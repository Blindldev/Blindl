import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, currentStep, totalSteps }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-800">Finding Your Perfect Match</h2>
        </div>
        <span className="text-sm font-medium text-gray-600">
          {currentStep} of {totalSteps}
        </span>
      </div>
      
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Getting Started</span>
        <span>Almost Done</span>
      </div>
    </div>
  );
};

export default ProgressBar; 