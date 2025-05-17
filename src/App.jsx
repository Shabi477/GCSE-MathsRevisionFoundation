import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Circle, Triangle, PenLine, Table, ChevronRight, Plus, Check, X, Upload, 
  FileSpreadsheet, BarChart, Award, BookOpen, Image, Square, Sigma, Percent, 
  PieChart, LineChart, GitBranch, Divide, Function, Hash, Infinity as InfinityIcon, 
  Binary, AlignJustify, Atom, Pi, Loader2, Recycle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import './MathsFlash.css';

// Add custom CSS for enhanced visual design
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Outfit:wght@400;500;600&display=swap');

  :root {
    --primary-color: #5b6eae;
    --primary-light: #e8ecf7;
    --primary-dark: #3c4e8e;
    --secondary-color: #6eb5b8;
    --secondary-light: #e8f6f7;
    --secondary-dark: #4e8285;
    --accent-color: #b085c9;
    --accent-light: #f5ebfa;
    --success-color: #78c2a4;
    --success-light: #e8f6f0;
    --error-color: #e28c8c;
    --error-light: #fceeee;
    --warning-color: #e2c18c;
    --warning-light: #fcf6ee;
    --neutral-50: #f9fafb;
    --neutral-100: #f3f4f6;
    --neutral-200: #e5e7eb;
    --neutral-300: #d1d5db;
    --neutral-400: #9ca3af;
    --neutral-500: #6b7280;
    --neutral-600: #4b5563;
    --neutral-700: #374151;
    --neutral-800: #1f2937;
    --neutral-900: #111827;
  }

  body {
    font-family: 'Nunito', sans-serif;
    background-color: var(--neutral-50);
    color: var(--neutral-700);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
  }

  .card-container {
    perspective: 1000px;
  }

  .card {
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .card.flipped {
    transform: rotateY(180deg);
  }

  .card-front, .card-back {
    backface-visibility: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
    border-radius: 16px;
  }

  .card-back {
    transform: rotateY(180deg);
  }

  .topic-card {
    transition: all 0.3s ease;
  }

  .topic-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  }

  .input-field {
    transition: all 0.3s ease;
    border-radius: 8px;
    border: 1px solid var(--neutral-300);
  }

  .input-field:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-light);
  }

  .btn {
    transition: all 0.2s ease;
    border-radius: 8px;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
  }

  .btn-primary {
    background-color: var(--primary-color);
    color: white;
  }

  .btn-primary:hover {
    background-color: var(--primary-dark);
  }

  .btn-secondary {
    background-color: var(--secondary-color);
    color: white;
  }

  .btn-secondary:hover {
    background-color: var(--secondary-dark);
  }

  .btn-success {
    background-color: var(--success-color);
    color: white;
  }

  .btn-success:hover {
    background-color: var(--success-color);
    filter: brightness(90%);
  }

  .btn-error {
    background-color: var(--error-color);
    color: white;
  }

  .btn-error:hover {
    background-color: var(--error-color);
    filter: brightness(90%);
  }

  .btn-neutral {
    background-color: var(--neutral-200);
    color: var(--neutral-700);
  }

  .btn-neutral:hover {
    background-color: var(--neutral-300);
  }

  .answer-correct {
    animation: pulse-success 0.6s;
  }

  .answer-incorrect {
    animation: pulse-error 0.6s;
  }

  @keyframes pulse-success {
    0% { box-shadow: 0 0 0 0 rgba(120, 194, 164, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(120, 194, 164, 0); }
    100% { box-shadow: 0 0 0 0 rgba(120, 194, 164, 0); }
  }

  @keyframes pulse-error {
    0% { box-shadow: 0 0 0 0 rgba(226, 140, 140, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(226, 140, 140, 0); }
    100% { box-shadow: 0 0 0 0 rgba(226, 140, 140, 0); }
  }
`;

function MathsFlashApp() {
  // Add custom styles to head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
  
  // Topic icons mapping - Expanded with more math icons
  const topicIcons = {
    calculator: <Calculator size={24} />,
    circle: <Circle size={24} />,
    triangle: <Triangle size={24} />,
    penLine: <PenLine size={24} />,
    table: <Table size={24} />,
    square: <Square size={24} />,
    sigma: <Sigma size={24} />,
    percent: <Percent size={24} />,
    pieChart: <PieChart size={24} />,
    lineChart: <LineChart size={24} />,
    gitBranch: <GitBranch size={24} />, // For sequences and patterns
    divide: <Divide size={24} />,
    function: <Function size={24} />,
    hash: <Hash size={24} />, // For number theory
    infinity: <InfinityIcon size={24} />,
    binary: <Binary size={24} />, // For number bases
    alignJustify: <AlignJustify size={24} />, // For matrices
    atom: <Atom size={24} />, // For physics
    pi: <Pi size={24} />,
    recycle: <Recycle size={24} /> // For transformations
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
      icon: 'atom',
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
  
  // Animation states
  const [animateCorrect, setAnimateCorrect] = useState(false);
  const [animateIncorrect, setAnimateIncorrect] = useState(false);

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
      imageUrl: currentTopic.imageUrl,
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
    
    // Add confirmation dialog
    if (!window.confirm("Are you sure you want to delete this card?")) {
      return;
    }
    
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
    
    // Set animation state
    if (isCorrect) {
      setAnimateCorrect(true);
      setTimeout(() => setAnimateCorrect(false), 800);
    } else {
      setAnimateIncorrect(true);
      setTimeout(() => setAnimateIncorrect(false), 800);
    }
    
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
  
  // Render functions
  function renderHeader() {
    return (
      <header className="bg-gradient-to-r from-primary-color to-secondary-color text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 
              className="text-xl md:text-2xl font-bold cursor-pointer font-poppins" 
              onClick={goToTopics}
            >
              MathsFlash
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {mode === 'teacher' && (
              <span className="bg-warning-color text-neutral-700 text-xs font-medium px-3 py-1 rounded-full">
                Teacher Mode
              </span>
            )}
            
            <button 
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
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
      <div className="p-6 bg-neutral-50">
        <h2 className="text-3xl font-bold text-center mb-8 text-primary-dark font-poppins">Foundation Maths Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {topics.map(topic => (
            <div 
              key={topic.id} 
              className="topic-card bg-white rounded-xl shadow-md p-5 border-l-4 border-primary-color cursor-pointer hover:shadow-lg transition"
              onClick={() => selectTopic(topic)}
            >
              {/* Display topic image if available */}
              {topic.imageUrl && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src={topic.imageUrl} 
                    alt={`${topic.title} visualization`} 
                    className="h-36 rounded-md object-contain"
                  />
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="text-primary-color">
                    {topicIcons[topic.icon]}
                  </div>
                  <h3 className="text-lg font-semibold font-poppins">{topic.title}</h3>
                </div>
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-primary-light text-primary-dark rounded-full text-xs font-medium">
                    {topic.cards.length} cards
                  </span>
                  <ChevronRight size={16} className="ml-2 text-neutral-400" />
                </div>
              </div>
              
              {/* Show previous performance if available */}
              {performanceData[topic.id] && 
               (performanceData[topic.id].correct > 0 || performanceData[topic.id].incorrect > 0) && (
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div>
                      Previous: {performanceData[topic.id].correct} correct, 
                      {performanceData[topic.id].incorrect} incorrect
                    </div>
                    <div className="flex items-center">
                      {performanceData[topic.id].correct + performanceData[topic.id].incorrect > 0 && (
                        <div className="w-16 bg-neutral-200 rounded-full h-2 mr-1">
                          <div 
                            className="bg-success-color h-2 rounded-full" 
                            style={{ 
                              width: `${Math.round(performanceData[topic.id].correct / 
                                (performanceData[topic.id].correct + performanceData[topic.id].incorrect) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Edit topic button (only visible in teacher mode) */}
              {mode === 'teacher' && (
                <div className="mt-3 text-right">
                  <button 
                    className="text-neutral-500 text-xs hover:text-primary-color transition-colors"
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
          ))}
          
          {mode === 'teacher' && (
            <div 
              className="bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors"
              onClick={() => setView('newTopic')}
            >
              <div className="text-neutral-400 mb-3">
                <Plus size={32} />
              </div>
              <p className="text-neutral-500 font-medium">Add New Topic</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  function renderNewTopic() {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-primary-dark text-center font-poppins">Create New Foundation Maths Topic</h2>
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Topic Name</label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              autoFocus
              placeholder="Enter topic name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Choose Icon</label>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(topicIcons).map(([key, icon]) => (
                <div 
                  key={key}
                  onClick={() => setSelectedIcon(key)}
                  className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedIcon === key ? 'border-primary-color bg-primary-light' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <div className={selectedIcon === key ? 'text-primary-color' : 'text-neutral-600'}>
                    {icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* New topic image upload section */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Topic Image (optional)</label>
            <div className="flex flex-col items-center p-5 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
              <Image size={28} className="text-neutral-400 mb-3" />
              <p className="text-sm text-neutral-500 mb-4 text-center">Upload an image to visually represent this topic</p>
              
              <input
                type="file"
                accept="image/*"
                id="topic-image-upload"
                className="hidden"
                onChange={handleTopicImageUpload}
              />
              
              <label
                htmlFor="topic-image-upload"
                className="btn btn-primary px-4 py-2 rounded-lg"
              >
                Choose Image
              </label>
              
              {/* Preview the selected image */}
              {topicImageUrl && (
                <div className="mt-4 border rounded-lg p-3 w-full bg-white">
                  <p className="text-xs text-neutral-500 mb-2">Selected image:</p>
                  <img 
                    src={topicImageUrl} 
                    alt="Topic preview" 
                    className="mx-auto max-h-36 object-contain rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              className="btn btn-neutral px-5 py-2"
              onClick={() => {
                setView('topics');
                setTopicImageUrl(''); // Clear the image state
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary px-5 py-2"
              onClick={saveNewTopic}
            >
              Create Topic
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // New function to render edit topic view
  function renderEditTopic() {
    const topicToEdit = topics.find(t => t.title === newTopicName);
    
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-primary-dark text-center font-poppins">Edit Foundation Maths Topic</h2>
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Topic Name</label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              autoFocus
              placeholder="Enter topic name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Choose Icon</label>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(topicIcons).map(([key, icon]) => (
                <div 
                  key={key}
                  onClick={() => setSelectedIcon(key)}
                  className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedIcon === key ? 'border-primary-color bg-primary-light' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <div className={selectedIcon === key ? 'text-primary-color' : 'text-neutral-600'}>
                    {icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Topic image upload/edit section */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Topic Image (optional)</label>
            <div className="flex flex-col items-center p-5 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
              <Image size={28} className="text-neutral-400 mb-3" />
              <p className="text-sm text-neutral-500 mb-4 text-center">Upload an image to visually represent this topic</p>
              
              <input
                type="file"
                accept="image/*"
                id="topic-image-edit"
                className="hidden"
                onChange={handleTopicImageUpload}
              />
              
              <label
                htmlFor="topic-image-edit"
                className="btn btn-primary px-4 py-2 rounded-lg"
              >
                {topicImageUrl ? 'Change Image' : 'Choose Image'}
              </label>
              
              {/* Preview the selected image */}
              {topicImageUrl && (
                <div className="mt-4 border rounded-lg p-3 w-full bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-neutral-500">Current image:</p>
                    <button 
                      className="text-xs text-error-color hover:text-red-700 transition-colors"
                      onClick={() => setTopicImageUrl('')}
                    >
                      Remove
                    </button>
                  </div>
                  <img 
                    src={topicImageUrl} 
                    alt="Topic preview" 
                    className="mx-auto max-h-36 object-contain rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              className="btn btn-neutral px-5 py-2"
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
              className="btn btn-primary px-5 py-2"
              onClick={() => saveEditedTopic(topicToEdit.id)}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  function renderCards() {
    if (!currentTopic || !currentTopic.cards || currentTopic.cards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-neutral-500 mb-6 text-lg">No cards available for this topic.</div>
          {mode === 'teacher' && (
            <button 
              className="btn btn-primary px-6 py-3 rounded-lg"
              onClick={createNewCard}
            >
              Create First Card
            </button>
          )}
        </div>
      );
    }
    
    const card = currentTopic.cards[currentCardIndex];
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Stats and Timer */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex justify-between items-center">
          <div className="flex space-x-6">
            <div className="text-success-color font-medium flex items-center">
              <Check size={18} className="mr-1" /> {stats.correct}
            </div>
            <div className="text-error-color font-medium flex items-center">
              <X size={18} className="mr-1" /> {stats.incorrect}
            </div>
            <div className="text-neutral-500 font-medium flex items-center">
              <Recycle size={18} className="mr-1" /> {stats.skipped}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-neutral-700 font-mono bg-neutral-100 px-3 py-1 rounded-lg">{formatTime(timer)}</div>
            <button 
              className={`px-3 py-1 rounded-lg text-sm font-medium ${timerActive ? 'bg-error-color' : 'bg-success-color'} text-white`}
              onClick={toggleTimer}
            >
              {timerActive ? 'Pause' : 'Start'}
            </button>
            <button 
              className="px-3 py-1 bg-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-300 transition-colors"
              onClick={resetStats}
            >
              Reset
            </button>
          </div>
        </div>
        
        {/* Topic and Card Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button 
              className="mr-4 px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center transition-colors"
              onClick={goToTopics}
            >
              <ChevronRight size={16} className="transform rotate-180 mr-1" />
              Topics
            </button>
            <div className="text-primary-color mr-3">
              {topicIcons[currentTopic.icon]}
            </div>
            <h2 className="text-2xl font-bold font-poppins text-primary-dark">
              {currentTopic.title}
              {card.subtopic && card.subtopic !== 'General' && (
                <span className="ml-2 text-sm font-normal text-neutral-500">
                  {card.subtopic}
                </span>
              )}
            </h2>
          </div>
          <div className="text-sm font-medium bg-neutral-100 px-3 py-1 rounded-lg">
            Card {currentCardIndex + 1} of {currentTopic.cards.length}
          </div>
        </div>
        
        {/* Flashcard with flip animation */}
        <div className="h-96 w-full card-container mb-6">
          <div className={`card relative w-full h-full ${isFlipped ? 'flipped' : ''}`}>
            {/* Front of card (Question) */}
            <div className="card-front absolute w-full h-full bg-white rounded-xl shadow-md p-6 flex flex-col">
              <div className="text-neutral-500 text-sm mb-2 font-medium">Question:</div>
              <div className="mb-6 font-medium text-lg flex-grow font-outfit">{card.question}</div>
              
              {card.imageUrl && (
                <div className="my-4 flex justify-center">
                  <img 
                    src={card.imageUrl} 
                    alt="Question illustration" 
                    className="max-h-48 rounded-lg shadow-sm"
                  />
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="mt-auto">
                <div className="mb-5">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Your Answer:</label>
                  <div className="flex">
                    <input
                      ref={answerInputRef}
                      type="text"
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      className={`flex-grow p-3 border rounded-lg input-field ${
                        animateCorrect 
                          ? 'answer-correct border-success-color' 
                          : animateIncorrect
                          ? 'answer-incorrect border-error-color'
                          : answerStatus === 'correct' 
                          ? 'border-success-color bg-success-light' 
                          : answerStatus === 'incorrect'
                          ? 'border-error-color bg-error-light'
                          : 'border-neutral-300'
                      }`}
                      placeholder="Type your answer here"
                      disabled={answerStatus !== null}
                    />
                    {answerStatus === 'correct' && (
                      <div className="flex items-center justify-center w-12 bg-success-color text-white rounded-r-lg ml-[-8px]">
                        <Check size={20} />
                      </div>
                    )}
                    {answerStatus === 'incorrect' && (
                      <div className="flex items-center justify-center w-12 bg-error-color text-white rounded-r-lg ml-[-8px]">
                        <X size={20} />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  {answerStatus === null ? (
                    <>
                      <button 
                        type="submit"
                        className="flex-grow py-3 btn btn-primary rounded-lg font-medium"
                      >
                        Check Answer
                      </button>
                      {showHint ? (
                        <div className="flex-grow bg-warning-light p-4 rounded-lg border border-warning-color">
                          <div className="text-neutral-700">{card.hint}</div>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          className="flex-grow py-3 bg-warning-light text-neutral-700 rounded-lg hover:bg-warning-color hover:text-white transition-colors font-medium"
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
                        className="flex-grow py-3 btn btn-neutral rounded-lg font-medium"
                        onClick={resetCard}
                      >
                        Try Again
                      </button>
                      <button 
                        type="submit"
                        className="flex-grow py-3 btn btn-primary rounded-lg font-medium"
                      >
                        View Solution
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
            
            {/* Back of card (Answer) */}
            <div className="card-back absolute w-full h-full bg-primary-light rounded-xl shadow-md overflow-auto">
              <div className="p-6">
                <h3 className="font-bold mb-3 text-primary-dark">Answer:</h3>
                <div className="mb-5 text-lg font-medium font-outfit bg-white p-4 rounded-lg border border-primary-light">{card.answer}</div>
                
                {card.answerImageUrl && (
                  <div className="my-5 flex justify-center">
                    <img 
                      src={card.answerImageUrl} 
                      alt="Answer illustration" 
                      className="max-h-40 rounded-lg shadow-sm"
                    />
                  </div>
                )}
                
                {card.explanation && (
                  <div className="mt-6">
                    <h3 className="font-bold mb-3 text-primary-dark">Solution:</h3>
                    <div className="bg-white p-4 rounded-lg border border-primary-light whitespace-pre-line font-outfit">
                      {card.explanation}
                    </div>
                  </div>
                )}
                
                {card.videoUrl && (
                  <div className="mt-6">
                    <h3 className="font-bold mb-3 text-primary-dark">Video Explanation:</h3>
                    <a 
                      href={card.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary-color hover:underline block p-4 bg-white rounded-lg border border-primary-light"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                          </svg>
                        </div>
                        <span className="font-medium">Watch video explanation</span>
                      </div>
                    </a>
                  </div>
                )}
                
                <div className="mt-8 flex justify-center">
                  <button 
                    className="px-8 py-3 btn btn-primary rounded-lg font-medium"
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
        </div>
        
        {/* Navigation controls */}
        <div className="flex justify-between items-center mb-6">
          <button 
            className="px-4 py-2 btn btn-neutral rounded-lg disabled:opacity-50"
            onClick={prevCard}
            disabled={currentCardIndex === 0}
          >
            Previous
          </button>
          
          <div className="text-sm text-neutral-500 font-medium">
            {answerStatus === null ? "Enter your answer and check" : isFlipped ? "Review the solution" : "Check your answer then view solution"}
          </div>
          
          <button 
            className="px-4 py-2 btn btn-neutral rounded-lg"
            onClick={skipCard}
          >
            Skip
          </button>
        </div>
        
        {/* Teacher controls */}
        {mode === 'teacher' && (
          <div className="flex justify-center mt-6 space-x-4">
            <button 
              className="px-5 py-3 btn btn-primary rounded-lg flex items-center font-medium"
              onClick={createNewCard}
            >
              <Plus size={18} className="mr-2" />
              Add Card
            </button>
            {card && (
              <>
                <button 
                  className="px-5 py-3 bg-warning-color text-white rounded-lg hover:bg-yellow-500 transition-colors flex items-center font-medium"
                  onClick={() => editCard(card)}
                >
                  <PenLine size={18} className="mr-2" />
                  Edit Card
                </button>
                <button 
                  className="px-5 py-3 btn btn-error rounded-lg flex items-center font-medium"
                  onClick={() => deleteCard(card.id)}
                >
                  <X size={18} className="mr-2" />
                  Delete Card
                </button>
              </>
            )}
            <button 
              className="px-5 py-3 btn btn-success rounded-lg flex items-center font-medium"
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
  
  function renderSummary() {
    if (!summaryData) {
      prepareSummaryData();
      return (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <Loader2 size={40} className="text-primary-color animate-spin mb-4" />
          <div className="text-lg text-neutral-600">Preparing your summary...</div>
        </div>
      );
    }
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header section */}
          <div className="bg-gradient-to-r from-primary-color to-secondary-color text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-white mr-4 bg-white/20 p-3 rounded-full">
                  {topicIcons[summaryData.icon]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-poppins mb-1">{summaryData.topicName}</h2>
                  <div className="text-white/80">Performance Summary</div>
                </div>
              </div>
              <div className="bg-white text-primary-dark rounded-full w-20 h-20 flex items-center justify-center font-bold text-3xl border-4 border-white shadow-md font-poppins">
                {summaryData.grade.letter}
              </div>
            </div>
            
            {/* Display topic image if available */}
            {summaryData.imageUrl && (
              <div className="mt-6 flex justify-center">
                <img 
                  src={summaryData.imageUrl} 
                  alt={`${summaryData.topicName} visualization`} 
                  className="h-40 rounded-lg object-contain bg-white/10 p-2"
                />
              </div>
            )}
          </div>
          
          {/* Overall stats */}
          <div className="p-8 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-primary-light p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-primary-dark mb-2 font-poppins">
                  {summaryData.overallCorrectPercentage}%
                </div>
                <div className="text-sm text-neutral-600">Overall Score</div>
              </div>
              
              <div className="bg-success-light p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-success-color mb-2 font-poppins">
                  {summaryData.correct}
                </div>
                <div className="text-sm text-neutral-600">Correct Answers</div>
              </div>
              
              <div className="bg-error-light p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-error-color mb-2 font-poppins">
                  {summaryData.incorrect}
                </div>
                <div className="text-sm text-neutral-600">Incorrect Answers</div>
              </div>
              
              <div className="bg-neutral-100 p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-neutral-700 mb-2 font-mono">
                  {formatTime(summaryData.timeTaken)}
                </div>
                <div className="text-sm text-neutral-600">Time Taken</div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-xl font-bold mb-2 text-primary-dark font-poppins">{summaryData.grade.comment}</div>
              <p className="text-neutral-600">
                You attempted {summaryData.totalAttempted} out of {summaryData.totalCards} questions.
                {summaryData.skipped > 0 && ` You skipped ${summaryData.skipped} questions.`}
              </p>
            </div>
          </div>
          
          {/* Strengths and weaknesses */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths section */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center text-primary-dark font-poppins">
                <Award size={22} className="text-yellow-500 mr-2" /> Your Strengths
              </h3>
              
              {summaryData.strengths.length > 0 ? (
                <ul className="space-y-3">
                  {summaryData.strengths.map(subtopic => (
                    <li key={subtopic} className="bg-success-light p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{subtopic}</span>
                        <span className="text-success-color font-bold">
                          {summaryData.subtopicsAnalysis[subtopic].correctPercentage}% correct
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 mt-3">
                        <div 
                          className="bg-success-color h-2 rounded-full" 
                          style={{ width: `${summaryData.subtopicsAnalysis[subtopic].correctPercentage}%` }}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-neutral-500 italic p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  {summaryData.totalAttempted > 0 
                    ? "Keep practicing to develop your strengths." 
                    : "No questions attempted yet."}
                </div>
              )}
            </div>
            
            {/* Areas to improve */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center text-primary-dark font-poppins">
                <BookOpen size={22} className="text-primary-color mr-2" /> Areas to Improve
              </h3>
              
              {summaryData.weaknesses.length > 0 ? (
                <ul className="space-y-3">
                  {summaryData.weaknesses.map(subtopic => (
                    <li key={subtopic} className="bg-error-light p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{subtopic}</span>
                        <span className="text-error-color font-bold">
                          {summaryData.subtopicsAnalysis[subtopic].correctPercentage}% correct
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 mt-3">
                        <div 
                          className="bg-error-color h-2 rounded-full" 
                          style={{ width: `${summaryData.subtopicsAnalysis[subtopic].correctPercentage}%` }}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-neutral-500 italic p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  {summaryData.totalAttempted > 0 
                    ? "Great job! No significant weak areas identified." 
                    : "No questions attempted yet."}
                </div>
              )}
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="p-8 bg-neutral-50 border-t">
            <h3 className="text-lg font-bold mb-4 text-primary-dark font-poppins">Recommended Next Steps</h3>
            
            {summaryData.recommendedTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaryData.recommendedTopics.map(topic => (
                  <div 
                    key={topic.id}
                    className="topic-card bg-white rounded-xl shadow-sm p-5 border-l-4 border-primary-color cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      const fullTopic = topics.find(t => t.id === topic.id);
                      if (fullTopic) {
                        selectTopic(fullTopic);
                      }
                    }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="text-primary-color mr-3">
                        {topicIcons[topic.icon]}
                      </div>
                      <h4 className="font-semibold font-poppins">{topic.title}</h4>
                    </div>
                    <p className="text-sm text-neutral-600">{topic.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-neutral-500 italic p-4 bg-white rounded-xl border border-neutral-200">
                No specific recommendations at this time.
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="p-8 flex justify-between border-t">
            <button 
              className="px-6 py-3 btn btn-neutral rounded-lg font-medium"
              onClick={goToTopics}
            >
              Return to Topics
            </button>
            <button 
              className="px-6 py-3 btn btn-primary rounded-lg font-medium"
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
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-primary-dark text-center font-poppins">
          {editingCard.id ? 'Edit Card' : 'Create New Card'}
        </h2>
        
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Question</label>
            <textarea
              value={editingCard.question || ''}
              onChange={(e) => setEditingCard({...editingCard, question: e.target.value})}
              className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              rows={3}
              placeholder="Enter your question"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Subtopic/Category</label>
            <input
              type="text"
              value={editingCard.subtopic || 'General'}
              onChange={(e) => setEditingCard({...editingCard, subtopic: e.target.value})}
              className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              placeholder="e.g. Algebra, Fractions, Linear Equations"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Group similar questions together for better performance tracking
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Question Image (optional)</label>
            <div className="flex flex-col items-center p-4 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
              <Image size={24} className="text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-500 mb-3 text-center">Upload an image to illustrate the question</p>
              
              <input
                type="file"
                accept="image/*"
                id="question-image"
                className="hidden"
                onChange={(e) => handleImageUpload(e, true)}
              />
              
              <label
                htmlFor="question-image"
                className="btn btn-primary px-4 py-2 rounded-lg"
              >
                {editingCard.imageUrl ? 'Change Image' : 'Choose Image'}
              </label>
              
              {editingCard.imageUrl && (
                <div className="mt-4 border rounded-lg p-3 w-full bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-neutral-500">Image Preview:</p>
                    <button 
                      className="text-xs text-error-color hover:text-red-700"
                      onClick={() => setEditingCard({...editingCard, imageUrl: ''})}
                    >
                      Remove
                    </button>
                  </div>
                  <img src={editingCard.imageUrl} alt="Preview" className="max-h-32 mx-auto object-contain rounded-md" />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Hint (optional)</label>
            <textarea
              value={editingCard.hint || ''}
              onChange={(e) => setEditingCard({...editingCard, hint: e.target.value})}
              className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              rows={2}
              placeholder="Provide a hint to help solve the problem"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Answer</label>
            <textarea
              value={editingCard.answer || ''}
              onChange={(e) => setEditingCard({...editingCard, answer: e.target.value})}
              className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              rows={2}
              placeholder="The correct answer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
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
              className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              rows={2}
              placeholder="e.g. 4, x=4, x = 4"
            />
            <p className="text-xs text-neutral-500 mt-1">
              List alternative correct answers here. The main answer will be added automatically.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Answer Image (optional)</label>
            <div className="flex flex-col items-center p-4 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
              <Image size={24} className="text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-500 mb-3 text-center">Upload an image to illustrate the answer</p>
              
              <input
                type="file"
                accept="image/*"
                id="answer-image"
                className="hidden"
                onChange={(e) => handleImageUpload(e, false)}
              />
              
              <label
                htmlFor="answer-image"
                className="btn btn-primary px-4 py-2 rounded-lg"
              >
                {editingCard.answerImageUrl ? 'Change Image' : 'Choose Image'}
              </label>
              
              {editingCard.answerImageUrl && (
                <div className="mt-4 border rounded-lg p-3 w-full bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-neutral-500">Image Preview:</p>
                    <button 
                      className="text-xs text-error-color hover:text-red-700"
                      onClick={() => setEditingCard({...editingCard, answerImageUrl: ''})}
                    >
                      Remove
                    </button>
                  </div>
                  <img src={editingCard.answerImageUrl} alt="Preview" className="max-h-32 mx-auto object-contain rounded-md" />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Solution/Explanation (optional)</label>
            <textarea
              value={editingCard.explanation || ''}
              onChange={(e) => setEditingCard({...editingCard, explanation: e.target.value})}
              className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              rows={4}
              placeholder="Explain how to solve the problem step by step"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Video URL (optional)</label>
            <input
              type="text"
              value={editingCard.videoUrl || ''}
              onChange={(e) => setEditingCard({...editingCard, videoUrl: e.target.value})}
              className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
            />
          </div>
          
          <div className="flex justify-between pt-6">
            <button
              className="px-6 py-3 btn btn-neutral rounded-lg font-medium"
              onClick={() => {
                setEditingCard(null);
                setView('cards');
              }}
            >
              Cancel
            </button>
            
            <button
              className="px-6 py-3 btn btn-primary rounded-lg font-medium"
              onClick={saveCard}
            >
              Save Card
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  function renderLogin() {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-primary-color/10 rounded-full p-4 mb-4">
              <Calculator size={32} className="text-primary-color" />
            </div>
            <h2 className="text-2xl font-bold text-primary-dark font-poppins">Teacher Login</h2>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
            <input
              ref={passwordInputRef}
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
              placeholder="Enter teacher password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  login();
                }
              }}
            />
            {passwordError && (
              <p className="text-error-color text-sm mt-2">{passwordError}</p>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <button
              className="px-6 py-3 btn btn-neutral rounded-lg font-medium"
              onClick={() => setView('topics')}
            >
              Cancel
            </button>
            
            <button
              className="px-6 py-3 btn btn-primary rounded-lg font-medium"
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
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-primary-dark text-center font-poppins">
          Import Questions from Excel for "{currentTopic?.title}"
        </h2>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          {!sheetData ? (
            <div className="space-y-6">
              <div className="text-neutral-700">
                <p className="mb-4">Upload an Excel file (.xlsx, .xls) containing your questions and answers.</p>
                <p className="mb-2">Your spreadsheet should include:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>A header row with column names (e.g., "Question", "Answer", etc.)</li>
                  <li><strong>Required:</strong> Columns for questions and answers</li>
                  <li><strong>Optional:</strong> Columns for hints, explanations, acceptable alternative answers, subtopics, and video URLs</li>
                </ul>
              </div>
              
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center bg-neutral-50">
                <div className="text-neutral-500 mb-6">
                  <Upload size={40} className="mx-auto mb-3 text-primary-color" />
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
                  className="inline-block px-5 py-3 btn btn-primary rounded-lg font-medium"
                >
                  Select Excel File
                </label>
              </div>
              
              {importError && (
                <div className="p-4 bg-error-light border border-error-color text-error-color rounded-lg">
                  {importError}
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <button
                  className="px-5 py-3 btn btn-neutral rounded-lg font-medium"
                  onClick={() => setView('cards')}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center text-sm text-neutral-500 mb-2">
                  <FileSpreadsheet size={16} className="mr-2 text-primary-color" />
                  <span>{importFile.name}</span>
                </div>
                <p className="font-medium">Found {sheetData.rows.length} rows of data. Please map your columns below:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Question Column <span className="text-error-color">*</span>
                    </label>
                    <select
                      value={columnMappings.question}
                      onChange={(e) => setColumnMappings({...columnMappings, question: e.target.value})}
                      className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                      required
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Answer Column <span className="text-error-color">*</span>
                    </label>
                    <select
                      value={columnMappings.answer}
                      onChange={(e) => setColumnMappings({...columnMappings, answer: e.target.value})}
                      className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                      required
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Hint Column (optional)
                    </label>
                    <select
                      value={columnMappings.hint}
                      onChange={(e) => setColumnMappings({...columnMappings, hint: e.target.value})}
                      className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Subtopic/Category Column (optional)
                    </label>
                    <select
                      value={columnMappings.subtopic}
                      onChange={(e) => setColumnMappings({...columnMappings, subtopic: e.target.value})}
                      className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
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
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Explanation/Solution Column (optional)
                    </label>
                    <select
                      value={columnMappings.explanation}
                      onChange={(e) => setColumnMappings({...columnMappings, explanation: e.target.value})}
                      className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Acceptable Answers Column (optional)
                    </label>
                    <select
                      value={columnMappings.acceptableAnswers}
                      onChange={(e) => setColumnMappings({...columnMappings, acceptableAnswers: e.target.value})}
                      className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                    >
                      <option value="">Select column</option>
                      {sheetData.headers.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </select>
                    <p className="text-xs text-neutral-500 mt-1">
                      This can be a comma-separated list of alternate answers
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Video URL Column (optional)
                    </label>
                    <select
                      value={columnMappings.videoUrl}
                      onChange={(e) => setColumnMappings({...columnMappings, videoUrl: e.target.value})}
                      className="input-field w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
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
                <div className="mt-6 border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-neutral-50 p-4 border-b">
                    <h3 className="font-semibold text-primary-dark">Data Preview</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Question
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Answer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            {columnMappings.subtopic !== '' ? 'Subtopic' : 'Hint'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {sheetData.rows.slice(0, 3).map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                            <td className="px-4 py-3 text-sm whitespace-normal">
                              {columnMappings.question !== '' ? row[columnMappings.question] || 'N/A' : 'Not mapped'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {columnMappings.answer !== '' ? row[columnMappings.answer] || 'N/A' : 'Not mapped'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {columnMappings.subtopic !== '' 
                                ? (row[columnMappings.subtopic] || 'General') 
                                : (columnMappings.hint !== '' ? row[columnMappings.hint] || 'N/A' : 'Not mapped')}
                            </td>
                          </tr>
                        ))}
                        {sheetData.rows.length > 3 && (
                          <tr>
                            <td colSpan="3" className="px-4 py-3 text-sm text-neutral-500 text-center">
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
                <div className="p-4 bg-error-light border border-error-color text-error-color rounded-lg">
                  {importError}
                </div>
              )}
              
              <div className="flex justify-between pt-6">
                <button
                  className="px-5 py-3 btn btn-neutral rounded-lg font-medium"
                  onClick={cancelImport}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-3 btn btn-success rounded-lg font-medium flex items-center"
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
    );
  }