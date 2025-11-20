# API Endpoints Documentation

Base URL: `http://localhost:3000/api`

## Authentication Endpoints

### Public Endpoints (No authentication required)

#### `POST /api/auth/login`
Login with email and password
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "access_token": "jwt-token-here",
      "user": {
        "_id": "user-id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "user"
      }
    }
  }
  ```

#### `POST /api/auth/register`
Register a new user (default role: `user`)
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name",
    "role": "user" // optional, defaults to "user"
  }
  ```
- **Response:**
  ```json
  {
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "_id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "user",
      "isActive": true
    }
  }
  ```

### Protected Endpoints (Require JWT token)

#### `GET /api/auth/profile`
Get current user's profile
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Response:**
  ```json
  {
    "statusCode": 200,
    "message": "Profile retrieved successfully",
    "data": {
      "_id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "user",
      "isActive": true,
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### `POST /api/auth/register-admin`
Create an admin user (requires `super_admin` role)
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `super_admin`
- **Request Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin Name",
    "role": "admin"
  }
  ```

---

## User Management Endpoints

All endpoints require authentication and `admin` or `super_admin` role.

#### `GET /api/users`
List all users
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `admin` or `super_admin`
- **Response:** Array of users (passwords excluded)

#### `GET /api/users/:id`
Get user by ID
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `admin` or `super_admin`

#### `POST /api/users`
Create a new user
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `admin` or `super_admin`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name",
    "role": "user",
    "isActive": true
  }
  ```

#### `PATCH /api/users/:id`
Update user
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `admin` or `super_admin`
- **Request Body:** (all fields optional)
  ```json
  {
    "email": "newemail@example.com",
    "name": "New Name",
    "role": "admin",
    "isActive": false
  }
  ```

#### `DELETE /api/users/:id`
Delete user
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `super_admin` only
- **Response:** 204 No Content

---

## YouTubers Management Endpoints

All endpoints require authentication.

#### `GET /api/youtubers`
List all YouTubers
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Response:** Array of all YouTubers

#### `GET /api/youtubers/:id`
Get YouTuber by ID
- **Headers:** `Authorization: Bearer <jwt-token>`

#### `POST /api/youtubers`
Create a new YouTuber
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `admin` or `super_admin`
- **Request Body:**
  ```json
  {
    "channelId": "UC...",
    "channelName": "Channel Name",
    "isActive": true
  }
  ```

#### `PATCH /api/youtubers/:id`
Update YouTuber
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `admin` or `super_admin`
- **Request Body:**
  ```json
  {
    "channelName": "New Channel Name",
    "isActive": false
  }
  ```

#### `DELETE /api/youtubers/:id`
Delete YouTuber
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `admin` or `super_admin`
- **Response:** 204 No Content

---

## Videos Endpoints

All endpoints require authentication.

#### `GET /api/youtubers/:channelId/videos`
Get all videos for a specific YouTuber
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Response:** Array of videos with transcripts and analysis

#### `GET /api/videos/:id`
Get a single video with full details
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Response:** Video object with transcript and sentiment analysis

#### `PATCH /api/videos/:id/reanalyze`
Mark video for re-analysis
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Request Body:**
  ```json
  {
    "forceRetranscribe": false
  }
  ```

---

## Cron Runs / Job Logs Endpoints

All endpoints require authentication and `admin` or `super_admin` role.

#### `GET /api/cron-runs`
List cron runs with filters
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `admin` or `super_admin`
- **Query Parameters:**
  - `status` (optional): `running` | `success` | `failed`
  - `startDate` (optional): ISO date string
  - `endDate` (optional): ISO date string
  - `page` (optional): page number (default: 1)
  - `limit` (optional): items per page (default: 10)
- **Example:** `/api/cron-runs?status=success&page=1&limit=20`

#### `GET /api/cron-runs/:id`
Get detailed information about a specific cron run
- **Headers:** `Authorization: Bearer <jwt-token>`
- **Required Role:** `admin` or `super_admin`

---

## Role-Based Access Summary

### `super_admin` Role
- Full access to all endpoints
- Can delete users
- Can create admin users
- Can manage all YouTubers and videos

### `admin` Role
- Can manage users (except delete)
- Can manage YouTubers
- Can view all videos
- Can view cron run logs

### `user` Role
- Can view YouTubers (read-only)
- Can view videos (read-only)
- Cannot manage users
- Cannot view cron logs
- Cannot create/update/delete YouTubers

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

The JWT token is obtained from the `/api/auth/login` endpoint and is valid for 7 days (configurable via `JWT_EXPIRES_IN` env variable).

