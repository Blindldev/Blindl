import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Question } from '../types/quiz';

interface QuizQuestionProps {
  question: Question;
  answer: any;
  onAnswer: (questionId: string, answer: any) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, answer, onAnswer }) => {
  const [localAnswer, setLocalAnswer] = useState(answer || '');

  const handleInputChange = (value: any) => {
    setLocalAnswer(value);
    onAnswer(question.id, value);
  };

  const handleOptionSelect = (option: string) => {
    if (question.type === 'multiSelect') {
      const currentAnswers = Array.isArray(localAnswer) ? localAnswer : [];
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter((a: string) => a !== option)
        : [...currentAnswers, option];
      handleInputChange(newAnswers);
    } else {
      handleInputChange(option);
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={question.type}
            value={localAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={question.placeholder}
            className="input-field"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={localAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={question.placeholder}
            min={question.validation?.min}
            max={question.validation?.max}
            className="input-field"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={localAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="input-field resize-none"
          />
        );
      
      case 'select':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`option-card ${localAnswer === option ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {localAnswer === option && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );
      
      case 'multiSelect':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`checkbox-option ${Array.isArray(localAnswer) && localAnswer.includes(option) ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(localAnswer) && localAnswer.includes(option)}
                    onChange={() => {}}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium">{option}</span>
                </div>
              </motion.div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="question-card"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {question.question}
        </h2>
        {question.required && (
          <span className="text-sm text-red-500">* Required</span>
        )}
      </div>
      
      <div className="space-y-4">
        {renderInput()}
      </div>
      
      {question.type === 'multiSelect' && Array.isArray(localAnswer) && localAnswer.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-primary-50 rounded-lg"
        >
          <p className="text-sm text-primary-700">
            Selected: {localAnswer.join(', ')}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuizQuestion; 