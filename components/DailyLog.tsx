
import React, { useState, useEffect, useRef } from 'react';
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

export default DailyLog;
   