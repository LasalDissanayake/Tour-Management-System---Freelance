# Tourist Management System - Backend

This is the backend for the Tourist Management System built using Node.js, Express, and MongoDB.

## Features

- User Authentication (Register, Login)
- Role-based access control (Guide, Tourist, Service Provider)
- User Profile Management

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB database (MongoDB Atlas connection string provided)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Tourist-Management-System/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://Scooby:OgzjHRCxtXE9wHC3@tourist.z0kko6u.mongodb.net/?retryWrites=true&w=majority&appName=Tourist
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- **Register**: `POST /api/auth/register`
  - Body: 
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "password": "password123",
      "confirmPassword": "password123",
      "role": "Tourist"
    }
    ```

- **Login**: `POST /api/auth/login`
  - Body: 
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```

- **Get Profile**: `GET /api/auth/profile`
  - Requires an active session (user must be logged in)

- **Logout**: `POST /api/auth/logout`
  - Ends the user session

## Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── models/          # Mongoose models
├── routes/          # Route definitions
├── .env             # Environment variables
├── package.json     # Project dependencies
├── README.md        # Project documentation
└── server.js        # Entry point
```

## Authentication Flow

1. User registers with required fields (firstName, lastName, email, password, confirmPassword, and role)
2. Password is hashed before saving to the database
3. User can log in with email and password
4. Session is created and maintained with a cookie
5. Protected routes check for an active session

## Future Enhancements

- Email verification
- Password reset functionality
- Additional role-specific features
- Profile updates and image upload
