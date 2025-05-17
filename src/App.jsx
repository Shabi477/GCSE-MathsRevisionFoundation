import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Circle, Triangle, PenLine, Table, ChevronRight, Plus, Check, X, Upload, FileSpreadsheet, BarChart, Award, BookOpen, Image } from 'lucide-react';
import * as XLSX from 'xlsx';
import './MathsFlash.css';

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
  
  // Topic icons mapping
  const topicIcons = {
    calculator: <Calculator size={24} />,
    circle: <Circle size={24} />,
    triangle: <Triangle size={24} />,
    penLine: <PenLine size={24} />,
    table: <Table size={24} />
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
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 
              className="text-xl md:text-2xl font-bold cursor-pointer" 
              onClick={goToTopics}
            >
              MathsFlash
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {mode === 'teacher' && (
              <span className="bg-yellow-500 text-xs font-medium px-2 py-1 rounded-full">
                Teacher Mode
              </span>
            )}
            
            <button 
              className="p-2 rounded-full hover:bg-blue-700"
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
      <div className="p-4">
        <h2 className="text-2xl font-bold text-center mb-6">Foundation Maths Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(topic => (
            <div 
              key={topic.id} 
              className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => selectTopic(topic)}
            >
              {/* Display topic image if available */}
              {topic.imageUrl && (
                <div className="mb-3 flex justify-center">
                  <img 
                    src={topic.imageUrl} 
                    alt={`${topic.title} visualization`} 
                    className="h-32 rounded-md object-contain"
                  />
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-500">
                    {topicIcons[topic.icon]}
                  </div>
                  <h3 className="text-lg font-semibold">{topic.title}</h3>
                </div>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {topic.cards.length} cards
                  </span>
                  <ChevronRight size={16} className="ml-2 text-gray-400" />
                </div>
              </div>
              
              {/* Show previous performance if available */}
              {performanceData[topic.id] && 
               (performanceData[topic.id].correct > 0 || performanceData[topic.id].incorrect > 0) && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      Previous: {performanceData[topic.id].correct} correct, 
                      {performanceData[topic.id].incorrect} incorrect
                    </div>
                    <div className="flex items-center">
                      {performanceData[topic.id].correct + performanceData[topic.id].incorrect > 0 && (
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
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
                <div className="mt-2 text-right">
                  <button 
                    className="text-gray-500 text-xs hover:text-blue-500"
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
              className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setView('newTopic')}
            >
              <div className="text-gray-400 mb-2">
                <Plus size={24} />
              </div>
              <p className="text-gray-500">Add New Topic</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  function renderNewTopic() {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-6">Create New Foundation Maths Topic</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Choose Icon</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(topicIcons).map(([key, icon]) => (
                <div 
                  key={key}
                  onClick={() => setSelectedIcon(key)}
                  className={`flex items-center justify-center p-3 rounded-md cursor-pointer border-2 ${selectedIcon === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className={selectedIcon === key ? 'text-blue-500' : 'text-gray-600'}>
                    {icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* New topic image upload section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic Image (optional)</label>
            <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <Image size={24} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-3">Upload an image to visually represent this topic</p>
              
              <input
                type="file"
                accept="image/*"
                id="topic-image-upload"
                className="hidden"
                onChange={handleTopicImageUpload}
              />
              
              <label
                htmlFor="topic-image-upload"
                className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
              >
                Choose Image
              </label>
              
              {/* Preview the selected image */}
              {topicImageUrl && (
                <div className="mt-4 border rounded p-2 w-full">
                  <p className="text-xs text-gray-500 mb-2">Selected image:</p>
                  <img 
                    src={topicImageUrl} 
                    alt="Topic preview" 
                    className="mx-auto max-h-32 object-contain"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={() => {
                setView('topics');
                setTopicImageUrl(''); // Clear the image state
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-6">Edit Foundation Maths Topic</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Choose Icon</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(topicIcons).map(([key, icon]) => (
                <div 
                  key={key}
                  onClick={() => setSelectedIcon(key)}
                  className={`flex items-center justify-center p-3 rounded-md cursor-pointer border-2 ${selectedIcon === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className={selectedIcon === key ? 'text-blue-500' : 'text-gray-600'}>
                    {icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Topic image upload/edit section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic Image (optional)</label>
            <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <Image size={24} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-3">Upload an image to visually represent this topic</p>
              
              <input
                type="file"
                accept="image/*"
                id="topic-image-edit"
                className="hidden"
                onChange={handleTopicImageUpload}
              />
              
              <label
                htmlFor="topic-image-edit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
              >
                {topicImageUrl ? 'Change Image' : 'Choose Image'}
              </label>
              
              {/* Preview the selected image */}
              {topicImageUrl && (
                <div className="mt-4 border rounded p-2 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-500">Current image:</p>
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
                    className="mx-auto max-h-32 object-contain"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
          <div className="text-gray-500 mb-4">No cards available for this topic.</div>
          {mode === 'teacher' && (
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
      <div className="p-4">
        {/* Stats and Timer */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="text-green-600 font-medium">✓ {stats.correct}</div>
            <div className="text-red-600 font-medium">✗ {stats.incorrect}</div>
            <div className="text-gray-600 font-medium">⟳ {stats.skipped}</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-gray-700 font-mono">{formatTime(timer)}</div>
            <button 
              className={`px-2 py-1 rounded-md text-xs ${timerActive ? 'bg-red-500' : 'bg-green-500'} text-white`}
              onClick={toggleTimer}
            >
              {timerActive ? 'Pause' : 'Start'}
            </button>
            <button 
              className="px-2 py-1 bg-gray-200 rounded-md text-xs"
              onClick={resetStats}
            >
              Reset
            </button>
          </div>
        </div>
        
        {/* Topic and Card Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <button 
              className="mr-3 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded flex items-center"
              onClick={goToTopics}
            >
              <ChevronRight size={14} className="transform rotate-180 mr-1" />
              Topics
            </button>
            <div className="text-blue-500 mr-2">
              {topicIcons[currentTopic.icon]}
            </div>
            <h2 className="text-xl font-bold">
              {currentTopic.title}
              {card.subtopic && card.subtopic !== 'General' && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {card.subtopic}
                </span>
              )}
            </h2>
          </div>
          <div className="text-sm">
            Card {currentCardIndex + 1} of {currentTopic.cards.length}
          </div>
        </div>
        
        {/* Flashcard with flip animation */}
        <div className="h-96 w-full perspective-1000 mb-4">
          <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front of card (Question) */}
            <div className="absolute w-full h-full bg-white rounded-lg shadow-lg backface-hidden">
              <div className="p-6 flex flex-col h-full">
                <div className="text-gray-500 text-sm mb-2">Question:</div>
                <div className="mb-4 font-medium text-lg flex-grow">{card.question}</div>
                
                {card.imageUrl && (
                  <div className="my-4 flex justify-center">
                    <img 
                      src={card.imageUrl} 
                      alt="Question illustration" 
                      className="max-h-48 rounded-md"
                    />
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="mt-auto">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer:</label>
                    <div className="flex">
                      <input
                        ref={answerInputRef}
                        type="text"
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        className={`flex-grow p-2 border rounded-l-md ${
                          answerStatus === 'correct' 
                            ? 'border-green-500 bg-green-50' 
                            : answerStatus === 'incorrect'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        placeholder="Type your answer here"
                        disabled={answerStatus !== null}
                      />
                      {answerStatus === 'correct' && (
                        <div className="flex items-center justify-center w-10 bg-green-500 text-white rounded-r-md">
                          <Check size={20} />
                        </div>
                      )}
                      {answerStatus === 'incorrect' && (
                        <div className="flex items-center justify-center w-10 bg-red-500 text-white rounded-r-md">
                          <X size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {answerStatus === null ? (
                      <>
                        <button 
                          type="submit"
                          className="flex-grow py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Check Answer
                        </button>
                        {showHint ? (
                          <div className="flex-grow bg-yellow-50 p-3 rounded-md border border-yellow-100">
                            <div className="text-sm text-gray-700">{card.hint}</div>
                          </div>
                        ) : (
                          <button 
                            type="button"
                            className="flex-grow py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
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
                          className="flex-grow py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                          onClick={resetCard}
                        >
                          Try Again
                        </button>
                        <button 
                          type="submit"
                          className="flex-grow py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          View Solution
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
            
            {/* Back of card (Answer) */}
            <div className="absolute w-full h-full bg-blue-50 rounded-lg shadow-lg backface-hidden rotate-y-180 overflow-auto">
              <div className="p-6">
                <h3 className="font-semibold mb-2">Answer:</h3>
                <div className="mb-4 font-medium">{card.answer}</div>
                
                {card.answerImageUrl && (
                  <div className="my-4 flex justify-center">
                    <img 
                      src={card.answerImageUrl} 
                      alt="Answer illustration" 
                      className="max-h-40 rounded-md"
                    />
                  </div>
                )}
                
                {card.explanation && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Solution:</h3>
                    <div className="bg-white p-3 rounded-md border border-gray-200 whitespace-pre-line">
                      {card.explanation}
                    </div>
                  </div>
                )}
                
                {card.videoUrl && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Video Explanation:</h3>
                    <a 
                      href={card.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline block p-3 bg-white rounded-md border border-gray-200"
                    >
                      <div className="flex items-center">
                        <div className="mr-2 text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                          </svg>
                        </div>
                        <span>Watch video explanation</span>
                      </div>
                    </a>
                  </div>
                )}
                
                <div className="mt-6 flex justify-center">
                  <button 
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
        <div className="flex justify-between items-center">
          <button 
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
            onClick={prevCard}
            disabled={currentCardIndex === 0}
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            {answerStatus === null ? "Enter your answer and check" : isFlipped ? "Review the solution" : "Check your answer then view solution"}
          </div>
          
          <button 
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md"
            onClick={skipCard}
          >
            Skip
          </button>
        </div>
        
        {/* Teacher controls */}
        {mode === 'teacher' && (
          <div className="flex justify-center mt-4 space-x-4">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={createNewCard}
            >
              Add Card
            </button>
            {card && (
              <>
                <button 
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md"
                  onClick={() => editCard(card)}
                >
                  Edit Card
                </button>
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                  onClick={() => deleteCard(card.id)}
                >
                  Delete Card
                </button>
              </>
            )}
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center"
              onClick={() => setView('import')}
            >
              <FileSpreadsheet size={18} className="mr-1" />
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
      return <div className="p-4 text-center">Preparing your summary...</div>;
    }
    
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header section */}
          <div className="bg-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-white mr-3">
                  {topicIcons[summaryData.icon]}
                </div>
                <h2 className="text-2xl font-bold">{summaryData.topicName} - Performance Summary</h2>
              </div>
              <div className="bg-white text-blue-800 rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl border-4 border-white">
                {summaryData.grade.letter}
              </div>
            </div>
          </div>
          
          {/* Overall stats */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {summaryData.overallCorrectPercentage}%
                </div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {summaryData.correct}
                </div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {summaryData.incorrect}
                </div>
                <div className="text-sm text-gray-500">Incorrect Answers</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-600 mb-1">
                  {formatTime(summaryData.timeTaken)}
                </div>
                <div className="text-sm text-gray-500">Time Taken</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className="text-lg font-bold mb-2">{summaryData.grade.comment}</div>
              <p className="text-gray-600">
                You attempted {summaryData.totalAttempted} out of {summaryData.totalCards} questions.
                {summaryData.skipped > 0 && ` You skipped ${summaryData.skipped} questions.`}
              </p>
            </div>
          </div>
          
          {/* Strengths and weaknesses */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths section */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <Award size={20} className="text-yellow-500 mr-2" /> Your Strengths
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
  }
  
  function renderCardEditor() {
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
  }
  
  function renderLogin() {
    return (
      <div className="flex items-center justify-center min-h-64 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-xl font-bold">Teacher Login</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              ref={passwordInputRef}
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter teacher password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  login();
                }
              }}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              onClick={() => setView('topics')}
            >
              Cancel
            </button>
            
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
  
  // Main render
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
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

export default App;Question", "Answer", etc.)</li>
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
  }
  
  // Main render
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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