# Blind Dating Quiz Backend

A Node.js/Express backend for the Blind Dating Quiz application with Firebase Authentication and MongoDB storage.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file with:
   ```
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   ```

3. **Firebase Service Account:**
   - Go to [Firebase Console > Project Settings > Service Accounts](https://console.firebase.google.com/)
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in the backend root

4. **Start the server:**
   ```bash
   npm run dev  # Development with auto-reload
   npm start    # Production
   ```

## API Endpoints

### POST /api/submit-quiz
Submit quiz answers (requires Firebase ID token)

**Headers:**
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Body:**
```json
{
  "answers": {
    "gender": "male",
    "name": "John Doe",
    "age": 25,
    "email": "john@example.com",
    "phone": "+1234567890",
    "sexualOrientation": "straight",
    "relationshipGoals": "serious",
    "drinkingHabits": "socially",
    "smokingHabits": "never",
    "availableDates": ["friday", "saturday"],
    "selfDescription": "I'm a fun person...",
    "idealPartnerDescription": "Someone who...",
    "howDidYouFindOut": "social_media"
  }
}
```

### GET /api/my-quiz
Get user's quiz data (requires Firebase ID token)

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response:**
```json
{
  "uid": "firebase_user_id",
  "email": "user@example.com",
  "phone": "+1234567890",
  "answers": { ... },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Authentication

The backend uses Firebase Admin SDK to verify Firebase ID tokens. All protected endpoints require a valid Firebase ID token in the Authorization header. 