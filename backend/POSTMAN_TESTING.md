# Testing the Tourist Management System API with Postman

This guide will help you test the Tourist Management System API using Postman. It includes all the necessary endpoints, request examples, and expected responses.

## Setup

1. Make sure your backend server is running:
   ```
   cd "E:\GitHub Repositories\Tourist Management System\backend"
   npm run dev
   ```
   
2. The server should be running on `http://localhost:5000`

3. Import the collection into Postman (or create a new collection)

## Authentication Endpoints

### 1. User Registration

**Endpoint**: `POST http://localhost:5000/api/auth/register`

**Headers**:
- Content-Type: application/json

**Body (Guide)**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "guide@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "Guide"
}
```

**Body (Tourist)**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "tourist@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "Tourist"
}
```

**Body (Service Provider)**:
```json
{
  "firstName": "Mike",
  "lastName": "Johnson",
  "email": "provider@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "ServiceProvider"
}
```

**Expected Response (200 OK)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id_here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "guide@example.com",
    "role": "Guide"
  }
}
```

### 2. User Login

**Endpoint**: `POST http://localhost:5000/api/auth/login`

**Headers**:
- Content-Type: application/json

**Body**:
```json
{
  "email": "guide@example.com",
  "password": "password123"
}
```

**Expected Response (200 OK)**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id_here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "guide@example.com",
    "role": "Guide"
  }
}
```

> **Important**: After login, Postman will automatically save the session cookie. Make sure you have "Automatically follow redirects" and "Save cookies" enabled in Postman settings.

### 3. Get User Profile

**Endpoint**: `GET http://localhost:5000/api/auth/profile`

**Headers**: None (session cookie will be sent automatically)

**Expected Response (200 OK)**:
```json
{
  "user": {
    "id": "user_id_here",
    "firstName": "John",
    "lastName": "Doe",
    "email": "guide@example.com",
    "role": "Guide",
    "profilePicture": "",
    "isActive": true,
    "specialization": "",
    "experience": 0,
    "createdAt": "2023-04-01T12:00:00.000Z",
    "updatedAt": "2023-04-01T12:00:00.000Z"
  }
}
```

**Expected Response (401 Unauthorized - if not logged in)**:
```json
{
  "message": "Not authenticated"
}
```

### 4. User Logout

**Endpoint**: `POST http://localhost:5000/api/auth/logout`

**Headers**: None (session cookie will be sent automatically)

**Expected Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

## Testing Workflow

1. **Register a new user**: Create a user for each role (Guide, Tourist, ServiceProvider)
2. **Login with a registered user**: This will create a session
3. **Access the user profile**: Verify that you can access the profile with the active session
4. **Logout**: End the session
5. **Try accessing profile after logout**: Verify that you get a 401 Unauthorized error

## Testing Session Persistence

1. **Login with a registered user**
2. **Close Postman**
3. **Reopen Postman**
4. **Try accessing the profile endpoint**:
   - If cookies are properly stored, you should still be able to access the profile
   - If the session has expired, you'll need to login again

## Common Issues and Troubleshooting

### CORS Errors

If you encounter CORS errors, verify that the server is correctly configured with CORS. The backend should have:

```javascript
app.use(cors({
  origin: 'http://localhost:3000', // This might need to be updated based on your setup
  credentials: true
}));
```

### Session Not Persisting

If your session is not persisting between requests:

1. Check that "Save cookies" is enabled in Postman
2. Verify that the server is correctly setting the session cookie
3. Make sure your express-session configuration is correct

### Validation Errors

If you're getting validation errors during registration:
1. Ensure all required fields are provided
2. Check that passwords match
3. Verify that the email is in a valid format
4. Ensure the role is one of: "Guide", "Tourist", or "ServiceProvider"

## Next Steps

Once you've verified all the authentication endpoints are working correctly, you can:

1. Add more role-specific features
2. Create additional endpoints for updating user profiles
3. Implement profile picture uploads
4. Add functionality specific to each user role

Happy testing!
