const { ConfidentialClientApplication } = require('@azure/msal-node');
require('dotenv').config();

// Cấu hình MSAL
const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        // Thay đổi từ tenant ID cụ thể sang 'organizations' để hỗ trợ multi-tenant
        authority: `https://login.microsoftonline.com/organizations`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        redirectUri: process.env.AZURE_REDIRECT_URI,
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                if (process.env.NODE_ENV === 'development' && process.env.DEBUG_AZURE === 'true') {
                    console.log(message);
                }
            },
            piiLoggingEnabled: false,
            logLevel: process.env.NODE_ENV === 'production' ? 'Error' : 'Warning',
        }
    }
};

// Cấu hình Passport Azure AD
const passportConfig = {
    identityMetadata: `https://login.microsoftonline.com/organizations/v2.0/.well-known/openid-configuration`,
    clientID: process.env.AZURE_CLIENT_ID,
    responseType: 'code',
    responseMode: 'form_post',
    redirectUrl: process.env.AZURE_REDIRECT_URI,
    allowHttpForRedirectUrl: true, // Chỉ sử dụng trong môi trường phát triển
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    validateIssuer: false, // Đặt thành false cho multi-tenant
    issuer: null, // Đặt thành null cho multi-tenant
    passReqToCallback: true,
    scope: ['profile', 'email', 'openid'],
    loggingLevel: 'error',
    useCookieInsteadOfSession: true,
    cookieEncryptionKeys: [
        { key: process.env.COOKIE_KEY, iv: process.env.COOKIE_IV }
    ],
    cookieSameSite: false,
};

// Khởi tạo MSAL client
const msalClient = new ConfidentialClientApplication(msalConfig);

// Kiểm tra kết nối Azure
async function testAzureConnection() {
    try {
        // Lấy token cho API Graph để kiểm tra kết nối
        const result = await msalClient.acquireTokenByClientCredential({
            scopes: ['https://graph.microsoft.com/.default'],
        });

        return (result && result.accessToken) ? true : false;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    msalConfig,
    passportConfig,
    msalClient,
    testAzureConnection,
}; 