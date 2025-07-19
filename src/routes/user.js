const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Tất cả các route đều yêu cầu xác thực và quyền admin
router.use(authenticate, requireAdmin);

// Lấy tất cả người dùng
router.get('/', userController.getAllUsers);

// Lấy thông tin người dùng theo ID
router.get('/:id', userController.getUserById);

// Khóa/Mở khóa người dùng
router.patch('/:id/toggle', userController.toggleUserStatus);

// Cập nhật vai trò người dùng
router.patch('/:id/role', userController.updateUserRole);

module.exports = router; 