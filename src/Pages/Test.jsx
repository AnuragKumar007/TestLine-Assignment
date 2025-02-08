import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const Test = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const testId = location.state?.testId;

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3 * 60); // 3 minutes in seconds
  const [testStarted, setTestStarted] = useState(false);
  const [mediaAccess, setMediaAccess] = useState({
    camera: false,
    audio: false,
  });
  const [stream, setStream] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTimeout, setAlertTimeout] = useState(null);
  const [navigationAttempts, setNavigationAttempts] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [testInfo, setTestInfo] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Use the correct relative path from the public directory
        const response = await axios.get('/questions.json');
        const data = response.data;

        if (!data || !data.questions || !Array.isArray(data.questions)) {
          console.error('Invalid data format:', data);
          showTemporaryAlert('Error: Invalid question data format');
          return;
        }

        setTestInfo({
          title: data.title || 'Test',
          topic: data.topic || 'General',
          duration: parseInt(data.duration) || 15,
          totalQuestions: parseInt(data.questions_count) || data.questions.length,
          correctMarks: parseFloat(data.correct_answer_marks) || 4,
          negativeMarks: parseFloat(data.negative_marks) || 1,
          id: data.id
        });

        const formattedQuestions = data.questions.map(q => ({
          id: q.id,
          question: q.description,
          options: Array.isArray(q.options) ? q.options.map(opt => ({
            id: opt.id,
            text: opt.description,
            isCorrect: opt.is_correct
          })) : [],
          solution: q.detailed_solution
        }));

        setQuestions(formattedQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        showTemporaryAlert('Error loading questions. Please try again later.');
      }
    };

    loadQuestions();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, timeLeft]);

  // Add navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (testStarted && !showResults) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [testStarted, showResults]);

  const requestMediaAccess = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      setMediaAccess({
        camera: true,
        audio: true
      });
      return true;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      showTemporaryAlert('Camera and microphone access are required to take the test. Please allow access and try again.');
      return false;
    }
  };

  const startTest = async () => {
    const hasAccess = await requestMediaAccess();
    if (hasAccess) {
      setTestStarted(true);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && testStarted && !showResults) {
      handleNavigationAttempt();
    }
  };

  const handleWindowBlur = () => {
    if (testStarted && !showResults) {
      handleNavigationAttempt();
    }
  };

  const handleNavigationAttempt = () => {
    const newAttempts = navigationAttempts + 1;
    setNavigationAttempts(newAttempts);
    
    if (newAttempts === 1) {
      showTemporaryAlert('Warning: First attempt to leave the test. You have 1 more attempt before automatic submission.');
    } else if (newAttempts === 2) {
      showTemporaryAlert('Warning: Final attempt to leave the test. Next attempt will result in automatic submission.');
    } else if (newAttempts > 2) {
      showTemporaryAlert('Test automatically submitted due to multiple navigation attempts.');
      handleSubmit();
    }
  };

  const showTemporaryAlert = (message) => {
    if (alertTimeout) {
      clearTimeout(alertTimeout);
    }
    
    setAlertMessage(message);
    setShowAlert(true);
    
    const timeout = setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 3000);
    
    setAlertTimeout(timeout);
  };

  const handleAnswer = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach(question => {
      const selectedOption = answers[question.id];
      if (!selectedOption) {
        unattempted++;
      } else {
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (selectedOption === correctOption.text) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const totalScore = (correct * testInfo.correctMarks) - (incorrect * testInfo.negativeMarks);
    const maxPossibleScore = questions.length * testInfo.correctMarks;
    const percentage = (totalScore / maxPossibleScore) * 100;

    return {
      correct,
      incorrect,
      unattempted,
      totalScore: Math.max(0, totalScore),
      percentage: Math.max(0, percentage.toFixed(2))
    };
  };

  const handleSubmit = async () => {
    const score = calculateScore();
    setShowResults(true);

    try {
      // Save the test result
      const newResult = {
        testId: testInfo.id,
        score: score.totalScore,
        percentage: score.percentage,
        correct: score.correct,
        incorrect: score.incorrect,
        unattempted: score.unattempted,
        timestamp: new Date().toISOString()
      };

      // Save to localStorage as a temporary solution
      const existingResults = JSON.parse(localStorage.getItem('testResults') || '{"results": []}');
      existingResults.results.push(newResult);
      localStorage.setItem('testResults', JSON.stringify(existingResults));
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  const renderResults = () => {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-black text-center mb-6">Test Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">Score Summary</h3>
              <div className="space-y-2 text-black">
                <p>Total Score: <span className="font-medium">{score.totalScore}</span></p>
                <p>Percentage: <span className="font-medium">{score.percentage}%</span></p>
                <p>Correct Answers: <span className="text-green-600 font-medium">{score.correct}</span></p>
                <p>Incorrect Answers: <span className="text-red-600 font-medium">{score.incorrect}</span></p>
                <p>Unattempted: <span className="text-gray-600 font-medium">{score.unattempted}</span></p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">Test Information</h3>
              <div className="space-y-2 text-black">
                <p>Title: <span className="font-medium">{testInfo.title}</span></p>
                <p>Topic: <span className="font-medium">{testInfo.topic}</span></p>
                <p>Total Questions: <span className="font-medium">{testInfo.totalQuestions}</span></p>
                <p>Marks per Question: <span className="font-medium">+{testInfo.correctMarks}</span></p>
                <p>Negative Marking: <span className="font-medium">-{testInfo.negativeMarks}</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-semibold text-black">Detailed Analysis</h3>
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const correctAnswer = question.options.find(opt => opt.isCorrect).text;
              const isCorrect = userAnswer === correctAnswer;

              return (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-medium text-black mb-2">Question {index + 1}: {question.question}</p>
                  <p className="text-black mb-2">Your Answer: 
                    <span className={isCorrect ? "text-green-600 ml-2 font-medium" : "text-red-600 ml-2 font-medium"}>
                      {userAnswer || "Not attempted"}
                    </span>
                  </p>
                  <p className="text-black mb-2">Correct Answer: <span className="text-green-600 font-medium">{correctAnswer}</span></p>
                  {!isCorrect && question.solution && (
                    <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                      <p className="font-medium text-black mb-2">Solution:</p>
                      <p className="text-black whitespace-pre-wrap">{question.solution}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Return to Dashboard
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  if (showResults) {
    return renderResults();
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {testInfo?.title || 'Loading...'}
          </h2>
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Topic: {testInfo?.topic}</p>
            <p className="text-gray-600 mb-2">Total Questions: {testInfo?.totalQuestions}</p>
            <p className="text-gray-600 mb-2">Duration: {testInfo?.duration} minutes</p>
            <p className="text-gray-600 mb-2">Marks per Question: +{testInfo?.correctMarks}</p>
            <p className="text-gray-600 mb-2">Negative Marking: -{testInfo?.negativeMarks}</p>
          </div>
          <div className="space-y-4 mb-6">
            <p className="text-gray-600">Before starting the test:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>You have {testInfo?.duration} minutes to complete the test</li>
              <li>Each correct answer will award you {testInfo?.correctMarks} marks</li>
              <li>Each wrong answer will deduct {testInfo?.negativeMarks} mark</li>
              <li>Ensure you have a working camera and microphone</li>
              <li>Find a quiet, well-lit space</li>
              <li>Close all unnecessary browser tabs</li>
              <li>Have required materials ready</li>
            </ul>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startTest}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700"
          >
            Start Test
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            <span className="block sm:inline">{alertMessage}</span>
          </div>
        </motion.div>
      )}
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
            <div className="text-lg font-medium text-indigo-600">
              Time Left: {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>

          {currentQ && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">
                  Question {currentQuestion + 1} of {questions.length}
                </h3>
                <p className="text-lg text-black mb-6">{currentQ.question}</p>
              </div>

              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(currentQ.id, option.text)}
                    className={`w-full p-4 text-left rounded-lg border ${
                      answers[currentQ.id] === option.text
                        ? 'border-indigo-600 bg-indigo-50 text-black'
                        : 'border-gray-300 hover:border-indigo-300 text-black'
                    }`}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 text-indigo-600 disabled:text-gray-400"
            >
              Previous
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit Test
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
