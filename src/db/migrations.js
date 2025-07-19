const { pool } = require('../../server');

/**
 * Tạo các bảng cần thiết khi khởi động server
 * Tự động tạo bảng nếu chưa tồn tại
 */
const createTables = async () => {
    try {
        // Tạo bảng users nếu chưa tồn tại
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                display_name VARCHAR(255),
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                ms_id VARCHAR(255) UNIQUE,
                avatar_url TEXT,
                is_admin BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        `);
        
        // Kiểm tra và thêm user admin mặc định nếu chưa có
        const adminCheck = await pool.query(`
            SELECT * FROM users WHERE email = 'admin@phatdatholdings.com.vn'
        `);
        
        if (adminCheck.rows.length === 0) {
            const bcrypt = require('bcrypt');
            const password = 'Admin@123';
            const passwordHash = await bcrypt.hash(password, 10);
            
            await pool.query(`
                INSERT INTO users (
                    email,
                    password_hash,
                    first_name,
                    last_name,
                    display_name,
                    role,
                    is_admin,
                    is_active
                ) VALUES (
                    'admin@phatdatholdings.com.vn',
                    $1,
                    'Master',
                    'Admin',
                    'Master Admin',
                    'admin',
                    TRUE,
                    TRUE
                )
            `, [passwordHash]);
            
            console.log('✅ Đã thêm tài khoản admin mặc định');
            console.log('   Email: admin@phatdatholdings.com.vn');
            console.log('   Password: Admin@123');
        }

        // Tạo bảng allowed_domains nếu chưa tồn tại
        await pool.query(`
            CREATE TABLE IF NOT EXISTS allowed_domains (
                id SERIAL PRIMARY KEY,
                domain_name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Danh sách các domain được phép
        const allowedDomains = [
            { domain: 'phatdatholdings.com.vn', description: 'Domain công ty Phát Đạt Holdings' },
            { domain: 'gmail.com', description: 'Gmail - Phát triển và test' },
            { domain: 'outlook.com', description: 'Outlook - Phát triển và test' },
            { domain: 'hotmail.com', description: 'Hotmail - Phát triển và test' },
            { domain: 'live.com', description: 'Microsoft Live - Phát triển và test' }
        ];
        
        // Thêm các domain vào bảng nếu chưa có
        for (const domain of allowedDomains) {
            const domainCheck = await pool.query(`
                SELECT * FROM allowed_domains WHERE domain_name = $1
            `, [domain.domain]);
            
            if (domainCheck.rows.length === 0) {
                await pool.query(`
                    INSERT INTO allowed_domains (domain_name, description, is_active)
                    VALUES ($1, $2, TRUE)
                `, [domain.domain, domain.description]);
                
                console.log(`✅ Đã thêm domain: ${domain.domain}`);
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ Lỗi khởi tạo database:', error.message);
        throw error;
    }
};

module.exports = { createTables }; 