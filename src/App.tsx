import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Film, Star, Award } from 'lucide-react';
import { saveSurveyResponse } from './pocketbase';

interface Question {
  id: string;
  question: string;
  options: Array<{ emoji: string; text: string; value: string }>;
}

interface Answers {
  [key: string]: string;
}

const questions: Question[] = [
  {
    id: 'movie-type',
    question: 'What type of movie are you feeling?',
    options: [
      { emoji: '🎭', text: 'Drama', value: 'drama' },
      { emoji: '😂', text: 'Comedy', value: 'comedy' },
      { emoji: '😱', text: 'Thriller', value: 'thriller' },
      { emoji: '💕', text: 'Romance', value: 'romance' },
      { emoji: '🎬', text: 'Action', value: 'action' },
      { emoji: '🌌', text: 'Star Wars (assuming we\'re caught up)', value: 'starwars' },
      { emoji: '🎲', text: 'Surprise me', value: 'surprise' }
    ]
  },
  {
    id: 'snack-choice',
    question: 'Pick your top snack choice:',
    options: [
      { emoji: '🍿', text: 'Classic buttered popcorn', value: 'popcorn' },
      { emoji: '🍕', text: 'Pizza', value: 'pizza' },
      { emoji: '👨‍🍳', text: 'Brennen can chef something up', value: 'brennen' },
      { emoji: '🥡', text: 'Other Takeout', value: 'takeout' }
    ]
  },
  {
    id: 'candy-choice',
    question: 'Go-to candy for a movie night:',
    options: [
      { emoji: '🍪', text: 'Cookie dough bites', value: 'cookiedough' },
      { emoji: '🍬', text: 'Sour candy', value: 'sour' },
      { emoji: '🍭', text: 'Gummy bears', value: 'gummy' },
      { emoji: '🍡', text: 'Licorice', value: 'licorice' },
      { emoji: '🍫', text: 'Peanut M&M\'s', value: 'peanutmms' },
      { emoji: '✏️', text: 'Other (fill in)', value: 'other' },
      { emoji: '🚫', text: 'No candy for me', value: 'none' }
    ]
  },
  {
    id: 'beverage-choice',
    question: 'What\'s your beverage of choice?',
    options: [
      { emoji: '🥤', text: 'Soda (Coke, Sprite, etc.)', value: 'soda' },
      { emoji: '🍷', text: 'Wine', value: 'wine' },
      { emoji: '🍺', text: 'Beer', value: 'beer' },
      { emoji: '🍹', text: 'Fun mocktail/cocktail', value: 'cocktail' },
      { emoji: '☕️', text: 'Coffee/Tea', value: 'coffee' },
      { emoji: '💧', text: 'Water (keeping it clean)', value: 'water' }
    ]
  },
  {
    id: 'lighting-preference',
    question: 'Lights on, lights dim, or full theater darkness?',
    options: [
      { emoji: '💡', text: 'Lights on', value: 'on' },
      { emoji: '🌘', text: 'Dim mood lighting', value: 'dim' },
      { emoji: '🌑', text: 'Total darkness, let\'s immerse', value: 'dark' }
    ]
  },
  {
    id: 'comfort-setup',
    question: 'Pillow and blanket situation?',
    options: [
      { emoji: '🛋', text: 'One of each, please', value: 'both' },
      { emoji: '🧣', text: 'Just a blanket', value: 'blanket' },
      { emoji: '🪑', text: 'I\'m good as is', value: 'none' },
      { emoji: '🧸', text: 'I\'m bringing my own cozy gear', value: 'own' }
    ]
  },
  {
    id: 'email',
    question: 'What\'s your email address?',
    options: [] // Special case - will use text input instead of options
  }
];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [customCandyInput, setCustomCandyInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    // Clear custom input if not selecting "other"
    if (questionId === 'candy-choice' && value !== 'other') {
      setCustomCandyInput('');
    }
  };

  const handleCustomCandyInput = (value: string) => {
    setCustomCandyInput(value);
    if (value.trim()) {
      setAnswers(prev => ({ ...prev, 'candy-choice': 'other', 'candy-custom': value }));
    }
  };

  const handleEmailInput = (value: string) => {
    setEmailInput(value);
    if (value.trim()) {
      setAnswers(prev => ({ ...prev, 'email': value }));
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Last question - save to PocketBase and show results
      setIsAnimating(true);
      setIsSaving(true);
      setSaveError(null);
      
      try {
        await saveSurveyResponse(answers);
        setTimeout(() => {
          setShowResults(true);
          setIsAnimating(false);
          setIsSaving(false);
        }, 300);
      } catch (error) {
        console.error('Failed to save survey:', error);
        setSaveError('Failed to save your responses. Please try again.');
        setIsAnimating(false);
        setIsSaving(false);
      }
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const resetSurvey = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setCustomCandyInput('');
    setEmailInput('');
    setIsSaving(false);
    setSaveError(null);
  };

  const currentQuestionData = questions[currentQuestion];
  const currentAnswer = answers[currentQuestionData?.id];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center p-4">
        <div className={`max-w-2xl w-full transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="bg-gradient-to-br from-red-950 to-gray-900 rounded-2xl shadow-2xl border border-red-800/30 p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full">
                  <Award className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                Your Perfect Movie Night
              </h1>
              <p className="text-red-200 text-lg">
                Here's your personalized cinema experience
              </p>
            </div>

            <div className="space-y-6">
              {questions.map((question) => {
                const answer = answers[question.id];
                const selectedOption = question.options.find(opt => opt.value === answer);
                
                return (
                  <div key={question.id} className="bg-black/20 rounded-xl p-6 border border-red-800/20">
                    <h3 className="text-red-200 font-semibold mb-2">{question.question}</h3>
                    {question.id === 'email' ? (
                      <div className="text-white text-lg">
                        <span className="text-2xl mr-3">📧</span>
                        {answers['email'] || 'No email provided'}
                      </div>
                    ) : selectedOption && (
                      <div className="text-white text-lg">
                        <span className="text-2xl mr-3">{selectedOption.emoji}</span>
                        {selectedOption.value === 'other' && question.id === 'candy-choice' 
                          ? answers['candy-custom'] || 'Other candy'
                          : selectedOption.text
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <div className="mb-4 text-green-400 text-sm">
                ✅ Your responses have been saved successfully!
              </div>
              <button
                onClick={resetSurvey}
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Take Survey Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center p-4">
      {/* Theater Curtains Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-red-900 to-transparent"></div>
      </div>

      <div className="max-w-2xl w-full z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full">
              <Film className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
            Cinema Survey
          </h1>
          <p className="text-red-200 text-lg">
            Tell us about your perfect movie night
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-red-200 text-sm">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-red-200 text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className={`bg-gradient-to-br from-red-950 to-gray-900 rounded-2xl shadow-2xl border border-red-800/30 p-8 mb-6 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            {currentQuestionData?.question}
          </h2>

          <div className="space-y-4">
            {/* Email question - special case */}
            {currentQuestionData?.id === 'email' ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <span className="text-6xl">📧</span>
                </div>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={emailInput}
                  onChange={(e) => handleEmailInput(e.target.value)}
                  className="w-full p-4 rounded-xl bg-black/30 text-white placeholder-red-300 border border-red-800/30 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 text-lg"
                  autoFocus
                />
                <p className="text-red-300 text-sm text-center">
                  We'll use this to identify your responses and send you movie night updates!
                </p>
              </div>
            ) : (
              /* Regular multiple choice questions */
              currentQuestionData?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestionData.id, option.value)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 transform hover:scale-102 hover:shadow-lg ${
                    currentAnswer === option.value
                      ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg'
                      : 'bg-black/20 text-red-100 hover:bg-black/30 border border-red-800/20 hover:border-red-600/50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">{option.emoji}</span>
                    <span className="text-lg font-medium">{option.text}</span>
                  </div>
                </button>
              ))
            )}
            
            {/* Custom input for candy choice */}
            {currentQuestionData?.id === 'candy-choice' && currentAnswer === 'other' && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="What's your favorite candy?"
                  value={customCandyInput}
                  onChange={(e) => handleCustomCandyInput(e.target.value)}
                  className="w-full p-4 rounded-xl bg-black/30 text-white placeholder-red-300 border border-red-800/30 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-600 rounded-xl text-red-200 text-center">
            {saveError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0 || isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              currentQuestion === 0 || isSaving
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700 transform hover:scale-105'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentQuestion
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : index < currentQuestion
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextQuestion}
            disabled={
              (!currentAnswer && currentQuestionData?.id !== 'email') || 
              (currentAnswer === 'other' && currentQuestionData?.id === 'candy-choice' && !customCandyInput.trim()) ||
              (currentQuestionData?.id === 'email' && !emailInput.trim()) ||
              isSaving
            }
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              (!currentAnswer && currentQuestionData?.id !== 'email') || 
              (currentAnswer === 'other' && currentQuestionData?.id === 'candy-choice' && !customCandyInput.trim()) ||
              (currentQuestionData?.id === 'email' && !emailInput.trim()) ||
              isSaving
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-700 hover:to-red-900 transform hover:scale-105 shadow-lg'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;