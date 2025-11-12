
export interface TimerState {
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
}
   