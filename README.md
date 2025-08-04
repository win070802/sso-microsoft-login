# Microsoft SSO Authentication System

A free, open-source authentication system built with Node.js, Express, and PostgreSQL that provides Microsoft Single Sign-On (SSO) integration, user management, and domain access control for your applications.

## Features

- **Microsoft SSO Integration**: Seamlessly authenticate users with their Microsoft accounts
- **Domain Restriction**: Control which email domains are allowed to access your application
- **User Management**: Manage users, roles, and permissions
- **Admin Dashboard**: Complete administrative interface for user and domain management
- **API Documentation**: Comprehensive API documentation for easy integration
- **Security**: JWT-based authentication and API key protection

## Quick Start

### Prerequisites

- Node.js 14.x or higher
- PostgreSQL 12.x or higher
- Microsoft Azure account with registered application

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/microsoft-sso-auth.git
cd microsoft-sso-auth
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
PORT=8080
NODE_ENV=development
SKIP_DOMAIN_CHECK=false
DEBUG_AZURE=false
API_KEY=your-api-key
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_REDIRECT_URI=http://localhost:8080/api/auth/microsoft/callback
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
```

4. Start the server
```bash
npm run dev
```

## Configuration

### Azure Application Setup

1. Register a new application in the Azure Portal
2. Set the redirect URI to `http://localhost:8080/api/auth/microsoft/callback`
3. Grant permissions for Microsoft Graph API (User.Read)
4. Configure the application as multi-tenant
5. Copy the Client ID and Client Secret to your `.env` file

### Domain Restriction

By default, the system restricts access to specific email domains. You can:

1. Add allowed domains through the admin interface
2. Set `SKIP_DOMAIN_CHECK=true` in development mode to bypass domain checks
3. Manage domain status (active/inactive) through the API

## Usage

### Admin Account

The system automatically creates an admin account on first run:
- Email: admin@phatdatholdings.com.vn
- Password: Admin@123

### API Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Frontend Integration

To integrate with your frontend application:

1. Configure your frontend to use the authentication endpoints
2. Implement the Microsoft SSO login flow
3. Handle authentication tokens and user sessions
4. Protect routes based on user roles and permissions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Tran Minh Khoi**
- Website: [tranminhkhoi.dev](https://tranminhkhoi.dev)
- Email: [contact@tranminhkhoi.dev](mailto:contact@tranminhkhoi.dev)

## Support

If you find this project helpful, consider supporting the development:

[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/win070802) 
