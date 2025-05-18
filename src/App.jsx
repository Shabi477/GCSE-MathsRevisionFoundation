import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Users, 
  User, 
  Edit3, 
  Plus, 
  BookIcon, 
  BarChart2,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';

function MathsFlashApp() {
  // State definitions
  const [view, setView] = useState('topics');
  const [currentUser, setCurrentUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [importError, setImportError] = useState('');
  const [columnMappings, setColumnMappings] = useState({
    question: '',
    answer: '',
    hint: '',
    subtopic: '',
    explanation: '',
    acceptableAnswers: '',
    videoUrl: ''
  });

  // Define topicIcons to prevent errors
  const topicIcons = {
    book: <BookIcon size={20} />,
    calculator: <div>📊</div>,
    // Add more icons as needed
  };

  // Mock functions that would be defined elsewhere
  const goToTopics = () => setView('topics');
  const selectTopic = (topic) => {
    setCurrentTopic(topic);
    setView('cards');
  };
  const handleImageUpload = (e, isQuestion) => {
    // Mock function for image upload
    console.log('Image upload', isQuestion);
  };
  const saveCard = () => {
    // Mock function to save card
    console.log('Saving card', editingCard);
    setView('cards');
  };
  const deleteClass = (id) => {
    // Mock function to delete class
    console.log('Deleting class', id);
  };
  const createClass = () => {
    // Mock function to create class
    console.log('Creating class', newClassName);
    setView('managementClasses');
  };
  const updateClass = () => {
    // Mock function to update class
    console.log('Updating class', editingClass);
    setView('managementClasses');
  };
  const getClassPerformance = (classId) => {
    // Mock function to get class performance
    return {
      avgCorrectPercentage: 85,
      totalCorrect: 120,
      totalIncorrect: 20,
      totalAttempted: 140,
      studentsWithData: 15,
      studentsByGrade: { A: 5, B: 7, C: 2, D: 1, F: 0 }
    };
  };
  const getTopicPerformanceByClass = (topicId, classId) => {
    // Mock function to get topic performance by class
    return {
      avgCorrectPercentage: 80,
      totalAttempted: 50,
      studentsWithData: 10
    };
  };
  const getStudentPerformance = (studentId) => {
    // Mock function to get student performance
    return {
      overallPercentage: 85,
      totalCorrect: 40,
      totalAttempted: 50,
      topicsAttempted: 5,
      grade: { letter: 'B' }
    };
  };
  const removeStudentFromClass = (studentId) => {
    // Mock function to remove student from class
    console.log('Removing student', studentId);
  };
  const addStudentsToClass = () => {
    // Mock function to add students to class
    console.log('Adding students', selectedStudents);
  };
  const handleExcelUpload = (e) => {
    // Mock function to handle Excel upload
    setImportFile({ name: 'example.xlsx' });
    setSheetData({
      headers: ['Question', 'Answer', 'Hint', 'Subtopic'],
      rows: [
        ['What is 2+2?', '4', 'Add the numbers', 'Addition'],
        ['What is 3*3?', '9', 'Multiply the numbers', 'Multiplication']
      ]
    });
  };
  const cancelImport = () => {
    setSheetData(null);
    setImportFile(null);
  };
  const importCards = () => {
    // Mock function to import cards
    console.log('Importing cards with mappings', columnMappings);
    setView('cards');
  };
  const getFilteredStudents = () => {
    // Mock function to get filtered students
    return users.filter(user => user.role === 'student');
  };

  // Mock function for rendering header
  const renderHeader = () => (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">MathsFlash</h1>
        {currentUser ? (
          <button 
            className="px-4 py-2 bg-gray-200 rounded-md"
            onClick={() => setCurrentUser(null)}
          >
            Logout
          </button>
        ) : (
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={() => setView('login')}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );

  // Mock function for rendering auth page
  const renderAuthPage = () => (
    <div className="container mx-auto p-4">
      <h2>Login Form Would Go Here</h2>
    </div>
  );

  // Mock function for rendering topics
  const renderTopics = () => (
    <div className="container mx-auto p-4">
      <h2>Topics Would Go Here</h2>
    </div>
  );

  // Mock function for rendering cards
  const renderCards = () => (
    <div className="container mx-auto p-4">
      <h2>Cards Would Go Here</h2>
    </div>
  );

  // Mock function for rendering new topic
  const renderNewTopic = () => (
    <div className="container mx-auto p-4">
      <h2>New Topic Form Would Go Here</h2>
    </div>
  );

  // Render summary function
  const renderSummary = () => {
    // Mock summaryData
    const summaryData = {
      strengths: ['Addition', 'Subtraction'],
      weaknesses: ['Multiplication', 'Division'],
      subtopicsAnalysis: {
        'Addition': { correctPercentage: 90 },
        'Subtraction': { correctPercentage: 85 },
        'Multiplication': { correctPercentage: 50 },
        'Division': { correctPercentage: 45 }
      },
      totalAttempted: 50,
      recommendedTopics: [
        { id: '1', title: 'Multiplication', icon: 'calculator', reason: 'Needs improvement' },
        { id: '2', title: 'Division', icon: 'book', reason: 'Requires practice' }
      ]
    };

    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Performance Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Strengths */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <BookOpen size={20} className="text-green-500 mr-2" /> Your Strengths
                </h3>
                
                {summaryData.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {summaryData.strengths.map(subtopic => (
                      <li key={subtopic} className="bg-green-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{subtopic}</span>
                          <span className="text-green-600 font-medium">
                            {summaryData.subtopicsAnalysis[subtopic].correctPercentage}% correct
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${summaryData.subtopicsAnalysis[subtopic].correctPercentage}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 italic">
                    {summaryData.totalAttempted > 0 
                      ? "Keep practicing to develop your strengths." 
                      : "No questions attempted yet."}
                  </div>
                )}
              </div>
              
              {/* Areas to improve */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <BookOpen size={20} className="text-blue-500 mr-2" /> Areas to Improve
                </h3>
                
                {summaryData.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {summaryData.weaknesses.map(subtopic => (
                      <li key={subtopic} className="bg-red-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{subtopic}</span>
                          <span className="text-red-600 font-medium">
                            {summaryData.subtopicsAnalysis[subtopic].correctPercentage}% correct
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${summaryData.subtopicsAnalysis[subtopic].correctPercentage}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 italic">
                    {summaryData.totalAttempted > 0 
                      ? "Great job! No significant weak areas identified." 
                      : "No questions attempted yet."}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="p-6 bg-gray-50 border-t">
            <h3 className="text-lg font-bold mb-3">Recommended Next Steps</h3>
            
            {summaryData.recommendedTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaryData.recommendedTopics.map(topic => (
                  <div 
                    key={topic.id}
                    className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      const fullTopic = topics.find(t => t.id === topic.id);
                      if (fullTopic) {
                        selectTopic(fullTopic);
                      }
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <div className="text-blue-500 mr-2">
                        {topicIcons[topic.icon]}
                      </div>
                      <h4 className="font-semibold">{topic.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{topic.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                No specific recommendations at this time.
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="p-6 flex justify-between border-t">
            <button 
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={goToTopics}
            >
              Return to Topics
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => {
                selectTopic(currentTopic); // Restart the same topic
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderCardEditor = () => {
    if (!editingCard) return null;
    
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-6">
          {editingCard.id ? 'Edit Card' : 'Create New Card'}
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <textarea
              value={editingCard.question || ''}
              onChange={(e) => setEditingCard({...editingCard, question: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtopic/Category</label>
            <input
              type="text"
              value={editingCard.subtopic || 'General'}
              onChange={(e) => setEditingCard({...editingCard, subtopic: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. Algebra, Fractions, Linear Equations"
            />
            <p className="text-xs text-gray-500 mt-1">
              Group similar questions together for better performance tracking
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, true)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {editingCard.imageUrl && (
              <div className="mt-2 p-2 border rounded-md bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Image Preview:</p>
                <img src={editingCard.imageUrl} alt="Preview" className="max-h-32" />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hint</label>
            <textarea
              value={editingCard.hint || ''}
              onChange={(e) => setEditingCard({...editingCard, hint: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea
              value={editingCard.answer || ''}
              onChange={(e) => setEditingCard({...editingCard, answer: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acceptable Answers (comma separated, optional)
            </label>
            <textarea
              value={(editingCard.acceptableAnswers || []).join(', ')}
              onChange={(e) => {
                const answers = e.target.value
                  .split(',')
                  .map(a => a.trim())
                  .filter(a => a);
                setEditingCard({...editingCard, acceptableAnswers: answers});
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="e.g. 4, x=4, x = 4"
            />
            <p className="text-xs text-gray-500 mt-1">
              List alternative correct answers here. The main answer will be added automatically.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, false)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {editingCard.answerImageUrl && (
              <div className="mt-2 p-2 border rounded-md bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Image Preview:</p>
                <img src={editingCard.answerImageUrl} alt="Preview" className="max-h-32" />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Solution/Explanation</label>
            <textarea
              value={editingCard.explanation || ''}
              onChange={(e) => setEditingCard({...editingCard, explanation: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
            <input
              type="text"
              value={editingCard.videoUrl || ''}
              onChange={(e) => setEditingCard({...editingCard, videoUrl: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
            />
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={() => {
                setEditingCard(null);
                setView('cards');
              }}
            >
              Cancel
            </button>
            
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={saveCard}
            >
              Save Card
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderTeacherDashboard = () => {
    // Get teacher's classes
    const teacherClasses = classes.filter(c => c.teacherId === currentUser?.id);
    
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 lg:w-72 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">Teacher Dashboard</h2>
            
            <nav className="space-y-1">
              <button 
                className="w-full flex items-center space-x-3 text-gray-700 p-2 rounded-md hover:bg-gray-100 text-left"
                onClick={() => setView('topics')}
              >
                <BookIcon size={20} />
                <span>Manage Topics</span>
              </button>
              
              <button 
                className="w-full flex items-center space-x-3 text-gray-700 p-2 rounded-md hover:bg-gray-100 text-left"
                onClick={() => setView('managementClasses')}
              >
                <Users size={20} />
                <span>Manage Classes</span>
              </button>
              
              <button 
                className="w-full flex items-center space-x-3 text-gray-700 p-2 rounded-md hover:bg-gray-100 text-left"
                onClick={() => setView('studentReports')}
              >
                <BarChart2 size={20} />
                <span>Student Reports</span>
              </button>
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-600 mb-2">Your Classes</h3>
              {teacherClasses.length > 0 ? (
                <ul className="space-y-1">
                  {teacherClasses.map(cls => (
                    <li key={cls.id}>
                      <button 
                        className="w-full flex items-center text-left p-2 text-sm hover:bg-blue-50 rounded"
                        onClick={() => {
                          setSelectedClass(cls);
                          setView('classDetails');
                        }}
                      >
                        <span className="truncate">{cls.name}</span>
                        <span className="ml-auto text-xs text-gray-500">{cls.students.length} students</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No classes created yet
                </div>
              )}
              
              <button 
                className="mt-3 w-full py-2 bg-blue-500 text-white rounded-md flex items-center justify-center"
                onClick={() => setView('createClass')}
              >
                <Plus size={18} className="mr-1" />
                Create New Class
              </button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 w-full bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome, {currentUser?.name}</h2>
              <p className="text-gray-600">Your teacher dashboard overview</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Total Topics</h3>
                  <BookIcon size={20} className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold">{topics.length}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {topics.reduce((acc, topic) => acc + (topic.cards?.length || 0), 0)} total cards
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Your Classes</h3>
                  <Users size={20} className="text-green-500" />
                </div>
                <p className="text-2xl font-bold">{teacherClasses.length}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {teacherClasses.reduce((acc, cls) => acc + (cls.students?.length || 0), 0)} students enrolled
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Active Students</h3>
                  <User size={20} className="text-yellow-500" />
                </div>
                <p className="text-2xl font-bold">
                  {users.filter(user => user.role === 'student').length}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Registered student accounts
                </p>
              </div>
            </div>
            
            {teacherClasses.length > 0 && (
              <div>
                <h3 className="font-medium text-lg mb-4">Recent Class Activity</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Average Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          View
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teacherClasses.map(cls => {
                        const classPerf = getClassPerformance(cls.id);
                        return (
                          <tr key={cls.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{cls.students.length} students</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {classPerf && classPerf.totalAttempted > 0 ? (
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {classPerf.avgCorrectPercentage}%
                                  </div>
                                  <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full" 
                                      style={{ width: `${classPerf.avgCorrectPercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">No data yet</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button 
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => {
                                  setSelectedClass(cls);
                                  setView('classDetails');
                                }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderClassManagement = () => {
    // Get teacher's classes
    const teacherClasses = classes.filter(c => c.teacherId === currentUser?.id);
    
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Manage Classes</h2>
              <p className="text-gray-600">Create and organize your classes</p>
            </div>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
              onClick={() => setView('createClass')}
            >
              <Plus size={18} className="mr-1" />
              New Class
            </button>
          </div>
          
          {teacherClasses.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teacherClasses.map(cls => (
                    <tr key={cls.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cls.students.length} students</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(cls.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => {
                            setSelectedClass(cls);
                            setView('classDetails');
                          }}
                        >
                          Manage
                        </button>
                        <button 
                          className="text-yellow-600 hover:text-yellow-900"
                          onClick={() => {
                            setEditingClass({...cls});
                            setView('editClass');
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => deleteClass(cls.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Users size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Classes Yet</h3>
              <p className="text-gray-500 mb-6">Create your first class to get started</p>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center mx-auto"
                onClick={() => setView('createClass')}
              >
                <Plus size={18} className="mr-1" />
                Create New Class
              </button>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button 
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={() => setView('teacherDashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderCreateClass = () => {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-6">Create New Class</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. Mathematics 101"
                autoFocus
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => setView('managementClasses')}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={createClass}
                disabled={!newClassName.trim()}
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderEditClass = () => {
    if (!editingClass) return null;
    
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-6">Edit Class</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input
                type="text"
                value={editingClass.name}
                onChange={(e) => setEditingClass({...editingClass, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. Mathematics 101"
                autoFocus
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => {
                  setEditingClass(null);
                  setView('managementClasses');
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={updateClass}
                disabled={!editingClass.name.trim()}
              >
                Update Class
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderClassDetails = () => {
    if (!selectedClass) return null;
    
    // Get students in this class
    const classStudents = selectedClass.students
      .map(studentId => users.find(user => user.id === studentId))
      .filter(Boolean);
    
    // Get list of students not in this class
    const availableStudents = users.filter(user => 
      user.role === 'student' && !selectedClass.students.includes(user.id)
    );
    
    // Get filtered available students
    const filteredAvailableStudents = availableStudents.filter(student => {
      if (!studentSearch.trim()) return true;
      const search = studentSearch.toLowerCase().trim();
      return student.name.toLowerCase().includes(search) || 
             student.email.toLowerCase().includes(search);
    });
    
    // Get class performance data
    const classPerformance = getClassPerformance(selectedClass.id);
    
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{selectedClass.name}</h2>
              <p className="text-gray-600">
                {classStudents.length} student{classStudents.length !== 1 ? 's' : ''} enrolled
              </p>
            </div>
            <div className="space-x-2">
              <button 
                className="px-4 py-2 bg-yellow-500 text-white rounded-md flex items-center"
                onClick={() => {
                  setEditingClass({...selectedClass});
                  setView('editClass');
                }}
              >
                <Edit3 size={18} className="mr-1" />
                Edit Class
              </button>
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => {
                  setSelectedClass(null);
                  setView(currentUser?.role === 'teacher' ? 'teacherDashboard' : 'topics');
                }}
              >
                Back
              </button>
            </div>
          </div>
          
          {/* Class stats */}
          {classPerformance && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Class Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {classPerformance.avgCorrectPercentage}%
                  </div>
                  <div className="text-sm text-gray-500">Average Score</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {classPerformance.totalCorrect}
                  </div>
                  <div className="text-sm text-gray-500">Correct Answers</div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {classPerformance.totalIncorrect}
                  </div>
                  <div className="text-sm text-gray-500">Incorrect Answers</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-gray-600 mb-1">
                    {classPerformance.studentsWithData}/{classStudents.length}
                  </div>
                  <div className="text-sm text-gray-500">Active Students</div>
                </div>
              </div>
              
              {/* Grade distribution */}
              <div className="mt-6">
                <h4 className="font-medium mb-2">Grade Distribution</h4>
                <div className="flex items-center space-x-2">
                  {classPerformance.studentsByGrade.A > 0 && (
                    <div className="flex-1 bg-green-100 text-green-800 p-2 text-center rounded">
                      A ({classPerformance.studentsByGrade.A})
                    </div>
                  )}
                  {classPerformance.studentsByGrade.B > 0 && (
                    <div className="flex-1 bg-blue-100 text-blue-800 p-2 text-center rounded">
                      B ({classPerformance.studentsByGrade.B})
                    </div>
                  )}
                  {classPerformance.studentsByGrade.C > 0 && (
                    <div className="flex-1 bg-yellow-100 text-yellow-800 p-2 text-center rounded">
                      C ({classPerformance.studentsByGrade.C})
                    </div>
                  )}
                  {classPerformance.studentsByGrade.D > 0 && (
                    <div className="flex-1 bg-orange-100 text-orange-800 p-2 text-center rounded">
                      D ({classPerformance.studentsByGrade.D})
                    </div>
                  )}
                  {classPerformance.studentsByGrade.F > 0 && (
                    <div className="flex-1 bg-red-100 text-red-800 p-2 text-center rounded">
                      F ({classPerformance.studentsByGrade.F})
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Topics section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Topics Performance</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students Attempted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topics.map(topic => {
                    const topicPerf = getTopicPerformanceByClass(topic.id, selectedClass.id);
                    return (
                      <tr key={topic.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-blue-500 mr-2">
                              {topicIcons[topic.icon]}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{topic.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {topicPerf && topicPerf.totalAttempted > 0 ? (
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {topicPerf.avgCorrectPercentage}%
                              </div>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${topicPerf.avgCorrectPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">No data yet</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {topicPerf ? (
                            <div className="text-sm text-gray-900">
                              {topicPerf.studentsWithData} / {classStudents.length}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">0 / {classStudents.length}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {topicPerf && topicPerf.studentsWithData > 0 ? (
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => {
                                // View detailed topic performance
                                // Implementation for topic details view
                              }}
                            >
                              View Details
                            </button>
                          ) : (
                            <span className="text-gray-400">No data</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Students section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Students</h3>
            
            {/* Current students */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Enrolled Students</h4>
              {classStudents.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classStudents.map(student => {
                        const studentPerf = getStudentPerformance(student.id);
                        return (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {studentPerf && studentPerf.totalAttempted > 0 ? (
                                <div className="flex items-center">
                                  <div className="mr-2 w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full" 
                                      style={{ width: `${studentPerf.overallPercentage}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-sm font-medium">
                                    {studentPerf.overallPercentage}% ({studentPerf.grade.letter})
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">No activity yet</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => removeStudentFromClass(student.id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4 border border-gray-200 rounded-lg">
                  No students enrolled yet
                </div>
              )}
            </div>
            
            {/* Add students section */}
            <div>
              <h4 className="font-medium mb-2">Add Students</h4>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                      placeholder="Search students by name or email..."
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {filteredAvailableStudents.length > 0 ? (
                  <div className="space-y-2">
                    {filteredAvailableStudents.map(student => (
                      <div 
                        key={student.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                      >
                        <div>
                          <div className="text-sm font-medium">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents([...selectedStudents, student.id]);
                              } else {
                                setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                              }
                            }}
                            className="mr-2"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 flex justify-end">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                        onClick={addStudentsToClass}
                        disabled={selectedStudents.length === 0}
                      >
                        Add Selected Students ({selectedStudents.length})
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    {studentSearch.trim() 
                      ? "No matching students found" 
                      : "No available students to add"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderImport = () => {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-6">
          Import Questions from Excel for "{currentTopic?.title}"
        </h2>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {!sheetData ? (
            <div className="space-y-6">
              <div className="text-gray-700">
                <p className="mb-4">Upload an Excel file (.xlsx, .xls) containing your questions and answers.</p>
                <p className="mb-2">Your spreadsheet should include:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>A header row with column names (e.g., "Question", "Answer", etc.)</li>
                  <li><strong>Required:</strong> Columns for questions and answers</li>
                  <li><strong>Optional:</strong> Columns for hints, explanations, acceptable alternative answers, subtopics, and video URLs</li>
                </ul>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <Upload size={40} className="mx-auto mb-2" />
                  <p>Drag and drop your Excel file here, or click to browse</p>
                </div>
                
                <input
                  type="file"
                  id="excel-upload"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleExcelUpload}
                />
                
                <label
                  htmlFor="excel-upload"
                  className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                  Select Excel File
                </label>
              </div>
              
              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {importError}
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  onClick={() => setView('cards')}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <FileSpreadsheet size={16} className="mr-1" />
                  <span>{importFile.name}</span>
                </div>
                <p className="font-medium">Found {sheetData.rows.length} rows of data. Please map your columns below:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Column <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={columnMappings.question}
                      onChange={(e) => setColumnMappings({...columnMappings, question: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Answer Column <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={columnMappings.answer}
                      onChange={(e) => setColumnMappings({...columnMappings, answer: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hint Column (optional)
                    </label>
                    <select
                      value={columnMappings.hint}
                      onChange={(e) => setColumnMappings({...columnMappings, hint: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtopic/Category Column (optional)
                    </label>
                    <select
                      value={columnMappings.subtopic}
                      onChange={(e) => setColumnMappings({...columnMappings, subtopic: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Explanation/Solution Column (optional)
                    </label>
                    <select
                      value={columnMappings.explanation}
                      onChange={(e) => setColumnMappings({...columnMappings, explanation: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Acceptable Answers Column (optional)
                    </label>
                    <select
                      value={columnMappings.acceptableAnswers}
                      onChange={(e) => setColumnMappings({...columnMappings, acceptableAnswers: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      This can be a comma-separated list of alternate answers
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video URL Column (optional)
                    </label>
                    <select
                      value={columnMappings.videoUrl}
                      onChange={(e) => setColumnMappings({...columnMappings, videoUrl: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Preview section */}
              {columnMappings.question !== '' && columnMappings.answer !== '' && (
                <div className="mt-4 border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <h3 className="font-medium">Data Preview</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Question
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Answer
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {columnMappings.subtopic !== '' ? 'Subtopic' : 'Hint'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sheetData.rows.slice(0, 3).map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 text-sm whitespace-normal">
                              {columnMappings.question !== '' ? row[columnMappings.question] || 'N/A' : 'Not mapped'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {columnMappings.answer !== '' ? row[columnMappings.answer] || 'N/A' : 'Not mapped'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {columnMappings.subtopic !== '' 
                                ? (row[columnMappings.subtopic] || 'General') 
                                : (columnMappings.hint !== '' ? row[columnMappings.hint] || 'N/A' : 'Not mapped')}
                            </td>
                          </tr>
                        ))}
                        {sheetData.rows.length > 3 && (
                          <tr>
                            <td colSpan="3" className="px-4 py-2 text-sm text-gray-500 text-center">
                              Showing 3 of {sheetData.rows.length} rows
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {importError}
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  onClick={cancelImport}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                  onClick={importCards}
                  disabled={columnMappings.question === '' || columnMappings.answer === ''}
                >
                  <Upload size={18} className="mr-1" />
                  Import Cards
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderStudentReports = () => {
    const studentsList = users.filter(user => user.role === 'student');
    
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Student Reports</h2>
              <p className="text-gray-600">View detailed performance for all students</p>
            </div>
            <div>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-64 p-2 border border-gray-300 rounded-md"
                placeholder="Search students..."
              />
            </div>
          </div>
          
          {studentsList.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Performance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topics Attempted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correct / Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredStudents().map(student => {
                    const studentPerf = getStudentPerformance(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {studentPerf && studentPerf.totalAttempted > 0 ? (
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-green-500 h-2.5 rounded-full" 
                                  style={{ width: `${studentPerf.overallPercentage}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium">
                                {studentPerf.overallPercentage}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No data</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {studentPerf ? studentPerf.topicsAttempted : 0} / {topics.length}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {studentPerf && studentPerf.totalAttempted > 0 ? (
                            <div className="text-sm text-gray-900">
                              {studentPerf.totalCorrect} / {studentPerf.totalAttempted}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">0 / 0</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {studentPerf && studentPerf.totalAttempted > 0 ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              studentPerf.grade.letter === 'A' ? 'bg-green-100 text-green-800' :
                              studentPerf.grade.letter === 'B' ? 'bg-blue-100 text-blue-800' :
                              studentPerf.grade.letter === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              studentPerf.grade.letter === 'D' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {studentPerf.grade.letter}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <User size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Students Found</h3>
              <p className="text-gray-500 mb-6">There are no students registered yet</p>
            </div>
          )}
          
          <div className="mt-6">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={() => setView('teacherDashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Main render
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {renderHeader()}
      <main className="flex-1">
        {view === 'login' && renderAuthPage()}
        {view === 'topics' && renderTopics()}
        {view === 'cards' && renderCards()}
        {view === 'edit' && renderCardEditor()}
        {view === 'newTopic' && renderNewTopic()}
        {view === 'import' && renderImport()}
        {view === 'summary' && renderSummary()}
        {view === 'teacherDashboard' && renderTeacherDashboard()}
        {view === 'managementClasses' && renderClassManagement()}
        {view === 'createClass' && renderCreateClass()}
        {view === 'editClass' && renderEditClass()}
        {view === 'classDetails' && renderClassDetails()}
        {view === 'studentReports' && renderStudentReports()}
      </main>
    </div>
  );
}

const App = () => {
  return (
    <div className="h-screen w-full">
      <MathsFlashApp />
    </div>
  );
};

export default App;