const AllowedDomain = require('../models/allowedDomain');

// Lấy tất cả domain
const getAllDomains = async (req, res) => {
    try {
        const domains = await AllowedDomain.getAll();
        
        res.status(200).json({
            success: true,
            domains
        });
    } catch (error) {
        console.error('Error getting domains:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Lấy domain theo ID
const getDomainById = async (req, res) => {
    try {
        const { id } = req.params;
        const domain = await AllowedDomain.getById(id);
        
        if (!domain) {
            return res.status(404).json({
                success: false,
                message: 'Domain not found'
            });
        }
        
        res.status(200).json({
            success: true,
            domain
        });
    } catch (error) {
        console.error('Error getting domain:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Thêm domain mới
const createDomain = async (req, res) => {
    try {
        const { domain_name, description, is_active } = req.body;
        
        if (!domain_name) {
            return res.status(400).json({
                success: false,
                message: 'Domain name is required'
            });
        }
        
        // Kiểm tra domain đã tồn tại chưa
        const existingDomain = await AllowedDomain.isDomainAllowed(domain_name);
        if (existingDomain) {
            return res.status(400).json({
                success: false,
                message: 'Domain already exists'
            });
        }
        
        const newDomain = await AllowedDomain.create({
            domain_name,
            description,
            is_active: is_active !== undefined ? is_active : true
        });
        
        res.status(201).json({
            success: true,
            message: 'Domain added successfully',
            domain: newDomain
        });
    } catch (error) {
        console.error('Error creating domain:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Cập nhật domain
const updateDomain = async (req, res) => {
    try {
        const { id } = req.params;
        const { domain_name, description, is_active } = req.body;
        
        // Kiểm tra domain có tồn tại không
        const domain = await AllowedDomain.getById(id);
        if (!domain) {
            return res.status(404).json({
                success: false,
                message: 'Domain not found'
            });
        }
        
        // Nếu thay đổi tên domain, kiểm tra tên mới đã tồn tại chưa
        if (domain_name && domain_name !== domain.domain_name) {
            const existingDomain = await AllowedDomain.isDomainAllowed(domain_name);
            if (existingDomain) {
                return res.status(400).json({
                    success: false,
                    message: 'Domain name already exists'
                });
            }
        }
        
        const updatedDomain = await AllowedDomain.update(id, {
            domain_name,
            description,
            is_active
        });
        
        res.status(200).json({
            success: true,
            message: 'Domain updated successfully',
            domain: updatedDomain
        });
    } catch (error) {
        console.error('Error updating domain:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Xóa domain
const deleteDomain = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra domain có tồn tại không
        const domain = await AllowedDomain.getById(id);
        if (!domain) {
            return res.status(404).json({
                success: false,
                message: 'Domain not found'
            });
        }
        
        // Không cho phép xóa domain mặc định
        if (domain.domain_name === 'phatdatholdings.com.vn') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete default domain'
            });
        }
        
        const deletedDomain = await AllowedDomain.delete(id);
        
        res.status(200).json({
            success: true,
            message: 'Domain deleted successfully',
            domain: deletedDomain
        });
    } catch (error) {
        console.error('Error deleting domain:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Kích hoạt/Vô hiệu hóa domain
const toggleDomainStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra domain có tồn tại không
        const domain = await AllowedDomain.getById(id);
        if (!domain) {
            return res.status(404).json({
                success: false,
                message: 'Domain not found'
            });
        }
        
        // Không cho phép vô hiệu hóa domain mặc định
        if (domain.domain_name === 'phatdatholdings.com.vn' && domain.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Cannot deactivate default domain'
            });
        }
        
        const updatedDomain = await AllowedDomain.update(id, {
            is_active: !domain.is_active
        });
        
        res.status(200).json({
            success: true,
            message: `Domain ${updatedDomain.is_active ? 'activated' : 'deactivated'} successfully`,
            domain: updatedDomain
        });
    } catch (error) {
        console.error('Error toggling domain status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getAllDomains,
    getDomainById,
    createDomain,
    updateDomain,
    deleteDomain,
    toggleDomainStatus
}; 