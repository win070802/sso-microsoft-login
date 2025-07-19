const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const { testGeminiConnection } = require('./config/gemini');
const { testAzureConnection } = require('./config/azure');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Thiết lập kết nối PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Kiểm tra các kết nối
async function checkConnections() {
    console.log('🔄 Đang kiểm tra kết nối...');
    
    // Kiểm tra kết nối PostgreSQL
    try {
        const pgResult = await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL: OK');
    } catch (err) {
        console.error('❌ PostgreSQL: Thất bại -', err.message);
    }

    // Kiểm tra kết nối Gemini
    try {
        const geminiResult = await testGeminiConnection();
        if (geminiResult && geminiResult.success) {
            console.log(`✅ Gemini API (${geminiResult.modelName}): OK`);
        } else {
            console.log('❌ Gemini API: Thất bại');
        }
    } catch (err) {
        console.error('❌ Gemini API: Thất bại -', err.message);
    }
    
    // Kiểm tra kết nối Azure AD
    try {
        const azureConnected = await testAzureConnection();
        if (azureConnected) {
            console.log('✅ Azure AD: OK');
        } else {
            console.log('❌ Azure AD: Thất bại');
        }
    } catch (err) {
        console.error('❌ Azure AD: Thất bại -', err.message);
    }
}

// Khởi tạo database
const initDatabase = async () => {
    try {
        // Import createTables khi cần để tránh circular dependency
        const { createTables } = require('./src/db/migrations');
        await createTables();
    } catch (error) {
        console.error('❌ Lỗi khởi tạo database:', error.message);
    }
};

const startServer = async () => {
    // Khởi động server trước
    const server = app.listen(port, () => {
        console.log(`🚀 Server đang chạy trên cổng ${port}`);
    });
    
    // Sau đó kiểm tra kết nối và khởi tạo database
    await checkConnections();
    await initDatabase();
};

// Xuất pool để sử dụng ở các module khác
module.exports = {
    pool,
    app
};

// Khởi động server nếu file được chạy trực tiếp
if (require.main === module) {
startServer();
}
