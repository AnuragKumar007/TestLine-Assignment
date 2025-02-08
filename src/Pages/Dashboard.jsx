import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import banner from '../assets/banner.jpg';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [testResults, setTestResults] = useState({});
  const [userData, setUserData] = useState({
    name: 'Anurag Kumar',
    progress: 50,
    activeCourses: [
      { id: 1, title: 'Genetics & Evolution', progress: 50 },
      { id: 2, title: 'JavaScript Advanced', progress: 30 },
    ],
    completedCourses: [
      { id: 1, title: 'Web Development Basics', completionDate: '2024-01-15' },
      { id: 2, title: 'CSS Mastery', completionDate: '2024-01-30' },
    ],
    upcomingTests: [
      { 
        id: 1, 
        title: 'Genetics & Evolution', 
        duration: '15 minutes', 
        questions: 10, 
        difficulty: 'Intermediate' 
      },
      { 
        id: 2, 
        title: 'Genetics & Evolution', 
        duration: '30 minutes', 
        questions: 30, 
        difficulty: 'Advanced' 
      },
      { 
        id: 3, 
        title: 'Web Development Basics', 
        duration: '30 minutes', 
        questions: 25, 
        difficulty: 'Beginner' 
      }
    ],
    certifications: [
      { id: 1, title: 'Genetics & Evolution', date: '2024-01-15', score: 92 },
      { id: 2, title: 'CSS Mastery', date: '2024-01-30', score: 88 },
    ],
  });

  const [updates, setUpdates] = useState([
    'New course "React Advanced" is now available',
    'You earned a badge in JavaScript Fundamentals',
    'Upcoming test: React Fundamentals on Feb 15',
    'Your progress in CSS Mastery is outstanding',
    'New achievement unlocked: Quick Learner',
  ]);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = await axios.get('/questions.json');
        const data = response.data;
        
        if (!data) {
          console.error('Invalid data format:', data);
          return;
        }

        // Load test results from localStorage
        const resultsData = JSON.parse(localStorage.getItem('testResults') || '{"results": []}');
        const resultsMap = {};
        if (resultsData && resultsData.results) {
          resultsData.results.forEach(result => {
            if (!resultsMap[result.testId] || result.timestamp > resultsMap[result.testId].timestamp) {
              resultsMap[result.testId] = result;
            }
          });
        }
        setTestResults(resultsMap);

        setTests([{
          id: data.id || 1,
          title: data.title || 'Test',
          topic: data.topic || 'General',
          duration: parseInt(data.duration) || 15,
          totalQuestions: parseInt(data.questions_count) || (data.questions?.length || 0),
          correctMarks: parseFloat(data.correct_answer_marks) || 4,
          negativeMarks: parseFloat(data.negative_marks) || 1,
          endDate: data.end_time ? new Date(data.end_time) : new Date(),
          status: 'available'
        }]);
      } catch (error) {
        console.error('Error loading tests:', error);
      }
    };

    loadTests();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates(prevUpdates => {
        const firstUpdate = prevUpdates[0];
        return [...prevUpdates.slice(1), firstUpdate];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleStartTest = (testId) => {
    navigate('/test', { state: { testId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile and Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 sm:mb-0">
                  {userData.name.charAt(0)}
                </div>
                <div className="sm:ml-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {userData.name}
                  </h2>
                  <p className="text-gray-600">Premium Member</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Overall Progress
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${userData.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{userData.progress}% Complete</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    Active Courses
                  </h3>
                  <div className="space-y-3">
                    {userData.activeCourses.map(course => (
                      <div key={course.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 truncate">{course.title}</h4>
                        <p className="text-sm text-gray-600">Progress: {course.progress}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    Completed Courses
                  </h3>
                  <div className="space-y-3">
                    {userData.completedCourses.map(course => (
                      <div key={course.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 truncate">{course.title}</h4>
                        <p className="text-sm text-gray-600">Completed on: {course.completionDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Updates Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-auto lg:h-[400px] overflow-hidden"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Latest Updates
            </h2>
            <div className="space-y-3 sm:space-y-4 relative">
              {updates.map((update, index) => (
                <div
                  key={index}
                  className="p-3 sm:p-4 bg-gray-50 rounded-lg transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateY(-${index * 4}px)`,
                  }}
                >
                  <p className="text-sm sm:text-base text-gray-700 line-clamp-2">{update}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Tests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Upcoming Tests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userData.upcomingTests.map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-xl p-4 flex flex-col min-h-[280px] relative overflow-hidden"
                >
                  <div className="flex-1 mb-16">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {test.title}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Duration:</span> {test.duration}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Questions:</span> {test.questions}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Difficulty:</span> {test.difficulty}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/test', { state: { testId: test.id } })}
                    className="absolute bottom-4 left-4 right-4 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Start Test
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Your Certifications
            </h2>
            <div className="space-y-4">
              {userData.certifications.map(cert => (
                <div key={cert.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                  <p className="text-gray-600 text-sm">Completed on {cert.date}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm font-medium text-gray-700">Score: </span>
                    <span className="ml-2 text-sm font-semibold text-indigo-600">{cert.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Available Tests and Feature Cards Section */}
          <div className="flex flex-col lg:flex-row gap-6 col-span-3">
            {/* Available Tests */}
            <div className="w-full lg:w-1/3 bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-indigo-600 mb-6">Available Tests</h2>
              <div>
                <h3 className="font-medium text-gray-900">Genetics and Evolution</h3>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <p>Topic: The Molecular Basis of Inheritance</p>
                  <p>Duration: 15</p>
                  <p>Questions: 10</p>
                  <p>Marks: +4</p>
                  <p>Negative: -1</p>
                  <p>Available till: 7/16/2024</p>
                </div>
                <button className="w-full mt-6 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm" onClick={() => navigate('/test', { state: { testId: 1 } })}>
                  Start Test
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="w-full lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">Adaptive Learning</h3>
                      <p className="text-sm text-gray-600 leading-snug line-clamp-2">
                        Engage with dynamic quizzes that adapt to your learning pace
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">Detailed Analytics</h3>
                      <p className="text-sm text-gray-600 leading-snug line-clamp-2">
                        Monitor your improvement with detailed analytics and insights
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 mb-1 truncate">Verified Certifications</h3>
                    <p className="text-sm text-gray-600 leading-snug line-clamp-2">
                      Get recognized for your achievements with verified certifications
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
