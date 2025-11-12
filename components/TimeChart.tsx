import React, { useMemo, useState, useRef, useEffect } from 'react';

interface TimeChartProps {
  dailyTotals: { [key: string]: number };
}

const formatTimeDetailed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

    const areaPath = `${linePath} L ${xScale(maxDate)},${innerHeight + margin.top} L ${xScale(minDate)},${innerHeight + margin.top} Z`;

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
                    left: `${tooltip.x}px`, 
                    top: `${tooltip.y - 60}px`,
                    transform: `translateX(-50%)`,
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
              <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
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

export default TimeChart;