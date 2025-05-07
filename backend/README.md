# FixMyRide Backend

This is the backend server for the FixMyRide application.

## Deployment Instructions

### 1. Prepare Your Application

1. Make sure your code is in a Git repository
2. Ensure you have a `package.json` file with all dependencies
3. Set up your environment variables

### 2. Deploy to Render.com

1. Create a Render account at https://render.com
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Configure your service:
   - Name: fixmyride-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret key
     - `PORT`: 3000
     - `NODE_ENV`: production

### 3. Update Frontend Configuration

After deployment, update your frontend's API configuration to use the new backend URL:

```typescript
// app/config.ts
export const API_ENDPOINTS = {
  BASE_URL: 'https://your-render-app-url.onrender.com',
  // ... other endpoints
};
```

### 4. Environment Variables

Create a `.env` file in your backend directory with these variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

### 5. MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Add it to your environment variables

### 6. Testing the Deployment

1. Test the API endpoints using Postman or similar tool
2. Verify the frontend can connect to the backend
3. Test user registration and login
4. Test issue creation and mechanic offers

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000

## API Endpoints

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/issues - Create a new issue
- GET /api/issues - Get all issues
- POST /api/issues/:id/offer - Submit an offer
- POST /api/issues/:id/accept/:mechanicId - Accept an offer 