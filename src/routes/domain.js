const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Tất cả các route đều yêu cầu xác thực và quyền admin
router.use(authenticate, requireAdmin);

// Lấy tất cả domain
router.get('/', domainController.getAllDomains);

// Lấy domain theo ID
router.get('/:id', domainController.getDomainById);

// Thêm domain mới
router.post('/', domainController.createDomain);

// Cập nhật domain
router.put('/:id', domainController.updateDomain);

// Xóa domain
router.delete('/:id', domainController.deleteDomain);

// Kích hoạt/Vô hiệu hóa domain
router.patch('/:id/toggle', domainController.toggleDomainStatus);

module.exports = router; 