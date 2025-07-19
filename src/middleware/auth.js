const jwt = require('jsonwebtoken');
const User = require('../models/user');

// API key hợp lệ cho FE
const validApiKeys = [
    process.env.API_KEY 
];

// Middleware kiểm tra API key
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    
    if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res.status(401).json({
            success: false,
            message: 'API key không hợp lệ hoặc thiếu'
        });
    }
    
    next();
};

// Middleware xác thực JWT token
const authenticate = (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Không tìm thấy token xác thực' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Xác thực token
        jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret', async (err, decoded) => {
            if (err) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Token không hợp lệ hoặc đã hết hạn' 
                });
            }

            // Kiểm tra user có tồn tại không
            const user = await User.getById(decoded.id);
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Không tìm thấy người dùng' 
                });
            }

            if (!user.is_active) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Tài khoản đã bị khóa' 
                });
            }

            // Lưu thông tin user vào request
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Lỗi xác thực:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server', 
            error: error.message 
        });
    }
};

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
    if (!req.user || (!req.user.is_admin && req.user.role !== 'admin')) {
        return res.status(403).json({ 
            success: false,
            message: 'Bạn không có quyền truy cập chức năng này' 
        });
    }
    next();
};

module.exports = {
    authenticate,
    requireAdmin,
    apiKeyAuth
}; 