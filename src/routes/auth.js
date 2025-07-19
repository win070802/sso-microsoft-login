const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Đăng nhập admin bằng email/password
router.post('/login', authController.loginWithPassword);

// Khởi tạo đăng nhập Microsoft
router.get('/microsoft/login', authController.initiateLogin);

// Xử lý callback từ Microsoft
router.get('/microsoft/callback', authController.handleMicrosoftCallback);
router.post('/microsoft/callback', authController.handleMicrosoftCallback);

// Lấy thông tin người dùng hiện tại
router.get('/me', authenticate, authController.getCurrentUser);

// Kiểm tra email domain
router.post('/check-domain', authController.checkEmailDomain);

module.exports = router;