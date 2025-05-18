import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator, Circle, Triangle, PenLine, Table, ChevronRight, Plus,
  Check, X, Upload, FileSpreadsheet, Award, BookOpen, Image, ChevronLeft,
  Sparkles, Brain, BookOpenCheck, RefreshCw, FileCheck, Star, BookMarked
} from 'lucide-react';
import * as XLSX from 'xlsx';
import './MathsFlash.css';

// Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-bold mb-2 dark:text-gray-200">{title}</h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// CircularProgress component
function CircularProgress({ percentage, size = 36, strokeWidth = 3, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
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

function MathsFlashApp() {
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
  const [topicImageUrl, setTopicImageUrl] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [answerStatus, setAnswerStatus] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [performanceData, setPerformanceData] = useState({});
  const [summaryData, setSummaryData] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [columnMappings, setColumnMappings] = useState({
    question: '',
    answer: '',
    hint: '',
    explanation: '',
    acceptableAnswers: '',
    videoUrl: '',
    subtopic: ''
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });

  const passwordInputRef = useRef(null);
  const answerInputRef = useRef(null);

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

  const [topics, setTopics] = useState([
    {
      id: 1,
      title: 'Algebra',
      icon: 'calculator',
      imageUrl: '',
      cards: [
        {
          id: 1,
          question: 'Solve for x: 2x + 5 = 13',
          hint: 'Subtract 5 from both sides, then divide.',
          answer: 'x = 4',
          acceptableAnswers: ['4', 'x=4', 'x = 4'],
          explanation:
            'Starting with 2x + 5 = 13\nSubtract 5 from both sides: 2x = 8\nDivide both sides by 2: x = 4',
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
          acceptableAnswers: ['(x+3)(x-3)', '(x-3)(x+3)'],
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
      imageUrl: '',
      cards: [
        {
          id: 1,
          question: 'Find the area of a circle with radius r = 5 cm',
          hint: 'Use the formula A = πr²',
          answer: 'A = 25π ≈ 78.54 cm²',
          acceptableAnswers: ['25π', '78.54'],
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
      imageUrl: '',
      cards: [
        {
          id: 1,
          question: "What is Newton's Second Law of Motion?",
          hint: 'It relates force, mass, and acceleration.',
          answer: 'F = ma',
          acceptableAnswers: ['F = ma'],
          explanation:
            'Force equals mass times acceleration. The force acting on an object is equal to the mass of that object times its acceleration.',
          videoUrl: '',
          imageUrl: '',
          answerImageUrl: '',
          subtopic: "Newton's Laws"
        }
      ]
    }
  ]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `/* full CSS from your original code... */`;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
      topic.cards.forEach(card => {
        const subtopic = card.subtopic || 'General';
        initialPerformanceData[topic.id].subtopics[subtopic] =
          initialPerformanceData[topic.id].subtopics[subtopic] || { correct: 0, incorrect: 0, skipped: 0, total: 0 };
        initialPerformanceData[topic.id].subtopics[subtopic].total += 1;
      });
    });
    setPerformanceData(initialPerformanceData);
  }, [topics]);

  useEffect(() => {
    if (view === 'login' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [view]);

  useEffect(() => {
    if (answerInputRef.current && !isFlipped && answerStatus === null) {
      answerInputRef.current.focus();
    }
  }, [currentCardIndex, isFlipped, answerStatus]);

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

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function handleImageUpload(event, isQuestion) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      if (isQuestion) setEditingCard({ ...editingCard, imageUrl: e.target.result });
      else setEditingCard({ ...editingCard, answerImageUrl: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  function handleTopicImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setTopicImageUrl(e.target.result);
    reader.readAsDataURL(file);
  }

  function editTopic(topic) {
    setNewTopicName(topic.title);
    setSelectedIcon(topic.icon);
    setTopicImageUrl(topic.imageUrl || '');
    setView('editTopic');
  }

  function saveEditedTopic(topicId) {
    if (!newTopicName.trim()) {
      alert('Please enter a topic name');
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

  function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonData.length < 2) {
          setImportError('Spreadsheet must contain at least a header row and one data row');
          return;
        }
        const headers = jsonData[0];
        setSheetData({ headers, rows: jsonData.slice(1) });
        const mapping = { ...columnMappings };
        headers.forEach((header, index) => {
          const h = String(header).toLowerCase();
          if (h.includes('question')) mapping.question = index;
          else if (h.includes('answer') && !h.includes('acceptable')) mapping.answer = index;
          else if (h.includes('hint')) mapping.hint = index;
          else if (h.includes('explanation') || h.includes('solution')) mapping.explanation = index;
          else if (h.includes('acceptable') || h.includes('alt')) mapping.acceptableAnswers = index;
          else if (h.includes('video') || h.includes('url')) mapping.videoUrl = index;
          else if (h.includes('subtopic') || h.includes('category')) mapping.subtopic = index;
        });
        setColumnMappings(mapping);
        setImportError('');
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setImportError('Invalid Excel file format. Please check your file and try again.');
      }
    };
    reader.onerror = () => setImportError('Error reading the file. Please try again.');
    reader.readAsArrayBuffer(file);
  }

  function importCards() {
    if (!currentTopic || !sheetData) return;
    if (columnMappings.question === '' || columnMappings.answer === '') {
      setImportError('Question and Answer column mappings are required');
      return;
    }
    try {
      const newCards = [];
      let importErrors = 0;
      sheetData.rows.forEach((row, index) => {
        if (row.length === 0 || !row[columnMappings.question]) return;
        const question = row[columnMappings.question] || '';
        const answer = row[columnMappings.answer] || '';
        if (!question.trim() || !answer.trim()) {
          importErrors++;
          return;
        }
        const hint = columnMappings.hint !== '' ? row[columnMappings.hint] || '' : '';
        const explanation = columnMappings.explanation !== '' ? row[columnMappings.explanation] || '' : '';
        const videoUrl = columnMappings.videoUrl !== '' ? row[columnMappings.videoUrl] || '' : '';
        const subtopic = columnMappings.subtopic !== '' ? row[columnMappings.subtopic] || 'General' : 'General';
        let acceptable = [answer];
        if (columnMappings.acceptableAnswers !== '' && row[columnMappings.acceptableAnswers]) {
          const alt = row[columnMappings.acceptableAnswers]
            .toString()
            .split(',')
            .map(a => a.trim());
          acceptable = [...acceptable, ...alt.filter(a => a && a !== answer)];
        }
        const newCard = {
          id: Date.now() + index,
          question,
          answer,
          hint,
          explanation,
          videoUrl,
          acceptableAnswers: acceptable,
          imageUrl: '',
          answerImageUrl: '',
          subtopic
        };
        newCards.push(newCard);
        setImportProgress(Math.round(((index + 1) / sheetData.rows.length) * 100));
      });
      if (newCards.length === 0) {
        setImportError('No valid cards could be imported. Please check your data and mappings.');
        return;
      }
      const updated = [...topics];
      const idx = updated.findIndex(t => t.id === currentTopic.id);
      if (idx > -1) {
        updated[idx].cards = [...updated[idx].cards, ...newCards];
        setTopics(updated);
        setCurrentTopic(updated[idx]);
        // update performanceData
        setSheetData(null);
        setImportFile(null);
        setView('cards');
        alert(`Successfully imported ${newCards.length} cards` +
          (importErrors > 0 ? ` (${importErrors} rows skipped)` : ''));
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

  function login() {
    if (passwordInput === password) {
      setMode('teacher');
      setPasswordInput('');
      setPasswordError('');
      setView('topics');
    } else setPasswordError('Incorrect password');
  }

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
    setStats({ correct: 0, incorrect: 0, skipped: 0 });
    setTimer(0);
    setTimerActive(true);
  }

  function nextCard() {
    if (currentTopic && currentCardIndex < currentTopic.cards.length - 1)
      setCurrentCardIndex(currentCardIndex + 1), setIsFlipped(false), setShowHint(false), setStudentAnswer(''), setAnswerStatus(null);
    else if (currentTopic) {
      prepareSummaryData();
      setView('summary');
      setTimerActive(false);
    }
  }

  function prevCard() {
    if (currentCardIndex > 0)
      setCurrentCardIndex(currentCardIndex - 1), setIsFlipped(false), setShowHint(false), setStudentAnswer(''), setAnswerStatus(null);
  }

  function updatePerformance(result, card) {
    if (!currentTopic) return;
    const topicId = currentTopic.id;
    const sub = card.subtopic || 'General';
    const pd = { ...performanceData };
    if (!pd[topicId]) pd[topicId] = { topicName: currentTopic.title, icon: currentTopic.icon, correct:0, incorrect:0, skipped:0, total:currentTopic.cards.length, subtopics: {} };
    if (!pd[topicId].subtopics[sub]) pd[topicId].subtopics[sub] = { correct:0, incorrect:0, skipped:0, total:0 };
    pd[topicId][result]++;
    pd[topicId].subtopics[sub][result]++;
    setPerformanceData(pd);
  }

  function prepareSummaryData() {
    if (!currentTopic) return;
    const data = performanceData[currentTopic.id];
    const subs = {};
    Object.keys(data.subtopics).forEach(s => {
      const d = data.subtopics[s];
      const att = d.correct + d.incorrect;
      const pct = att > 0 ? Math.round((d.correct / att) * 100) : 0;
      subs[s] = { ...d, attempted:att, correctPercentage:pct, needsWork:pct<70 && att>0 };
    });
    const strengths = Object.keys(subs).filter(s=>subs[s].correctPercentage>=85&&subs[s].attempted>0);
    const weaknesses=Object.keys(subs).filter(s=>subs[s].needsWork);
    const totalAtt=data.correction + data.incorrect;
    const overall=totalAtt>0?Math.round((data.correct/totalAtt)*100):0;
    const rec=[];
    if(weaknesses.length)rec.push({id:currentTopic.id,title:currentTopic.title,icon:currentTopic.icon,reason:`Practice ${weaknesses[0]}`});
    topics.forEach(t=>{const p=performanceData[t.id]||{correct:0,incorrect:0};if(t.id!==currentTopic.id&&(p.correct+p.incorrect===0))rec.push({id:t.id,title:t.title,icon:t.icon,reason:'You haven\'t tried this topic'});});
    setSummaryData({topicName:currentTopic.title,icon:currentTopic.icon,totalCards:currentTopic.cards.length,totalAttempted:data.correct+data.incorrect,correct:data.correct,incorrect:data.incorrect,skipped:data.skipped,overallCorrectPercentage:overall,timeTaken:timer,subtopicsAnalysis:subs,strengths,weaknesses,recommendedTopics:rec,grade:getGrade(overall)});
  }

  function getGrade(p) {
    if (p>=90) return {letter:'A',comment:'Excellent!'};
    if (p>=80) return {letter:'B',comment:'Very Good!'};
    if (p>=70) return {letter:'C',comment:'Good'};
    if (p>=60) return {letter:'D',comment:'Satisfactory'};
    return {letter:'F',comment:'Needs Improvement'};
  }

  function saveNewTopic() { /* same logic as above */ }
  function createNewCard() { /* same logic as above */ }
  function editCard(card) { /* same logic */ }
  function saveCard() { /* same logic */ }
  function deleteCard(cardId) { /* confirmation + logic */ }
  function toggleHint() { setShowHint(!showHint); }
  function toggleFlip() { setIsFlipped(!isFlipped); }
  function checkAnswer() { /* logic */ }
  function handleSubmit(e) { e.preventDefault(); if(answerStatus===null) checkAnswer(); else toggleFlip(); }
  function resetCard() { /* logic */ }
  function skipCard() { /* logic */ }
  function resetStats() { setStats({correct:0,incorrect:0,skipped:0}); setTimer(0); }
  function toggleTimer() { setTimerActive(!timerActive); }

  // Render functions from your original code:
  // renderHeader, renderTopics, renderNewTopic, renderEditTopic, renderImport,
  // renderLogin, renderCardEditor, renderCards, renderSummary

  return (
    <div className={`min-h-screen ${isDarkMode?'dark-mode bg-gray-900':'bg-gray-50'} flex flex-col`}>
      {renderHeader()}
      <main className="flex-1">
        {view==='topics'&&renderTopics()}
        {view==='cards'&&renderCards()}
        {view==='login'&&renderLogin()}
        {view==='edit'&&renderCardEditor()}
        {view==='newTopic'&&renderNewTopic()}
        {view==='editTopic'&&renderEditTopic()}
        {view==='import'&&renderImport()}
        {view==='summary'&&renderSummary()}
      </main>
      <footer className={`py-4 ${isDarkMode?'bg-gray-800 text-gray-400':'bg-gray-100 text-gray-600'} text-center text-sm`}>
        <p>MathsFlash &copy; {new Date().getFullYear()}</p>
      </footer>
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

export default App;
