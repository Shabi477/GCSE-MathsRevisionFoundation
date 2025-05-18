import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator,
  Circle,
  Triangle,
  PenLine,
  Table,
  ChevronRight,
  Plus,
  Check,
  X,
  Upload,
  FileSpreadsheet,
  BarChart,
  Award,
  BookOpen,
  Image,
  ChevronLeft,
  Sparkles,
  Brain,
  BookOpenCheck,
  RefreshCw,
  FileCheck,
  Star,
  BookMarked
} from 'lucide-react';
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
  const [topicImageUrl, setTopicImageUrl] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [answerStatus, setAnswerStatus] = useState(null);
  const passwordInputRef = useRef(null);
  const answerInputRef = useRef(null);
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
      imageUrl: '',
      cards: [
        {
          id: 1,
          question: 'Solve for x: 2x + 5 = 13',
          hint: 'Subtract 5 from both sides, then divide.',
          answer: 'x = 4',
          acceptableAnswers: ['4', 'x=4', 'x = 4', 'x= 4', 'x =4'],
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
          acceptableAnswers: [
            '(x+3)(x-3)',
            '(x-3)(x+3)',
            '(x + 3)(x - 3)',
            '(x - 3)(x + 3)'
          ],
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
          acceptableAnswers: [
            '25π',
            '78.54',
            '78.5',
            '25pi',
            '25π cm²',
            '78.54 cm²',
            '78.5 cm²'
          ],
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
          acceptableAnswers: [
            'F = ma',
            'F=ma',
            'f=ma',
            'f = ma',
            'force = mass × acceleration',
            'force = mass * acceleration'
          ],
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

      /* ... plus your other animations, dark‐mode overrides, scrollbars, tooltips … */
    `;
    document.head.appendChild(styleElement);

    return () => document.head.removeChild(styleElement);
  }, []);

  // Toggle dark mode
  function toggleDarkMode() {
    setIsDarkMode(!isDarkMode);
  }

  // Initialize performance data when topics change
  useEffect(() => {
    const initialPerformanceData = {};
    topics.forEach((topic) => {
      initialPerformanceData[topic.id] = {
        topicName: topic.title,
        icon: topic.icon,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: topic.cards.length,
        subtopics: {}
      };
      topic.cards.forEach((card) => {
        const sub = card.subtopic || 'General';
        if (!initialPerformanceData[topic.id].subtopics[sub]) {
          initialPerformanceData[topic.id].subtopics[sub] = {
            correct: 0,
            incorrect: 0,
            skipped: 0,
            total: 0
          };
        }
        initialPerformanceData[topic.id].subtopics[sub].total += 1;
      });
    });
    setPerformanceData(initialPerformanceData);
  }, [topics]);

  // Focus handling, timer, formatting, Excel import handlers,
  // login, navigation, performance updates, summary generation,
  // topic/card CRUD, flashcard interactions…
  // (All as you originally posted.)

  // Render functions: renderHeader, renderTopics, renderNewTopic,
  // renderEditTopic, renderCards, renderSummary, renderCardEditor,
  // renderLogin, renderImport …

  // Main render
  return (
    <div className={`${isDarkMode ? 'dark-mode bg-gray-900' : 'bg-gray-50'} min-h-screen flex flex-col`}>
      {/* Header */}
      {renderHeader()}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {view === 'topics' && renderTopics()}
        {view === 'cards' && renderCards()}
        {view === 'login' && renderLogin()}
        {view === 'edit' && renderCardEditor()}
        {view === 'newTopic' && renderNewTopic()}
        {view === 'editTopic' && renderEditTopic()}
        {view === 'import' && renderImport()}
        {view === 'summary' && renderSummary()}
      </main>

      {/* Footer & ConfirmDialog */}
      {/* … as in your original code … */}

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

const App = () => (
  <div className="h-screen w-full">
    <MathsFlashApp />
  </div>
);

export default App;

