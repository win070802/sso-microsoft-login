const User = require('../models/user');

// Lấy tất cả người dùng (có phân trang và tìm kiếm)
const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            keyword = '',
            domain = '',
            role = '',
            status,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        // Chuyển đổi tham số status từ chuỗi sang boolean
        let isActive = null;
        if (status === 'active') isActive = true;
        if (status === 'inactive') isActive = false;

        const result = await User.paginate({
            page: parseInt(page),
            limit: parseInt(limit),
            keyword,
            domain,
            role,
            isActive,
            sortBy,
            sortOrder
        });
        
        // Loại bỏ thông tin nhạy cảm
        const safeUsers = result.data.map(user => {
            const { password_hash, ...safeUser } = user;
            return safeUser;
        });
        
        res.status(200).json({
            success: true,
            users: safeUsers,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Lấy thông tin người dùng theo ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.getById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Loại bỏ thông tin nhạy cảm
        const { password_hash, ...safeUser } = user;
        
        res.status(200).json({
            success: true,
            user: safeUser
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Khóa/Mở khóa người dùng
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.getById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Không cho phép khóa tài khoản admin mặc định
        if (user.email === 'admin@phatdatholdings.com.vn' && user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Cannot deactivate default admin account'
            });
        }
        
        // Không cho phép tự khóa tài khoản của chính mình
        if (user.id === req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Cannot deactivate your own account'
            });
        }
        
        const updatedUser = await User.update(id, {
            is_active: !user.is_active
        });
        
        // Loại bỏ thông tin nhạy cảm
        const { password_hash, ...safeUser } = updatedUser;
        
        res.status(200).json({
            success: true,
            message: `User ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`,
            user: safeUser
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Cập nhật vai trò người dùng
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        // Kiểm tra role hợp lệ
        const validRoles = ['admin', 'user', 'manager', 'staff'];
        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Vai trò không hợp lệ. Vai trò phải là một trong: ' + validRoles.join(', ')
            });
        }
        
        // Kiểm tra người dùng tồn tại
        const user = await User.getById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }
        
        // Không cho phép thay đổi vai trò của admin mặc định
        if (user.email === 'admin@phatdatholdings.com.vn') {
            return res.status(403).json({
                success: false,
                message: 'Không thể thay đổi vai trò của tài khoản admin mặc định'
            });
        }
        
        // Không cho phép thay đổi vai trò của chính mình
        if (user.id === req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Không thể thay đổi vai trò của chính mình'
            });
        }
        
        // Cập nhật vai trò
        const updatedUser = await User.updateRole(id, role);
        
        // Loại bỏ thông tin nhạy cảm
        const { password_hash, ...safeUser } = updatedUser;
        
        res.status(200).json({
            success: true,
            message: `Vai trò người dùng đã được cập nhật thành ${role}`,
            user: safeUser
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    toggleUserStatus,
    updateUserRole
}; 