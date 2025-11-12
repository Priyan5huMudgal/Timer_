import React, { useState, useEffect, useMemo } from 'react';
import Timer from './components/Timer';
import Calendar from './components/Calendar';
import DailyLog from './components/DailyLog';
import TimeChart from './components/TimeChart';
import { MoonIcon } from './components/icons/MoonIcon';
import { SunIcon } from './components/icons/SunIcon';
import { ShareIcon } from './components/icons/ShareIcon';
import type { Session, DailyLogData } from './types';
import { getStoredSessions, getStoredLogs } from './services/storageService';

declare const JSZip: any;

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('timer-theme') as 'light' | 'dark' | null;
    return storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>(getStoredSessions());
  const [logs, setLogs] = useState<DailyLogData>(getStoredLogs());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('timer-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const onTimerChange = (newSessions: Session[]) => {
    setSessions(newSessions);
  };
  
  const onLogChange = (newLogs: DailyLogData) => {
    setLogs(newLogs);
  };

  const dailyTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    sessions.forEach(session => {
      const date = new Date(session.start).toISOString().split('T')[0];
      const duration = session.end - session.start;
      if (!totals[date]) {
        totals[date] = 0;
      }
      totals[date] += duration;
    });
    return totals;
  }, [sessions]);

  const exportData = () => {
    const headers = "Date,Activity Log,Time Tracked (HH:MM:SS)\n";
    const sortedDates = Object.keys(dailyTotals).sort();

    const csvContent = sortedDates.map(dateStr => {
      const log = logs[dateStr] || '';
      const totalMs = dailyTotals[dateStr] || 0;
      const hours = Math.floor(totalMs / 3600000);
      const minutes = Math.floor((totalMs % 3600000) / 60000);
      const seconds = Math.floor((totalMs % 60000) / 1000);
      const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      return `"${dateStr}","${log.replace(/"/g, '""')}","${timeFormatted}"`;
    }).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "timer_log_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const shareProject = async () => {
    const zip = new JSZip();

    const projectFiles = {
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Persistent Timer & Log</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              'dark-bg': '#1a202c',
              'dark-card': '#2d3748',
              'dark-text': '#e2e8f0',
              'dark-primary': '#4299e1',
              'light-bg': '#f7fafc',
              'light-card': '#ffffff',
              'light-text': '#2d3748',
              'light-primary': '#3182ce',
            },
            backgroundImage: {
              'cheerful-light': 'radial-gradient(circle at top, #fdf4d7, #f7fafc 80%)',
              'cheerful-dark': 'radial-gradient(circle at top, #2d3748, #1a202c 80%)',
            }
          }
        }
      }
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script type="importmap">
{
  "imports": {
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "react": "https://aistudiocdn.com/react@^19.2.0"
  }
}
</script>
</head>
  <body class="antialiased">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>`,
      'index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      'App.tsx': `import React, { useState, useEffect, useMemo } from 'react';
import Timer from './components/Timer';
import Calendar from './components/Calendar';
import DailyLog from './components/DailyLog';
import TimeChart from './components/TimeChart';
import { MoonIcon } from './components/icons/MoonIcon';
import { SunIcon } from './components/icons/SunIcon';
import { ShareIcon } from './components/icons/ShareIcon';
import type { Session, DailyLogData } from './types';
import { getStoredSessions, getStoredLogs } from './services/storageService';

declare const JSZip: any;

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('timer-theme') as 'light' | 'dark' | null;
    return storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>(getStoredSessions());
  const [logs, setLogs] = useState<DailyLogData>(getStoredLogs());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('timer-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const onTimerChange = (newSessions: Session[]) => {
    setSessions(newSessions);
  };
  
  const onLogChange = (newLogs: DailyLogData) => {
    setLogs(newLogs);
  };

  const dailyTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    sessions.forEach(session => {
      const date = new Date(session.start).toISOString().split('T')[0];
      const duration = session.end - session.start;
      if (!totals[date]) {
        totals[date] = 0;
      }
      totals[date] += duration;
    });
    return totals;
  }, [sessions]);

  const exportData = () => {
    const headers = "Date,Activity Log,Time Tracked (HH:MM:SS)\\n";
    const sortedDates = Object.keys(dailyTotals).sort();

    const csvContent = sortedDates.map(dateStr => {
      const log = logs[dateStr] || '';
      const totalMs = dailyTotals[dateStr] || 0;
      const hours = Math.floor(totalMs / 3600000);
      const minutes = Math.floor((totalMs % 3600000) / 60000);
      const seconds = Math.floor((totalMs % 60000) / 1000);
      const timeFormatted = \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;
      
      return \`"\${dateStr}","\${log.replace(/"/g, '""')}","\${timeFormatted}"\`;
    }).join('\\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "timer_log_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const shareProject = async () => { /* This function is defined outside this string literal */ };


  return (
    <div className="min-h-screen bg-cheerful-light dark:bg-cheerful-dark text-light-text dark:text-dark-text transition-colors duration-300">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-light-primary dark:text-dark-primary">Persistent Timer & Log</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={shareProject}
              className="px-4 py-2 text-sm font-medium rounded-md bg-light-primary/10 text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary hover:bg-light-primary/20 dark:hover:bg-dark-primary/30 transition-colors flex items-center gap-2"
              title="Share Project"
            >
              <ShareIcon className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 text-sm font-medium rounded-md bg-light-primary/10 text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary hover:bg-light-primary/20 dark:hover:bg-dark-primary/30 transition-colors"
            >
              Export CSV
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Timer onStateChange={onTimerChange} />
            <TimeChart dailyTotals={dailyTotals} />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} dailyTotals={dailyTotals} />
            <DailyLog selectedDate={selectedDate} logs={logs} onLogChange={onLogChange} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;`,
      'metadata.json': `{
  "name": "Persistent Timer & Log",
  "description": "A desktop-style timer application that persists across sessions, capable of running for over 500 hours. It includes a calendar to view daily tracked time and a log for taking notes."
}`,
      'types.ts': `export interface TimerState {
  startTime: number | null;
  accumulatedTime: number;
  isRunning: boolean;
}

export interface Session {
  start: number;
  end: number;
}

export interface DailyLogData {
  [key: string]: string;
}`,
      'services/storageService.ts': `import type { TimerState, Session, DailyLogData } from '../types';

const TIMER_STATE_KEY = 'persistent-timer-state';
const SESSIONS_KEY = 'persistent-timer-sessions';
const LOGS_KEY = 'persistent-timer-logs';

// Timer State
export const getStoredTimerState = (): TimerState | null => {
  const stored = localStorage.getItem(TIMER_STATE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const storeTimerState = (state: TimerState) => {
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
};

// Sessions
export const getStoredSessions = (): Session[] => {
  const stored = localStorage.getItem(SESSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const storeSessions = (sessions: Session[]) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

const splitSessionAcrossDays = (session: Session): Session[] => {
  const { start, end } = session;
  if (end <= start) return [];

  const splitSessions: Session[] = [];
  let cursor = start;
  
  while (cursor < end) {
      const cursorDate = new Date(cursor);
      const endOfDay = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), cursorDate.getDate() + 1).getTime();
      const sessionEnd = Math.min(end, endOfDay);
      
      if (sessionEnd > cursor) {
          splitSessions.push({ start: cursor, end: sessionEnd });
      }
      
      cursor = sessionEnd;
  }
  return splitSessions;
}


export const addSession = (session: Session) => {
    const sessions = getStoredSessions();
    const newSessions = splitSessionAcrossDays(session);
    const updatedSessions = [...sessions, ...newSessions];
    storeSessions(updatedSessions);
    return updatedSessions;
}

// Daily Logs
export const getStoredLogs = (): DailyLogData => {
  const stored = localStorage.getItem(LOGS_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const storeLogs = (logs: DailyLogData) => {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};`,
      'hooks/useTimer.ts': `import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerState, Session } from '../types';
import { getStoredTimerState, storeTimerState, addSession, getStoredSessions } from '../services/storageService';

export const useTimer = (onStateChange: (sessions: Session[]) => void) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerStateRef = useRef<TimerState>({
    startTime: null,
    accumulatedTime: 0,
    isRunning: false,
  });
  const intervalRef = useRef<number | null>(null);

  const calculateElapsedTime = useCallback(() => {
    const { startTime, accumulatedTime, isRunning: wasRunning } = timerStateRef.current;
    if (wasRunning && startTime) {
      return accumulatedTime + (Date.now() - startTime);
    }
    return accumulatedTime;
  }, []);

  useEffect(() => {
    const savedState = getStoredTimerState();
    if (savedState) {
      timerStateRef.current = savedState;
      if (savedState.isRunning && savedState.startTime) {
        // App was closed while running. Account for offline time.
        const now = Date.now();
        const timeSinceClosed = now - savedState.startTime;
        timerStateRef.current.accumulatedTime += timeSinceClosed;
        
        // Create session(s) for the offline period
        const offlineSession = { start: savedState.startTime, end: now };
        const newSessions = addSession(offlineSession);
        onStateChange(newSessions);

        // Start a new timing session from now.
        timerStateRef.current.startTime = now;
      }
      setIsRunning(savedState.isRunning);
    }
    setElapsedTime(calculateElapsedTime());
    storeTimerState(timerStateRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(() => {
    setElapsedTime(calculateElapsedTime());
  }, [calculateElapsedTime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(update, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, update]);

  const start = useCallback(() => {
    if (isRunning) return;
    const now = Date.now();
    timerStateRef.current = {
      ...timerStateRef.current,
      startTime: now,
      isRunning: true,
    };
    setIsRunning(true);
    storeTimerState(timerStateRef.current);
  }, [isRunning]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    const now = Date.now();
    const { startTime, accumulatedTime } = timerStateRef.current;
    if (startTime) {
      const newAccumulatedTime = accumulatedTime + (now - startTime);
      timerStateRef.current = {
        accumulatedTime: newAccumulatedTime,
        startTime: null,
        isRunning: false,
      };
      
      const newSessions = addSession({ start: startTime, end: now });
      onStateChange(newSessions);
      setElapsedTime(newAccumulatedTime);
    }
    setIsRunning(false);
    storeTimerState(timerStateRef.current);
  }, [isRunning, onStateChange]);

  const reset = useCallback(() => {
    const wasRunning = timerStateRef.current.isRunning;
    const startTime = timerStateRef.current.startTime;

    if (wasRunning && startTime) {
        const newSessions = addSession({ start: startTime, end: Date.now() });
        onStateChange(newSessions);
    } else {
        // ensure UI updates if sessions are cleared elsewhere but timer was paused
        onStateChange(getStoredSessions());
    }

    timerStateRef.current = {
      startTime: null,
      accumulatedTime: 0,
      isRunning: false,
    };
    
    setIsRunning(false);
    setElapsedTime(0);
    storeTimerState(timerStateRef.current);
  }, [onStateChange]);

  return { elapsedTime, isRunning, start, pause, reset };
};`,
      'components/Timer.tsx': `import React from 'react';
import { useTimer } from '../hooks/useTimer';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { ResetIcon } from './icons/ResetIcon';
import type { Session } from '../types';

interface TimerProps {
  onStateChange: (sessions: Session[]) => void;
}

const formatTime = (totalMilliseconds: number) => {
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

const Timer: React.FC<TimerProps> = ({ onStateChange }) => {
  const { elapsedTime, isRunning, start, pause, reset } = useTimer(onStateChange);
  const { hours, minutes, seconds } = formatTime(elapsedTime);

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md p-6 sm:p-8 flex flex-col items-center justify-center h-full">
      <div className="text-6xl sm:text-8xl md:text-9xl font-mono tracking-tighter text-light-text dark:text-dark-text mb-8">
        <span>{hours}</span>
        <span className="animate-pulse">:</span>
        <span>{minutes}</span>
        <span className="animate-pulse">:</span>
        <span>{seconds}</span>
      </div>
      <div className="flex space-x-4">
        {!isRunning ? (
          <button
            onClick={start}
            className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full transition-transform transform hover:scale-105 shadow-lg"
            aria-label="Start Timer"
          >
            <PlayIcon className="w-12 h-12 sm:w-14 sm:h-14" />
          </button>
        ) : (
          <button
            onClick={pause}
            className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-transform transform hover:scale-105 shadow-lg"
            aria-label="Pause Timer"
          >
            <PauseIcon className="w-12 h-12 sm:w-14 sm:h-14" />
          </button>
        )}
        <button
          onClick={reset}
          className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-transform transform hover:scale-105 shadow-lg"
          aria-label="Reset Timer"
        >
          <ResetIcon className="w-12 h-12 sm:w-14 sm:h-14" />
        </button>
      </div>
    </div>
  );
};

export default Timer;`,
      'components/Calendar.tsx': `import React, { useState } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dailyTotals: { [key: string]: number };
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, dailyTotals }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const renderHeader = () => {
    const dateFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' });
    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-5 h-5" /></button>
        <span className="text-lg font-semibold">{dateFormat.format(currentMonth)}</span>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronRightIcon className="w-5 h-5" /></button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        {days.map(day => <div key={day}>{day}</div>)}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = currentMonth;
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6-monthEnd.getDay()));

    const rows = [];
    let day = startDate;
    
    while (day <= endDate) {
      let week = [];
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dateStr = cloneDay.toISOString().split('T')[0];
        const isSelected = selectedDate.toDateString() === cloneDay.toDateString();
        const isCurrentMonth = cloneDay.getMonth() === currentMonth.getMonth();
        const totalMs = dailyTotals[dateStr] || 0;
        const totalHours = totalMs / 3600000;

        let intensityClass = '';
        if (totalHours > 0) {
            if (totalHours > 8) intensityClass = 'bg-green-500/70';
            else if (totalHours > 4) intensityClass = 'bg-green-500/50';
            else if (totalHours > 1) intensityClass = 'bg-green-500/30';
            else intensityClass = 'bg-green-500/10';
        }

        week.push(
          <div key={day.toString()} className={\`p-1 text-center text-sm \${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}\`}>
            <div
              onClick={() => onDateSelect(cloneDay)}
              className={\`w-full aspect-square rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors \${intensityClass} \${isSelected ? 'ring-2 ring-light-primary dark:ring-dark-primary' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}\`}
            >
              <span>{cloneDay.getDate()}</span>
              {totalMs > 0 && (
                <span className="text-xs opacity-80">{Math.floor(totalMs / 60000)}m</span>
              )}
            </div>
          </div>
        );
        day.setDate(day.getDate() + 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{week}</div>);
    }
    return <div>{rows}</div>;
  };


  return (
    <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;`,
      'components/DailyLog.tsx': `import React, { useState, useEffect, useRef } from 'react';
import type { DailyLogData } from '../types';
import { storeLogs } from '../services/storageService';

interface DailyLogProps {
  selectedDate: Date;
  logs: DailyLogData;
  onLogChange: (logs: DailyLogData) => void;
}

const DailyLog: React.FC<DailyLogProps> = ({ selectedDate, logs, onLogChange }) => {
  const dateKey = selectedDate.toISOString().split('T')[0];
  const [note, setNote] = useState(logs[dateKey] || '');
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    setNote(logs[dateKey] || '');
  }, [dateKey, logs]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = window.setTimeout(() => {
      const newLogs = { ...logs, [dateKey]: newNote };
      storeLogs(newLogs);
      onLogChange(newLogs);
    }, 500);
  };
  
  const dateFormat = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">
        Log for <span className="text-light-primary dark:text-dark-primary">{dateFormat.format(selectedDate)}</span>
      </h2>
      <textarea
        value={note}
        onChange={handleNoteChange}
        placeholder="What did you work on today?"
        className="w-full h-48 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none transition-shadow"
      ></textarea>
    </div>
  );
};

export default DailyLog;`,
      'components/TimeChart.tsx': `import React, { useMemo, useState, useRef, useEffect } from 'react';

interface TimeChartProps {
  dailyTotals: { [key: string]: number };
}

const formatTimeDetailed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;
};

interface TooltipData {
  x: number;
  y: number;
  date: string;
  time: string;
  visible: boolean;
}

const TimeChart: React.FC<TimeChartProps> = ({ dailyTotals }) => {
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, date: '', time: '', visible: false });
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (svgRef.current) {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });
        resizeObserver.observe(svgRef.current);
        return () => resizeObserver.disconnect();
    }
  }, []);

  const data = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const filteredData = Object.entries(dailyTotals)
      .map(([dateStr, ms]) => ({ date: new Date(dateStr+'T00:00:00'), value: ms }))
      .filter(d => d.date >= thirtyDaysAgo)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      if (filteredData.length === 0) return [];
      
      const today = new Date();
      today.setHours(0,0,0,0);
      if(!filteredData.find(d => d.date.getTime() === today.getTime())) {
         const todayStr = today.toISOString().split('T')[0];
         if(!dailyTotals[todayStr]) {
            filteredData.push({ date: today, value: 0 });
            filteredData.sort((a, b) => a.date.getTime() - b.date.getTime());
         }
      }

    return filteredData;
  }, [dailyTotals]);
  
  const { width, height } = dimensions;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { xScale, yScale, linePath, areaPath, points } = useMemo(() => {
    if (data.length < 2 || innerWidth <= 0 || innerHeight <= 0) {
      return { xScale: null, yScale: null, linePath: '', areaPath: '', points: [] };
    }

    const maxTime = Math.max(...data.map(d => d.value), 3600000);
    const minDate = data[0].date;
    const maxDate = data[data.length - 1].date;

    const xScale = (date: Date) => margin.left + ((date.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * innerWidth;
    const yScale = (value: number) => margin.top + innerHeight - (value / maxTime) * innerHeight;
    
    const points = data.map(d => ({ x: xScale(d.date), y: yScale(d.value), date: d.date, value: d.value }));

    const linePath = points.map((p, i) => \`\${i === 0 ? 'M' : 'L'} \${p.x},\${p.y}\`).join(' ');

    const areaPath = \`\${linePath} L \${xScale(maxDate)},\${innerHeight + margin.top} L \${xScale(minDate)},\${innerHeight + margin.top} Z\`;

    return { xScale, yScale, linePath, areaPath, points };
  }, [data, innerWidth, innerHeight, margin]);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    
    const closestPoint = points.reduce((prev, curr) => 
      Math.abs(curr.x - mouseX) < Math.abs(prev.x - mouseX) ? curr : prev
    );
    
    const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(closestPoint.date);
    const formattedTime = formatTimeDetailed(closestPoint.value);

    setTooltip({
      x: closestPoint.x,
      y: closestPoint.y,
      date: formattedDate,
      time: formattedTime,
      visible: true
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };
  
  const xAxisTicks = useMemo(() => {
     if (!xScale || data.length < 2) return [];
     const tickCount = Math.min(data.length, Math.floor(innerWidth / 80));
     if(tickCount <= 1) return data.length > 0 ? [data[0]] : [];
     const indices = Array.from({ length: tickCount }, (_, i) => Math.floor(i * (data.length - 1) / (tickCount - 1)));
     return indices.map(i => data[i]);
  }, [xScale, data, innerWidth]);

  const yAxisTicks = useMemo(() => {
    if (!yScale) return [];
    const maxHours = Math.ceil(Math.max(...data.map(d => d.value), 3600000) / 3600000);
    const tickCount = Math.min(5, maxHours + 1);
    if (tickCount <= 1) return maxHours > 0 ? [0, maxHours * 3600000] : [0];
    return Array.from({ length: tickCount }, (_, i) => i * (maxHours / (tickCount - 1)) * 3600000);
  }, [yScale, data]);


  if (data.length < 2) {
    return (
        <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md p-4 flex flex-col items-center justify-center min-h-[300px]">
            <h2 className="text-lg font-semibold mb-2">Time Tracked (Last 30 Days)</h2>
            <p className="text-gray-500 dark:text-gray-400">Not enough data to display chart. Keep tracking your time!</p>
        </div>
    )
  }

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md p-4 relative">
      <h2 className="text-lg font-semibold mb-2">Time Tracked (Last 30 Days)</h2>
      <div className="relative w-full h-64 sm:h-80">
        {tooltip.visible && (
            <div 
                className="absolute text-xs bg-black/70 text-white p-2 rounded-md pointer-events-none transition-transform duration-100"
                style={{
                    left: \`\${tooltip.x}px\`, 
                    top: \`\${tooltip.y - 60}px\`,
                    transform: \`translateX(-50%)\`,
                    whiteSpace: 'nowrap'
                }}
            >
                <div><strong>{tooltip.date}</strong></div>
                <div>{tooltip.time}</div>
            </div>
        )}
        <svg ref={svgRef} width="100%" height="100%" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="text-light-primary dark:text-dark-primary stop-color" stopOpacity={0.4} />
              <stop offset="100%" className="text-light-primary dark:text-dark-primary stop-color" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {/* Axes */}
          <g className="text-xs text-gray-500 dark:text-gray-400" style={{userSelect: 'none'}}>
            {/* Y Axis */}
            <line x1={margin.left} y1={margin.top} x2={margin.left} y2={innerHeight + margin.top} className="stroke-current" strokeWidth="0.5" />
            {yAxisTicks.map(tick => (
              <g key={tick} transform={\`translate(0, \${yScale(tick)})\`}>
                <text x={margin.left - 8} y="0" dominantBaseline="middle" textAnchor="end" className="fill-current">{Math.round(tick/3600000)}h</text>
                <line x1={margin.left} x2={innerWidth + margin.left} className="stroke-current" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
              </g>
            ))}
            {/* X Axis */}
            <line x1={margin.left} y1={innerHeight + margin.top} x2={innerWidth + margin.left} y2={innerHeight + margin.top} className="stroke-current" strokeWidth="0.5" />
            {xAxisTicks.map(({date}) => (
                <text key={date.toString()} x={xScale(date)} y={innerHeight + margin.top + 15} textAnchor="middle" dominantBaseline="hanging" className="fill-current">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)}
                </text>
            ))}
          </g>
          
          {/* Chart Data */}
          <path d={areaPath} fill="url(#areaGradient)" />
          <path d={linePath} fill="none" className="stroke-light-primary dark:stroke-dark-primary" strokeWidth="2" />
          
          {/* Tooltip Indicator */}
          {tooltip.visible && (
            <g>
                <line x1={tooltip.x} y1={margin.top} x2={tooltip.x} y2={innerHeight+margin.top} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx={tooltip.x} cy={tooltip.y} r="4" className="fill-white stroke-light-primary dark:stroke-dark-primary" strokeWidth="2" />
            </g>
          )}

        </svg>
      </div>
    </div>
  );
};

export default TimeChart;`,
      'components/icons/ChevronLeftIcon.tsx': `import React from 'react';
export const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);`,
      'components/icons/ChevronRightIcon.tsx': `import React from 'react';
export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);`,
      'components/icons/MoonIcon.tsx': `import React from 'react';
export const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);`,
      'components/icons/PauseIcon.tsx': `import React from 'react';
export const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);`,
      'components/icons/PlayIcon.tsx': `import React from 'react';
export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M8 5v14l11-7z" />
  </svg>
);`,
      'components/icons/ResetIcon.tsx': `import React from 'react';
export const ResetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
  </svg>
);`,
      'components/icons/ShareIcon.tsx': `import React from 'react';
export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 4.186m0-4.186c.18.32.32.67.41 1.043m-1.085 2.102a2.25 2.25 0 01-1.085-2.102m0 0a2.25 2.25 0 11-4.186 0 2.25 2.25 0 014.186 0zm-12.828 2.102a2.25 2.25 0 110-4.186 2.25 2.25 0 010 4.186zM9.317 12.907a2.25 2.25 0 100-4.186m0 4.186c-.18-.32-.32-.67-.41-1.043m1.085-2.102a2.25 2.25 0 011.085 2.102m0 0a2.25 2.25 0 114.186 0 2.25 2.25 0 01-4.186 0z" />
  </svg>
);`,
      'components/icons/SunIcon.tsx': `import React from 'react';
export const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M12 12a4.5 4.5 0 000 9 4.5 4.5 0 000-9z" />
  </svg>
);`,
    };

    // Replace the App.tsx content with the correct version that doesn't have the share function inlined
    projectFiles['App.tsx'] = (projectFiles['App.tsx'] as string).replace('const shareProject = async () => { /* This function is defined outside this string literal */ };', '');
    
    const readmeContent = `# Persistent Timer & Log

This is a simple, persistent timer application.

## How to Run

This project is designed to run in a web environment that can handle \`.tsx\` files directly, such as the AI Studio environment it was created in.

1.  Unzip the folder.
2.  Ensure all files are in the same directory structure as in the zip.
3.  Open the \`index.html\` file in a compatible browser or development environment.

The application requires an internet connection to load its dependencies (React, ReactDOM, etc.).
`;

    zip.file('README.md', readmeContent);

    for (const [path, content] of Object.entries(projectFiles)) {
      zip.file(path, content);
    }
    
    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'persistent-timer-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };


  return (
    <div className="min-h-screen bg-cheerful-light dark:bg-cheerful-dark text-light-text dark:text-dark-text transition-colors duration-300">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-light-primary dark:text-dark-primary">Persistent Timer & Log</h1>
          <div className="flex items-center gap-2">
             <button
              onClick={shareProject}
              className="px-4 py-2 text-sm font-medium rounded-md bg-light-primary/10 text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary hover:bg-light-primary/20 dark:hover:bg-dark-primary/30 transition-colors flex items-center gap-2"
              title="Share Project as .zip"
            >
              <ShareIcon className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 text-sm font-medium rounded-md bg-light-primary/10 text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary hover:bg-light-primary/20 dark:hover:bg-dark-primary/30 transition-colors"
            >
              Export CSV
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Timer onStateChange={onTimerChange} />
            <TimeChart dailyTotals={dailyTotals} />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} dailyTotals={dailyTotals} />
            <DailyLog selectedDate={selectedDate} logs={logs} onLogChange={onLogChange} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;