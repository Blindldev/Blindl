import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { LogOut, Clock, Heart, Phone, CheckCircle } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  phoneNumber?: string;
  answers?: Record<string, any>;
  status: 'pending' | 'matched' | 'contacted';
  submittedAt?: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneVerificationStep, setPhoneVerificationStep] = useState<'input' | 'code' | 'complete'>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);

  const questions = [
    {
      id: 'gender',
      question: 'What is your gender?',
      type: 'select',
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      required: true
    },
    {
      id: 'name',
      question: 'What is your name?',
      type: 'text',
      placeholder: 'Enter your full name',
      required: true
    },
    {
      id: 'age',
      question: 'How old are you?',
      type: 'number',
      placeholder: 'Enter your age',
      required: true,
      validation: (value: string) => {
        const age = parseInt(value);
        if (!value) return 'Age is required';
        if (isNaN(age)) return 'Please enter a valid number';
        if (age < 18) return 'You must be at least 18 years old';
        if (age > 99) return 'Please enter a valid age (18-99)';
        return null;
      }
    },
    {
      id: 'phone',
      question: 'What is your phone number?',
      type: 'tel',
      placeholder: 'Enter your phone number',
      required: true,
      validation: (value: string) => {
        if (!value) return 'Phone number is required';
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return null;
      }
    },
    {
      id: 'orientation',
      question: 'What is your sexual orientation?',
      type: 'select',
      options: ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Other', 'Prefer not to say'],
      required: true
    },
    {
      id: 'relationshipGoals',
      question: 'What are your relationship goals?',
      type: 'select',
      options: ['Long-term relationship', 'Marriage', 'Casual dating', 'Friendship first', 'Not sure yet'],
      required: true
    },
    {
      id: 'drinkingSmoking',
      question: 'Do you drink or smoke?',
      type: 'select',
      options: ['I drink occasionally', 'I drink regularly', 'I smoke occasionally', 'I smoke regularly', 'I don\'t drink or smoke', 'I prefer not to say'],
      required: true
    },
    {
      id: 'availableDates',
      question: 'Which dates work for you? (Select all that apply)',
      type: 'multiSelect',
      options: ['Weekday evenings', 'Weekend afternoons', 'Weekend evenings', 'Weekday lunches', 'Flexible schedule'],
      required: true,
      validation: (value: string[]) => {
        if (!value || value.length === 0) return 'Please select at least one option';
        return null;
      }
    },
    {
      id: 'selfDescription',
      question: 'Give a brief description of yourself. Hobbies, work, etc.',
      type: 'textarea',
      placeholder: 'Tell us about yourself...',
      required: true,
      validation: (value: string) => {
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 500) return 'Description must be less than 500 characters';
        return null;
      }
    },
    {
      id: 'idealPartner',
      question: 'Give a brief description of your ideal partner. Green flags? Deal breakers?',
      type: 'textarea',
      placeholder: 'Describe your ideal partner...',
      required: true,
      validation: (value: string) => {
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 500) return 'Description must be less than 500 characters';
        return null;
      }
    },
    {
      id: 'howDidYouFind',
      question: 'How did you find out about this event?',
      type: 'select',
      options: ['Social media', 'Friend recommendation', 'Online search', 'Event website', 'Other'],
      required: true
    }
  ];

  // Check for existing user session on app load
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const token = localStorage.getItem('google_token');
        if (token) {
          const decoded = jwtDecode(token) as any;
          
          // Check if user has existing data in localStorage
          const existingData = localStorage.getItem(`user_${decoded.email}`);
          if (existingData) {
            const userData = JSON.parse(existingData);
            setUser(userData);
            setIsAuthenticated(true);
            
            // If user has already submitted answers, show waiting page
            if (userData.answers) {
              setAnswers(userData.answers);
            }
          } else {
            // User doesn't exist in our system yet
            setUser({
              id: decoded.sub,
              email: decoded.email,
              name: decoded.name,
              picture: decoded.picture,
              status: 'pending'
            });
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        localStorage.removeItem('google_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingUser();
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential) as any;
      localStorage.setItem('google_token', credentialResponse.credential);
      
      // Check if user has existing data in localStorage
      const existingData = localStorage.getItem(`user_${decoded.email}`);
      if (existingData) {
        const userData = JSON.parse(existingData);
        setUser(userData);
        setIsAuthenticated(true);
        
        // If user has already submitted answers, show waiting page
        if (userData.answers) {
          setAnswers(userData.answers);
        }
      } else {
        // New user - show quiz
        setUser({
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          status: 'pending'
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('google_token');
    setUser(null);
    setIsAuthenticated(false);
    setAnswers({});
    setCurrentStep(0);
    setErrors([]);
  };

  const handlePhoneVerification = async () => {
    setIsPhoneVerifying(true);
    try {
      // For now, simulate phone verification
      setTimeout(() => {
        setPhoneVerificationStep('code');
        setIsPhoneVerifying(false);
      }, 1000);
    } catch (error) {
      console.error('Phone verification error:', error);
      alert('Failed to send verification code. Please try again.');
    } finally {
      setIsPhoneVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsPhoneVerifying(true);
    try {
      // For now, simulate code verification
      setTimeout(() => {
        setPhoneVerificationStep('complete');
        
        // Update user with verified phone number
        setUser(prev => prev ? {
          ...prev,
          phoneNumber: phoneNumber
        } : null);
        setIsPhoneVerifying(false);
      }, 1000);
    } catch (error) {
      console.error('Code verification error:', error);
      alert('Invalid verification code. Please try again.');
    } finally {
      setIsPhoneVerifying(false);
    }
  };

  const validateField = (questionId: string, value: any): string | null => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return null;

    if (question.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${question.question} is required`;
    }

    if (question.validation) {
      return question.validation(value);
    }

    return null;
  };

  const validateCurrentStep = (): boolean => {
    const currentQuestion = questions[currentStep];
    const answer = answers[currentQuestion.id];
    const error = validateField(currentQuestion.id, answer);
    
    if (error) {
      setErrors([{ field: currentQuestion.id, message: error }]);
      return false;
    } else {
      setErrors([]);
      return true;
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Clear error when user starts typing
    setErrors(prev => prev.filter(error => error.field !== questionId));
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    // If this is the phone question and user hasn't verified their phone
    if (questions[currentStep].id === 'phone' && !user?.phoneNumber) {
      setPhoneNumber(answers.phone);
      setPhoneVerificationStep('input');
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Quiz completed - submit to backend
      await submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setErrors([]); // Clear errors when going back
    }
  };

  const submitQuiz = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const submissionData = {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        picture: user.picture,
        answers: answers,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // Store data locally
      localStorage.setItem(`user_${user.email}`, JSON.stringify(submissionData));
      
      // Update user with answers
      setUser(prev => prev ? {
        ...prev,
        answers: answers,
        status: 'pending',
        submittedAt: new Date().toISOString()
      } : null);
      
      alert('Quiz submitted successfully! We\'ll be in touch soon.');
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your quiz. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentError = errors.find(error => error.field === currentQuestion?.id);
  
  const canProceed = currentQuestion && (
    currentQuestion.required ? 
    answers[currentQuestion.id] && 
    (Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id].length > 0 : true) :
    true
  ) && !currentError;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Phone verification modal
  if (phoneVerificationStep !== 'complete' && currentQuestion?.id === 'phone' && answers.phone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <Phone className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {phoneVerificationStep === 'input' ? 'Verify Your Phone Number' : 'Enter Verification Code'}
            </h2>
            <p className="text-gray-600">
              {phoneVerificationStep === 'input' 
                ? 'We\'ll send a verification code to your phone number.' 
                : 'Enter the 6-digit code sent to your phone.'}
            </p>
          </div>

          {phoneVerificationStep === 'input' ? (
            <div className="space-y-4">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div id="recaptcha-container"></div>
              <button
                onClick={handlePhoneVerification}
                disabled={isPhoneVerifying || !phoneNumber}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isPhoneVerifying ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              />
              <button
                onClick={handleVerifyCode}
                disabled={isPhoneVerifying || verificationCode.length !== 6}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isPhoneVerifying ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          )}

          <button
            onClick={() => setPhoneVerificationStep('complete')}
            className="w-full mt-4 text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>
        </motion.div>
      </div>
    );
  }

  // Welcome page (not authenticated)
  if (!isAuthenticated) {
    return (
      <GoogleOAuthProvider clientId="910532636592-98noic506pegni3jm6omq7p610u8gdrh.apps.googleusercontent.com">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center safe-area-top safe-area-bottom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mobile-card text-center max-w-md w-full mx-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <Heart className="w-16 h-16 text-blue-500 mx-auto" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-800 mb-4"
            >
              Find Your Perfect Match
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-8"
            >
              Take our compatibility quiz to discover meaningful connections. 
              Sign in with Google to get started.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  alert('Login failed. Please try again.');
                }}
                theme="filled_blue"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-gray-400 mt-8"
            >
              Your privacy is protected. We only use your Google account for authentication.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-green-600 mt-2 font-medium"
            >
              ✨ Now live on blindl.com
            </motion.div>
          </motion.div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  // Waiting page (user has already submitted answers)
  if (user?.answers && Object.keys(user.answers).length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 safe-area-top safe-area-bottom">
        <div className="mobile-container">
          {/* Header */}
          <div className="mobile-card mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Welcome back, {user.name}!</h1>
                  <p className="text-gray-600">{user.email}</p>
                  {user.phoneNumber && (
                    <p className="text-sm text-gray-500 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {user.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Status Card */}
          <div className="mobile-card mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Clock className="w-8 h-8 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-800">Your Profile Status</h2>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Status: {user.status}</h3>
              <p className="text-blue-700">
                {user.status === 'pending' && 'We\'re reviewing your profile and finding compatible matches.'}
                {user.status === 'matched' && 'Great news! We\'ve found some potential matches for you.'}
                {user.status === 'contacted' && 'We\'ve reached out with your matches. Check your email!'}
              </p>
            </div>

            {user.submittedAt && (
              <p className="text-sm text-gray-500">
                Submitted on: {new Date(user.submittedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Your Answers */}
          <div className="mobile-card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(user.answers).map(([key, value]) => {
                const question = questions.find(q => q.id === key);
                if (!question) return null;
                
                return (
                  <div key={key} className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{question.question}</h3>
                    <p className="text-gray-600">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz page (authenticated but no answers yet)
  const renderQuestion = () => {
    const question = currentQuestion;
    const answer = answers[question.id];
    const error = errors.find(e => e.field === question.id);

    switch (question.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <div>
            <input
              type={question.type}
              value={answer || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error.message}</p>
            )}
          </div>
        );
      
      case 'textarea':
        return (
          <div>
            <textarea
              value={answer || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error.message}</p>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div>
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div
                  key={option}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    answer === option 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleAnswer(question.id, option)}
                >
                  <span className="font-medium">{option}</span>
                </div>
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error.message}</p>
            )}
          </div>
        );
      
      case 'multiSelect':
        const selectedOptions = Array.isArray(answer) ? answer : [];
        return (
          <div>
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div
                  key={option}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedOptions.includes(option)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    const newSelection = selectedOptions.includes(option)
                      ? selectedOptions.filter(o => o !== option)
                      : [...selectedOptions, option];
                    handleAnswer(question.id, newSelection);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {selectedOptions.includes(option) && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error.message}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 safe-area-top safe-area-bottom">
      <div className="mobile-container">
        {/* Header */}
        <div className="mobile-card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img 
                src={user?.picture} 
                alt={user?.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
                {user?.phoneNumber && (
                  <p className="text-xs text-green-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Phone verified
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Question {currentStep + 1} of {questions.length}
            </h2>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="mobile-card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>
          {currentQuestion.required && (
            <p className="text-sm text-red-500 mb-4">* Required</p>
          )}
          
          <div className="space-y-4">
            {renderQuestion()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                !canProceed || isSubmitting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 
               currentStep === questions.length - 1 ? 'Complete Profile' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;