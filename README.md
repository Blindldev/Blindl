# Blind Dating Quiz App

A beautiful, animated quiz application for blind dating events with Google OAuth authentication and phone number verification.

## 🚀 Features

- **Google OAuth Authentication**: Secure login with Google accounts
- **Phone Number Verification**: Firebase phone authentication for additional security
- **Interactive Quiz**: 11 comprehensive questions about dating preferences
- **Real-time Validation**: Form validation with helpful error messages
- **Progress Tracking**: Visual progress bar and step indicators
- **User Profiles**: Returning users see their submitted answers and status
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful Animations**: Smooth transitions with Framer Motion

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **@react-oauth/google** for Google authentication
- **Firebase** for phone verification

### Backend (Optional)
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Firebase Admin SDK** for authentication verification

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd BlindlDating
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies (optional)**
   ```bash
   cd backend
   npm install
   cd ..
   ```

## ⚙️ Configuration

### Frontend Setup

1. **Firebase Configuration**
   Update `src/firebase.ts` with your Firebase project settings:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

2. **Google OAuth Client ID**
   The app is already configured with your Google Client ID in `src/App.tsx`.

### Backend Setup (Optional)

1. **Environment Variables**
   Create `backend/.env`:
   ```
   PORT=4000
   MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/blind-dating-quiz
   ```

2. **Firebase Service Account**
   Download your Firebase service account key and save it as `backend/serviceAccountKey.json`.

## 🚀 Running the Application

### Frontend Only (Recommended for Development)
```bash
npm run dev
```
Visit `http://localhost:3000` (or the port shown in the terminal).

### With Backend
1. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend**
   ```bash
   npm run dev
   ```

## 📱 User Flow

1. **Welcome Page**: Users see the landing page with Google Sign-In
2. **Google Authentication**: Users sign in with their Google account
3. **Quiz Flow**: Users answer 11 questions about their preferences:
   - Gender
   - Name
   - Age
   - Phone number (with verification)
   - Sexual orientation
   - Relationship goals
   - Drinking/smoking habits
   - Available dates
   - Self description
   - Ideal partner description
   - How they found the event
4. **Phone Verification**: When users reach the phone question, they verify their number
5. **Submission**: Quiz answers are stored locally (or in backend if configured)
6. **Profile Page**: Returning users see their status and submitted answers

## 🔧 Development

### Project Structure
```
BlindlDating/
├── src/                    # Frontend source code
│   ├── App.tsx            # Main application component
│   ├── firebase.ts        # Firebase configuration
│   └── index.css          # Global styles
├── backend/               # Backend API (optional)
│   ├── index.js           # Express server
│   ├── package.json       # Backend dependencies
│   └── .env              # Backend environment variables
├── public/                # Static assets
├── package.json           # Frontend dependencies
└── README.md             # This file
```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm run dev` - Start backend with nodemon
- `npm start` - Start backend in production mode

## 🔒 Security Features

- **Google OAuth**: Secure authentication with Google accounts
- **Phone Verification**: Additional verification step for phone numbers
- **Input Validation**: Comprehensive form validation
- **Local Storage**: Data stored securely in browser (or backend if configured)

## 🎨 UI/UX Features

- **Modern Design**: Clean, modern interface with gradient backgrounds
- **Smooth Animations**: Framer Motion animations for better user experience
- **Progress Indicators**: Visual progress bar and step counters
- **Responsive Layout**: Works on all device sizes
- **Error Handling**: Clear error messages and validation feedback

## 📊 Data Storage

### Frontend Only Mode
- Quiz answers stored in browser localStorage
- User profiles persist across sessions
- No external database required

### With Backend Mode
- Quiz answers stored in MongoDB
- User authentication verified with Firebase Admin SDK
- RESTful API endpoints for data management

## 🚀 Deployment

### Frontend Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy the backend folder to your server (Heroku, Railway, etc.)
3. Update frontend API endpoints to point to your deployed backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify your Firebase configuration
4. Check that your Google OAuth client ID is correct

## 🔄 Updates

- **v1.0.0**: Initial release with Google OAuth and phone verification
- Frontend-only mode for easy deployment
- Optional backend for data persistence
- Comprehensive form validation
- Beautiful UI with animations 