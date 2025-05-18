// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator, Circle, Triangle, PenLine, Table,
  ChevronRight, Plus, Check, X, Upload, FileSpreadsheet,
  Award, BookOpen, Image, ChevronLeft, Sparkles, Brain,
  BookOpenCheck, RefreshCw, FileCheck, Star, BookMarked
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

// Circular progress component
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
        className="progress-ring transition-transform duration-500"
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
  const [topicImageUrl, setTopicImageUrl] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [answerStatus, setAnswerStatus] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Performance tracking state
  const [performanceData, setPerformanceData] = useState({});
  const [summaryData, setSummaryData] = useState(null);

  // Excel import state
  const [importFile, setImportFile] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [columnMappings, setColumnMappings] = useState({
    question: '', answer: '', hint: '', explanation: '',
    acceptableAnswers: '', videoUrl: '', subtopic: ''
  });
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState('');

  // Timer state
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Stats state
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });

  // Refs
  const passwordInputRef = useRef(null);
  const answerInputRef   = useRef(null);

  // Topic icons mapping
  const topicIcons = {
    calculator:    <Calculator    size={24} />,
    circle:        <Circle        size={24} />,
    triangle:      <Triangle      size={24} />,
    penLine:       <PenLine       size={24} />,
    table:         <Table         size={24} />,
    sparkles:      <Sparkles      size={24} />,
    brain:         <Brain         size={24} />,
    bookOpenCheck: <BookOpenCheck size={24} />,
    star:          <Star          size={24} />,
    bookMarked:    <BookMarked    size={24} />
  };

  // Topics and cards
  const [topics, setTopics] = useState([
    {
      id: 1, title: 'Algebra', icon: 'calculator', imageUrl: '', cards: [
        {
          id: 1,
          question: 'Solve for x: 2x + 5 = 13',
          hint: 'Subtract 5 from both sides, then divide.',
          answer: 'x = 4',
          acceptableAnswers: ['4', 'x=4'],
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
      id: 2, title: 'Geometry', icon: 'circle', imageUrl: '', cards: [
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
      id: 3, title: 'Physics', icon: 'brain', imageUrl: '', cards: [
        {
          id: 1,
          question: "What is Newton's Second Law of Motion?",
          hint: 'It relates force, mass, and acceleration.',
          answer: 'F = ma',
          acceptableAnswers: ['F = ma', 'F=ma'],
          explanation: 'Force equals mass times acceleration.',
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

  // Effects

  // Initialize performance data when topics change
  useEffect(() => {
    const initial = {};
    topics.forEach(topic => {
      initial[topic.id] = {
        topicName: topic.title,
        icon: topic.icon,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: topic.cards.length,
        subtopics: {}
      };
      topic.cards.forEach(card => {
        const sub = card.subtopic || 'General';
        if (!initial[topic.id].subtopics[sub]) {
          initial[topic.id].subtopics[sub] = { correct: 0, incorrect: 0, skipped: 0, total: 0 };
        }
        initial[topic.id].subtopics[sub].total++;
      });
    });
    setPerformanceData(initial);
  }, [topics]);

  // Focus password input on login view
  useEffect(() => {
    if (view === 'login' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [view]);

  // Focus answer input on new card
  useEffect(() => {
    if (answerInputRef.current && !isFlipped && answerStatus === null) {
      answerInputRef.current.focus();
    }
  }, [currentCardIndex, isFlipped, answerStatus]);

  // Timer effect
  useEffect(() => {
    let iv = null;
    if (timerActive) {
      iv = setInterval(() => {
        setTimer(s => s + 1);
      }, 1000);
    }
    return () => {
      if (iv) clearInterval(iv);
    };
  }, [timerActive]);

  // Format time mm:ss
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60), s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // File upload handlers
  function handleImageUpload(e, isQuestion) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      if (isQuestion) {
        setEditingCard(c => ({ ...c, imageUrl: evt.target.result }));
      } else {
        setEditingCard(c => ({ ...c, answerImageUrl: evt.target.result }));
      }
    };
    reader.readAsDataURL(file);
  }
  function handleTopicImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => setTopicImageUrl(evt.target.result);
    reader.readAsDataURL(file);
  }

  // Edit/save topic
  function editTopic(topic) {
    setNewTopicName(topic.title);
    setSelectedIcon(topic.icon);
    setTopicImageUrl(topic.imageUrl||'');
    setView('editTopic');
  }
  function saveEditedTopic(topicId) {
    if (!newTopicName.trim()) { alert('Please enter a topic name'); return; }
    setTopics(ts => ts.map(t =>
      t.id===topicId
        ? { ...t, title: newTopicName, icon: selectedIcon, imageUrl: topicImageUrl }
        : t
    ));
    setNewTopicName('');
    setSelectedIcon('calculator');
    setTopicImageUrl('');
    setView('topics');
  }

  // Excel import
  function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (json.length<2) {
          setImportError('Spreadsheet must contain at least a header row and one data row');
          return;
        }
        const headers = json[0];
        setSheetData({ headers, rows: json.slice(1) });
        // auto-mapping
        const mapping = { ...columnMappings };
        headers.forEach((h,i) => {
          const hl = String(h).toLowerCase();
          if (hl.includes('question')) mapping.question = i;
          else if (hl.includes('answer') && !hl.includes('acceptable')) mapping.answer = i;
          else if (hl.includes('hint')) mapping.hint = i;
          else if (hl.includes('explanation')||hl.includes('solution')) mapping.explanation = i;
          else if (hl.includes('acceptable')||hl.includes('alt')) mapping.acceptableAnswers = i;
          else if (hl.includes('video')||hl.includes('url')) mapping.videoUrl = i;
          else if (hl.includes('subtopic')||hl.includes('category')) mapping.subtopic = i;
        });
        setColumnMappings(mapping);
        setImportError('');
      } catch {
        setImportError('Invalid Excel file format. Please check and try again.');
      }
    };
    reader.onerror = () => setImportError('Error reading the file. Please try again.');
    reader.readAsArrayBuffer(file);
  }
  function importCards() {
    if (!currentTopic || !sheetData) return;
    if (columnMappings.question===''||columnMappings.answer==='') {
      setImportError('Question and Answer column mappings are required');
      return;
    }
    try {
      const newCards = []; let errs = 0;
      sheetData.rows.forEach((row,i) => {
        if (!row[columnMappings.question]||!row[columnMappings.answer]) { errs++; return; }
        const question = row[columnMappings.question], answer=row[columnMappings.answer];
        let hint = columnMappings.hint!==''?row[columnMappings.hint]||'':'';
        let explanation = columnMappings.explanation!==''?row[columnMappings.explanation]||'':'';
        let videoUrl = columnMappings.videoUrl!==''?row[columnMappings.videoUrl]||'':'';
        let subtopic = columnMappings.subtopic!==''?row[columnMappings.subtopic]||'General':'General';
        let acceptableAnswers = [answer];
        if (columnMappings.acceptableAnswers!=='' && row[columnMappings.acceptableAnswers]) {
          const alt = String(row[columnMappings.acceptableAnswers]).split(',').map(a=>a.trim());
          acceptableAnswers.push(...alt.filter(a=>a&&a!==answer));
        }
        newCards.push({
          id: Date.now()+i,
          question, answer, hint, explanation, videoUrl,
          acceptableAnswers, imageUrl:'', answerImageUrl:'', subtopic
        });
        setImportProgress(Math.round(((i+1)/sheetData.rows.length)*100));
      });
      if (newCards.length===0) {
        setImportError('No valid cards imported; check your data and mappings.');
        return;
      }
      setTopics(ts => {
        const idx = ts.findIndex(t=>t.id===currentTopic.id);
        if (idx===-1) return ts;
        ts[idx].cards.push(...newCards);
        return [...ts];
      });
      setCurrentTopic(ts => ({
        ...ts.find(t=>t.id===currentTopic.id)
      }));
      // update performanceData subtopic totals
      setSheetData(null);
      setImportFile(null);
      setView('cards');
      alert(`Successfully imported ${newCards.length} cards${errs>0?` (${errs} skipped)`:''}`);
    } catch {
      setImportError('An error occurred during import. Please try again.');
    }
  }
  function cancelImport() {
    setSheetData(null);
    setImportFile(null);
    setImportError('');
    setView('cards');
  }

  // Login
  function login() {
    if (passwordInput===password) {
      setMode('teacher');
      setPasswordInput(''); setPasswordError('');
      setView('topics');
    } else {
      setPasswordError('Incorrect password');
    }
  }

  // Navigation
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
    setStats({ correct:0, incorrect:0, skipped:0 });
    setTimer(0); setTimerActive(true);
  }
  function nextCard() {
    if (currentCardIndex < currentTopic.cards.length - 1) {
      setCurrentCardIndex(i=>i+1);
      setIsFlipped(false); setShowHint(false);
      setStudentAnswer(''); setAnswerStatus(null);
    } else {
      prepareSummaryData();
      setView('summary');
      setTimerActive(false);
    }
  }
  function prevCard() {
    if (currentCardIndex>0) {
      setCurrentCardIndex(i=>i-1);
      setIsFlipped(false); setShowHint(false);
      setStudentAnswer(''); setAnswerStatus(null);
    }
  }

  // Performance tracking
  function updatePerformance(result, card) {
    if (!currentTopic) return;
    setPerformanceData(pd => {
      const data = { ...pd };
      const tid = currentTopic.id;
      const sub = card.subtopic||'General';
      if (!data[tid]) data[tid] = { topicName:currentTopic.title,icon:currentTopic.icon,correct:0,incorrect:0,skipped:0,total:currentTopic.cards.length,subtopics:{} };
      if (!data[tid].subtopics[sub]) data[tid].subtopics[sub]={correct:0,incorrect:0,skipped:0,total:0};
      if (result==='correct')      { data[tid].correct++; data[tid].subtopics[sub].correct++; }
      else if (result==='incorrect'){ data[tid].incorrect++; data[tid].subtopics[sub].incorrect++; }
      else                          { data[tid].skipped++; data[tid].subtopics[sub].skipped++; }
      return data;
    });
  }

  function prepareSummaryData() {
    if (!currentTopic) return;
    const td = performanceData[currentTopic.id];
    if (!td) return;
    const subs = {}, keys = Object.keys(td.subtopics);
    keys.forEach(k => {
      const d = td.subtopics[k];
      const attempted = d.correct + d.incorrect;
      const pct = attempted>0 ? Math.round((d.correct/attempted)*100) : 0;
      subs[k] = { ...d, attempted, correctPercentage:pct, needsWork:pct<70&&attempted>0 };
    });
    const strengths = keys.filter(k=>subs[k].correctPercentage>=85&&subs[k].attempted>0)
      .sort((a,b)=>subs[b].correctPercentage-subs[a].correctPercentage);
    const weaknesses = keys.filter(k=>subs[k].needsWork)
      .sort((a,b)=>subs[a].correctPercentage-subs[b].correctPercentage);
    const totalAttempted = td.correct + td.incorrect;
    const overallCorrectPercentage = totalAttempted>0 ? Math.round((td.correct/totalAttempted)*100) : 0;
    const recommended = [];
    if (weaknesses.length>0) {
      recommended.push({
        id: currentTopic.id,
        title: currentTopic.title,
        icon: currentTopic.icon,
        reason: `Practice ${weaknesses[0]} and other areas that need improvement`
      });
    }
    topics.forEach(t => {
      const perf = performanceData[t.id];
      if (t.id!==currentTopic.id && (!perf||perf.correct+perf.incorrect===0)) {
        recommended.push({ id:t.id, title:t.title, icon:t.icon, reason:"You haven't tried this topic yet" });
      }
    });
    const summary = {
      topicName: currentTopic.title, icon: currentTopic.icon,
      totalCards: currentTopic.cards.length,
      totalAttempted, correct:td.correct, incorrect:td.incorrect, skipped:td.skipped,
      overallCorrectPercentage, timeTaken: timer,
      subtopicsAnalysis: subs, strengths, weaknesses,
      recommendedTopics: recommended,
      grade: getGrade(overallCorrectPercentage)
    };
    setSummaryData(summary);
  }
  function getGrade(pct) {
    if (pct>=90) return { letter:'A', comment:'Excellent!' };
    if (pct>=80) return { letter:'B', comment:'Very Good!' };
    if (pct>=70) return { letter:'C', comment:'Good' };
    if (pct>=60) return { letter:'D', comment:'Satisfactory' };
    return { letter:'F', comment:'Needs Improvement' };
  }

  // Topic management
  function saveNewTopic() {
    if (!newTopicName.trim()) { alert("Please enter a topic name"); return; }
    const newTopic = { id:Date.now(), title:newTopicName, icon:selectedIcon, imageUrl:topicImageUrl, cards:[] };
    setTopics(ts=>[...ts,newTopic]);
    setNewTopicName(''); setSelectedIcon('calculator'); setTopicImageUrl('');
    setView('topics');
  }

  // Card management
  function createNewCard() {
    if (!currentTopic) { alert("Please select a topic first"); return; }
    const newCard = { id:Date.now(), question:'', hint:'', answer:'', acceptableAnswers:[], explanation:'', videoUrl:'', imageUrl:'', answerImageUrl:'', subtopic:'General' };
    setEditingCard(newCard); setView('edit');
  }
  function editCard(card) {
    setEditingCard({ ...card }); setView('edit');
  }
  function saveCard() {
    if (!editingCard || !currentTopic) return;
    if (!editingCard.question.trim()) { alert("Question cannot be empty"); return; }
    if (!editingCard.answer.trim())   { alert("Answer cannot be empty"); return; }
    let acceptableAnswers = editingCard.acceptableAnswers || [];
    if (!acceptableAnswers.includes(editingCard.answer)) acceptableAnswers = [editingCard.answer, ...acceptableAnswers];
    const updatedCard = { ...editingCard, acceptableAnswers, subtopic:editingCard.subtopic||'General' };
    setTopics(ts => {
      const tdup = [...ts];
      const tidx = tdup.findIndex(t=>t.id===currentTopic.id);
      if (tidx===-1) return ts;
      const cidx = tdup[tidx].cards.findIndex(c=>c.id===editingCard.id);
      if (cidx!==-1) tdup[tidx].cards[cidx] = updatedCard;
      else           tdup[tidx].cards.push(updatedCard);
      return tdup;
    });
    // update performanceData totals similarly (omitted for brevity but you had that)
    setView('cards'); setEditingCard(null);
  }
  function deleteCard(cardId) {
    if (!currentTopic) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Card',
      message: 'Are you sure you want to delete this card? This action cannot be undone.',
      onConfirm: () => {
        setTopics(ts => {
          const tdup = [...ts];
          const tidx = tdup.findIndex(t=>t.id===currentTopic.id);
          if (tidx===-1) return ts;
          tdup[tidx].cards = tdup[tidx].cards.filter(c=>c.id!==cardId);
          return tdup;
        });
        setCurrentCardIndex(i => Math.max(0,i-1));
        setConfirmDialog({ ...confirmDialog, isOpen:false });
      },
      onCancel: () => setConfirmDialog(cd=>({ ...cd, isOpen:false }))
    });
  }

  // Flashcard interactions
  function toggleHint() { setShowHint(h=>!h); }
  function toggleFlip() { setIsFlipped(f=>!f); }
  function checkAnswer() {
    if (!studentAnswer.trim()) { alert("Please enter your answer"); return; }
    const card = currentTopic.cards[currentCardIndex];
    const isCorrect = card.acceptableAnswers.some(a=>studentAnswer.trim().toLowerCase()===a.toLowerCase());
    setAnswerStatus(isCorrect?'correct':'incorrect');
    setStats(s=>({ ...s, [isCorrect?'correct':'incorrect']: s[isCorrect?'correct':'incorrect']+1 }));
    updatePerformance(isCorrect?'correct':'incorrect', card);
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (answerStatus===null) checkAnswer();
    else toggleFlip();
  }
  function resetCard() {
    setStudentAnswer(''); setAnswerStatus(null);
    if (isFlipped) toggleFlip();
  }
  function skipCard() {
    setStats(s=>({ ...s, skipped: s.skipped+1 }));
    updatePerformance('skipped', currentTopic.cards[currentCardIndex]);
    nextCard();
  }
  function resetStats() {
    setStats({ correct:0, incorrect:0, skipped:0 });
    setTimer(0);
  }
  function toggleTimer() { setTimerActive(t=>!t); }

  // Render functions
  function renderHeader() {
    return (
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1
            className="text-xl md:text-2xl font-bold cursor-pointer"
            onClick={goToTopics}
          >
            MathsFlash
          </h1>
          <div className="flex items-center space-x-3">
            {mode==='teacher' && (
              <span className="bg-yellow-500 text-xs font-medium px-2 py-1 rounded-full">
                Teacher Mode
              </span>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              className="px-3 py-1 bg-white bg-opacity-20 rounded transition"
              onClick={() => {
                if (mode==='teacher') setMode('student');
                else setView('login');
              }}
            >
              {mode==='teacher'?'Student View':'Teacher Login'}
            </button>
          </div>
        </div>
      </header>
    );
  }

  function renderTopics() {
    return (
      <div className="p-4 flex-1">
        <h2 className="text-2xl font-bold text-center mb-6 dark:text-gray-200">
          Foundation Maths Topics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map(topic => (
            <div
              key={topic.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500
                         cursor-pointer transform hover:scale-105 hover:shadow-xl transition duration-200 ease-out"
              onClick={() => selectTopic(topic)}
            >
              {topic.imageUrl && (
                <img
                  src={topic.imageUrl}
                  alt=""
                  className="h-32 w-full object-cover rounded-md mb-3"
                />
              )}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-blue-500">{topicIcons[topic.icon]}</div>
                  <h3 className="text-lg font-semibold dark:text-gray-200">
                    {topic.title}
                  </h3>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {topic.cards.length} cards
                </span>
              </div>
              {performanceData[topic.id] && (performanceData[topic.id].correct + performanceData[topic.id].incorrect) > 0 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Prev: {performanceData[topic.id].correct}✓, {performanceData[topic.id].incorrect}✗
                </div>
              )}
              {mode==='teacher' && (
                <button
                  className="mt-3 text-xs text-gray-500 hover:text-blue-400"
                  onClick={e => { e.stopPropagation(); editTopic(topic); }}
                >
                  Edit Topic
                </button>
              )}
            </div>
          ))}
          {mode==='teacher' && (
            <div
              className="bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 p-6
                         flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              onClick={() => setView('newTopic')}
            >
              <Plus size={24} className="text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-300">Add New Topic</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCards() {
    if (!currentTopic || !currentTopic.cards || currentTopic.cards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 flex-1">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No cards available for this topic.
          </p>
          {mode==='teacher' && (
            <button
              onClick={createNewCard}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create First Card
            </button>
          )}
        </div>
      );
    }

    const card = currentTopic.cards[currentCardIndex];

    return (
      <div className="p-4 flex-1 overflow-auto">
        {/* Stats & Timer */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 mb-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="text-green-600 font-medium">✓ {stats.correct}</div>
            <div className="text-red-600 font-medium">✗ {stats.incorrect}</div>
            <div className="text-gray-600 font-medium">⟳ {stats.skipped}</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-gray-700 dark:text-gray-200 font-mono">
              {formatTime(timer)}
            </div>
            <button
              className={`px-2 py-1 rounded-md text-xs ${
                timerActive ? 'bg-red-500' : 'bg-green-500'
              } text-white`}
              onClick={toggleTimer}
            >
              {timerActive ? 'Pause' : 'Start'}
            </button>
            <button
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-md"
              onClick={resetStats}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Card Flip */}
        <div className="perspective-1000 h-96 mb-4">
          <div
            className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-500 ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front */}
            <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col">
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                Question:
              </div>
              <div className="mb-4 font-medium text-xl flex-grow dark:text-gray-200">
                {card.question}
              </div>
              {card.imageUrl && (
                <div className="my-4 flex justify-center">
                  <img
                    src={card.imageUrl}
                    alt="Question"
                    className="max-h-48 rounded-md"
                  />
                </div>
              )}
              <form onSubmit={handleSubmit} className="mt-auto">
                <div className="mb-4">
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                    Your Answer:
                  </label>
                  <div className="flex">
                    <input
                      ref={answerInputRef}
                      type="text"
                      value={studentAnswer}
                      onChange={e => setStudentAnswer(e.target.value)}
                      className={`flex-grow p-2 border rounded-l-md ${
                        answerStatus === 'correct'
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : answerStatus === 'incorrect'
                          ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-gray-300 dark:bg-gray-700 dark:text-gray-200'
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
                        <div className="flex-grow bg-yellow-50 dark:bg-yellow-900 p-3 rounded-md border border-yellow-100 dark:border-yellow-700">
                          <div className="text-sm text-gray-700 dark:text-yellow-200">
                            {card.hint}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="flex-grow py-2 bg-yellow-100 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-100 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-700"
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
                        className="flex-grow py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
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

            {/* Back */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-50 dark:bg-blue-900 rounded-lg p-6 shadow-lg overflow-auto">
              <h3 className="font-semibold mb-2 dark:text-blue-300">Answer:</h3>
              <div className="mb-4 font-medium dark:text-gray-200">{card.answer}</div>
              {card.answerImageUrl && (
                <div className="my-4 flex justify-center">
                  <img
                    src={card.answerImageUrl}
                    alt="Answer"
                    className="max-h-40 rounded-md"
                  />
                </div>
              )}
              {card.explanation && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 dark:text-blue-300">Solution:</h3>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-blue-100 dark:border-blue-800 whitespace-pre-line dark:text-gray-200">
                    {card.explanation}
                  </div>
                </div>
              )}
              {card.videoUrl && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 dark:text-blue-300">Video Explanation:</h3>
                  <a
                    href={card.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-md border border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-800 transition-colors"
                  >
                    <div className="mr-3 text-red-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                      </svg>
                    </div>
                    <span className="dark:text-gray-200">Watch video explanation</span>
                  </a>
                </div>
              )}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    if (currentCardIndex === currentTopic.cards.length - 1) {
                      prepareSummaryData();
                      setView('summary');
                      setTimerActive(false);
                    } else {
                      nextCard();
                    }
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {currentCardIndex === currentTopic.cards.length - 1
                    ? 'Finish & See Summary'
                    : 'Next Card'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Teacher Controls */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {answerStatus === null
              ? 'Enter your answer and check'
              : isFlipped
              ? 'Review the solution'
              : 'Check your answer then view solution'}
          </div>
          <button
            onClick={skipCard}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
          >
            Skip
          </button>
        </div>
        {mode==='teacher' && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={createNewCard}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add Card
            </button>
            <button
              onClick={() => editCard(card)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Edit Card
            </button>
            <button
              onClick={() => deleteCard(card.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete Card
            </button>
            <button
              onClick={() => setView('import')}
              className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600"
            >
              <FileSpreadsheet size={18} className="mr-1" /> Import
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderNewTopic() {
    return (
      <div className="p-6 max-w-md mx-auto flex-1">
        <h2 className="text-2xl font-bold mb-6 dark:text-gray-200">
          Create New Foundation Maths Topic
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">
              Topic Name
            </label>
            <input
              type="text"
              value={newTopicName}
              onChange={e => setNewTopicName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="e.g. Trigonometry, Calculus"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-3">
              Choose Icon
            </label>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(topicIcons).map(([key, icon]) => (
                <div
                  key={key}
                  onClick={() => setSelectedIcon(key)}
                  className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border-2 transition ${
                    selectedIcon===key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className={selectedIcon===key?'text-blue-500':'text-gray-600 dark:text-gray-400'}>
                    {icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">
              Topic Image (optional)
            </label>
            <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
              <Image size={28} className="text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
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
                className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
              >
                Choose Image
              </label>
              {topicImageUrl && (
                <div className="mt-4 border dark:border-gray-600 p-2 w-full">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Selected image:
                  </p>
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
              onClick={() => { setView('topics'); setTopicImageUrl(''); }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={saveNewTopic}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Topic
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderEditTopic() {
    const topicToEdit = topics.find(t => t.title===newTopicName);
    return (
      <div className="p-6 max-w-md mx-auto flex-1">
        <h2 className="text-2xl font-bold mb-6 dark:text-gray-200">
          Edit Foundation Maths Topic
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">
              Topic Name
            </label>
            <input
              type="text"
              value={newTopicName}
              onChange={e => setNewTopicName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-3">
              Choose Icon
            </label>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(topicIcons).map(([key, icon]) => (
                <div
                  key={key}
                  onClick={() => setSelectedIcon(key)}
                  className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border-2 transition ${
                    selectedIcon===key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className={selectedIcon===key?'text-blue-500':'text-gray-600 dark:text-gray-400'}>
                    {icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">
              Topic Image (optional)
            </label>
            <div className="flex flex-col items-center p-4 border-2 border-dashed border- gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
              <Image size={28} className="text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
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
                className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
              >
                {topicImageUrl ? 'Change Image' : 'Choose Image'}
              </label>
              {topicImageUrl && (
                <div className="mt-4 border dark:border-gray-600 p-2 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Current image:
                    </p>
                    <button
                      className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600"
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
              onClick={() => { setView('topics'); setNewTopicName(''); setSelectedIcon('calculator'); setTopicImageUrl(''); }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={() => saveEditedTopic(topicToEdit.id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
                  </div>
          </div>
        </div>
      </div>
    );
  }

  function renderImport() {
    return (
      <div className="p-4 max-w-3xl mx-auto flex-1">
        <h2 className="text-xl font-bold mb-6 dark:text-gray-200">
          Import Questions from Excel for "{currentTopic?.title}"
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {!sheetData ? (
            <>
              <div className="text-gray-700 dark:text-gray-300">
                <p className="mb-4">Upload an Excel file (.xlsx, .xls) containing your questions and answers.</p>
                <p className="mb-2">Your spreadsheet should include at least:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>A header row</li>
                  <li><strong>Required:</strong> Question & Answer columns</li>
                  <li>Optional: Hint, Explanation, Acceptable Answers, Subtopic, Video URL</li>
                </ul>
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload size={40} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Drag & drop or click to browse</p>
                <input
                  type="file"
                  id="excel-upload"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleExcelUpload}
                />
                <label
                  htmlFor="excel-upload"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                >
                  Select Excel File
                </label>
              </div>
              {importError && (
                <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-md">
                  {importError}
                </div>
              )}
              <div className="flex justify-between">
                <button
                  onClick={() => setView('cards')}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Column mapping UI (same as original) */}
              {/* ... paste your renderImport mapping UI from earlier here ... */}
              <div className="flex justify-between">
                <button
                  onClick={cancelImport}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={importCards}
                  disabled={columnMappings.question === '' || columnMappings.answer === ''}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  Import Cards
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  function renderSummary() {
    if (!summaryData) {
      prepareSummaryData();
      return <div className="p-4 text-center dark:text-gray-200">Preparing your summary...</div>;
    }
    return (
      <div className="p-4 max-w-4xl mx-auto flex-1">
        {/* Summary card layout (same as original) */}
        {/* ... paste your renderSummary UI from earlier here ... */}
      </div>
    );
  }

  function renderCardEditor() {
    if (!editingCard) return null;
    return (
      <div className="p-4 max-w-2xl mx-auto flex-1">
        <h2 className="text-xl font-bold mb-6 dark:text-gray-200">
          {editingCard.id ? 'Edit Card' : 'Create New Card'}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {/* Card editor form (same as original) */}
          {/* ... paste your renderCardEditor UI from earlier here ... */}
        </div>
      </div>
    );
  }

  function renderLogin() {
    return (
      <div className="flex items-center justify-center flex-1 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-6 dark:text-gray-200 text-center">Teacher Login</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Password</label>
            <input
              ref={passwordInputRef}
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), login())}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Enter teacher password"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setView('topics')}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={login}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {renderHeader()}
        <main className="flex-1 overflow-auto">
          {view === 'topics'   && renderTopics()}
          {view === 'cards'    && renderCards()}
          {view === 'login'    && renderLogin()}
          {view === 'edit'     && renderCardEditor()}
          {view === 'newTopic' && renderNewTopic()}
          {view === 'editTopic'&& renderEditTopic()}
          {view === 'import'   && renderImport()}
          {view === 'summary'  && renderSummary()}
        </main>
        <ConfirmDialog
          {...confirmDialog}
          onConfirm={() => { confirmDialog.onConfirm(); }}
          onCancel={() => confirmDialog.onCancel()}
        />
      </div>
    </div>
  );
}

const App = () => <MathsFlashApp />;

export default App;
