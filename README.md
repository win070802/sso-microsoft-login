# Phat Dat Assistant API

Backend API for the Phat Dat Assistant system, built with Node.js, Express, PostgreSQL and Microsoft SSO.

## API Endpoints

### Authentication

#### 1. Login with email/password (Admin)

```
POST /api/auth/login
```

**Headers:**
```
Content-Type: application/json
x-api-key: pdat-frontend-api-key-2025
```

**Body:**
```json
{
  "email": "admin@phatdatholdings.com.vn",
  "password": "Admin@123"
}
```

**Successful Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1090390625961181185",
    "email": "admin@phatdatholdings.com.vn",
    "first_name": "Master",
    "last_name": "Admin",
    "display_name": "Master Admin",
    "role": "admin",
    "is_admin": true,
    "avatar_url": null
  }
}
```

#### 2. Initiate Microsoft Login

```
GET /api/auth/microsoft/login
```

**Headers:**
```
x-api-key: pdat-frontend-api-key-2025
```

**Successful Response:**
```json
{
  "success": true,
  "redirectUrl": "https://login.microsoftonline.com/..."
}
```

The frontend should redirect the user to the URL in `redirectUrl`.

#### 3. Handle Microsoft Callback

```
GET /api/auth/microsoft/callback?code=xxx
```

or

```
POST /api/auth/microsoft/callback
```
**Body:**
```json
{
  "code": "xxx"
}
```

**Successful Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1090390625961181185",
    "email": "user@phatdatholdings.com.vn",
    "first_name": "User",
    "last_name": "Name",
    "display_name": "User Name",
    "role": "user",
    "is_admin": false,
    "avatar_url": null
  }
}
```

#### 4. Get Current User Information

```
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Successful Response:**
```json
{
  "success": true,
  "user": {
    "id": "1090390625961181185",
    "email": "admin@phatdatholdings.com.vn",
    "first_name": "Master",
    "last_name": "Admin",
    "display_name": "Master Admin",
    "role": "admin",
    "is_admin": true,
    "avatar_url": null,
    "last_login": "2025-07-18T02:45:12.142Z"
  }
}
```

### Domain Management (Admin only)

#### 1. Get All Domains

```
GET /api/domains
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Successful Response:**
```json
{
  "success": true,
  "domains": [
    {
      "id": 1,
      "domain_name": "phatdatholdings.com.vn",
      "description": "Domain công ty Phát Đạt Holdings",
      "is_active": true,
      "created_at": "2025-07-18T02:45:12.142Z",
      "updated_at": "2025-07-18T02:45:12.142Z"
    }
  ]
}
```

#### 2. Get Domain by ID

```
GET /api/domains/:id
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Successful Response:**
```json
{
  "success": true,
  "domain": {
    "id": 1,
    "domain_name": "phatdatholdings.com.vn",
    "description": "Domain công ty Phát Đạt Holdings",
    "is_active": true,
    "created_at": "2025-07-18T02:45:12.142Z",
    "updated_at": "2025-07-18T02:45:12.142Z"
  }
}
```

#### 3. Create New Domain

```
POST /api/domains
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Body:**
```json
{
  "domain_name": "example.com",
  "description": "Example domain",
  "is_active": true
}
```

**Successful Response:**
```json
{
  "success": true,
  "message": "Domain added successfully",
  "domain": {
    "id": 2,
    "domain_name": "example.com",
    "description": "Example domain",
    "is_active": true,
    "created_at": "2025-07-18T02:45:12.142Z",
    "updated_at": "2025-07-18T02:45:12.142Z"
  }
}
```

#### 4. Update Domain

```
PUT /api/domains/:id
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Body:**
```json
{
  "domain_name": "example.com",
  "description": "Updated description",
  "is_active": true
}
```

**Successful Response:**
```json
{
  "success": true,
  "message": "Domain updated successfully",
  "domain": {
    "id": 2,
    "domain_name": "example.com",
    "description": "Updated description",
    "is_active": true,
    "created_at": "2025-07-18T02:45:12.142Z",
    "updated_at": "2025-07-18T03:45:12.142Z"
  }
}
```

#### 5. Delete Domain

```
DELETE /api/domains/:id
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Successful Response:**
```json
{
  "success": true,
  "message": "Domain deleted successfully",
  "domain": {
    "id": 2,
    "domain_name": "example.com",
    "description": "Updated description",
    "is_active": true,
    "created_at": "2025-07-18T02:45:12.142Z",
    "updated_at": "2025-07-18T03:45:12.142Z"
  }
}
```

#### 6. Toggle Domain Status (Activate/Deactivate)

```
PATCH /api/domains/:id/toggle
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Successful Response:**
```json
{
  "success": true,
  "message": "Domain deactivated successfully",
  "domain": {
    "id": 2,
    "domain_name": "example.com",
    "description": "Updated description",
    "is_active": false,
    "created_at": "2025-07-18T02:45:12.142Z",
    "updated_at": "2025-07-18T03:45:12.142Z"
  }
}
```

### User Management (Admin only)

#### 1. Get All Users (with Pagination and Search)

```
GET /api/users
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Query Parameters:**
```
page         - Số trang hiện tại (mặc định: 1)
limit        - Số lượng kết quả mỗi trang (mặc định: 10)
keyword      - Từ khóa tìm kiếm (tên, email, etc.)
domain       - Tên miền email (ví dụ: phatdatholdings.com.vn)
role         - Vai trò người dùng (admin, user, etc.)
status       - Trạng thái (active/inactive)
sortBy       - Sắp xếp theo trường (id, email, created_at, etc.)
sortOrder    - Thứ tự sắp xếp (ASC/DESC)
```

**Ví dụ:**
```
GET /api/users?page=1&limit=10&keyword=admin&domain=phatdatholdings.com.vn&role=admin&status=active&sortBy=created_at&sortOrder=DESC
```

**Successful Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "admin@phatdatholdings.com.vn",
      "first_name": "Master",
      "last_name": "Admin",
      "display_name": "Master Admin",
      "role": "admin",
      "is_admin": true,
      "avatar_url": null,
      "is_active": true,
      "created_at": "2025-07-18T02:45:12.142Z",
      "updated_at": "2025-07-18T02:45:12.142Z",
      "last_login": "2025-07-18T02:45:12.142Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 2. Get User by ID

```
GET /api/users/:id
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Successful Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@phatdatholdings.com.vn",
    "first_name": "Master",
    "last_name": "Admin",
    "display_name": "Master Admin",
    "role": "admin",
    "is_admin": true,
    "avatar_url": null,
    "is_active": true,
    "created_at": "2025-07-18T02:45:12.142Z",
    "updated_at": "2025-07-18T02:45:12.142Z",
    "last_login": "2025-07-18T02:45:12.142Z"
  }
}
```

#### 3. Toggle User Status (Activate/Deactivate)

```
PATCH /api/users/:id/toggle
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Successful Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "user": {
    "id": 2,
    "email": "user@phatdatholdings.com.vn",
    "first_name": "User",
    "last_name": "Name",
    "display_name": "User Name",
    "role": "user",
    "is_admin": false,
    "avatar_url": null,
    "is_active": false,
    "created_at": "2025-07-18T02:45:12.142Z",
    "updated_at": "2025-07-18T03:45:12.142Z",
    "last_login": "2025-07-18T02:45:12.142Z"
  }
}
```

#### 4. Update User Role

```
PATCH /api/users/:id/role
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: pdat-frontend-api-key-2025
```

**Body:**
```json
{
  "role": "admin"
}
```

**Vai trò hợp lệ:**
- `admin` - Quản trị viên (có tất cả quyền)
- `manager` - Quản lý (có một số quyền quản trị)
- `staff` - Nhân viên (có quyền hạn chế)
- `user` - Người dùng thông thường (quyền cơ bản)

**Successful Response:**
```json
{
  "success": true,
  "message": "Vai trò người dùng đã được cập nhật thành admin",
  "user": {
    "id": 2,
    "email": "user@phatdatholdings.com.vn",
    "first_name": "User",
    "last_name": "Name",
    "display_name": "User Name",
    "role": "admin",
    "is_admin": true,
    "avatar_url": null,
    "is_active": true,
    "created_at": "2025-07-18T02:45:12.142Z",
    "updated_at": "2025-07-18T03:45:12.142Z",
    "last_login": "2025-07-18T02:45:12.142Z"
  }
}
```

### Other APIs

#### 1. Check API Status

```
GET /api/status
```

**Headers:**
```
x-api-key: pdat-frontend-api-key-2025
```

**Successful Response:**
```json
{
  "status": "online",
  "version": "1.0.0",
  "timestamp": "2025-07-18T02:45:12.142Z"
}
```

## Authentication

The system uses two authentication mechanisms:

### 1. API Key (x-api-key header)

Used for requests from the frontend to the API. Add the `x-api-key` header with the default value:

```
x-api-key: pdat-frontend-api-key-2025
```

### 2. JWT Token (Bearer token)

Used for user authentication after login. Add the `Authorization` header with the `Bearer` prefix:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Admin Account

- **Email**: admin@phatdatholdings.com.vn
- **Password**: Admin@123

## Allowed Domains

Only emails from the `phatdatholdings.com.vn` domain are allowed to log in to the system through Microsoft SSO.

## Database

The system will automatically create tables and default data when the server starts:

1. **users**: Table storing user information
2. **allowed_domains**: Table storing the list of domains allowed to log in 