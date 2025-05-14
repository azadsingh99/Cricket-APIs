# Cricket APIs

A Node.js backend application with MySQL database for user registration, OTP verification, and game score management.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a MySQL database named `cricket_api`
4. Configure environment variables in `.env` file:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=cricket_api
   JWT_SECRET=your_secret_key
   OTP_EXPIRY=60000
   ```
5. Start the server:
   ```
   npm run dev
   ```

## API Documentation

### Authentication APIs

#### 1. Send OTP
- **URL**: `/api/auth/send-otp`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "phone": "1234567890"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully"
  }
  ```

#### 2. Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "phone": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "dob": "1990-01-01",
    "otp": "1234"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "jwt_token_here",
    "userId": 1
  }
  ```

### Score APIs (Requires Authentication)

#### 1. Save Score
- **URL**: `/api/score/save`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Body**:
  ```json
  {
    "score": 100
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Score saved successfully"
  }
  ```

#### 2. Get Score Card
- **URL**: `/api/score/scorecard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response** (Success - Image generated):
  ```json
  {
    "success": true,
    "imageUrl": "/uploads/scorecard_f47ac10b-58cc-4372-a567-0e02b2c3d479.jpg"
  }
  ```
- **Response** (Fallback - If image generation fails):
  ```json
  {
    "success": true,
    "scoreCard": {
      "userName": "John Doe",
      "rank": 1,
      "score": 1050,
      "date": "22nd April 25",
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "fallback": true
    },
    "message": "Image generation failed, returning data instead"
  }
  ```

#### 3. Get Weekly Scores
- **URL**: `/api/score/weekly`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt_token_here`
- **Response**:
  ```json
  {
    "success": true,
    "weeks": [
      {
        "weekNo": 1,
        "rank": 1,
        "totalScore": 1500
      },
      {
        "weekNo": 2,
        "rank": 3,
        "totalScore": 120
      }
    ]
  }
  ```

## Image Generation

The score card API generates JPEG images with the following specifications:
- Size: 1280x720 pixels
- Font: Arial (falls back from specified Poppins)
- Format: JPEG
- Content: User name, rank, total score, and current date

## Postman Collection

The application comes with a Postman collection for testing:

1. Import `Cricket-APIs-Postman-Collection.json` into Postman
2. The collection contains all API endpoints with example request/response data
3. All endpoints are configured to use `http://localhost:3000`
4. The collection includes automatic token extraction - when you register a user, the JWT token is automatically saved for subsequent authenticated requests

## Notes

- OTP is hardcoded to "1234" for all requests
- OTP expires after 1 minute
- Each user can submit a maximum of 3 scores per day
- Score value must be between 50 and 500 