import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Circle, Triangle, PenLine, Table, ChevronRight, Plus, Check, X, Upload, FileSpreadsheet, BarChart, Award, BookOpen, Image, ChevronLeft, Sparkles, Brain, BookOpenCheck, RefreshCw, FileCheck, Star, BookMarked } from 'lucide-react';
import * as XLSX from 'xlsx';
import './MathsFlash.css';

// Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6 transform transition-all animate-fade-in">
        <h3 className="text-lg font-bold mb-2 dark:text-gray-200">{title}</h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

function MathsFlashApp() {
  // Basic state
  const [mode, setMode] = useState('student');
  const [view, setView] = useState('topics');
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [password] = useState('teacher123');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('calculator');
  const [topicImageUrl, setTopicImageUrl] = useState(''); // New state for topic image
  const [studentAnswer, setStudentAnswer] = useState('');
  const [answerStatus, setAnswerStatus] = useState(null); // null, 'correct', or 'incorrect'
  const passwordInputRef = useRef(null);
  const answerInputRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  // Performance tracking state
  const [performanceData, setPerformanceData] = useState({});
  const [summaryData, setSummaryData] = useState(null);
  
  // Excel import state
  const [importFile, setImportFile] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [columnMappings, setColumnMappings] = useState({
    question: '',
    answer: '',
    hint: '',
    explanation: '',
    acceptableAnswers: '',
    videoUrl: ''
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState('');
  
  // Timer state
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // Stats state
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0
  });
  
  // Topic icons mapping with enhanced options
  const topicIcons = {
    calculator: <Calculator size={24} />,
    circle: <Circle size={24} />,
    triangle: <Triangle size={24} />,
    penLine: <PenLine size={24} />,
    table: <Table size={24} />,
    sparkles: <Sparkles size={24} />,
    brain: <Brain size={24} />,
    bookOpenCheck: <BookOpenCheck size={24} />,
    star: <Star size={24} />,
    bookMarked: <BookMarked size={24} />
  };
  
  // Topics and cards
  const [topics, setTopics] = useState([
    { 
      id: 1, 
      title: 'Algebra',
      icon: 'calculator',
      imageUrl: '', // Added imageUrl property
      cards: [
        {
          id: 1,
          question: 'Solve for x: 2x + 5 = 13',
          hint: 'Subtract 5 from both sides, then divide.',
          answer: 'x = 4',
          acceptableAnswers: ['4', 'x=4', 'x = 4', 'x= 4', 'x =4'],
          explanation: 'Starting with 2x + 5 = 13\nSubtract 5 from both sides: 2x = 8\nDivide both sides by 2: x = 4',
          videoUrl: 'https://www.youtube.com/watch?v=9DxrF6Ttws4',
          imageUrl: '',
          answerImageUrl: '',
          subtopic: 'Linear Equations'
        },
        {
          id: 2,
          question: 'Factor: x² - 9',
          hint: 'This is a difference of squares',
          answer: '(x+3)(x-3)',
          acceptableAnswers: ['(x+3)(x-3)', '(x-3)(x+3)', '(x + 3)(x - 3)', '(x - 3)(x + 3)'],
          explanation: 'Difference of squares: a² - b² = (a+b)(a-b)',
          videoUrl: 'https://www.youtube.com/watch?v=WDZMYixEzxs',
          imageUrl: '',
          answerImageUrl: '',
          subtopic: 'Factoring'
        }
      ]
    },
    { 
      id: 2, 
      title: 'Geometry',
      icon: 'circle',
      imageUrl: '', // Added imageUrl property
      cards: [
        {
          id: 1,
          question: 'Find the area of a circle with radius r = 5 cm',
          hint: 'Use the formula A = πr²',
          answer: 'A = 25π ≈ 78.54 cm²',
          acceptableAnswers: ['25π', '78.54', '78.5', '25pi', '25π cm²', '78.54 cm²', '78.5 cm²'],
          explanation: 'The area of a circle is given by A = πr²',
          videoUrl: 'https://www.youtube.com/watch?v=YokKp3pwVFc',
          imageUrl: '',
          answerImageUrl: '',
          subtopic: 'Circles'
        }
      ]
    },
    { 
      id: 3, 
      title: 'Physics',
      icon: 'brain',
      imageUrl: '', // Added imageUrl property
      cards: [
        {
          id: 1,
          question: 'What is Newton\'s Second Law of Motion?',
          hint: 'It relates force, mass, and acceleration.',
          answer: 'F = ma',
          acceptableAnswers: ['F = ma', 'F=ma', 'f=ma', 'f = ma', 'force = mass × acceleration', 'force = mass * acceleration'],
          explanation: 'Force equals mass times acceleration. The force acting on an object is equal to the mass of that object times its acceleration.',
          videoUrl: '',
          imageUrl: '',
          answerImageUrl: '',
          subtopic: 'Newton\'s Laws'
        }
      ]
    }
  ]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Add custom CSS to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .card-flip {
        perspective: 1000px;
      }
      .card-inner {
        transition: transform 0.8s;
        transform-style: preserve-3d;
        position: relative;
        width: 100%;
        height: 100%;
      }
      .flipped .card-inner {
        transform: rotateY(180deg);
      }
      .card-front, .card-back {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 1rem;
      }
      .card-front {
        z-index: 2;
      }
      .card-back {
        transform: rotateY(180deg);
      }
      
      /* Animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .fade-in {
        animation: fadeIn 0.4s ease-in-out;
      }
      
      .slide-in {
        animation: slideIn 0.5s ease-out;
      }
      
      .pulse {
        animation: pulse 1.5s ease-in-out infinite;
      }
      
      .progress-ring {
        transition: stroke-dashoffset 0.5s ease;
      }
      
      /* Dark mode styles */
      .dark-mode {
        background-color: #1a1a2e;
        color: #e6e6e6;
      }
      
      .dark-mode .bg-white {
        background-color: #2a2a40;
      }
      
      .dark-mode .text-gray-700 {
        color: #d1d1d1;
      }
      
      .dark-mode .text-gray-600 {
        color: #b8b8b8;
      }
      
      .dark-mode .text-gray-500 {
        color: #a0a0a0;
      }
      
      .dark-mode .border-gray-300 {
        border-color: #3a3a50;
      }
      
      .dark-mode .bg-gray-50 {
        background-color: #252538;
      }
      
      .dark-mode .bg-blue-50 {
        background-color: #1e3a5f;
      }
      
      .dark-mode .bg-green-50 {
        background-color: #1e3b2f;
      }
      
      .dark-mode .bg-red-50 {
        background-color: #3b1e1e;
      }
      
      .dark-mode .bg-yellow-50 {
        background-color: #3b331e;
      }
      
      /* Custom scrollbar */
      * {
        scrollbar-width: thin;
        scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
      }
      
      *::-webkit-scrollbar {
        width: 8px;
      }
      
      *::-webkit-scrollbar-track {
        background: transparent;
      }
      
      *::-webkit-scrollbar-thumb {
        background-color: rgba(155, 155, 155, 0.5);
        border-radius: 20px;
        border: transparent;
      }
      
      .tooltip {
        position: relative;
        display: inline-block;
      }
      
      .tooltip .tooltip-text {
        visibility: hidden;
        width: 120px;
        background-color: rgba(0, 0, 0, 0.8);
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .tooltip:hover .tooltip-text {
        visibility: visible;
        opacity: 1;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Toggle dark mode
  function toggleDarkMode() {
    setIsDarkMode(!isDarkMode);
  }
  
  // Initialize performance data when topics change
  useEffect(() => {
    const initialPerformanceData = {};
    topics.forEach(topic => {
      initialPerformanceData[topic.id] = {
        topicName: topic.title,
        icon: topic.icon,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: topic.cards.length,
        subtopics: {}
      };
      
      // Group cards by subtopic
      topic.cards.forEach(card => {
        const subtopic = card.subtopic || 'General';
        if (!initialPerformanceData[topic.id].subtopics[subtopic]) {
          initialPerformanceData[topic.id].subtopics[subtopic] = {
            correct: 0,
            incorrect: 0,
            skipped: 0,
            total: 0
          };
        }
        initialPerformanceData[topic.id].subtopics[subtopic].total += 1;
      });
    });
    
    setPerformanceData(initialPerformanceData);
  }, [topics]);
  
  // Focus password input when login view is shown
  useEffect(() => {
    if (view === 'login' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [view]);

  // Focus answer input when a new card is shown
  useEffect(() => {
    if (answerInputRef.current && !isFlipped && answerStatus === null) {
      answerInputRef.current.focus();
    }
  }, [currentCardIndex, isFlipped, answerStatus]);
  
  // Timer effect - improved cleanup
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimer(seconds => seconds + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);
  
  // Format time as mm:ss with consistent zero-padding
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  // File upload handlers
  function handleImageUpload(event, isQuestion) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (isQuestion) {
        setEditingCard({...editingCard, imageUrl: e.target.result});
      } else {
        setEditingCard({...editingCard, answerImageUrl: e.target.result});
      }
    };
    reader.readAsDataURL(file);
  }
  
  // Topic image upload handler
  function handleTopicImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setTopicImageUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  }
  
  // Function to edit topic (new function)
  function editTopic(topic) {
    setNewTopicName(topic.title);
    setSelectedIcon(topic.icon);
    setTopicImageUrl(topic.imageUrl || '');
    setView('editTopic');
  }
  
  // Function to save edited topic (new function)
  function saveEditedTopic(topicId) {
    if (!newTopicName.trim()) {
      alert("Please enter a topic name");
      return;
    }
    
    const updatedTopics = topics.map(topic => 
      topic.id === topicId 
        ? { ...topic, title: newTopicName, icon: selectedIcon, imageUrl: topicImageUrl }
        : topic
    );
    
    setTopics(updatedTopics);
    setNewTopicName('');
    setSelectedIcon('calculator');
    setTopicImageUrl('');
    setView('topics');
  }
  
  // Excel import functions
  function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          setImportError('Spreadsheet must contain at least a header row and one data row');
          return;
        }
        
        // Extract headers (first row)
        const headers = jsonData[0];
        
        // Set sheet data
        setSheetData({
          headers,
          rows: jsonData.slice(1) // Skip header row
        });
        
        // Auto-map columns if possible
        const mapping = { ...columnMappings };
        headers.forEach((header, index) => {
          const headerLower = String(header).toLowerCase();
          
          if (headerLower.includes('question')) {
            mapping.question = index;
          } else if (headerLower.includes('answer') && !headerLower.includes('acceptable')) {
            mapping.answer = index;
          } else if (headerLower.includes('hint')) {
            mapping.hint = index;
          } else if (headerLower.includes('explanation') || headerLower.includes('solution')) {
            mapping.explanation = index;
          } else if (headerLower.includes('acceptable') || headerLower.includes('alt')) {
            mapping.acceptableAnswers = index;
          } else if (headerLower.includes('video') || headerLower.includes('url')) {
            mapping.videoUrl = index;
          } else if (headerLower.includes('subtopic') || headerLower.includes('category')) {
            mapping.subtopic = index;
          }
        });
        
        setColumnMappings(mapping);
        setImportError('');
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setImportError('Invalid Excel file format. Please check your file and try again.');
      }
    };
    
    reader.onerror = () => {
      setImportError('Error reading the file. Please try again.');
    };
    
    reader.readAsArrayBuffer(file);
  }
  
  function importCards() {
    if (!currentTopic || !sheetData) return;
    
    // Validate required mappings
    if (columnMappings.question === '' || columnMappings.answer === '') {
      setImportError('Question and Answer column mappings are required');
      return;
    }
    
    try {
      const newCards = [];
      let importErrors = 0;
      
      // Process each row
      sheetData.rows.forEach((row, index) => {
        // Skip empty rows
        if (row.length === 0 || !row[columnMappings.question]) return;
        
        const question = row[columnMappings.question] || '';
        const answer = row[columnMappings.answer] || '';
        
        // Skip if either question or answer is missing
        if (!question.trim() || !answer.trim()) {
          importErrors++;
          return;
        }
        
        // Get other fields if mapped
        const hint = columnMappings.hint !== '' ? row[columnMappings.hint] || '' : '';
        const explanation = columnMappings.explanation !== '' ? row[columnMappings.explanation] || '' : '';
        const videoUrl = columnMappings.videoUrl !== '' ? row[columnMappings.videoUrl] || '' : '';
        const subtopic = columnMappings.subtopic !== '' ? row[columnMappings.subtopic] || 'General' : 'General';
        
        // Handle acceptable answers (could be comma-separated in the spreadsheet)
        let acceptableAnswers = [answer]; // Default to just the main answer
        if (columnMappings.acceptableAnswers !== '' && row[columnMappings.acceptableAnswers]) {
          const altAnswers = row[columnMappings.acceptableAnswers].toString().split(',').map(a => a.trim());
          acceptableAnswers = [...acceptableAnswers, ...altAnswers.filter(a => a && a !== answer)];
        }
        
        // Create the new card
        const newCard = {
          id: Date.now() + index, // Ensure unique IDs
          question,
          answer,
          hint,
          explanation,
          videoUrl,
          acceptableAnswers,
          imageUrl: '',
          answerImageUrl: '',
          subtopic
        };
        
        newCards.push(newCard);
        setImportProgress(Math.round((index + 1) / sheetData.rows.length * 100));
      });
      
      if (newCards.length === 0) {
        setImportError('No valid cards could be imported. Please check your data and mappings.');
        return;
      }
      
      // Update the current topic with new cards
      const updatedTopics = [...topics];
      const topicIndex = updatedTopics.findIndex(t => t.id === currentTopic.id);
      
      if (topicIndex !== -1) {
        // Add new cards to this topic
        updatedTopics[topicIndex].cards = [...updatedTopics[topicIndex].cards, ...newCards];
        
        // Update performance data for new subtopics
        const updatedPerformanceData = {...performanceData};
        if (updatedPerformanceData[currentTopic.id]) {
          updatedPerformanceData[currentTopic.id].total = updatedTopics[topicIndex].cards.length;
          
          newCards.forEach(card => {
            const subtopic = card.subtopic || 'General';
            if (!updatedPerformanceData[currentTopic.id].subtopics[subtopic]) {
              updatedPerformanceData[currentTopic.id].subtopics[subtopic] = {
                correct: 0,
                incorrect: 0,
                skipped: 0,
                total: 0
              };
            }
            updatedPerformanceData[currentTopic.id].subtopics[subtopic].total += 1;
          });
          
          setPerformanceData(updatedPerformanceData);
        }
        
        setTopics(updatedTopics);
        setCurrentTopic({...updatedTopics[topicIndex]});
        
        // Reset import state
        setSheetData(null);
        setImportFile(null);
        setView('cards');
        
        // Show success message
        const successMsg = `Successfully imported ${newCards.length} cards` + 
                          (importErrors > 0 ? ` (${importErrors} rows skipped due to missing data)` : '');
        alert(successMsg);
      }
    } catch (error) {
      console.error('Error importing cards:', error);
      setImportError('An error occurred during import. Please try again.');
    }
  }
  
  function cancelImport() {
    setSheetData(null);
    setImportFile(null);
    setImportError('');
    setView('cards');
  }
  
  // Login function
  function login() {
    if (passwordInput === password) {
      setMode('teacher');
      setPasswordInput('');
      setPasswordError('');
      setView('topics');
    } else {
      setPasswordError('Incorrect password');
    }
  }
  
  // Navigation functions
  function goToTopics() {
    setView('topics');
    setCurrentTopic(null);
    setEditingCard(null);
    setSummaryData(null);
  }
  
  function selectTopic(topic) {
    setCurrentTopic(topic);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setStudentAnswer('');
    setAnswerStatus(null);
    setView('cards');
    setSummaryData(null);
    
    // Reset stats for this session
    setStats({
      correct: 0,
      incorrect: 0,
      skipped: 0
    });
    
    // Start timer when a new topic is selected
    setTimer(0);
    setTimerActive(true);
  }
  
  function nextCard() {
    if (currentTopic && currentCardIndex < currentTopic.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowHint(false);
      setStudentAnswer('');
      setAnswerStatus(null);
    } else if (currentTopic && currentCardIndex === currentTopic.cards.length - 1) {
      // Prepare summary data when finishing the last card
      prepareSummaryData();
      setView('summary');
      setTimerActive(false);
    }
  }
  
  function prevCard() {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      setShowHint(false);
      setStudentAnswer('');
      setAnswerStatus(null);
    }
  }
  
  // Performance tracking functions
  function updatePerformance(result, card) {
    if (!currentTopic) return;
    
    const topicId = currentTopic.id;
    const subtopic = card.subtopic || 'General';
    
    const updatedPerformanceData = {...performanceData};
    
    // Create topic entry if it doesn't exist
    if (!updatedPerformanceData[topicId]) {
      updatedPerformanceData[topicId] = {
        topicName: currentTopic.title,
        icon: currentTopic.icon,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: currentTopic.cards.length,
        subtopics: {}
      };
    }
    
    // Create subtopic entry if it doesn't exist
    if (!updatedPerformanceData[topicId].subtopics[subtopic]) {
      updatedPerformanceData[topicId].subtopics[subtopic] = {
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: 0
      };
    }
    
    // Update the counters
    if (result === 'correct') {
      updatedPerformanceData[topicId].correct += 1;
      updatedPerformanceData[topicId].subtopics[subtopic].correct += 1;
    } else if (result === 'incorrect') {
      updatedPerformanceData[topicId].incorrect += 1;
      updatedPerformanceData[topicId].subtopics[subtopic].incorrect += 1;
    } else if (result === 'skipped') {
      updatedPerformanceData[topicId].skipped += 1;
      updatedPerformanceData[topicId].subtopics[subtopic].skipped += 1;
    }
    
    setPerformanceData(updatedPerformanceData);
  }
  
  function prepareSummaryData() {
    if (!currentTopic) return;
    
    const topicData = performanceData[currentTopic.id];
    if (!topicData) return;
    
    // Calculate percentages and identify strengths/weaknesses
    const subtopicsAnalysis = {};
    const subtopicsList = Object.keys(topicData.subtopics);
    
    subtopicsList.forEach(subtopic => {
      const data = topicData.subtopics[subtopic];
      const attempted = data.correct + data.incorrect;
      const correctPercentage = attempted > 0 ? Math.round((data.correct / attempted) * 100) : 0;
      
      subtopicsAnalysis[subtopic] = {
        ...data,
        correctPercentage,
        attempted,
        needsWork: correctPercentage < 70 && attempted > 0
      };
    });
    
    // Identify strengths (subtopics with > 85% correct)
    const strengths = subtopicsList
      .filter(subtopic => {
        const analysis = subtopicsAnalysis[subtopic];
        return analysis.correctPercentage >= 85 && analysis.attempted > 0;
      })
      .sort((a, b) => subtopicsAnalysis[b].correctPercentage - subtopicsAnalysis[a].correctPercentage);
    
    // Identify weaknesses (subtopics with < 70% correct)
    const weaknesses = subtopicsList
      .filter(subtopic => {
        const analysis = subtopicsAnalysis[subtopic];
        return analysis.needsWork;
      })
      .sort((a, b) => subtopicsAnalysis[a].correctPercentage - subtopicsAnalysis[b].correctPercentage);
    
    // Calculate overall stats
    const totalAttempted = topicData.correct + topicData.incorrect;
    const overallCorrectPercentage = totalAttempted > 0 
      ? Math.round((topicData.correct / totalAttempted) * 100) 
      : 0;
    
    // Find recommended topics
    const recommendedTopics = [];
    if (weaknesses.length > 0) {
      // First recommend topics that need work from the current topic
      recommendedTopics.push({
        id: currentTopic.id,
        title: currentTopic.title,
        icon: currentTopic.icon,
        reason: `Practice ${weaknesses[0]} and other areas that need improvement`
      });
    }
    
    // Add other topics they haven't tried yet
    topics.forEach(topic => {
      if (topic.id !== currentTopic.id && 
          (!performanceData[topic.id] || 
           performanceData[topic.id].correct + performanceData[topic.id].incorrect === 0)) {
        recommendedTopics.push({
          id: topic.id,
          title: topic.title,
          icon: topic.icon,
          reason: "You haven't tried this topic yet"
        });
      }
    });
    
    // Create the summary data
    const summary = {
      topicName: currentTopic.title,
      icon: currentTopic.icon,
      totalCards: currentTopic.cards.length,
      totalAttempted,
      correct: topicData.correct,
      incorrect: topicData.incorrect,
      skipped: topicData.skipped,
      overallCorrectPercentage,
      timeTaken: timer,
      subtopicsAnalysis,
      strengths,
      weaknesses,
      recommendedTopics,
      grade: getGrade(overallCorrectPercentage)
    };
    
    setSummaryData(summary);
  }
  
  function getGrade(percentage) {
    if (percentage >= 90) return { letter: 'A', comment: 'Excellent!' };
    if (percentage >= 80) return { letter: 'B', comment: 'Very Good!' };
    if (percentage >= 70) return { letter: 'C', comment: 'Good' };
    if (percentage >= 60) return { letter: 'D', comment: 'Satisfactory' };
    return { letter: 'F', comment: 'Needs Improvement' };
  }
  
  // Topic management functions
  function saveNewTopic() {
    if (!newTopicName.trim()) {
      alert("Please enter a topic name");
      return;
    }
    
    const newTopic = {
      id: Date.now(),
      title: newTopicName,
      icon: selectedIcon,
      imageUrl: topicImageUrl, // Include the topic image URL
      cards: []
    };
    
    setTopics([...topics, newTopic]);
    setNewTopicName('');
    setSelectedIcon('calculator');
    setTopicImageUrl(''); // Reset the topic image URL
    setView('topics');
  }
  
  // Card management functions
  function createNewCard() {
    if (!currentTopic) {
      alert("Please select a topic first");
      return;
    }
    
    const newCard = {
      id: Date.now(),
      question: '',
      hint: '',
      answer: '',
      acceptableAnswers: [],
      explanation: '',
      videoUrl: '',
      imageUrl: '',
      answerImageUrl: '',
      subtopic: 'General'
    };
    
    setEditingCard(newCard);
    setView('edit');
  }
  
  function editCard(card) {
    setEditingCard({...card});
    setView('edit');
  }
  
  function saveCard() {
    if (!editingCard || !currentTopic) return;
    
    // Add validation
    if (!editingCard.question.trim()) {
      alert("Question field cannot be empty");
      return;
    }
    
    if (!editingCard.answer.trim()) {
      alert("Answer field cannot be empty");
      return;
    }
    
    // Make sure acceptableAnswers always includes the main answer
    let acceptableAnswers = editingCard.acceptableAnswers || [];
    if (!acceptableAnswers.includes(editingCard.answer)) {
      acceptableAnswers = [editingCard.answer, ...acceptableAnswers];
    }
    
    const updatedCard = {
      ...editingCard,
      acceptableAnswers,
      subtopic: editingCard.subtopic || 'General'
    };
    
    const updatedTopics = [...topics];
    const topicIndex = updatedTopics.findIndex(t => t.id === currentTopic.id);
    
    if (topicIndex === -1) return;
    
    const cardIndex = updatedTopics[topicIndex].cards.findIndex(c => c.id === editingCard.id);
    
    if (cardIndex !== -1) {
      // Update existing card
      updatedTopics[topicIndex].cards[cardIndex] = updatedCard;
    } else {
      // Add new card
      updatedTopics[topicIndex].cards.push(updatedCard);
    }
    
    // Update performance data structure for subtopics
    const updatedPerformanceData = {...performanceData};
    if (!updatedPerformanceData[currentTopic.id]) {
      updatedPerformanceData[currentTopic.id] = {
        topicName: currentTopic.title,
        icon: currentTopic.icon,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: updatedTopics[topicIndex].cards.length,
        subtopics: {}
      };
    }
    
    // Update subtopic totals
    updatedPerformanceData[currentTopic.id].total = updatedTopics[topicIndex].cards.length;
    
    const subtopic = updatedCard.subtopic;
    if (!updatedPerformanceData[currentTopic.id].subtopics[subtopic]) {
      updatedPerformanceData[currentTopic.id].subtopics[subtopic] = {
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: 0
      };
    }
    
    // Only increment total if it's a new card
    if (cardIndex === -1) {
      updatedPerformanceData[currentTopic.id].subtopics[subtopic].total += 1;
    }
    
    setPerformanceData(updatedPerformanceData);
    setTopics(updatedTopics);
    setCurrentTopic({...updatedTopics[topicIndex]});
    setView('cards');
    setEditingCard(null);
  }
  
  function deleteCard(cardId) {
    if (!currentTopic) return;
    
    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Card',
      message: 'Are you sure you want to delete this card? This action cannot be undone.',
      onConfirm: () => {
        const updatedTopics = [...topics];
        const topicIndex = updatedTopics.findIndex(t => t.id === currentTopic.id);
        
        if (topicIndex === -1) return;
        
        const cardToDelete = updatedTopics[topicIndex].cards.find(card => card.id === cardId);
        const subtopic = cardToDelete?.subtopic || 'General';
        
        updatedTopics[topicIndex].cards = updatedTopics[topicIndex].cards.filter(card => card.id !== cardId);
        
        // Update performance data
        if (cardToDelete) {
          const updatedPerformanceData = {...performanceData};
          if (updatedPerformanceData[currentTopic.id]) {
            updatedPerformanceData[currentTopic.id].total -= 1;
            
            if (updatedPerformanceData[currentTopic.id].subtopics[subtopic]) {
              updatedPerformanceData[currentTopic.id].subtopics[subtopic].total -= 1;
            }
            
            setPerformanceData(updatedPerformanceData);
          }
        }
        
        setTopics(updatedTopics);
        setCurrentTopic({...updatedTopics[topicIndex]});
        
        // If no cards left, go back to topics view
        if (updatedTopics[topicIndex].cards.length === 0) {
          setView('topics');
          return;
        }
        
        if (currentCardIndex >= updatedTopics[topicIndex].cards.length) {
          setCurrentCardIndex(Math.max(0, updatedTopics[topicIndex].cards.length - 1));
        }
        
        // Close the dialog
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
      onCancel: () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  }
  
  // Flashcard interaction functions
  function toggleHint() {
    setShowHint(!showHint);
  }
  
  function toggleFlip() {
    setIsFlipped(!isFlipped);
  }
  
  function checkAnswer() {
    if (!studentAnswer.trim()) {
      alert("Please enter your answer");
      return;
    }
    
    const card = currentTopic.cards[currentCardIndex];
    const isCorrect = card.acceptableAnswers.some(
      answer => studentAnswer.trim().toLowerCase() === answer.toLowerCase()
    );
    
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    
    // Update session stats
    const newStats = {...stats};
    if (isCorrect) {
      newStats.correct += 1;
    } else {
      newStats.incorrect += 1;
    }
    setStats(newStats);
    
    // Update overall performance tracking
    updatePerformance(isCorrect ? 'correct' : 'incorrect', card);
  }
  
  function handleSubmit(e) {
    e.preventDefault();
    if (answerStatus === null) {
      checkAnswer();
    } else {
      toggleFlip(); // Show solution after checking answer
    }
  }
  
  function resetCard() {
    setStudentAnswer('');
    setAnswerStatus(null);
    if (isFlipped) {
      toggleFlip();
    }
  }
  
  function skipCard() {
    // Update stats
    const newStats = {...stats};
    newStats.skipped += 1;
    setStats(newStats);
    
    // Update performance tracking
    const card = currentTopic.cards[currentCardIndex];
    updatePerformance('skipped', card);
    
    // Move to next card
    nextCard();
  }
  
  function resetStats() {
    setStats({
      correct: 0,
      incorrect: 0,
      skipped: 0
    });
    setTimer(0);
  }
  
  function toggleTimer() {
    setTimerActive(!timerActive);
  }
  
  // Generate a circular progress indicator
  function CircularProgress({ percentage, size = 36, strokeWidth = 3, color }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring"
        />
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          fill={color}
          fontSize={size / 4}
          fontWeight="bold"
        >
          {percentage}%
        </text>
      </svg>
    );
  }
  
  // Render functions
  function renderHeader() {
    return (
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-600 to-indigo-700'} text-white shadow-lg sticky top-0 z-10`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 
              className="text-xl md:text-2xl font-bold cursor-pointer flex items-center" 
              onClick={goToTopics}
            >
              <span className="mr-2">🧠</span> MathsFlash
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {mode === 'teacher' && (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                Teacher Mode
              </span>
            )}
            
            <button 
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition duration-200"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <button 
              className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white bg-opacity-20 hover:bg-opacity-30'} transition duration-200`}
              onClick={() => {
                if (mode === 'teacher') {
                  setMode('student');
                } else {
                  setView('login');
                }
              }}
            >
              {mode === 'teacher' ? 'Student View' : 'Teacher Login'}
            </button>
          </div>
        </div>
      </header>
    );
  }
  
  function renderTopics() {
    return (
      <div className={`p-4 ${isDarkMode ? 'dark-mode' : ''}`}>
        <h2 className="text-2xl font-bold text-center mb-8 fade-in">
          <span className={`${isDarkMode ? 'text-purple-300' : 'text-indigo-600'}`}>Foundation Maths</span> Topics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
          {topics.map(topic => (
            <div 
              key={topic.id} 
              className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer ${isDarkMode ? 'dark-mode' : ''}`}
              onClick={() => selectTopic(topic)}
            >
              {/* Topic header with gradient background */}
              <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white relative overflow-hidden`}>
                {/* Abstract background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mt-16 -mr-16"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -mb-8 -ml-8"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-full">
                      {topicIcons[topic.icon]}
                    </div>
                    <h3 className="text-xl font-semibold">{topic.title}</h3>
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-full text-sm flex items-center">
                      {topic.cards.length} cards
                      <ChevronRight size={16} className="ml-1" />
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Display topic image if available */}
              {topic.imageUrl && (
                <div className="relative h-36 overflow-hidden">
                  <img 
                    src={topic.imageUrl} 
                    alt={`${topic.title} visualization`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30"></div>
                </div>
              )}
              
              {/* Topic content */}
              <div className="p-4">
                {/* Show previous performance if available */}
                {performanceData[topic.id] && 
                 (performanceData[topic.id].correct > 0 || performanceData[topic.id].incorrect > 0) && (
                  <div className="mt-2 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Previous performance
                      </div>
                      <div className="flex items-center">
                        {performanceData[topic.id].correct + performanceData[topic.id].incorrect > 0 && (
                          <CircularProgress 
                            percentage={Math.round(performanceData[topic.id].correct / 
                              (performanceData[topic.id].correct + performanceData[topic.id].incorrect) * 100)}
                            color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                            size={40}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <div className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                        <span className="text-gray-500">{performanceData[topic.id].correct} correct</span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                        <span className="text-gray-500">{performanceData[topic.id].incorrect} incorrect</span>
                      </div>
                      {performanceData[topic.id].skipped > 0 && (
                        <div className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1"></span>
                          <span className="text-gray-500">{performanceData[topic.id].skipped} skipped</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Topic summary - cards by subtopic */}
                {topic.cards.length > 0 && (
                  <div className={`mt-3 pt-3 ${performanceData[topic.id] && 
                    (performanceData[topic.id].correct > 0 || performanceData[topic.id].incorrect > 0) ? 
                    '' : 'border-t border-gray-100'}`}>
                    
                    <div className="text-xs text-gray-500 mb-2">Card categories:</div>
                    
                    {/* Get unique subtopics */}
                    {(() => {
                      const subtopics = {};
                      topic.cards.forEach(card => {
                        const subtopic = card.subtopic || 'General';
                        if (!subtopics[subtopic]) {
                          subtopics[subtopic] = 0;
                        }
                        subtopics[subtopic]++;
                      });
                      
                      return (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(subtopics).map(([subtopic, count]) => (
                            <div 
                              key={subtopic} 
                              className={`px-2 py-1 text-xs rounded-full ${
                                isDarkMode 
                                  ? 'bg-gray-700 text-gray-300' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {subtopic} ({count})
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                {/* Edit topic button (only visible in teacher mode) */}
                {mode === 'teacher' && (
                  <div className="mt-3 text-right">
                    <button 
                      className={`text-${isDarkMode ? 'blue-400' : 'blue-500'} text-sm hover:text-${isDarkMode ? 'blue-300' : 'blue-700'} transition duration-200`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        editTopic(topic);
                      }}
                    >
                      Edit Topic
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {mode === 'teacher' && (
            <div 
              className={`bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors ${isDarkMode ? 'dark-mode' : ''}`}
              onClick={() => setView('newTopic')}
            >
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} mb-4`}>
                <Plus size={24} className={isDarkMode ? 'text-blue-300' : 'text-blue-500'} />
              </div>
              <p className={`text-${isDarkMode ? 'gray-300' : 'gray-600'} font-medium`}>Add New Topic</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  function renderNewTopic() {
    return (
      <div className={`p-6 max-w-md mx-auto ${isDarkMode ? 'dark-mode' : ''}`}>
        <h2 className={`text-2xl font-bold mb-8 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          <span className={isDarkMode ? 'text-blue-300' : 'text-blue-600'}>Create New</span> Foundation Maths Topic
        </h2>
        <div className={`bg-white rounded-xl shadow-lg p-6 ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Topic Name</label>
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className={`w-full p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                autoFocus
                placeholder="e.g. Trigonometry, Calculus, Statistics"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Choose Icon</label>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(topicIcons).map(([key, icon]) => (
                  <div 
                    key={key}
                    onClick={() => setSelectedIcon(key)}
                    className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border-2 transition-all ${
                      selectedIcon === key 
                        ? isDarkMode 
                          ? 'border-blue-500 bg-blue-900 bg-opacity-50' 
                          : 'border-blue-500 bg-blue-50' 
                        : isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500' 
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={selectedIcon === key ? (isDarkMode ? 'text-blue-300' : 'text-blue-500') : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                      {icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* New topic image upload section */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Topic Image (optional)</label>
              <div className={`flex flex-col items-center p-6 border-2 border-dashed ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'} rounded-lg`}>
                <Image size={28} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 mb-4 text-center`}>
                  Upload an image to visually represent this topic
                </p>
                
                <input
                  type="file"
                  accept="image/*"
                  id="topic-image-upload"
                  className="hidden"
                  onChange={handleTopicImageUpload}
                />
                
                <label
                  htmlFor="topic-image-upload"
                  className={`px-4 py-2 ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white rounded-lg cursor-pointer transition-colors`}
                >
                  Choose Image
                </label>
                
                {/* Preview the selected image */}
                {topicImageUrl && (
                  <div className={`mt-4 border rounded-lg p-3 w-full ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Selected image:</p>
                    <img 
                      src={topicImageUrl} 
                      alt="Topic preview" 
                      className="mx-auto max-h-32 rounded-md object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                className={`px-4 py-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } rounded-lg transition-colors`}
                onClick={() => {
                  setView('topics');
                  setTopicImageUrl(''); // Clear the image state
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-lg transition-colors`}
                onClick={saveNewTopic}
              >
                Create Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // New function to render edit topic view
  function renderEditTopic() {
    const topicToEdit = topics.find(t => t.title === newTopicName);
    
    return (
      <div className={`p-6 max-w-md mx-auto ${isDarkMode ? 'dark-mode' : ''}`}>
        <h2 className={`text-2xl font-bold mb-8 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          <span className={isDarkMode ? 'text-purple-300' : 'text-indigo-600'}>Edit</span> Foundation Maths Topic
        </h2>
        <div className={`bg-white rounded-xl shadow-lg p-6 ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Topic Name</label>
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className={`w-full p-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                autoFocus
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Choose Icon</label>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(topicIcons).map(([key, icon]) => (
                  <div 
                    key={key}
                    onClick={() => setSelectedIcon(key)}
                    className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border-2 transition-all ${
                      selectedIcon === key 
                        ? isDarkMode 
                          ? 'border-blue-500 bg-blue-900 bg-opacity-50' 
                          : 'border-blue-500 bg-blue-50' 
                        : isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500' 
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={selectedIcon === key ? (isDarkMode ? 'text-blue-300' : 'text-blue-500') : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                      {icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Topic image upload/edit section */}
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Topic Image (optional)</label>
              <div className={`flex flex-col items-center p-6 border-2 border-dashed ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'} rounded-lg`}>
                <Image size={28} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 mb-4 text-center`}>
                  Upload an image to visually represent this topic
                </p>
                
                <input
                  type="file"
                  accept="image/*"
                  id="topic-image-edit"
                  className="hidden"
                  onChange={handleTopicImageUpload}
                />
                
                <label
                  htmlFor="topic-image-edit"
                  className={`px-4 py-2 ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white rounded-lg cursor-pointer transition-colors`}
                >
                  {topicImageUrl ? 'Change Image' : 'Choose Image'}
                </label>
                
                {/* Preview the selected image */}
                {topicImageUrl && (
                  <div className={`mt-4 border rounded-lg p-3 w-full ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current image:</p>
                      <button 
                        className="text-xs text-red-500 hover:text-red-700"
                        onClick={() => setTopicImageUrl('')}
                      >
                        Remove
                      </button>
                    </div>
                    <img 
                      src={topicImageUrl} 
                      alt="Topic preview" 
                      className="mx-auto max-h-32 rounded-md object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                className={`px-4 py-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } rounded-lg transition-colors`}
                onClick={() => {
                  setView('topics');
                  setNewTopicName('');
                  setSelectedIcon('calculator');
                  setTopicImageUrl('');
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-lg transition-colors`}
                onClick={() => saveEditedTopic(topicToEdit.id)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  function renderCards() {
    if (!currentTopic || !currentTopic.cards || currentTopic.cards.length === 0) {
      return (
        <div className={`flex flex-col items-center justify-center p-16 ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className={`text-${isDarkMode ? 'gray-300' : 'gray-500'} text-xl mb-6`}>No cards available for this topic.</div>
          {mode === 'teacher' && (
            <button 
              className={`px-6 py-3 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1`}
              onClick={createNewCard}
            >
              <span className="flex items-center">
                <Plus size={20} className="mr-2" />
                Create First Card
              </span>
            </button>
          )}
        </div>
      );
    }
    
    const card = currentTopic.cards[currentCardIndex];
    
    return (
      <div className={`p-4 ${isDarkMode ? 'dark-mode' : ''}`}>
        {/* Stats and Timer with improved design */}
        <div className={`${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white'
        } rounded-xl shadow-md p-4 mb-6 fade-in`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <div className={`flex items-center px-4 py-2 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} rounded-lg`}>
                <Check size={18} className={`mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.correct}</span>
              </div>
              <div className={`flex items-center px-4 py-2 ${isDarkMode ? 'bg-red-900' : 'bg-red-100'} rounded-lg`}>
                <X size={18} className={`mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                <span className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{stats.incorrect}</span>
              </div>
              <div className={`flex items-center px-4 py-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                <RefreshCw size={18} className={`mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stats.skipped}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`text-lg font-mono px-4 py-2 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-lg`}>
                {formatTime(timer)}
              </div>
              <button 
                className={`flex items-center px-3 py-2 rounded-lg text-white transition-colors ${
                  timerActive 
                    ? isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                    : isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                }`}
                onClick={toggleTimer}
              >
                {timerActive ? 'Pause' : 'Start'}
              </button>
              <button 
                className={`p-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors`}
                onClick={resetStats}
                title="Reset statistics"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Topic and Card Info */}
        <div className="flex justify-between items-center mb-6 fade-in">
          <div className="flex items-center">
            <button 
              className={`mr-3 px-3 py-2 text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } rounded-lg flex items-center transition-colors`}
              onClick={goToTopics}
            >
              <ChevronLeft size={16} className="mr-1" />
              Topics
            </button>
            <div className={`p-2 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full mr-3`}>
              <div className={isDarkMode ? 'text-blue-300' : 'text-blue-500'}>
                {topicIcons[currentTopic.icon]}
              </div>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {currentTopic.title}
              </h2>
              {card.subtopic && card.subtopic !== 'General' && (
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {card.subtopic}
                </span>
              )}
            </div>
          </div>
          <div className={`px-3 py-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
            Card {currentCardIndex + 1} of {currentTopic.cards.length}
          </div>
        </div>
        
        {/* Flashcard with enhanced flip animation */}
        <div className="card-flip h-96 w-full mb-6 fade-in">
          <div className={`card-inner w-full h-full ${isFlipped ? 'flipped' : ''}`}>
            {/* Front of card (Question) */}
            <div className={`card-front ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } shadow-lg border p-6 flex flex-col`}>
              <div className={`text-sm mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-500'} font-medium uppercase tracking-wide`}>Question:</div>
              <div className={`mb-4 font-medium text-xl flex-grow ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{card.question}</div>
              
              {card.imageUrl && (
                <div className="my-4 flex justify-center">
                  <img 
                    src={card.imageUrl} 
                    alt="Question illustration" 
                    className="max-h-48 rounded-lg shadow-md"
                  />
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="mt-auto">
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Your Answer:</label>
                  <div className="flex">
                    <input
                      ref={answerInputRef}
                      type="text"
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      className={`flex-grow p-3 border rounded-l-lg ${
                        answerStatus === 'correct' 
                          ? isDarkMode ? 'border-green-600 bg-green-900 text-green-100' : 'border-green-500 bg-green-50 text-green-800' 
                          : answerStatus === 'incorrect'
                          ? isDarkMode ? 'border-red-600 bg-red-900 text-red-100' : 'border-red-500 bg-red-50 text-red-800'
                          : isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 text-gray-800'
                      } focus:outline-none focus:ring-2 ${
                        answerStatus === 'correct'
                          ? 'focus:ring-green-500'
                          : answerStatus === 'incorrect'
                          ? 'focus:ring-red-500'
                          : 'focus:ring-blue-500'
                      }`}
                      placeholder="Type your answer here"
                      disabled={answerStatus !== null}
                    />
                    {answerStatus === 'correct' && (
                      <div className={`flex items-center justify-center w-12 ${isDarkMode ? 'bg-green-600' : 'bg-green-500'} text-white rounded-r-lg`}>
                        <Check size={22} />
                      </div>
                    )}
                    {answerStatus === 'incorrect' && (
                      <div className={`flex items-center justify-center w-12 ${isDarkMode ? 'bg-red-600' : 'bg-red-500'} text-white rounded-r-lg`}>
                        <X size={22} />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {answerStatus === null ? (
                    <>
                      <button 
                        type="submit"
                        className={`py-3 ${
                          isDarkMode 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white rounded-lg transition-colors flex items-center justify-center`}
                      >
                        <FileCheck size={18} className="mr-2" />
                        Check Answer
                      </button>
                      {showHint ? (
                        <div className={`p-3 rounded-lg ${
                          isDarkMode 
                            ? 'bg-yellow-900 border border-yellow-700 text-yellow-100' 
                            : 'bg-yellow-50 border border-yellow-100 text-yellow-800'
                        }`}>
                          <div className="text-sm">{card.hint}</div>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          className={`py-3 ${
                            isDarkMode 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          } text-white rounded-lg transition-colors`}
                          onClick={toggleHint}
                        >
                          Show Hint
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button 
                        type="button"
                        className={`py-3 ${
                          isDarkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        } rounded-lg transition-colors`}
                        onClick={resetCard}
                      >
                        Try Again
                      </button>
                      <button 
                        type="submit"
                        className={`py-3 ${
                          isDarkMode 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white rounded-lg transition-colors`}
                      >
                        View Solution
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
            
            {/* Back of card (Answer) */}
            <div className={`card-back ${
              isDarkMode 
                ? 'bg-blue-900 border-blue-800' 
                : 'bg-blue-50 border-blue-100'
            } shadow-lg border rounded-xl p-6 overflow-auto`}>
              <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Answer:</h3>
              <div className={`mb-4 p-3 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-blue-100'
              } rounded-lg shadow-sm font-medium text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {card.answer}
              </div>
              
              {card.answerImageUrl && (
                <div className="my-6 flex justify-center">
                  <img 
                    src={card.answerImageUrl} 
                    alt="Answer illustration" 
                    className="max-h-40 rounded-lg shadow-md"
                  />
                </div>
              )}
              
              {card.explanation && (
                <div className="mt-6">
                  <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Solution:</h3>
                  <div className={`p-4 ${
                    isDarkMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-blue-100'
                  } rounded-lg shadow-sm whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {card.explanation}
                  </div>
                </div>
              )}
              
              {card.videoUrl && (
                <div className="mt-6">
                  <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Video Explanation:</h3>
                  <a 
                    href={card.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`block p-4 ${
                      isDarkMode 
                        ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' 
                        : 'bg-white border border-blue-100 hover:bg-blue-50'
                    } rounded-lg shadow-sm transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                        </svg>
                      </div>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Watch video explanation</span>
                    </div>
                  </a>
                </div>
              )}
              
              <div className="mt-8 flex justify-center">
                <button 
                  className={`px-8 py-3 ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1`}
                  onClick={() => {
                    // If we're on the last card, go to summary
                    if (currentCardIndex === currentTopic.cards.length - 1) {
                      prepareSummaryData();
                      setView('summary');
                      setTimerActive(false);
                    } else {
                      nextCard();
                    }
                  }}
                >
                  {currentCardIndex === currentTopic.cards.length - 1 
                    ? "Finish & See Summary" 
                    : "Next Card"}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation controls */}
        <div className="flex justify-between items-center fade-in">
          <button 
            className={`px-4 py-2 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={prevCard}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft size={18} className="mr-1" />
            Previous
          </button>
          
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
            {answerStatus === null ? "Enter your answer and check" : isFlipped ? "Review the solution" : "Check your answer then view solution"}
          </div>
          
          <button 
            className={`px-4 py-2 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } rounded-lg transition-colors`}
            onClick={skipCard}
          >
            Skip
            <ChevronRight size={18} className="ml-1 inline" />
          </button>
        </div>
        
        {/* Teacher controls */}
        {mode === 'teacher' && (
          <div className="flex justify-center mt-8 space-x-4 fade-in">
            <button 
              className={`px-5 py-2 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-lg shadow-md transition-colors flex items-center`}
              onClick={createNewCard}
            >
              <Plus size={18} className="mr-2" />
              Add Card
            </button>
            {card && (
              <>
                <button 
                  className={`px-5 py-2 ${
                    isDarkMode 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  } text-white rounded-lg shadow-md transition-colors`}
                  onClick={() => editCard(card)}
                >
                  Edit Card
                </button>
                <button 
                  className={`px-5 py-2 ${
                    isDarkMode 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white rounded-lg shadow-md transition-colors`}
                  onClick={() => deleteCard(card.id)}
                >
                  Delete Card
                </button>
              </>
            )}
            <button 
              className={`px-5 py-2 ${
                isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white rounded-lg shadow-md transition-colors flex items-center`}
              onClick={() => setView('import')}
            >
              <FileSpreadsheet size={18} className="mr-2" />
              Import from Excel
            </button>
          </div>
        )}
      </div>
    );
  }
  }
  
  function renderSummary() {
    if (!summaryData) {
      prepareSummaryData();
      return (
        <div className={`p-16 text-center ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="animate-pulse flex flex-col items-center">
            <div className={`h-10 w-64 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg mb-8`}></div>
            <div className={`h-6 w-48 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg mb-4`}></div>
            <div className={`h-32 w-full max-w-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}></div>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`p-4 max-w-4xl mx-auto ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden fade-in`}>
          {/* Header section with gradient */}
          <div className={`${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-900 to-indigo-900' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
          } text-white p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-16 -mr-16"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
                  {topicIcons[summaryData.icon]}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{summaryData.topicName}</h2>
                  <p className="text-blue-100 mt-1">Performance Summary</p>
                </div>
              </div>
              <div className={`${
                summaryData.grade.letter === 'A' ? 'bg-green-500' :
                summaryData.grade.letter === 'B' ? 'bg-green-400' :
                summaryData.grade.letter === 'C' ? 'bg-yellow-500' :
                summaryData.grade.letter === 'D' ? 'bg-yellow-400' :
                'bg-red-500'
              } text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white border-opacity-20`}>
                {summaryData.grade.letter}
              </div>
            </div>
          </div>
          
          {/* Overall stats with cards */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`${
                isDarkMode 
                  ? 'bg-blue-900 border border-blue-800' 
                  : 'bg-blue-50 border border-blue-100'
              } p-6 rounded-xl text-center shadow-sm`}>
                <div className={`text-4xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} mb-2`}>
                  {summaryData.overallCorrectPercentage}%
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-500'} font-medium`}>Overall Score</div>
              </div>
              
              <div className={`${
                isDarkMode 
                  ? 'bg-green-900 border border-green-800' 
                  : 'bg-green-50 border border-green-100'
              } p-6 rounded-xl text-center shadow-sm`}>
                <div className={`text-4xl font-bold ${isDarkMode ? 'text-green-300' : 'text-green-600'} mb-2`}>
                  {summaryData.correct}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-500'} font-medium`}>Correct Answers</div>
              </div>
              
              <div className={`${
                isDarkMode 
                  ? 'bg-red-900 border border-red-800' 
                  : 'bg-red-50 border border-red-100'
              } p-6 rounded-xl text-center shadow-sm`}>
                <div className={`text-4xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-600'} mb-2`}>
                  {summaryData.incorrect}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-500'} font-medium`}>Incorrect Answers</div>
              </div>
              
              <div className={`${
                isDarkMode 
                  ? 'bg-gray-700 border border-gray-600' 
                  : 'bg-gray-50 border border-gray-200'
              } p-6 rounded-xl text-center shadow-sm`}>
                <div className={`text-4xl font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  {formatTime(summaryData.timeTaken)}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Time Taken</div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {summaryData.grade.comment}
              </div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                You attempted {summaryData.totalAttempted} out of {summaryData.totalCards} questions.
                {summaryData.skipped > 0 && ` You skipped ${summaryData.skipped} questions.`}
              </p>
            </div>
          </div>
          
          {/* Strengths and weaknesses */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200">
            {/* Strengths section */}
            <div>
              <h3 className={`text-xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                <BookOpen size={22} className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mr-2`} /> 
                Areas to Improve
              </h3>
              
              {summaryData.weaknesses.length > 0 ? (
                <ul className="space-y-3">
                  {summaryData.weaknesses.map(subtopic => (
                    <li key={subtopic} className={`${
                      isDarkMode 
                        ? 'bg-red-900 border border-red-800' 
                        : 'bg-red-50 border border-red-100'
                    } p-4 rounded-lg shadow-sm`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>{subtopic}</span>
                        <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                          {summaryData.subtopicsAnalysis[subtopic].correctPercentage}% correct
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${summaryData.subtopicsAnalysis[subtopic].correctPercentage}%` }}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`p-6 ${
                  isDarkMode 
                    ? 'bg-gray-700 border border-gray-600' 
                    : 'bg-gray-50 border border-gray-200'
                } rounded-lg text-center italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {summaryData.totalAttempted > 0 
                    ? "Great job! No significant weak areas identified." 
                    : "No questions attempted yet."}
                </div>
              )}
            </div>
          </div>
          
          {/* Recommendations */}
          <div className={`p-6 md:p-8 ${
            isDarkMode 
              ? 'bg-gray-900 border-t border-gray-700' 
              : 'bg-gray-50 border-t border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Recommended Next Steps</h3>
            
            {summaryData.recommendedTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaryData.recommendedTopics.map(topic => (
                  <div 
                    key={topic.id}
                    className={`${
                      isDarkMode 
                        ? 'bg-gray-800 border-l-4 border-blue-600 hover:bg-gray-700' 
                        : 'bg-white border-l-4 border-blue-500 hover:bg-blue-50'
                    } rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300`}
                    onClick={() => {
                      const fullTopic = topics.find(t => t.id === topic.id);
                      if (fullTopic) {
                        selectTopic(fullTopic);
                      }
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`p-2 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full mr-3`}>
                        <div className={isDarkMode ? 'text-blue-300' : 'text-blue-500'}>
                          {topicIcons[topic.icon]}
                        </div>
                      </div>
                      <h4 className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{topic.title}</h4>
                    </div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-9`}>{topic.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-6 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              } rounded-lg text-center italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No specific recommendations at this time.
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className={`p-6 md:p-8 flex justify-between border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button 
              className={`px-6 py-3 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } rounded-lg shadow-sm hover:shadow transition-colors flex items-center`}
              onClick={goToTopics}
            >
              <ChevronLeft size={18} className="mr-2" />
              Return to Topics
            </button>
            <button 
              className={`px-6 py-3 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-lg shadow-sm hover:shadow-md transition-all`}
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
  }
  
  function renderCardEditor() {
    if (!editingCard) return null;
    
    return (
      <div className={`p-6 max-w-2xl mx-auto ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className={`${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-900 to-indigo-900' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
          } text-white p-6`}>
            <h2 className="text-xl font-bold">
              {editingCard.id ? 'Edit Card' : 'Create New Card'}
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Question</label>
              <textarea
                value={editingCard.question || ''}
                onChange={(e) => setEditingCard({...editingCard, question: e.target.value})}
                className={`w-full p-3 border ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                rows={3}
                placeholder="Enter the question here..."
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Subtopic/Category</label>
              <input
                type="text"
                value={editingCard.subtopic || 'General'}
                onChange={(e) => setEditingCard({...editingCard, subtopic: e.target.value})}
                className={`w-full p-3 border ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                placeholder="e.g. Algebra, Fractions, Linear Equations"
              />
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                Group similar questions together for better performance tracking
              </p>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Question Image</label>
              <div className={`p-4 border-2 border-dashed ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-800' 
                  : 'border-gray-300 bg-gray-50'
              } rounded-lg flex flex-col items-center`}>
                <Image size={24} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 mb-3`}>
                  Upload an image to illustrate the question
                </p>
                
                <input
                  type="file"
                  id="question-image"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, true)}
                />
                
                <label
                  htmlFor="question-image"
                  className={`px-4 py-2 ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white rounded-lg cursor-pointer transition-colors`}
                >
                  Choose Image
                </label>
                
                {editingCard.imageUrl && (
                  <div className="mt-4 w-full">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Image Preview:</p>
                    <img src={editingCard.imageUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Hint</label>
              <textarea
                value={editingCard.hint || ''}
                onChange={(e) => setEditingCard({...editingCard, hint: e.target.value})}
                className={`w-full p-3 border ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                rows={2}
                placeholder="Provide a hint to help students solve the problem"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Answer</label>
              <textarea
                value={editingCard.answer || ''}
                onChange={(e) => setEditingCard({...editingCard, answer: e.target.value})}
                className={`w-full p-3 border ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                rows={2}
                placeholder="The correct answer to the question"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
                className={`w-full p-3 border ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                rows={2}
                placeholder="e.g. 4, x=4, x = 4"
              />
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                List alternative correct answers here. The main answer will be added automatically.
              </p>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Answer Image</label>
              <div className={`p-4 border-2 border-dashed ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-800' 
                  : 'border-gray-300 bg-gray-50'
              } rounded-lg flex flex-col items-center`}>
                <Image size={24} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 mb-3`}>
                  Upload an image to illustrate the answer
                </p>
                
                <input
                  type="file"
                  id="answer-image"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, false)}
                />
                
                <label
                  htmlFor="answer-image"
                  className={`px-4 py-2 ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white rounded-lg cursor-pointer transition-colors`}
                >
                  Choose Image
                </label>
                
                {editingCard.answerImageUrl && (
                  <div className="mt-4 w-full">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Image Preview:</p>
                    <img src={editingCard.answerImageUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Solution/Explanation</label>
              <textarea
                value={editingCard.explanation || ''}
                onChange={(e) => setEditingCard({...editingCard, explanation: e.target.value})}
                className={`w-full p-3 border ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                rows={4}
                placeholder="Provide a detailed explanation of the solution"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Video URL</label>
              <input
                type="text"
                value={editingCard.videoUrl || ''}
                onChange={(e) => setEditingCard({...editingCard, videoUrl: e.target.value})}
                className={`w-full p-3 border ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                className={`px-5 py-3 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } rounded-lg transition-colors`}
                onClick={() => {
                  setEditingCard(null);
                  setView('cards');
                }}
              >
                Cancel
              </button>
              
              <button
                className={`px-5 py-3 ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-lg shadow-sm hover:shadow transition-colors`}
                onClick={saveCard}
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  function renderLogin() {
    return (
      <div className={`flex items-center justify-center min-h-screen p-4 ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className={`${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white'
        } rounded-xl shadow-xl p-8 w-full max-w-md fade-in`}>
          <div className="flex flex-col items-center justify-center mb-8">
            <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${
              isDarkMode 
                ? 'bg-blue-900' 
                : 'bg-blue-100'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Teacher Login</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Enter your password to access teacher mode</p>
          </div>
          
          <div className="mb-6">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Password</label>
            <input
              ref={passwordInputRef}
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className={`w-full p-3 border ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
              placeholder="Enter teacher password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  login();
                }
              }}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {passwordError}
              </p>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <button
              className={`px-5 py-3 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } rounded-lg transition-colors`}
              onClick={() => setView('topics')}
            >
              Cancel
            </button>
            
            <button
              className={`px-5 py-3 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-lg shadow-sm hover:shadow transition-colors`}
              onClick={login}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  function renderImport() {
    return (
      <div className={`p-6 max-w-4xl mx-auto ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className={`${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-900 to-teal-900' 
              : 'bg-gradient-to-r from-green-500 to-teal-500'
          } text-white p-6`}>
            <h2 className="text-xl font-bold flex items-center">
              <FileSpreadsheet size={22} className="mr-2" />
              Import Questions from Excel for "{currentTopic?.title}"
            </h2>
          </div>
          
          <div className="p-6">
            {!sheetData ? (
              <div className="space-y-6">
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p className="mb-4">Upload an Excel file (.xlsx, .xls) containing your questions and answers.</p>
                  <p className="mb-2">Your spreadsheet should include:</p>
                  <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>A header row with column names (e.g., "Question", "Answer", etc.)</li>
                    <li><strong>Required:</strong> Columns for questions and answers</li>
                    <li><strong>Optional:</strong> Columns for hints, explanations, acceptable alternative answers, subtopics, and video URLs</li>
                  </ul>
                </div>
                
                <div className={`border-2 border-dashed ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800' 
                    : 'border-gray-300 bg-gray-50'
                } rounded-xl p-10 text-center`}>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                    <Upload size={50} className="mx-auto mb-4" />
                    <p className="text-lg">Drag and drop your Excel file here, or click to browse</p>
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
                    className={`inline-block px-6 py-3 ${
                      isDarkMode 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white rounded-lg cursor-pointer transition-colors shadow-sm hover:shadow`}
                  >
                    Select Excel File
                  </label>
                </div>
                
                {importError && (
                  <div className={`p-4 ${
                    isDarkMode 
                      ? 'bg-red-900 border border-red-800' 
                      : 'bg-red-50 border border-red-200'
                  } text-${isDarkMode ? 'red-200' : 'red-600'} rounded-lg flex items-start`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {importError}
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <button
                    className={`px-5 py-3 ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } rounded-lg transition-colors`}
                    onClick={() => setView('cards')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`border-b pb-4 mb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                    <FileSpreadsheet size={16} className="mr-1" />
                    <span>{importFile.name}</span>
                  </div>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Found {sheetData.rows.length} rows of data. Please map your columns below:
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Question Column <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={columnMappings.question}
                        onChange={(e) => setColumnMappings({...columnMappings, question: e.target.value})}
                        className={`w-full p-3 border ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-800'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                        required
                      >
                        <option value="">Select column</option>
                        {sheetData.headers.map((header, index) => (
                          <option key={index} value={index}>{header}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Answer Column <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={columnMappings.answer}
                        onChange={(e) => setColumnMappings({...columnMappings, answer: e.target.value})}
                        className={`w-full p-3 border ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-800'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                        required
                      >
                        <option value="">Select column</option>
                        {sheetData.headers.map((header, index) => (
                          <option key={index} value={index}>{header}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Hint Column (optional)
                      </label>
                      <select
                        value={columnMappings.hint}
                        onChange={(e) => setColumnMappings({...columnMappings, hint: e.target.value})}
                        className={`w-full p-3 border ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-800'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                      >
                        <option value="">Select column</option>
                        {sheetData.headers.map((header, index) => (
                          <option key={index} value={index}>{header}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Subtopic/Category Column (optional)
                      </label>
                      <select
                        value={columnMappings.subtopic}
                        onChange={(e) => setColumnMappings({...columnMappings, subtopic: e.target.value})}
                        className={`w-full p-3 border ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-800'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
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
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Explanation/Solution Column (optional)
                      </label>
                      <select
                        value={columnMappings.explanation}
                        onChange={(e) => setColumnMappings({...columnMappings, explanation: e.target.value})}
                        className={`w-full p-3 border ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-800'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                      >
                        <option value="">Select column</option>
                        {sheetData.headers.map((header, index) => (
                          <option key={index} value={index}>{header}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Acceptable Answers Column (optional)
                      </label>
                      <select
                        value={columnMappings.acceptableAnswers}
                        onChange={(e) => setColumnMappings({...columnMappings, acceptableAnswers: e.target.value})}
                        className={`w-full p-3 border ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-800'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                      >
                        <option value="">Select column</option>
                        {sheetData.headers.map((header, index) => (
                          <option key={index} value={index}>{header}</option>
                        ))}
                      </select>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        This can be a comma-separated list of alternate answers
                      </p>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Video URL Column (optional)
                      </label>
                      <select
                        value={columnMappings.videoUrl}
                        onChange={(e) => setColumnMappings({...columnMappings, videoUrl: e.target.value})}
                        className={`w-full p-3 border ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-800'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
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
                  <div className="mt-6">
                    <div className={`${
                      isDarkMode 
                        ? 'bg-gray-700 border-b border-gray-600' 
                        : 'bg-gray-50 border-b border-gray-200'
                    } p-4 rounded-t-lg`}>
                      <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Data Preview</h3>
                    </div>
                    <div className={`overflow-x-auto ${
                      isDarkMode 
                        ? 'border border-gray-700 bg-gray-800' 
                        : 'border border-gray-200 bg-white'
                    } rounded-b-lg`}>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Question
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Answer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {columnMappings.subtopic !== '' ? 'Subtopic' : 'Hint'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`${isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                          {sheetData.rows.slice(0, 3).map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')}>
                              <td className={`px-4 py-3 text-sm whitespace-normal ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                {columnMappings.question !== '' ? row[columnMappings.question] || 'N/A' : 'Not mapped'}
                              </td>
                              <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                {columnMappings.answer !== '' ? row[columnMappings.answer] || 'N/A' : 'Not mapped'}
                              </td>
                              <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                {columnMappings.subtopic !== '' 
                                  ? (row[columnMappings.subtopic] || 'General') 
                                  : (columnMappings.hint !== '' ? row[columnMappings.hint] || 'N/A' : 'Not mapped')}
                              </td>
                            </tr>
                          ))}
                          {sheetData.rows.length > 3 && (
                            <tr>
                              <td colSpan="3" className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
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
                  <div className={`p-4 ${
                    isDarkMode 
                      ? 'bg-red-900 border border-red-800' 
                      : 'bg-red-50 border border-red-200'
                  } text-${isDarkMode ? 'red-200' : 'red-600'} rounded-lg flex items-start mt-6`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {importError}
                  </div>
                )}
                
                <div className="flex justify-between pt-6">
                  <button
                    className={`px-5 py-3 ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } rounded-lg transition-colors`}
                    onClick={cancelImport}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-5 py-3 ${
                      isDarkMode 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white rounded-lg shadow-sm hover:shadow transition-colors flex items-center ${
                      columnMappings.question === '' || columnMappings.answer === '' 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                    onClick={importCards}
                    disabled={columnMappings.question === '' || columnMappings.answer === ''}
                  >
                    <Upload size={18} className="mr-2" />
                    Import Cards
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Generate a circular progress indicator
  function CircularProgress({ percentage, size = 36, strokeWidth = 3, color }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring"
        />
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          fill={color}
          fontSize={size / 4}
          fontWeight="bold"
        >
          {percentage}%
        </text>
      </svg>
    );
  }
  
  // Main render
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark-mode bg-gray-900' : 'bg-gray-50'} flex flex-col`}>
      {renderHeader()}
      <main className="flex-1">
        {view === 'topics' && renderTopics()}
        {view === 'cards' && renderCards()}
        {view === 'login' && renderLogin()}
        {view === 'edit' && renderCardEditor()}
        {view === 'newTopic' && renderNewTopic()}
        {view === 'editTopic' && renderEditTopic()}
        {view === 'import' && renderImport()}
        {view === 'summary' && renderSummary()}
      </main>
      
      {/* Footer */}
      <footer className={`py-4 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'} text-center text-sm`}>
        <div className="container mx-auto px-4">
          <p>MathsFlash &copy; {new Date().getFullYear()} | An interactive mathematics learning tool</p>
        </div>
      </footer>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
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

export default App;-gray-800'}`}>
                <Award size={22} className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'} mr-2`} /> 
                Your Strengths
              </h3>
              
              {summaryData.strengths.length > 0 ? (
                <ul className="space-y-3">
                  {summaryData.strengths.map(subtopic => (
                    <li key={subtopic} className={`${
                      isDarkMode 
                        ? 'bg-green-900 border border-green-800' 
                        : 'bg-green-50 border border-green-100'
                    } p-4 rounded-lg shadow-sm`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>{subtopic}</span>
                        <span className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                          {summaryData.subtopicsAnalysis[subtopic].correctPercentage}% correct
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${summaryData.subtopicsAnalysis[subtopic].correctPercentage}%` }}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`p-6 ${
                  isDarkMode 
                    ? 'bg-gray-700 border border-gray-600' 
                    : 'bg-gray-50 border border-gray-200'
                } rounded-lg text-center italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {summaryData.totalAttempted > 0 
                    ? "Keep practicing to develop your strengths." 
                    : "No questions attempted yet."}
                </div>
              )}
            </div>
            
            {/* Areas to improve */}
            <div>
              <h3 className={`text-xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                <BookOpen size={22} className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mr-2`} /> 
                Areas to Improve
              </h3>
              
              {summaryData.weaknesses.length > 0 ? (
                <ul className="space-y-3">
                  {summaryData.weaknesses.map(subtopic => (
                    <li key={subtopic} className={`${
                      isDarkMode 
                        ? 'bg-red-900 border border-red-800' 
                        : 'bg-red-50 border border-red-100'
                    } p-4 rounded-lg shadow-sm`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>{subtopic}</span>
                        <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                          {summaryData.subtopicsAnalysis[subtopic].correctPercentage}% correct
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${summaryData.subtopicsAnalysis[subtopic].correctPercentage}%` }}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`p-6 ${
                  isDarkMode 
                    ? 'bg-gray-700 border border-gray-600' 
                    : 'bg-gray-50 border border-gray-200'
                } rounded-lg text-center italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {summaryData.totalAttempted > 0 
                    ? "Great job! No significant weak areas identified." 
                    : "No questions attempted yet."}
                </div>
              )}
            </div>
          </div>
          
          {/* Recommendations */}
          <div className={`p-6 md:p-8 ${
            isDarkMode 
              ? 'bg-gray-900 border-t border-gray-700' 
              : 'bg-gray-50 border-t border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Recommended Next Steps</h3>
            
            {summaryData.recommendedTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaryData.recommendedTopics.map(topic => (
                  <div 
                    key={topic.id}
                    className={`${
                      isDarkMode 
                        ? 'bg-gray-800 border-l-4 border-blue-600 hover:bg-gray-700' 
                        : 'bg-white border-l-4 border-blue-500 hover:bg-blue-50'
                    } rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-300`}
                    onClick={() => {
                      const fullTopic = topics.find(t => t.id === topic.id);
                      if (fullTopic) {
                        selectTopic(fullTopic);
                      }
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`p-2 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full mr-3`}>
                        <div className={isDarkMode ? 'text-blue-300' : 'text-blue-500'}>
                          {topicIcons[topic.icon]}
                        </div>
                      </div>
                      <h4 className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{topic.title}</h4>
                    </div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-9`}>{topic.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-6 ${
                isDarkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              } rounded-lg text-center italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No specific recommendations at this time.
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className={`p-6 md:p-8 flex justify-between border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button 
              className={`px-6 py-3 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } rounded-lg shadow-sm hover:shadow transition-colors flex items-center`}
              onClick={goToTopics}
            >
              <ChevronLeft size={18} className="mr-2" />
              Return to Topics
            </button>
            <button 
              className={`px-6 py-3 ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-lg shadow-sm hover:shadow-md transition-all`}
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
  }
  
  // Generate a circular progress indicator
  function CircularProgress({ percentage, size = 36, strokeWidth = 3, color }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring"
        />
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          fill={color}
          fontSize={size / 4}
          fontWeight="bold"
        >
          {percentage}%
        </text>
      </svg>
    );
  }
  
  // Main render
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark-mode bg-gray-900' : 'bg-gray-50'} flex flex-col`}>
      {renderHeader()}
      <main className="flex-1">
        {view === 'topics' && renderTopics()}
        {view === 'cards' && renderCards()}
        {view === 'login' && renderLogin()}
        {view === 'edit' && renderCardEditor()}
        {view === 'newTopic' && renderNewTopic()}
        {view === 'editTopic' && renderEditTopic()}
        {view === 'import' && renderImport()}
        {view === 'summary' && renderSummary()}
      </main>
      
      {/* Footer */}
      <footer className={`py-4 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'} text-center text-sm`}>
        <div className="container mx-auto px-4">
          <p>MathsFlash &copy; {new Date().getFullYear()} | An interactive mathematics learning tool</p>
        </div>
      </footer>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
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