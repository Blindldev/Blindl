import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { LogOut, Clock, Heart, Phone, CheckCircle, X, ArrowRight, ArrowLeft, MapPin, Calendar, Clock as ClockIcon } from 'lucide-react';

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

interface Match {
  id: string;
  name: string;
  picture: string;
  age: number;
  bio: string;
  dateOption: string;
  dayOption: string;
  timeOption: string;
  venue: {
    name: string;
    address: string;
    description: string;
    image: string;
  };
}

// Move MatchPopup, RescheduleModal, and renderProfileEditInput above App

// Match Popup Modal
const MatchPopup: React.FC<{
  match: Match | null;
  isOpen: boolean;
  showDetails: boolean;
  onClose: () => void;
  onResponse: (response: 'yes' | 'no' | 'reschedule') => void;
  onToggleDetails: () => void;
}> = ({ match, isOpen, showDetails, onClose, onResponse, onToggleDetails }) => {
  console.log('MatchPopup render:', { match: !!match, isOpen, showDetails });
  
  if (!match) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 safe-area-top safe-area-bottom"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Flip Container */}
            <motion.div
              animate={{ rotateY: showDetails ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front Side - Match Info */}
              <div className="w-full h-full overflow-y-auto" style={{ backfaceVisibility: 'hidden' }}>
                <div className="relative">
                  <img
                    src={match.picture}
                    alt={match.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h2 className="text-white text-xl font-bold">{match.name}, {match.age}</h2>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Potential Match Found!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you free for <span className="font-semibold">{match.dateOption}</span> on{' '}
                    <span className="font-semibold">{match.dayOption}</span> at{' '}
                    <span className="font-semibold">{match.timeOption}</span>?
                  </p>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mb-6">
                    <button
                      onClick={() => onResponse('yes')}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => onResponse('no')}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
                    >
                      No
                    </button>
                    <button
                      onClick={() => onResponse('reschedule')}
                      className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                    >
                      Reschedule
                    </button>
                  </div>

                  {/* More Info Button */}
                  <button
                    onClick={onToggleDetails}
                    className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span>More Info</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Back Side - Venue Details */}
              <div 
                className="absolute inset-0 w-full h-full bg-white overflow-y-auto" 
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="relative">
                  <img
                    src={match.venue.image}
                    alt={match.venue.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h2 className="text-white text-xl font-bold">{match.venue.name}</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">{match.venue.address}</span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">{match.dayOption} at {match.timeOption}</span>
                  </div>

                  <div className="flex items-center space-x-2 mb-6">
                    <ClockIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">{match.dateOption}</span>
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {match.venue.description}
                  </p>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">About {match.name}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {match.bio}
                    </p>
                  </div>

                  {/* Action Buttons on Back Side */}
                  <div className="flex space-x-3 mb-6">
                    <button
                      onClick={() => onResponse('yes')}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => onResponse('no')}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
                    >
                      No
                    </button>
                    <button
                      onClick={() => onResponse('reschedule')}
                      className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                    >
                      Reschedule
                    </button>
                  </div>

                  {/* Back Button */}
                  <button
                    onClick={onToggleDetails}
                    className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Match</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Reschedule Modal
const RescheduleModal: React.FC<{
  isOpen: boolean;
  match: Match | null;
  selectedDate: Date | null;
  selectedTime: string;
  timeOptions: string[];
  onClose: () => void;
  onSubmit: () => void;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  getAvailableDates: () => Date[];
}> = ({ isOpen, match, selectedDate, selectedTime, timeOptions, onClose, onSubmit, onDateSelect, onTimeSelect, getAvailableDates }) => {
  if (!match) return null;

  const availableDates = getAvailableDates();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 safe-area-top safe-area-bottom"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Scrollable Content */}
            <div className="p-6 flex-1 min-h-0 overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Reschedule Date</h2>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Select a new date:</label>
                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                  {availableDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => onDateSelect(date)}
                      className={`py-2 px-3 rounded-xl font-medium border transition-colors flex-shrink-0 min-w-[100px] ${
                        selectedDate && date.toDateString() === selectedDate.toDateString()
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Select a new time:</label>
                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                  {timeOptions.map((time) => (
                    <button
                      key={time}
                      onClick={() => onTimeSelect(time)}
                      className={`py-2 px-3 rounded-xl font-medium border transition-colors flex-shrink-0 min-w-[80px] ${
                        selectedTime === time
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 mr-3"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={!selectedDate || !selectedTime}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  !selectedDate || !selectedTime
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function renderProfileEditInput(question: any, editingValue: any, setEditingValue: (v: any) => void) {
  if (question.type === 'multiSelect') {
    return (
      <div className="space-y-2">
        {question.options?.map((option: string) => (
          <div
            key={option}
            className={`p-2 border rounded cursor-pointer ${Array.isArray(editingValue) && editingValue.includes(option) ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200'}`}
            onClick={() => {
              let newVal = Array.isArray(editingValue) ? [...editingValue] : [];
              if (newVal.includes(option)) newVal = newVal.filter((o: string) => o !== option);
              else newVal.push(option);
              setEditingValue(newVal);
            }}
          >
            <span>{option}</span>
            {Array.isArray(editingValue) && editingValue.includes(option) && <span className="ml-2 text-blue-600">✓</span>}
          </div>
        ))}
      </div>
    );
  } else if (question.type === 'select') {
    return (
      <select
        className="w-full border rounded p-2"
        value={editingValue}
        onChange={e => setEditingValue(e.target.value)}
      >
        <option value="">Select...</option>
        {question.options?.map((option: string) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    );
  } else if (question.type === 'textarea') {
    return (
      <textarea
        className="w-full border rounded p-2"
        value={editingValue}
        onChange={e => setEditingValue(e.target.value)}
        rows={3}
      />
    );
  } else {
    return (
      <input
        className="w-full border rounded p-2"
        type={question.type}
        value={editingValue}
        onChange={e => setEditingValue(e.target.value)}
      />
    );
  }
}

const App: React.FC = () => {
  // All state and effect hooks at the very top
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, ValidationError>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneVerificationStep, setPhoneVerificationStep] = useState<'phone' | 'code' | 'complete'>('complete');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  // Matching UI state
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matchIndex, setMatchIndex] = useState(0);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  // Lala Mode state
  const [isLalaMode, setIsLalaMode] = useState(false);
  const [lalaAnswers, setLalaAnswers] = useState<Record<string, any>>({});
  const [lalaCurrentStep, setLalaCurrentStep] = useState(0);
  const [lalaErrors, setLalaErrors] = useState<Record<string, ValidationError>>({});
  // Inline edit/profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<any>(null);
  // Lala Mode profile state
  const lalaKey = user ? `lala_${user.email}` : null;
  const [lalaProfile, setLalaProfile] = useState<Record<string, any> | null>(null);

  // Questions array
  const questions: any[] = [
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
      placeholder: '+1 (555) 123-4567',
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
      options: ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Other'],
      required: true
    },
    {
      id: 'goals',
      question: 'What are you looking for?',
      type: 'multiSelect',
      options: ['Serious relationship', 'Casual dating', 'Friendship', 'Hookups', 'Marriage', 'Not sure yet'],
      required: true
    },
    {
      id: 'drinking',
      question: 'Do you drink alcohol?',
      type: 'select',
      options: ['Yes, regularly', 'Yes, occasionally', 'No, I don\'t drink', 'I\'m sober'],
      required: true
    },
    {
      id: 'smoking',
      question: 'Do you smoke?',
      type: 'select',
      options: ['Yes, cigarettes', 'Yes, vaping', 'Yes, marijuana', 'No, I don\'t smoke', 'I\'m trying to quit'],
      required: true
    },
    {
      id: 'dates',
      question: 'What days are you typically available for dates?',
      type: 'multiSelect',
      options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
      validation: (value: string[]) => {
        if (!value || value.length === 0) return 'Please select at least one day';
        return null;
      }
    },
    {
      id: 'budget',
      question: 'What is your typical date budget?',
      type: 'select',
      options: ['Free', '$', '$$', '$$$', '$$$$'],
      required: true
    },
    {
      id: 'description',
      question: 'Tell us about yourself',
      type: 'textarea',
      placeholder: 'Share your interests, hobbies, what makes you unique...',
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
      question: 'Describe your ideal partner',
      type: 'textarea',
      placeholder: 'What qualities are you looking for in a partner?',
      required: true,
      validation: (value: string) => {
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 500) return 'Description must be less than 500 characters';
        return null;
      }
    },
    {
      id: 'howFound',
      question: 'How did you hear about us?',
      type: 'select',
      options: ['Social media', 'Friend recommendation', 'Online search', 'Event flyer', 'Other'],
      required: true
    }
  ];

  // Lala Mode questions
  const lalaQuestions: any[] = [
    {
      id: 'lalaDays',
      question: 'Which days are you attending Lollapalooza 2025?',
      type: 'multiSelect',
      options: ['Thursday, August 7', 'Friday, August 8', 'Saturday, August 9', 'Sunday, August 10', 'No longer going'],
      required: true,
      validation: (value: string[]) => {
        if (!value || value.length === 0) return 'Please select at least one day';
        return null;
      }
    }
  ];

  // Lollapalooza 2025 Schedule
  const lollapaloozaSchedule = {
    thursday: [
      { time: '12:00 PM', artist: 'The Beaches', stage: 'T-Mobile' },
      { time: '1:00 PM', artist: 'The Last Dinner Party', stage: 'T-Mobile' },
      { time: '2:00 PM', artist: 'Renée Rapp', stage: 'T-Mobile' },
      { time: '3:00 PM', artist: 'Tyler, The Creator', stage: 'T-Mobile' },
      { time: '4:00 PM', artist: 'SZA', stage: 'T-Mobile' },
      { time: '5:00 PM', artist: 'Blink-182', stage: 'T-Mobile' },
      { time: '6:00 PM', artist: 'The Killers', stage: 'T-Mobile' },
      { time: '7:00 PM', artist: 'Future', stage: 'T-Mobile' },
      { time: '8:00 PM', artist: 'Kendrick Lamar', stage: 'T-Mobile' },
      { time: '9:00 PM', artist: 'Lana Del Rey', stage: 'T-Mobile' }
    ],
    friday: [
      { time: '12:00 PM', artist: 'The Marías', stage: 'T-Mobile' },
      { time: '1:00 PM', artist: 'Dominic Fike', stage: 'T-Mobile' },
      { time: '2:00 PM', artist: 'Hozier', stage: 'T-Mobile' },
      { time: '3:00 PM', artist: 'The 1975', stage: 'T-Mobile' },
      { time: '4:00 PM', artist: 'Post Malone', stage: 'T-Mobile' },
      { time: '5:00 PM', artist: 'Skrillex', stage: 'T-Mobile' },
      { time: '6:00 PM', artist: 'Megan Thee Stallion', stage: 'T-Mobile' },
      { time: '7:00 PM', artist: 'The Weeknd', stage: 'T-Mobile' },
      { time: '8:00 PM', artist: 'Red Hot Chili Peppers', stage: 'T-Mobile' },
      { time: '9:00 PM', artist: 'Dua Lipa', stage: 'T-Mobile' }
    ],
    saturday: [
      { time: '12:00 PM', artist: 'Beach Weather', stage: 'T-Mobile' },
      { time: '1:00 PM', artist: 'Tate McRae', stage: 'T-Mobile' },
      { time: '2:00 PM', artist: 'Lil Baby', stage: 'T-Mobile' },
      { time: '3:00 PM', artist: 'Khalid', stage: 'T-Mobile' },
      { time: '4:00 PM', artist: 'Doja Cat', stage: 'T-Mobile' },
      { time: '5:00 PM', artist: 'J. Cole', stage: 'T-Mobile' },
      { time: '6:00 PM', artist: 'Ariana Grande', stage: 'T-Mobile' },
      { time: '7:00 PM', artist: 'Drake', stage: 'T-Mobile' },
      { time: '8:00 PM', artist: 'Billie Eilish', stage: 'T-Mobile' },
      { time: '9:00 PM', artist: 'The Strokes', stage: 'T-Mobile' }
    ],
    sunday: [
      { time: '12:00 PM', artist: 'The Aces', stage: 'T-Mobile' },
      { time: '1:00 PM', artist: 'Conan Gray', stage: 'T-Mobile' },
      { time: '2:00 PM', artist: 'Lorde', stage: 'T-Mobile' },
      { time: '3:00 PM', artist: 'Glass Animals', stage: 'T-Mobile' },
      { time: '4:00 PM', artist: 'Machine Gun Kelly', stage: 'T-Mobile' },
      { time: '5:00 PM', artist: 'Twenty One Pilots', stage: 'T-Mobile' },
      { time: '6:00 PM', artist: 'Foo Fighters', stage: 'T-Mobile' },
      { time: '7:00 PM', artist: 'Green Day', stage: 'T-Mobile' },
      { time: '8:00 PM', artist: 'Metallica', stage: 'T-Mobile' },
      { time: '9:00 PM', artist: 'Pearl Jam', stage: 'T-Mobile' }
    ]
  };

  // Dynamically generate artist selection questions based on selected days
  const generateArtistQuestions = (): any[] => {
    const selectedDays = lalaAnswers.lalaDays || [];
    // Filter out "No longer going" from selected days
    const validDays = selectedDays.filter((day: string) => day !== 'No longer going');
    const questions: any[] = [];
    validDays.forEach((day: string) => {
      let dayKey = '';
      if (day.toLowerCase().includes('thursday')) dayKey = 'thursday';
      else if (day.toLowerCase().includes('friday')) dayKey = 'friday';
      else if (day.toLowerCase().includes('saturday')) dayKey = 'saturday';
      else if (day.toLowerCase().includes('sunday')) dayKey = 'sunday';
      const daySchedule = lollapaloozaSchedule[dayKey as keyof typeof lollapaloozaSchedule];
      if (daySchedule) {
        // Sort by time
        const parseTime = (t: string) => {
          const [time, ampm] = t.split(' ');
          let [hour, minute] = time.split(':').map(Number);
          if (ampm === 'PM' && hour !== 12) hour += 12;
          if (ampm === 'AM' && hour === 12) hour = 0;
          return hour * 60 + (minute || 0);
        };
        const sorted = [...daySchedule].sort((a, b) => parseTime(a.time) - parseTime(b.time));
        questions.push({
          id: `artists_${dayKey}`,
          question: `Which artists are you planning to see on ${day}?`,
          type: 'multiSelect',
          options: sorted.map(set => `${set.time} - ${set.artist}`),
          required: true,
          validation: (value: string[]) => {
            if (!value || value.length === 0) return `Please select at least one artist for ${day}`;
            return null;
          }
        });
      }
    });
    return questions;
  };

  // Combine base questions with dynamic artist questions
  const allLalaQuestions: any[] = [...lalaQuestions, ...generateArtistQuestions()];
  useEffect(() => {
    if (lalaKey) {
      const lalaData = localStorage.getItem(lalaKey);
      if (lalaData) setLalaProfile(JSON.parse(lalaData));
      else setLalaProfile(null);
    } else {
      setLalaProfile(null);
    }
  }, [lalaKey, isLalaMode, user]);
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
        // setIsLoading(false); // This line was removed from the new_code, so it's removed here.
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
    setIsAuthenticated(false);
    setUser(null);
    setAnswers({});
    setCurrentStep(0);
    setErrors({});
  };

  // Dummy matches with different women's images
  const dummyMatches: Match[] = [
    {
      id: '1',
      name: 'Emma Rodriguez',
      picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      age: 26,
      bio: 'Passionate yoga instructor and coffee enthusiast. I love exploring new restaurants, hiking on weekends, and having deep conversations about life, travel, and dreams. Looking for someone who values authenticity and adventure!',
      dateOption: 'Coffee & Conversation',
      dayOption: 'Saturday',
      timeOption: '2:00 PM',
      venue: {
        name: 'Blue Bottle Coffee',
        address: '123 Main St, Downtown',
        description: 'A cozy coffee shop with great atmosphere for first dates. Known for their artisanal coffee and comfortable seating.',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop'
      }
    },
    {
      id: '2',
      name: 'Sophie Chen',
      picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      age: 24,
      bio: 'Creative graphic designer who loves art galleries, indie music, and trying new cuisines. I enjoy photography, weekend road trips, and meaningful conversations. Seeking someone who appreciates creativity and has a sense of humor!',
      dateOption: 'Art Gallery Walk',
      dayOption: 'Sunday',
      timeOption: '3:30 PM',
      venue: {
        name: 'Modern Art Gallery',
        address: '456 Art District Blvd',
        description: 'A contemporary art space featuring local and international artists. Perfect for cultural conversations and inspiration.',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
      }
    },
    {
      id: '3',
      name: 'Isabella Thompson',
      picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      age: 28,
      bio: 'Environmental scientist and nature lover. I spend my free time hiking, reading sci-fi novels, and volunteering at animal shelters. Looking for someone who cares about the planet and enjoys outdoor adventures!',
      dateOption: 'Nature Walk & Picnic',
      dayOption: 'Saturday',
      timeOption: '11:00 AM',
      venue: {
        name: 'Central Park Gardens',
        address: '789 Nature Trail Rd',
        description: 'Beautiful botanical gardens with walking trails, perfect for a peaceful outdoor date surrounded by nature.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
      }
    },
    {
      id: '4',
      name: 'Maya Patel',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      age: 25,
      bio: 'Software engineer by day, amateur chef by night. I love cooking, board games, and watching documentaries. Passionate about technology and always eager to learn new things. Seeking someone who enjoys good food and intellectual conversations!',
      dateOption: 'Cooking Class',
      dayOption: 'Friday',
      timeOption: '6:00 PM',
      venue: {
        name: 'Culinary Institute',
        address: '321 Chef Street',
        description: 'Professional cooking school offering hands-on classes. Learn to cook together while getting to know each other!',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop'
      }
    },
    {
      id: '5',
      name: 'Ava Williams',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      age: 27,
      bio: 'Marketing consultant and fitness enthusiast. I love trying new workout classes, traveling to new cities, and discovering hidden gem restaurants. Looking for someone who values health, adventure, and good conversation!',
      dateOption: 'Sunset Beach Walk',
      dayOption: 'Sunday',
      timeOption: '7:00 PM',
      venue: {
        name: 'Oceanfront Boardwalk',
        address: '567 Coastal Highway',
        description: 'Scenic beachfront promenade perfect for romantic sunset walks and ocean views.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop'
      }
    }
  ];

  // Time options for rescheduling
  const timeOptions = [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
  ];

  // Lala Mode functions
  const handleLalaAnswer = (questionId: string, answer: any) => {
    setLalaAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Clear error when user starts typing
    setLalaErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });

    // Auto-advance for single select questions in Lala Mode
    const currentLalaQuestion = allLalaQuestions[lalaCurrentStep];
    if (currentLalaQuestion && currentLalaQuestion.id === questionId && currentLalaQuestion.type === 'select' && answer) {
      // Small delay to allow the UI to update
      setTimeout(() => {
        handleLalaNext();
      }, 300);
    }
  };

  const handleLalaNext = () => {
    const currentLalaQuestion = allLalaQuestions[lalaCurrentStep];
    if (!currentLalaQuestion) return;

    const answer = lalaAnswers[currentLalaQuestion.id];
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      setLalaErrors(prev => ({ 
        ...prev, 
        [currentLalaQuestion.id]: { 
          field: currentLalaQuestion.id, 
          message: 'This field is required' 
        } 
      }));
      return;
    }

    if (lalaCurrentStep < allLalaQuestions.length - 1) {
      setLalaCurrentStep(prev => prev + 1);
    } else {
      // Lala quiz completed
      handleLalaSubmit();
    }
  };

  const handleLalaPrevious = () => {
    if (lalaCurrentStep > 0) {
      setLalaCurrentStep(prev => prev - 1);
      setLalaErrors({});
    }
  };

  const handleLalaSubmit = () => {
    if (user && lalaAnswers) {
      localStorage.setItem(`lala_${user.email}`, JSON.stringify(lalaAnswers));
      setLalaProfile(lalaAnswers);
    }
    setIsLalaMode(false);
  };

  const handleBackToMain = () => {
    setIsLalaMode(false);
    setLalaCurrentStep(0);
    setLalaAnswers({});
    setLalaErrors({});
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
    if (!currentQuestion) return true;

    const answer = answers[currentQuestion.id];
    const error = validateField(currentQuestion.id, answer);
    
    if (error) {
      setErrors(prev => ({ ...prev, [currentQuestion.id]: { field: currentQuestion.id, message: error } }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[currentQuestion.id];
        return newErrors;
      });
      return true;
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
    // Auto-advance for single select questions (not multi-select, text, textarea, etc.)
    const currentQuestion = questions[currentStep];
    if (currentQuestion && currentQuestion.id === questionId && currentQuestion.type === 'select' && answer && answer !== '') {
      setTimeout(() => {
        handleNext();
      }, 100);
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    // Prevent going out of bounds
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
      setErrors({}); // Clear errors when going back
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

  // Matching UI functions (move these up so they are defined before use)
  const handleTestMatch = () => {
    console.log('Test Match button clicked!');
    const nextMatch = dummyMatches[matchIndex];
    setCurrentMatch(nextMatch);
    setShowMatchPopup(true);
    setShowMatchDetails(false);
    setMatchIndex((prev) => (prev + 1) % dummyMatches.length);
    console.log('Match popup should now be visible');
  };

  const handleMatchResponse = (response: 'yes' | 'no' | 'reschedule') => {
    // Handle the match response
    console.log('Match response:', response);
    if (response === 'reschedule') {
      setShowRescheduleModal(true);
      return;
    }
    setShowMatchPopup(false);
    setCurrentMatch(null);
    setShowMatchDetails(false);
  };

  const handleToggleMatchDetails = () => {
    setShowMatchDetails(!showMatchDetails);
  };

  const handleRescheduleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both a date and time.');
      return;
    }
    console.log('Reschedule request:', {
      originalMatch: currentMatch,
      newDate: selectedDate,
      newTime: selectedTime
    });
    // Here you would typically send this to your backend
    alert(`Reschedule request sent! New date: ${selectedDate.toLocaleDateString()} at ${selectedTime}`);
    // Close modals and reset
    setShowRescheduleModal(false);
    setShowMatchPopup(false);
    setCurrentMatch(null);
    setShowMatchDetails(false);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    const twoWeeksFromNow = new Date(today.getTime() + (14 * 24 * 60 * 60 * 1000));
    for (let d = new Date(today); d <= twoWeeksFromNow; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  // Current question
  const currentQuestion = (currentStep >= 0 && currentStep < questions.length) ? questions[currentStep] : questions[0];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const canProceed = currentQuestion && (
    currentQuestion.required ? 
    answers[currentQuestion.id] && 
    (Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id].length > 0 : true) :
    true
  ) && !errors[currentQuestion?.id];

  // Loading state
  if (false) { // isLoading was removed from new_code, so it's set to false.
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
  if (isAuthenticated && (phoneVerificationStep === 'phone' || phoneVerificationStep === 'code')) {
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
              {phoneVerificationStep === 'phone' ? 'Verify Your Phone Number' : 'Enter Verification Code'}
            </h2>
            <p className="text-gray-600">
              {phoneVerificationStep === 'phone' 
                ? 'We\'ll send a verification code to your phone number.' 
                : 'Enter the 6-digit code sent to your phone.'}
            </p>
          </div>

          {phoneVerificationStep === 'phone' ? (
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
  if (!isAuthenticated || !user) {
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

  // Lala Mode Quiz Interface
  if (isLalaMode) {
    const currentLalaQuestion = allLalaQuestions[lalaCurrentStep];
    const lalaProgress = ((lalaCurrentStep + 1) / allLalaQuestions.length) * 100;

    const renderLalaQuestion = () => {
      const question = currentLalaQuestion;
      const answer = lalaAnswers[question.id];
      const error = lalaErrors[question.id];

      switch (question.type) {
        case 'multiSelect':
          const selectedOptions = Array.isArray(answer) ? answer : [];
          return (
            <div>
              <div className="space-y-3">
                {question.options?.map((option: string) => (
                  <div
                    key={option}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedOptions.includes(option)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => {
                      const newSelection = selectedOptions.includes(option)
                        ? selectedOptions.filter((o: string) => o !== option)
                        : [...selectedOptions, option];
                      handleLalaAnswer(question.id, newSelection);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {selectedOptions.includes(option) && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 safe-area-top safe-area-bottom">
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
                </div>
              </div>
              <button
                onClick={handleBackToMain}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Lala Question {lalaCurrentStep + 1} of {allLalaQuestions.length}
              </h2>
              <span className="text-sm text-gray-600">
                {Math.round(lalaProgress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${lalaProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="mobile-card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentLalaQuestion.question}
            </h2>
            {currentLalaQuestion.required && (
              <p className="text-sm text-red-500 mb-4">* Required</p>
            )}
            
            <div className="space-y-4">
              {renderLalaQuestion()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleLalaPrevious}
                disabled={lalaCurrentStep === 0}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  lalaCurrentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={handleLalaNext}
                disabled={!lalaAnswers[currentLalaQuestion?.id] || !!lalaErrors[currentLalaQuestion?.id]}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  !lalaAnswers[currentLalaQuestion?.id] || !!lalaErrors[currentLalaQuestion?.id]
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {lalaCurrentStep === allLalaQuestions.length - 1 ? 'Submit Lala Profile' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
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

          {/* Test Match Button */}
          <div className="mobile-card mb-8">
            <button
              onClick={handleTestMatch}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
            >
              🎯 Test Match #{matchIndex + 1}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Click to see different match scenarios ({matchIndex + 1} of {dummyMatches.length})
            </p>
          </div>

          {/* Lala Mode Button and Answers */}
          <div className="mobile-card mb-8">
            <button
              onClick={() => {
                setIsLalaMode(true);
                if (lalaProfile) {
                  setLalaAnswers(lalaProfile);
                } else {
                  setLalaAnswers({});
                }
                setLalaCurrentStep(0);
                setLalaErrors({});
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg"
            >
              {lalaProfile ? 'Edit Lala Mode Answers' : 'Start Lala Mode'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Find your Lollapalooza 2025 festival match!
            </p>
          </div>
          {lalaProfile && !lalaProfile.lalaDays?.includes('No longer going') && (
            <div className="mobile-card mb-8">
              <h2 className="text-xl font-bold text-green-700 mb-4">Your Lala Mode Answers</h2>
              <div className="space-y-2">
                {Object.entries(lalaProfile).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-2">
                    <span className="font-semibold text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                    <span className="ml-2 text-gray-600">{Array.isArray(value) ? value.join(', ') : value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your Answers */}
          <div className="mobile-card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(user.answers).map(([key, value]) => {
                const question = questions.find(q => q.id === key);
                if (!question || question.type === 'textarea') return null;
                const isEditing = editingField === key;
                const isEditable = key !== 'email' && key !== 'phone';
                return (
                  <div key={key} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">{question.question}</h3>
                      {isEditing ? (
                        renderProfileEditInput(question, editingValue, setEditingValue)
                      ) : (
                        <p className="text-gray-600">{Array.isArray(value) ? value.join(', ') : value}</p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      {isEditing ? (
                        <>
                          <button
                            className="text-green-600 font-semibold mb-1"
                            onClick={() => {
                              // Save logic
                              const newAnswers = { ...user.answers, [key]: editingValue };
                              setUser({ ...user, answers: newAnswers });
                              localStorage.setItem(`user_${user.email}`, JSON.stringify({ ...user, answers: newAnswers }));
                              setEditingField(null);
                              setEditingValue(null);
                            }}
                          >Save</button>
                          <button
                            className="text-gray-500 text-xs"
                            onClick={() => { setEditingField(null); setEditingValue(null); }}
                          >Cancel</button>
                        </>
                      ) : (
                        isEditable && (
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => { setEditingField(key); setEditingValue(value); }}
                            aria-label={`Edit ${question.question}`}
                          >
                            ✎
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Long answer (textarea) fields below the grid, full width */}
            {Object.entries(user.answers).map(([key, value]) => {
              const question = questions.find(q => q.id === key);
              if (!question || question.type !== 'textarea') return null;
              const isEditing = editingField === key;
              const isEditable = key !== 'email' && key !== 'phone';
              return (
                <div key={key} className="border border-gray-200 rounded-xl p-4 my-4 w-full">
                  <h3 className="font-semibold text-gray-800 mb-2">{question.question}</h3>
                  {isEditing ? (
                    renderProfileEditInput(question, editingValue, setEditingValue)
                  ) : (
                    <div className="w-full max-w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap break-words overflow-x-auto" style={{ fontFamily: 'inherit', minHeight: '3.5rem', maxHeight: '12rem' }}>
                      {value}
                    </div>
                  )}
                  <div className="flex flex-col items-end mt-2">
                    {isEditing ? (
                      <>
                        <button
                          className="text-green-600 font-semibold mb-1"
                          onClick={() => {
                            // Save logic
                            const newAnswers = { ...user.answers, [key]: editingValue };
                            setUser({ ...user, answers: newAnswers });
                            localStorage.setItem(`user_${user.email}`, JSON.stringify({ ...user, answers: newAnswers }));
                            setEditingField(null);
                            setEditingValue(null);
                          }}
                        >Save</button>
                        <button
                          className="text-gray-500 text-xs"
                          onClick={() => { setEditingField(null); setEditingValue(null); }}
                        >Cancel</button>
                      </>
                    ) : (
                      isEditable && (
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => { setEditingField(key); setEditingValue(value); }}
                          aria-label={`Edit ${question.question}`}
                        >
                          ✎
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit Profile Answers Button */}
          <button
            onClick={() => {
              setIsEditingProfile(true);
              setAnswers(user.answers || {});
              setCurrentStep(0);
              setErrors({});
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg mb-4"
          >
            Edit Profile Answers
          </button>
        </div>

        {/* Match Popup */}
        <MatchPopup
          match={currentMatch}
          isOpen={showMatchPopup}
          showDetails={showMatchDetails}
          onClose={() => setShowMatchPopup(false)}
          onResponse={handleMatchResponse}
          onToggleDetails={handleToggleMatchDetails}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          isOpen={showRescheduleModal}
          match={currentMatch}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          timeOptions={timeOptions}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={handleRescheduleSubmit}
          onDateSelect={handleDateSelect}
          onTimeSelect={setSelectedTime}
          getAvailableDates={getAvailableDates}
        />
      </div>
    );
  }

  // Quiz page (authenticated but no answers yet)
  const renderQuestion = () => {
    const question = currentQuestion;
    const answer = answers[question.id];
    const error = errors[question.id];

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
              {question.options?.map((option: string) => (
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
              {question.options?.map((option: string) => (
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

  if (isEditingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 safe-area-top safe-area-bottom">
        <div className="mobile-container">
          {/* Header */}
          <div className="mobile-card mb-8">
            <div className="flex items-center space-x-4">
              <img src={user?.picture} alt={user?.name} className="w-10 h-10 rounded-full" />
              <div>
                <h2 className="font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>
          {/* Question Card */}
          <div className="mobile-card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion.question}</h2>
            {currentQuestion.required && (
              <p className="text-sm text-red-500 mb-4">* Required</p>
            )}
            <div className="space-y-4">{renderQuestion()}</div>
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
                onClick={async () => {
                  if (!validateCurrentStep()) return;
                  if (currentStep < questions.length - 1) {
                    setCurrentStep(prev => prev + 1);
                  } else {
                    // On submit, update user and exit editing mode
                    await submitQuiz();
                    setIsEditingProfile(false);
                  }
                }}
                disabled={!canProceed || isSubmitting}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  !canProceed || isSubmitting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isSubmitting ? 'Submitting...' : currentStep === questions.length - 1 ? 'Save Profile' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Match Popup */}
      <MatchPopup
        match={currentMatch}
        isOpen={showMatchPopup}
        showDetails={showMatchDetails}
        onClose={() => setShowMatchPopup(false)}
        onResponse={handleMatchResponse}
        onToggleDetails={handleToggleMatchDetails}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        match={currentMatch}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        timeOptions={timeOptions}
        onClose={() => setShowRescheduleModal(false)}
        onSubmit={handleRescheduleSubmit}
        onDateSelect={handleDateSelect}
        onTimeSelect={setSelectedTime}
        getAvailableDates={getAvailableDates}
      />
    </div>
  );
};

export default App;