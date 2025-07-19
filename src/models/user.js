const { pool } = require('../../server');
const bcrypt = require('bcrypt');

class User {
    // Lấy tất cả users
    static async getAll() {
        try {
            const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
            return result.rows;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách users:', error);
            throw error;
        }
    }

    // Phân trang và tìm kiếm users
    static async paginate(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                keyword = '',
                domain = '',
                role = '',
                isActive = null,
                sortBy = 'created_at',
                sortOrder = 'DESC'
            } = options;
            
            // Tính offset dựa trên page và limit
            const offset = (page - 1) * limit;
            
            // Xây dựng điều kiện WHERE cho câu lệnh SQL
            const conditions = [];
            const params = [];
            
            // Điều kiện tìm kiếm theo keyword (email, tên, họ, tên hiển thị)
            if (keyword) {
                params.push(`%${keyword}%`);
                conditions.push(`(email ILIKE $${params.length} OR first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR display_name ILIKE $${params.length})`);
            }
            
            // Điều kiện tìm kiếm theo domain
            if (domain) {
                params.push(`%@${domain}%`);
                conditions.push(`email ILIKE $${params.length}`);
            }
            
            // Điều kiện tìm kiếm theo vai trò
            if (role) {
                params.push(role);
                conditions.push(`role = $${params.length}`);
            }
            
            // Điều kiện tìm kiếm theo trạng thái
            if (isActive !== null) {
                params.push(isActive);
                conditions.push(`is_active = $${params.length}`);
            }
            
            // Kết hợp tất cả điều kiện với toán tử AND
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            
            // Kiểm tra và xác thực tên cột để sắp xếp
            const validColumns = ['id', 'email', 'first_name', 'last_name', 'display_name', 'role', 'is_active', 'created_at', 'updated_at', 'last_login'];
            const validSortBy = validColumns.includes(sortBy) ? sortBy : 'created_at';
            
            // Kiểm tra và xác thực hướng sắp xếp
            const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
            
            // Truy vấn SQL chính để lấy dữ liệu người dùng
            const queryData = `
                SELECT * FROM users 
                ${whereClause}
                ORDER BY ${validSortBy} ${validSortOrder}
                LIMIT $${params.length + 1} OFFSET $${params.length + 2}
            `;
            
            // Truy vấn để đếm tổng số bản ghi
            const queryCount = `
                SELECT COUNT(*) as total FROM users 
                ${whereClause}
            `;
            
            // Thực hiện truy vấn với tham số
            params.push(limit, offset);
            const dataResult = await pool.query(queryData, params);
            
            // Thực hiện truy vấn đếm với tham số (không cần limit và offset)
            const countResult = await pool.query(queryCount, params.slice(0, -2));
            
            // Tính toán thông tin phân trang
            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            
            return {
                data: dataResult.rows,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages,
                    hasNextPage,
                    hasPrevPage
                }
            };
        } catch (error) {
            console.error('Lỗi khi phân trang và tìm kiếm users:', error);
            throw error;
        }
    }

    // Lấy user theo ID
    static async getById(id) {
        try {
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi lấy thông tin user:', error);
            throw error;
        }
    }

    // Lấy user theo email
    static async getByEmail(email) {
        try {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi lấy user theo email:', error);
            throw error;
        }
    }

    // Lấy user theo Microsoft ID
    static async getByMicrosoftId(msId) {
        try {
            const result = await pool.query('SELECT * FROM users WHERE ms_id = $1', [msId]);
            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi lấy user theo Microsoft ID:', error);
            throw error;
        }
    }

    // Tạo user mới từ thông tin Microsoft
    static async createFromMicrosoft(userData) {
        try {
            const { 
                email, 
                ms_id, 
                first_name, 
                last_name,
                display_name,
                avatar_url,
                is_admin = false 
            } = userData;

            const result = await pool.query(
                `INSERT INTO users (
                    email, 
                    ms_id, 
                    first_name, 
                    last_name,
                    display_name,
                    avatar_url,
                    is_admin,
                    role
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING *`,
                [email, ms_id, first_name, last_name, display_name, avatar_url, is_admin, is_admin ? 'admin' : 'user']
            );

            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi tạo user từ Microsoft:', error);
            throw error;
        }
    }

    // Cập nhật thông tin user
    static async update(id, userData) {
        try {
            const { email, first_name, last_name, display_name, role, is_admin, is_active, avatar_url } = userData;
            
            const result = await pool.query(
                `UPDATE users 
                SET 
                    email = COALESCE($1, email),
                    first_name = COALESCE($2, first_name),
                    last_name = COALESCE($3, last_name),
                    display_name = COALESCE($4, display_name),
                    role = COALESCE($5, role),
                    is_admin = COALESCE($6, is_admin),
                    is_active = COALESCE($7, is_active),
                    avatar_url = COALESCE($8, avatar_url),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $9
                RETURNING *`,
                [email, first_name, last_name, display_name, role, is_admin, is_active, avatar_url, id]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi cập nhật user:', error);
            throw error;
        }
    }

    // Cập nhật lần đăng nhập cuối
    static async updateLastLogin(id) {
        try {
            await pool.query(
                `UPDATE users 
                SET 
                    last_login = CURRENT_TIMESTAMP
                WHERE id = $1`,
                [id]
            );
            return true;
        } catch (error) {
            console.error('Lỗi khi cập nhật lần đăng nhập cuối:', error);
            throw error;
        }
    }

    // Xác thực user với email và password (cho admin)
    static async authenticate(email, password) {
        try {
            const user = await this.getByEmail(email);
            if (!user) {
                return null;
            }
            
            if (!user.is_active) {
                return { error: 'Tài khoản đã bị khóa' };
            }
            
            if (!user.password_hash) {
                return { error: 'Tài khoản này chỉ có thể đăng nhập bằng Microsoft SSO' };
            }
            
            // Kiểm tra password
            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) {
                return null;
            }
            
            // Cập nhật lần đăng nhập cuối
            await this.updateLastLogin(user.id);
            
            return user;
        } catch (error) {
            console.error('Lỗi khi xác thực user:', error);
            throw error;
        }
    }

    // Kiểm tra xem user có phải là admin không
    static isAdmin(user) {
        return user && (user.is_admin === true || user.role === 'admin');
    }

    // Đổi mật khẩu
    static async changePassword(id, newPassword) {
        try {
            const password_hash = await bcrypt.hash(newPassword, 10);
            
            const result = await pool.query(
                `UPDATE users 
                SET 
                    password_hash = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *`,
                [password_hash, id]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            throw error;
        }
    }

    // Cập nhật vai trò người dùng
    static async updateRole(id, role) {
        try {
            // Xác định is_admin dựa trên role
            const is_admin = role === 'admin';
            
            const result = await pool.query(
                `UPDATE users 
                SET 
                    role = $1,
                    is_admin = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING *`,
                [role, is_admin, id]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Lỗi khi cập nhật vai trò người dùng:', error);
            throw error;
        }
    }
}

module.exports = User; 