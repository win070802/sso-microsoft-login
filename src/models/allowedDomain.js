const { pool } = require('../../server');

class AllowedDomain {
    // Lấy tất cả domain được phép
    static async getAll() {
        try {
            const result = await pool.query('SELECT * FROM allowed_domains ORDER BY domain_name ASC');
            return result.rows;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách domain:', error);
            throw error;
        }
    }

    // Lấy domain theo ID
    static async getById(id) {
        try {
            const result = await pool.query('SELECT * FROM allowed_domains WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi lấy thông tin domain:', error);
            throw error;
        }
    }

    // Kiểm tra domain có được phép không
    static async isDomainAllowed(domain) {
        try {
            console.log('DEBUG - Checking domain:', domain);
            
            const result = await pool.query(
                'SELECT * FROM allowed_domains WHERE domain_name = $1 AND is_active = TRUE',
                [domain]
            );
            
            console.log('DEBUG - Domain check result:', result.rowCount > 0 ? 'Allowed' : 'Not allowed');
            
            return result.rowCount > 0;
        } catch (error) {
            console.error('Lỗi khi kiểm tra domain:', error);
            return false;
        }
    }

    // Thêm domain mới
    static async create(domainData) {
        try {
            const { domain_name, description, is_active = true } = domainData;
            
            const result = await pool.query(
                `INSERT INTO allowed_domains (domain_name, description, is_active) 
                VALUES ($1, $2, $3) 
                RETURNING *`,
                [domain_name, description, is_active]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi thêm domain:', error);
            throw error;
        }
    }

    // Cập nhật thông tin domain
    static async update(id, domainData) {
        try {
            const { domain_name, description, is_active } = domainData;
            
            const result = await pool.query(
                `UPDATE allowed_domains 
                SET 
                    domain_name = COALESCE($1, domain_name),
                    description = COALESCE($2, description),
                    is_active = COALESCE($3, is_active),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *`,
                [domain_name, description, is_active, id]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi cập nhật domain:', error);
            throw error;
        }
    }

    // Xóa domain
    static async delete(id) {
        try {
            const result = await pool.query('DELETE FROM allowed_domains WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi xóa domain:', error);
            throw error;
        }
    }

    // Lấy tất cả domains đang active
    static async getAllActive() {
        try {
            const result = await pool.query(
                'SELECT * FROM allowed_domains WHERE is_active = TRUE ORDER BY domain_name ASC'
            );
            return result.rows;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách domain active:', error);
            throw error;
        }
    }
    
    // Kiểm tra email có thuộc domain được phép không
    static async isEmailFromAllowedDomain(email) {
        try {
            console.log('DEBUG - Checking email domain for:', email);
            
            if (!email || !email.includes('@')) {
                console.log('DEBUG - Invalid email format');
                return false;
            }
            
            const domain = email.split('@')[1].toLowerCase();
            console.log('DEBUG - Extracted domain:', domain);
            
            // Kiểm tra domain trong cơ sở dữ liệu
            const isAllowed = await this.isDomainAllowed(domain);
            
            return isAllowed;
        } catch (error) {
            console.error('Lỗi khi kiểm tra email domain:', error);
            return false;
        }
    }
}

module.exports = AllowedDomain; 