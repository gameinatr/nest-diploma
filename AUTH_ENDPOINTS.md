# Authentication Endpoints

This document describes the authentication endpoints available in the application.

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Register a new user
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:**
- `refresh_token` (HTTP-only, 7 days expiration)

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:**
- `refresh_token` (HTTP-only, 7 days expiration)

### 3. Refresh Token
**POST** `/auth/refresh`

**Cookies Required:**
- `refresh_token` (HTTP-only cookie)

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Logout
**POST** `/auth/logout`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Effect:**
- Clears the `refresh_token` cookie

### 5. Get Profile (Protected)
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Other Endpoints

### Database Test
**GET** `/db-test`

Tests the database connection and returns database information.

### Health Check
**GET** `/health`

Returns application health status.

## Usage Examples

### Using curl

1. **Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. **Refresh Token:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

4. **Logout:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

5. **Get Profile:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Notes

- **Access tokens** expire after 15 minutes
- **Refresh tokens** expire after 7 days
- Refresh tokens are stored as HTTP-only cookies for security
- Passwords are hashed using bcryptjs with 10 salt rounds
- Email addresses must be unique
- Password must be at least 6 characters long
- firstName and lastName are optional fields
- Tokens are not invalidated when new ones are issued (stateless approach)
- Use the refresh endpoint to get new access tokens without re-authentication

## Token Security

- Access tokens are short-lived (15 minutes) for security
- Refresh tokens are stored in HTTP-only cookies to prevent XSS attacks
- Refresh tokens have a longer lifespan (7 days) for better user experience
- In production, ensure HTTPS is enabled for secure cookie transmission