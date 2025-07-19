const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { authenticate, apiKeyAuth, requireAdmin } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const domainRoutes = require('./routes/domain');
const userRoutes = require('./routes/user');
const authController = require('./controllers/authController');
const { pool } = require('../server');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(helmet()); // Bảo mật HTTP header
app.use(cors({
  origin: '*'
})); // Cho phép CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded

// Microsoft callback route không yêu cầu API key
app.get('/api/auth/microsoft/callback', authController.handleMicrosoftCallback);
app.post('/api/auth/microsoft/callback', authController.handleMicrosoftCallback);

// API key cho tất cả các API route khác
app.use('/api', apiKeyAuth);

// Routes công khai
app.use('/api/auth', authRoutes);

// Routes quản lý (yêu cầu xác thực và quyền admin)
app.use('/api/domains', domainRoutes);
app.use('/api/users', userRoutes);

// Root route (yêu cầu xác thực)
app.get('/', authenticate, (req, res) => {
    res.json({
        message: 'Phat Dat Assistant API',
        status: 'online',
        version: '1.0.0',
        user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.display_name || `${req.user.first_name} ${req.user.last_name}`.trim(),
            role: req.user.role,
            is_admin: req.user.is_admin
        }
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.use('/api', authenticate, (req, res, next) => {
    next();
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Không tìm thấy đường dẫn'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 Server đang chạy trên cổng ${port} 🚀`);
    });
} else {
    module.exports = app;
}
