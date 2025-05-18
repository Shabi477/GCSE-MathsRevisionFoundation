import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator, Circle, Triangle, PenLine, Table, ChevronRight, Plus,
  Check, X, Upload, FileSpreadsheet, Award, BookOpen, Image,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import './MathsFlash.css';

function MathsFlashApp() {
  // Dark mode toggle
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => setIsDarkMode(d => !d);

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

  // Performance tracking
  const [performanceData, setPerformanceData] = useState({});
  const [summaryData, setSummaryData] = useState(null);

  // Excel import
  const [importFile, setImportFile] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [columnMappings, setColumnMappings] = useState({ question:'', answer:'', hint:'', explanation:'', acceptableAnswers:'', videoUrl:'', subtopic:'' });
  const [importError, setImportError] = useState('');
  const [importProgress, setImportProgress] = useState(0);

  // Timer & stats
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [stats, setStats] = useState({ correct:0, incorrect:0, skipped:0 });

  // Refs
  const passwordInputRef = useRef(null);
  const answerInputRef = useRef(null);

  // Icons map
  const topicIcons = {
    calculator:<Calculator size={24}/>,
    circle:<Circle size={24}/>,
    triangle:<Triangle size={24}/>,
    penLine:<PenLine size={24}/>,
    table:<Table size={24}/>
  };

  // Topics & cards
  const [topics, setTopics] = useState([
    { id:1, title:'Algebra', icon:'calculator', imageUrl:'', cards:[
      { id:1, question:'Solve for x: 2x + 5 = 13', hint:'Subtract 5 then divide', answer:'x = 4', acceptableAnswers:['4','x=4'], explanation:'2x+5=13 => 2x=8 => x=4', videoUrl:'', imageUrl:'', answerImageUrl:'', subtopic:'Linear Equations' },
      { id:2, question:'Factor: x² - 9', hint:'Difference of squares', answer:'(x+3)(x-3)', acceptableAnswers:['(x+3)(x-3)','(x-3)(x+3)'], explanation:'a²-b²=(a+b)(a-b)', videoUrl:'', imageUrl:'', answerImageUrl:'', subtopic:'Factoring' }
    ]},
    { id:2, title:'Geometry', icon:'circle', imageUrl:'', cards:[
      { id:1, question:'Area of circle radius 5', hint:'Use A=πr²', answer:'25π', acceptableAnswers:['25π','78.54'], explanation:'π*5²', videoUrl:'', imageUrl:'', answerImageUrl:'', subtopic:'Circles' }
    ]},
    { id:3, title:'Physics', icon:'triangle', imageUrl:'', cards:[
      { id:1, question:"Newton's Second Law?", hint:'Force=mass×acceleration', answer:'F = ma', acceptableAnswers:['F=ma'], explanation:'Force equals mass times acceleration', videoUrl:'', imageUrl:'', answerImageUrl:'', subtopic:"Newton's Laws" }
    ]}
  ]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Initialize performance
  useEffect(() => {
    const perf = {};
    topics.forEach(t => {
      perf[t.id] = { correct:0, incorrect:0, skipped:0, total:t.cards.length, subtopics:{} };
      t.cards.forEach(c => {
        const s=c.subtopic||'General';
        if(!perf[t.id].subtopics[s]) perf[t.id].subtopics[s]={correct:0,incorrect:0,skipped:0,total:0};
        perf[t.id].subtopics[s].total++;
      });
    });
    setPerformanceData(perf);
  }, [topics]);

  // Focus inputs
  useEffect(() => { if(view==='login') passwordInputRef.current?.focus(); }, [view]);
  useEffect(() => { if(answerInputRef.current && !isFlipped && answerStatus===null) answerInputRef.current.focus(); }, [currentCardIndex,isFlipped,answerStatus]);
  useEffect(() => { let iv; if(timerActive) iv=setInterval(()=>setTimer(t=>t+1),1000); return()=>clearInterval(iv); }, [timerActive]);

  // Helpers
  function formatTime(s){ const m=Math.floor(s/60), r=s%60; return `${m<10?'0':''}${m}:${r<10?'0':''}${r}`; }
  function toggleFlip(){ setIsFlipped(f=>!f); }
  function toggleHint(){ setShowHint(h=>!h); }

  // Auth
  function login(){
    if(passwordInput===password){ setMode('teacher'); setPasswordInput(''); setPasswordError(''); setView('topics'); }
    else setPasswordError('Incorrect password');
  }

  // Navigation
  function goToTopics(){ setView('topics'); setCurrentTopic(null); setSummaryData(null); }
  function selectTopic(topic){ setCurrentTopic(topic); setCurrentCardIndex(0); setIsFlipped(false); setShowHint(false); setStudentAnswer(''); setAnswerStatus(null); setView('cards'); setStats({correct:0,incorrect:0,skipped:0}); setTimer(0); setTimerActive(true); }
  function nextCard(){ if(currentCardIndex<currentTopic.cards.length-1){ setCurrentCardIndex(i=>i+1); setIsFlipped(false); setShowHint(false); setStudentAnswer(''); setAnswerStatus(null);} else { prepareSummaryData(); setView('summary'); setTimerActive(false);} }
  function prevCard(){ if(currentCardIndex>0){ setCurrentCardIndex(i=>i-1); setIsFlipped(false); setShowHint(false); setStudentAnswer(''); setAnswerStatus(null);} }

  // Performance
  function updatePerformance(result,card){
    if(!currentTopic) return;
    const id=currentTopic.id, sub=card.subtopic||'General';
    const upd={...performanceData}; if(!upd[id]) upd[id]={correct:0,incorrect:0,skipped:0,total:currentTopic.cards.length,subtopics:{}};
    if(!upd[id].subtopics[sub]) upd[id].subtopics[sub]={correct:0,incorrect:0,skipped:0,total:0};
    if(result==='correct'){ upd[id].correct++; upd[id].subtopics[sub].correct++; }
    if(result==='incorrect'){ upd[id].incorrect++; upd[id].subtopics[sub].incorrect++; }
    if(result==='skipped'){ upd[id].skipped++; upd[id].subtopics[sub].skipped++; }
    setPerformanceData(upd);
  }

  function prepareSummaryData(){
    if(!currentTopic) return;
    const data=performanceData[currentTopic.id]; if(!data) return;
    const analysis={}, subs=Object.keys(data.subtopics);
    subs.forEach(s=>{ const d=data.subtopics[s]; const att=d.correct+d.incorrect; const pct=att?Math.round(d.correct/att*100):0;
      analysis[s]={...d,correctPercentage:pct,attempted:att,needsWork:pct<70&&att>0};
    });
    const strengths=subs.filter(s=>analysis[s].correctPercentage>=85&&analysis[s].attempted>0);
    const weaknesses=subs.filter(s=>analysis[s].needsWork);
    const totalAttempted=data.correct+data.incorrect;
    const overall=totalAttempted?Math.round(data.correct/totalAttempted*100):0;
    const rec=[];
    if(weaknesses.length) rec.push({id:currentTopic.id,title:currentTopic.title,icon:currentTopic.icon,reason:`Practice ${weaknesses[0]}`});
    topics.forEach(t=>{ if(t.id!==currentTopic.id&&( !performanceData[t.id]||performanceData[t.id].correct+performanceData[t.id].incorrect===0)) rec.push({id:t.id,title:t.title,icon:t.icon,reason:"You haven't tried this topic yet"});});
    const summary={ topicName:currentTopic.title, icon:currentTopic.icon, totalCards:currentTopic.cards.length, totalAttempted, correct:data.correct, incorrect:data.incorrect, skipped:data.skipped, overallCorrectPercentage:overall, timeTaken:timer, subtopicsAnalysis:analysis, strengths, weaknesses, recommendedTopics:rec, grade:getGrade(overall) };
    setSummaryData(summary);
  }
  function getGrade(p){ if(p>=90)return{letter:'A',comment:'Excellent!'}; if(p>=80)return{letter:'B',comment:'Very Good!'}; if(p>=70)return{letter:'C',comment:'Good'}; if(p>=60)return{letter:'D',comment:'Satisfactory'}; return{letter:'F',comment:'Needs Improvement'}; }

  // Topic + Card management (saveNewTopic, createNewCard, editCard, saveCard, deleteCard) … omitted for brevity but identical to original
  // Excel handlers (handleExcelUpload, importCards, cancelImport) … omitted
  // Answer handling (checkAnswer, handleSubmit, resetCard, skipCard, resetStats, toggleTimer) … omitted

  // Renderers with visual tweaks:
  function renderHeader(){
    return(
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1
            onClick={goToTopics}
            className="text-xl md:text-2xl font-bold cursor-pointer"
            style={{textShadow:'0 1px 2px rgba(0,0,0,0.2)'}}
          >MathsFlash</h1>
          <div className="flex items-center space-x-2">
            {mode==='teacher'&&<span className="bg-yellow-500 text-xs font-medium px-2 py-1 rounded-full">Teacher Mode</span>}
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition">{isDarkMode?'☀️':'🌙'}</button>
            <button onClick={()=>setMode(mode==='teacher'?'student':'teacher')} className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md">{mode==='teacher'?'Student View':'Teacher Login'}</button>
          </div>
        </div>
      </header>
    );
  }

  function renderTopics(){
    return(
      <div className="p-4">
        <h2 className="text-2xl font-bold text-center mb-6" style={{textShadow:'0 1px 2px rgba(0,0,0,0.2)'}}>Foundation Maths Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(topic=> (
            <div key={topic.id} onClick={()=>selectTopic(topic)} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 cursor-pointer transform hover:scale-105 hover:shadow-xl transition duration-200 ease-out">
              {topic.imageUrl && <img src={topic.imageUrl} alt={topic.title} className="h-32 mx-auto mb-2" />}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-500">{topicIcons[topic.icon]}</div>
                  <h3 className="text-lg font-semibold">{topic.title}</h3>
                </div>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{topic.cards.length} cards</span>
                  <ChevronRight size={16} className="ml-2 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
          {mode==='teacher'&&(
            <div onClick={()=>setView('newTopic')} className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition">
              <Plus size={24} className="text-gray-400 mb-2" />
              <p className="text-gray-500">Add New Topic</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCards(){
    if(!currentTopic||!currentTopic.cards||!currentTopic.cards.length) return <div...>/* no cards UI */</div>;
    const card=currentTopic.cards[currentCardIndex];
    return(
      <div className="p-4">
        {/* stats + timer omitted for brevity */}
        <div className="h-96 w-full perspective-1000 mb-4">
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped?'rotate-y-180':''}`}>
            {/* front/back card faces same as original */}
          </div>
        </div>
        {/* navigation + teacher controls same as original */}
      </div>
    );
  }

  function renderSummary(){ return <div>/* summary UI with same gradient cards */</div>; }
  function renderNewTopic(){ return <div>/* new/edit topic UI */</div>; }
  function renderCardEditor(){ return <div>/* card editor */</div>; }
  function renderLogin(){ return <div>/* login UI */</div>; }
  function renderImport(){ return <div>/* import UI */</div>; }

  return (
    <div className={`${isDarkMode?'dark':''} min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col`}>
      {renderHeader()}
      <main className="flex-1">
        {view==='topics'&&renderTopics()}
        {view==='cards'&&renderCards()}
        {view==='login'&&renderLogin()}
        {view==='edit'&&renderCardEditor()}
        {view==='newTopic'&&renderNewTopic()}
        {view==='editTopic'&&renderNewTopic()}
        {view==='import'&&renderImport()}
        {view==='summary'&&renderSummary()}
      </main>
    </div>
  );
}

export default function App() {
  return <MathsFlashApp />;
}
