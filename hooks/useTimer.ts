import { useState, useEffect, useCallback, useRef } from 'react';
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
};