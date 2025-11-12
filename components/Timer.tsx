
import React from 'react';
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

export default Timer;
   