const User = require('../models/user');
const AllowedDomain = require('../models/allowedDomain');
const jwt = require('jsonwebtoken');
const { msalClient } = require('../../config/azure');

// Tạo JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            is_admin: user.is_admin
        },
        process.env.JWT_SECRET || 'default_jwt_secret',
        { expiresIn: '24h' }
    );
};

// Đăng nhập admin bằng email/password
const loginWithPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email và mật khẩu là bắt buộc' 
            });
        }

        const user = await User.authenticate(email, password);
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Email hoặc mật khẩu không đúng' 
            });
        }

        if (user.error) {
            return res.status(401).json({ 
                success: false,
                message: user.error 
            });
        }

        // Tạo token
        const token = generateToken(user);

        // Phản hồi
        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                display_name: user.display_name,
                role: user.role,
                is_admin: user.is_admin,
                avatar_url: user.avatar_url
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Khởi tạo đăng nhập Microsoft
const initiateLogin = (req, res) => {
    try {
        // URL đăng nhập Microsoft
        const authCodeUrlParameters = {
            scopes: ["openid", "profile", "email", "User.Read"],
            redirectUri: process.env.AZURE_REDIRECT_URI,
        };

        // Tạo URL redirect
        msalClient.getAuthCodeUrl(authCodeUrlParameters)
            .then((url) => {
                res.status(200).json({
                    success: true,
                    redirectUrl: url
                });
            })
            .catch((error) => {
                console.error('Lỗi khi tạo URL đăng nhập Microsoft:', error);
                res.status(500).json({
                    success: false,
                    message: 'Lỗi khi tạo URL đăng nhập Microsoft',
                    error: error.message
                });
            });
    } catch (error) {
        console.error('Lỗi khởi tạo đăng nhập Microsoft:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khởi tạo đăng nhập Microsoft',
            error: error.message
        });
    }
};

// Xử lý callback từ Microsoft
const handleMicrosoftCallback = async (req, res) => {
    try {
        // Lấy code từ query params hoặc request body
        const code = req.query.code || req.body.code;
        
        // Kiểm tra FRONTEND_URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
        
        // Xác định nếu đây là request API (POST) hoặc redirect (GET)
        const isApiRequest = req.method === 'POST';
        
        if (!code) {
            // Xử lý lỗi dựa trên loại request
            if (isApiRequest) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu mã xác thực'
                });
            } else {
                return res.redirect(`${frontendUrl}/auth/callback?error=missing_code`);
            }
        }

        const tokenRequest = {
            code,
            scopes: ["openid", "profile", "email", "User.Read"],
            redirectUri: process.env.AZURE_REDIRECT_URI,
        };

        // Lấy token từ Microsoft
        const tokenResponse = await msalClient.acquireTokenByCode(tokenRequest);
        if (!tokenResponse) {
            // Xử lý lỗi dựa trên loại request
            if (isApiRequest) {
                return res.status(401).json({
                    success: false,
                    message: 'Xác thực thất bại'
                });
            } else {
                return res.redirect(`${frontendUrl}/auth/callback?error=authentication_failed`);
            }
        }

        const { idTokenClaims, account } = tokenResponse;
        
        // Lấy thông tin user từ Microsoft
        const email = idTokenClaims.preferred_username || idTokenClaims.email;
        const msId = account.homeAccountId;
        const first_name = idTokenClaims.given_name || '';
        const last_name = idTokenClaims.family_name || '';
        const display_name = idTokenClaims.name || `${first_name} ${last_name}`.trim();
        const avatar_url = null; // Cần API Graph để lấy ảnh đại diện

        if (!email) {
            // Xử lý lỗi dựa trên loại request
            if (isApiRequest) {
                return res.status(400).json({
                    success: false,
                    message: 'Không nhận được email từ tài khoản Microsoft'
                });
            } else {
                return res.redirect(`${frontendUrl}/auth/callback?error=missing_email`);
            }
        }

        // Kiểm tra domain có được phép không
        // Sửa lại cách đọc biến môi trường
        const skipDomainCheck = process.env.SKIP_DOMAIN_CHECK === 'true';
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        console.log('DEBUG - Email:', email);
        console.log('DEBUG - Environment:', process.env.NODE_ENV);
        console.log('DEBUG - Skip Domain Check:', process.env.SKIP_DOMAIN_CHECK);
        
        let isAllowed = false;
        
        // Nếu đang ở môi trường development và SKIP_DOMAIN_CHECK=true thì bỏ qua kiểm tra domain
        if (isDevelopment && skipDomainCheck) {
            isAllowed = true;
            console.log('DEBUG - Skipping domain check in development mode');
        } else {
            // Ngược lại thì kiểm tra domain
            isAllowed = await AllowedDomain.isEmailFromAllowedDomain(email);
            console.log('DEBUG - Domain check result:', isAllowed);
        }

        if (!isAllowed) {
            // Xử lý lỗi dựa trên loại request
            if (isApiRequest) {
                return res.status(403).json({
                    success: false,
                    message: 'Email không thuộc domain được phép',
                    email
                });
            } else {
                return res.redirect(`${frontendUrl}/auth/callback?error=domain_not_allowed&email=${encodeURIComponent(email)}`);
            }
        }

        // Tìm user theo Microsoft ID
        let user = await User.getByMicrosoftId(msId);
        
        // Nếu không tìm thấy user theo Microsoft ID, tìm theo email
        if (!user) {
            user = await User.getByEmail(email);
        }
        
        // Nếu user không tồn tại, tạo mới
        if (!user) {
            user = await User.createFromMicrosoft({
                email,
                ms_id: msId,
                first_name,
                last_name,
                display_name,
                avatar_url,
                is_admin: false
            });
        } 
        // Cập nhật thông tin Microsoft ID nếu user đã tồn tại nhưng chưa có Microsoft ID
        else if (!user.ms_id) {
            user = await User.update(user.id, {
                ms_id: msId,
                first_name: first_name || user.first_name,
                last_name: last_name || user.last_name,
                display_name: display_name || user.display_name,
                avatar_url: avatar_url || user.avatar_url
            });
        }

        if (!user.is_active) {
            // Xử lý lỗi dựa trên loại request
            if (isApiRequest) {
                return res.status(403).json({
                    success: false,
                    message: 'Tài khoản đã bị khóa'
                });
            } else {
                return res.redirect(`${frontendUrl}/auth/callback?error=account_inactive`);
            }
        }

        // Cập nhật thời gian đăng nhập cuối
        await User.updateLastLogin(user.id);

        // Tạo token
        const token = generateToken(user);

        // Tạo đối tượng user an toàn
        const safeUser = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            display_name: user.display_name,
            role: user.role,
            is_admin: user.is_admin,
            avatar_url: user.avatar_url
        };
        
        // Trả về kết quả dựa trên loại request
        if (isApiRequest) {
            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                token,
                user: safeUser
            });
        } else {
            // Redirect về frontend với token và thông tin user
            return res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(safeUser))}`);
        }
    } catch (error) {
        console.error('Lỗi xử lý callback Microsoft:', error);
        
        // Xử lý lỗi dựa trên loại request
        if (req.method === 'POST') {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        } else {
            // Redirect về frontend với thông báo lỗi
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
            return res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(error.message)}`);
        }
    }
};

// Lấy thông tin người dùng hiện tại
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.getById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                display_name: user.display_name,
                role: user.role,
                is_admin: user.is_admin,
                avatar_url: user.avatar_url,
                last_login: user.last_login
            }
        });
    } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Kiểm tra email domain
const checkEmailDomain = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email là bắt buộc'
            });
        }
        
        // Kiểm tra domain có được phép không
        const skipDomainCheck = process.env.SKIP_DOMAIN_CHECK === 'true';
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        let isAllowed = false;
        let allowedDomains = [];
        
        // Lấy danh sách domain được phép
        try {
            allowedDomains = await AllowedDomain.getAllActive();
        } catch (error) {
            console.error('Lỗi khi lấy danh sách domain:', error);
        }
        
        // Nếu đang ở môi trường development và SKIP_DOMAIN_CHECK=true thì bỏ qua kiểm tra domain
        if (isDevelopment && skipDomainCheck) {
            isAllowed = true;
        } else {
            // Ngược lại thì kiểm tra domain
            isAllowed = await AllowedDomain.isEmailFromAllowedDomain(email);
        }
        
        res.status(200).json({
            success: true,
            isAllowed,
            email,
            environment: process.env.NODE_ENV,
            skipDomainCheck: skipDomainCheck,
            allowedDomains: allowedDomains.map(d => d.domain_name)
        });
    } catch (error) {
        console.error('Lỗi kiểm tra email domain:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    loginWithPassword,
    initiateLogin,
    handleMicrosoftCallback,
    getCurrentUser,
    checkEmailDomain
};