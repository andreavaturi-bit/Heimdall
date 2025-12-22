
import React from 'react';
import { format, isWeekend, isPast, isToday, isSameDay } from 'date-fns';
import { getMonthDays, calculateBurnout } from '../utils/dateHelpers';
import { CalendarEvent, CalendarSettings, CategoryConfig } from '../types';
import { getLocalizedMonths } from '../constants';
import { AlertTriangle } from 'lucide-react';

interface CalendarRowProps {
  year: number;
  monthIndex: number;
  events: CalendarEvent[];
  categories: CategoryConfig[];
  settings: CalendarSettings;
  onSelectDay: (date: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
}

const CalendarRow: React.FC<CalendarRowProps> = ({ year, monthIndex, events, categories, settings, onSelectDay, onEditEvent }) => {
  const { days, startPadding } = getMonthDays(year, monthIndex);
  const months = getLocalizedMonths(settings.language);
  
  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, CategoryConfig>);
  }, [categories]);

  const monthEvents = events.filter(event => settings.activeCategoryIds.has(event.categoryId));
  const isBirdEye = settings.isBirdEyeView;
  const maxCols = settings.viewMode === 'weekday' ? 37 : 31;
  const colWidth = isBirdEye ? `${(1 / maxCols) * 100}%` : '3rem';

  return (
    <div className={`group flex border-b border-slate-100 transition-colors last:border-b-0 ${isBirdEye ? 'flex-1 min-h-0' : 'hover:bg-slate-50/30'}`}>
      <div className={`${isBirdEye ? 'w-16 px-1' : 'w-32 px-4'} flex-shrink-0 flex flex-col justify-center bg-white border-r border-slate-100 sticky left-0 z-20`}>
        <span className={`${isBirdEye ? 'text-[9px]' : 'text-sm'} font-bold text-slate-800 uppercase tracking-widest leading-none mb-1`}>
          {isBirdEye ? months[monthIndex].slice(0, 1) : months[monthIndex].slice(0, 3)}
        </span>
        {!isBirdEye && <span className="text-[10px] text-slate-500 font-black tracking-tighter tabular-nums">{year}</span>}
      </div>

      <div className={`flex relative ${isBirdEye ? 'min-w-0 flex-1 py-1 px-1' : 'min-w-max py-8 px-4'}`}>
        {settings.viewMode === 'weekday' && Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="flex-shrink-0" style={{ width: colWidth }} />
        ))}

        {days.map((date) => {
          const isWknd = isWeekend(date);
          const past = isPast(date) && !isToday(date);
          const burnout = settings.showBurnoutWarnings && calculateBurnout(date, monthEvents);
          const today = isToday(date);

          return (
            <div 
              key={date.toISOString()}
              className={`flex-shrink-0 flex flex-col items-center relative group/day cursor-pointer min-w-0`}
              style={{ width: colWidth }}
              onClick={() => onSelectDay(date)}
            >
              {!isBirdEye && (
                <div className={`text-[10px] font-black mb-2 transition-colors ${
                  today ? 'text-indigo-600 scale-125' : isWknd ? 'text-slate-900' : 'text-slate-700'
                }`}>
                  {format(date, 'd')}
                  {settings.viewMode === 'numeric' && (
                    <span className="block text-[8px] font-black opacity-90 text-center uppercase">
                      {format(date, 'EE').slice(0, 1)}
                    </span>
                  )}
                </div>
              )}

              <div className={`${isBirdEye ? 'w-full h-full rounded-sm' : 'w-10 h-10 rounded-lg'} border transition-all flex items-center justify-center relative ${
                today ? 'border-indigo-600 bg-indigo-50 shadow-sm z-10' : isWknd ? 'border-slate-300 bg-slate-200 shadow-inner' : 'border-transparent group-hover/day:border-slate-200'
              } ${settings.fadePast && past ? 'opacity-30 grayscale' : ''}`}>
                {burnout && !isBirdEye && (
                  <div className="absolute -top-1 -right-1 text-orange-500 animate-bounce z-20">
                    <AlertTriangle size={14} fill="currentColor" className="text-orange-100" />
                  </div>
                )}
              </div>

              <div className={`absolute left-0 z-10 flex flex-col gap-0.5 px-0.5 ${isBirdEye ? 'top-1 bottom-1 justify-center' : 'top-20'}`}>
                {monthEvents
                  .filter(e => isSameDay(new Date(e.startDate), date))
                  .map(event => {
                    const cat = categoryMap[event.categoryId];
                    if (!cat) return null;
                    const duration = Math.max(1, Math.round((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(event);
                        }}
                        className={`${isBirdEye ? 'h-1.5 opacity-90' : 'h-5 px-2 px-2 text-[9px]'} rounded-full font-bold text-white shadow-sm flex items-center truncate cursor-pointer hover:brightness-110 transition-all active:scale-95 z-30 ${cat.bgClass} ${settings.fadePast && past ? 'opacity-50' : ''}`}
                        style={{ 
                          width: isBirdEye ? `calc(${duration}00% + ${(duration - 1) * 2}px)` : `calc(${duration * 3}rem - 8px)`,
                          minWidth: isBirdEye ? '4px' : '40px' 
                        }}
                      >
                        {!isBirdEye && event.title}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarRow;
