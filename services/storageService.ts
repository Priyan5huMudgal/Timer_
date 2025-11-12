import type { TimerState, Session, DailyLogData } from '../types';

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
};