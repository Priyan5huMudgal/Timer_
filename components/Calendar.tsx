
import React, { useState } from 'react';
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
          <div key={day.toString()} className={`p-1 text-center text-sm ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}`}>
            <div
              onClick={() => onDateSelect(cloneDay)}
              className={`w-full aspect-square rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors ${intensityClass} ${isSelected ? 'ring-2 ring-light-primary dark:ring-dark-primary' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
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

export default Calendar;
   