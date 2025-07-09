const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
require('dotenv').config();

// For now, skip Firebase Admin initialization until we have real credentials
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Middleware to verify Google OAuth token (simplified for now)
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  
  try {
    // For now, just pass through - in production you'd verify the Google token
    req.user = { token };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Quiz schema
const quizSchema = new mongoose.Schema({
  userId: String,
  email: String,
  name: String,
  phoneNumber: String,
  answers: Object,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Quiz = mongoose.model('Quiz', quizSchema);

// Get user by email
app.get('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const quiz = await Quiz.findOne({ email });
    
    if (quiz) {
      res.json({
        id: quiz.userId,
        email: quiz.email,
        name: quiz.name,
        picture: '', // You can add this to your schema if needed
        phoneNumber: quiz.phoneNumber,
        answers: quiz.answers,
        status: quiz.status,
        submittedAt: quiz.createdAt
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Submit quiz
app.post('/api/submit-quiz', authenticateToken, async (req, res) => {
  const { userId, email, name, phoneNumber, answers } = req.body;
  
  try {
    // Check if user already exists
    let quiz = await Quiz.findOne({ email });
    
    if (quiz) {
      // Update existing quiz
      quiz.answers = answers;
      quiz.phoneNumber = phoneNumber;
      quiz.status = 'pending';
      await quiz.save();
    } else {
      // Create new quiz
      quiz = new Quiz({ userId, email, name, phoneNumber, answers });
      await quiz.save();
    }
    
    res.json({ success: true, quiz });
  } catch (err) {
    console.error('Error saving quiz:', err);
    res.status(500).json({ error: 'Failed to save quiz' });
  }
});

// Get user quiz (alternative endpoint)
app.get('/api/my-quiz', authenticateToken, async (req, res) => {
  try {
    // This would need the user email from the token
    res.status(400).json({ error: 'Use /api/user/:email instead' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get quiz' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
}); 