# API Documentation

This document provides detailed information about the API endpoints available in the Microsoft SSO Authentication System.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:8080/api
```

## Authentication

The system uses two authentication mechanisms:

### 1. API Key

All requests to the API require an API key in the header:

```
x-api-key: your-api-key
```

### 2. JWT Token

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints

### Authentication

#### 1. Login with Email/Password (Admin)

```
POST /auth/login
```

**Headers:**
```
Content-Type: application/json
x-api-key: your-api-key
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Successful Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1234567890",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "display_name": "Admin User",
    "role": "admin",
    "is_admin": true,
    "avatar_url": null
  }
}
```

#### 2. Initiate Microsoft Login

```
GET /auth/microsoft/login
```

**Headers:**
```
x-api-key: your-api-key
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
GET /auth/microsoft/callback?code=xxx
```

or

```
POST /auth/microsoft/callback
```

**Headers (for POST):**
```
Content-Type: application/json
x-api-key: your-api-key
```

**Request Body (for POST):**
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
    "id": "1234567890",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "display_name": "John Doe",
    "role": "user",
    "is_admin": false,
    "avatar_url": null
  }
}
```

#### 4. Get Current User Information

```
GET /auth/me
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Successful Response:**
```json
{
  "success": true,
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "display_name": "John Doe",
    "role": "user",
    "is_admin": false,
    "avatar_url": null,
    "last_login": "2023-07-18T02:45:12.142Z"
  }
}
```

### Domain Management (Admin only)

#### 1. Get All Domains

```
GET /domains
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Successful Response:**
```json
{
  "success": true,
  "domains": [
    {
      "id": 1,
      "domain_name": "example.com",
      "description": "Example Domain",
      "is_active": true,
      "created_at": "2023-07-18T02:45:12.142Z",
      "updated_at": "2023-07-18T02:45:12.142Z"
    }
  ]
}
```

#### 2. Get Domain by ID

```
GET /domains/:id
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Successful Response:**
```json
{
  "success": true,
  "domain": {
    "id": 1,
    "domain_name": "example.com",
    "description": "Example Domain",
    "is_active": true,
    "created_at": "2023-07-18T02:45:12.142Z",
    "updated_at": "2023-07-18T02:45:12.142Z"
  }
}
```

#### 3. Create New Domain

```
POST /domains
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Request Body:**
```json
{
  "domain_name": "newdomain.com",
  "description": "New Domain",
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
    "domain_name": "newdomain.com",
    "description": "New Domain",
    "is_active": true,
    "created_at": "2023-07-18T02:45:12.142Z",
    "updated_at": "2023-07-18T02:45:12.142Z"
  }
}
```

#### 4. Update Domain

```
PUT /domains/:id
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Request Body:**
```json
{
  "domain_name": "updateddomain.com",
  "description": "Updated Description",
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
    "domain_name": "updateddomain.com",
    "description": "Updated Description",
    "is_active": true,
    "created_at": "2023-07-18T02:45:12.142Z",
    "updated_at": "2023-07-18T03:45:12.142Z"
  }
}
```

#### 5. Delete Domain

```
DELETE /domains/:id
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Successful Response:**
```json
{
  "success": true,
  "message": "Domain deleted successfully",
  "domain": {
    "id": 2,
    "domain_name": "updateddomain.com",
    "description": "Updated Description",
    "is_active": true,
    "created_at": "2023-07-18T02:45:12.142Z",
    "updated_at": "2023-07-18T03:45:12.142Z"
  }
}
```

#### 6. Toggle Domain Status (Activate/Deactivate)

```
PATCH /domains/:id/toggle
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Successful Response:**
```json
{
  "success": true,
  "message": "Domain deactivated successfully",
  "domain": {
    "id": 2,
    "domain_name": "updateddomain.com",
    "description": "Updated Description",
    "is_active": false,
    "created_at": "2023-07-18T02:45:12.142Z",
    "updated_at": "2023-07-18T03:45:12.142Z"
  }
}
```

### User Management (Admin only)

#### 1. Get All Users (with Pagination and Search)

```
GET /users
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Query Parameters:**
```
page         - Current page number (default: 1)
limit        - Number of results per page (default: 10)
keyword      - Search keyword (name, email, etc.)
domain       - Email domain (e.g., example.com)
role         - User role (admin, user, etc.)
status       - Status (active/inactive)
sortBy       - Sort by field (id, email, created_at, etc.)
sortOrder    - Sort order (ASC/DESC)
```

**Example:**
```
GET /users?page=1&limit=10&keyword=admin&domain=example.com&role=admin&status=active&sortBy=created_at&sortOrder=DESC
```

**Successful Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "display_name": "Admin User",
      "role": "admin",
      "is_admin": true,
      "avatar_url": null,
      "is_active": true,
      "created_at": "2023-07-18T02:45:12.142Z",
      "updated_at": "2023-07-18T02:45:12.142Z",
      "last_login": "2023-07-18T02:45:12.142Z"
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
GET /users/:id
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Successful Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "display_name": "Admin User",
    "role": "admin",
    "is_admin": true,
    "avatar_url": null,
    "is_active": true,
    "created_at": "2023-07-18T02:45:12.142Z",
    "updated_at": "2023-07-18T02:45:12.142Z",
    "last_login": "2023-07-18T02:45:12.142Z"
  }
}
```

#### 3. Toggle User Status (Activate/Deactivate)

```
PATCH /users/:id/toggle
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Successful Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "user": {
    "id": 2,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "display_name": "John Doe",
    "role": "user",
    "is_admin": false,
    "avatar_url": null,
    "is_active": false,
    "created_at": "2023-07-18T02:45:12.142Z",
    "updated_at": "2023-07-18T03:45:12.142Z",
    "last_login": "2023-07-18T02:45:12.142Z"
  }
}
```

#### 4. Update User Role

```
PATCH /users/:id/role
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key
```

**Request Body:**
```json
{
  "role": "admin"
}
```

**Valid Roles:**
- `admin` - Administrator (full access)
- `manager` - Manager (limited administrative access)
- `staff` - Staff (restricted access)
- `user` - Regular user (basic access)

**Successful Response:**
```json
{
  "success": true,
  "message": "User role updated to admin successfully",
  "user": {
    "id": 2,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "display_name": "John Doe",
    "role": "admin",
    "is_admin": true,
    "avatar_url": null,
    "is_active": true,
    "created_at": "2023-07-18T02:45:12.142Z",
    "updated_at": "2023-07-18T03:45:12.142Z",
    "last_login": "2023-07-18T02:45:12.142Z"
  }
}
```

### Other APIs

#### 1. Check API Status

```
GET /status
```

**Headers:**
```
x-api-key: your-api-key
```

**Successful Response:**
```json
{
  "status": "online",
  "version": "1.0.0",
  "timestamp": "2023-07-18T02:45:12.142Z"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (in development mode only)"
}
```

Common error codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error 