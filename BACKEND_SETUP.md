# Backend Setup Guide for Quiz Data Storage with Google Auth

## Overview
This guide will help you set up a secure backend to store quiz responses with Google authentication integration.

## New User Flow
1. User visits the app and sees "Get Started" button
2. User clicks "Get Started" and is prompted to login with Google
3. If user has never logged in before → they complete the quiz
4. If user has logged in before → they see their profile status and answers
5. All data is tied to their Google account

## Data Structure

### User Profile
```json
{
  "id": "google_user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "answers": {
    "gender": "Male",
    "age": 25,
    "phone": "+1234567890",
    "orientation": "Straight",
    "relationshipGoals": "Long-term relationship",
    "drinkingSmoking": "I drink occasionally",
    "availableDates": ["Weekend evenings", "Weekday evenings"],
    "selfDescription": "I love hiking and reading...",
    "idealPartner": "Someone who is kind and adventurous...",
    "howDidYouFind": "Social media"
  },
  "status": "pending",
  "submittedAt": "2023-12-21T10:30:45.123Z",
  "createdAt": "2023-12-21T10:30:45.123Z",
  "updatedAt": "2023-12-21T10:30:45.123Z"
}
```

## Backend Options

### Option 1: Node.js/Express with MongoDB (Recommended)

#### 1. Create the backend project
```bash
mkdir quiz-backend
cd quiz-backend
npm init -y
npm install express mongoose cors helmet bcryptjs jsonwebtoken dotenv google-auth-library
npm install --save-dev nodemon
```

#### 2. Create the user schema
```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  answers: {
    gender: { type: String, required: true },
    age: { type: Number, required: true, min: 18, max: 99 },
    phone: { type: String, required: false },
    orientation: { type: String, required: true },
    relationshipGoals: { type: String, required: true },
    drinkingSmoking: { type: String, required: true },
    availableDates: [{ type: String, required: true }],
    selfDescription: { type: String, required: true, maxlength: 500 },
    idealPartner: { type: String, required: true, maxlength: 500 },
    howDidYouFind: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'contacted'],
    default: 'pending'
  },
  submittedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'answers.age': 1 });
userSchema.index({ 'answers.gender': 1 });

module.exports = mongoose.model('User', userSchema);
```

#### 3. Google Auth verification middleware
```javascript
// middleware/googleAuth.js
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyGoogleToken };
```

#### 4. User routes
```javascript
// routes/user.js
const express = require('express');
const User = require('../models/User');
const { verifyGoogleToken } = require('../middleware/googleAuth');
const { validateQuizData } = require('../middleware/validation');

const router = express.Router();

// Get user by email (for checking if user exists)
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit quiz answers (requires Google auth)
router.post('/submit-quiz', verifyGoogleToken, validateQuizData, async (req, res) => {
  try {
    const { userId, email, name, answers, submittedAt } = req.body;
    const googleUser = req.user;

    // Verify the user matches the token
    if (googleUser.email !== email) {
      return res.status(403).json({ error: 'Email mismatch' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user
      user.answers = answers;
      user.submittedAt = submittedAt;
      user.status = 'pending';
      await user.save();
    } else {
      // Create new user
      user = new User({
        id: userId,
        email,
        name,
        picture: googleUser.picture,
        answers,
        submittedAt,
        status: 'pending'
      });
      await user.save();
    }

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        answers: user.answers,
        status: user.status,
        submittedAt: user.submittedAt
      }
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user status (admin only)
router.patch('/:email/status', async (req, res) => {
  try {
    const { email } = req.params;
    const { status } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

#### 5. Updated validation middleware
```javascript
// middleware/validation.js
const validateQuizData = (req, res, next) => {
  const { answers } = req.body;

  // Required fields validation
  const requiredFields = [
    'gender', 'age', 'orientation', 'relationshipGoals', 
    'drinkingSmoking', 'availableDates', 'selfDescription', 
    'idealPartner', 'howDidYouFind'
  ];

  for (const field of requiredFields) {
    if (!answers[field]) {
      return res.status(400).json({
        error: `Missing required field: ${field}`
      });
    }
  }

  // Age validation
  if (answers.age < 18 || answers.age > 99) {
    return res.status(400).json({
      error: 'Age must be between 18 and 99'
    });
  }

  // Phone validation (optional)
  if (answers.phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(answers.phone.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({
        error: 'Invalid phone number format'
      });
    }
  }

  // Description length validation
  if (answers.selfDescription.length > 500 || answers.idealPartner.length > 500) {
    return res.status(400).json({
      error: 'Descriptions must be less than 500 characters'
    });
  }

  // Available dates validation
  if (!Array.isArray(answers.availableDates) || answers.availableDates.length === 0) {
    return res.status(400).json({
      error: 'Please select at least one available date'
    });
  }

  next();
};

module.exports = { validateQuizData };
```

#### 6. Main server file
```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const userRoutes = require('./routes/user');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/user', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 7. Environment variables (.env)
```env
MONGODB_URI=mongodb://localhost:27017/dating-quiz
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## Google OAuth Setup

### 1. Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
8. Copy the Client ID

### 2. Update Frontend
Replace `YOUR_GOOGLE_CLIENT_ID` in `src/App.tsx` with your actual Google Client ID:

```typescript
<GoogleOAuthProvider clientId="your-google-client-id.apps.googleusercontent.com">
```

## Security Best Practices

### 1. Token Verification
- Always verify Google tokens on the backend
- Never trust client-side data
- Use HTTPS in production

### 2. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/user', limiter);
```

### 3. Data Privacy
- Store only necessary user data
- Implement data deletion endpoints
- Add GDPR compliance features

## Frontend Integration

The frontend is already set up to work with this backend. The key endpoints are:

- `GET /api/user/:email` - Check if user exists
- `POST /api/user/submit-quiz` - Submit quiz answers (requires Google token)

## Deployment

### 1. Environment Variables
Make sure to set these in production:
- `GOOGLE_CLIENT_ID`
- `MONGODB_URI`
- `FRONTEND_URL`

### 2. CORS Configuration
Update CORS origins for production:
```javascript
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true
}));
```

## Next Steps

1. **Set up Google OAuth credentials**
2. **Create the backend** following this guide
3. **Update the frontend** with your Google Client ID
4. **Test the full flow** end-to-end
5. **Deploy to production** with proper security measures

The app now has a complete authentication flow with Google OAuth and user profile management! 