import React from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, RefreshCw, Mail } from 'lucide-react';

interface CompletionScreenProps {
  answers: Record<string, any>;
  onRestart: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ answers, onRestart }) => {
  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log('Quiz answers:', answers);
    alert('Thank you! Your responses have been submitted. We\'ll be in touch soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="quiz-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              <Heart className="w-8 h-8 text-primary-500 absolute -top-2 -right-2" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-800 mb-4"
          >
            Quiz Complete!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 mb-8"
          >
            Thank you for sharing your preferences with us. We're excited to help you find meaningful connections!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-50 rounded-2xl p-6 mb-8 text-left"
          >
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-primary-500" />
              What happens next?
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>We'll review your responses and find compatible matches</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>You'll receive an email within 24-48 hours with your matches</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>We'll coordinate a time for your blind date experience</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <button
              onClick={handleSubmit}
              className="btn-primary text-lg px-8 py-4 w-full"
            >
              Submit My Responses
            </button>
            
            <button
              onClick={onRestart}
              className="btn-secondary text-lg px-8 py-4 w-full flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Take Quiz Again</span>
            </button>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-gray-400 mt-8"
          >
            Your privacy is protected. We never share your personal information without consent.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default CompletionScreen; 