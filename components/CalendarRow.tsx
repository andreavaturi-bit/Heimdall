
import React from 'react';
import { format, isWeekend, isPast, isToday, isSameDay, startOfMonth, endOfMonth, parseISO, isAfter, isBefore } from 'date-fns';
import { getMonthDays, calculateBurnout } from '../utils/dateHelpers';
import { CalendarEvent, CalendarSettings, CategoryConfig } from '../types';
import { getLocalizedMonths, TRANSLATIONS } from '../constants';
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
  const { days, startPadding } = React.useMemo(() => getMonthDays(year, monthIndex), [year, monthIndex]);
  const months = getLocalizedMonths(settings.language);
  const t = TRANSLATIONS[settings.language];
  
  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, CategoryConfig>);
  }, [categories]);

  const monthEvents = React.useMemo(() => 
    events.filter(event => settings.activeCategoryIds.has(event.categoryId)),
    [events, settings.activeCategoryIds]
  );

  const isBirdEye = settings.isBirdEyeView;
  
  // Usiamo flex-1 per le colonne così si espandono a riempire il contenitore,
  // ma manteniamo una min-width per non sovrapporre i testi quando lo schermo è stretto.
  const minColWidth = isBirdEye ? '24px' : '48px'; 

  const monthStart = startOfMonth(new Date(year, monthIndex));
  const monthEnd = endOfMonth(new Date(year, monthIndex));

  const weekdays_abbr = settings.language === 'it' ? ['L', 'M', 'M', 'G', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className={`group flex flex-col border-b border-slate-200 transition-colors last:border-b-0 ${isBirdEye ? 'min-h-[64px]' : 'min-h-[110px] hover:bg-slate-50/50'} min-w-full`}>
      
      {/* Header giorni (L M M G V S D) */}
      <div className="flex bg-slate-50/30 border-b border-slate-100 min-w-full">
         <div className={`${isBirdEye ? 'w-16' : 'w-24 md:w-32'} flex-shrink-0 border-r border-slate-100 bg-white sticky left-0 z-20`} />
         <div className="flex flex-1">
           {settings.viewMode === 'weekday' && Array.from({ length: startPadding }).map((_, i) => (
              <div key={`head-pad-${i}`} style={{ flex: '1 1 0%', minWidth: minColWidth }} />
           ))}
           {days.map((date, i) => (
             <div key={`head-${i}`} style={{ flex: '1 1 0%', minWidth: minColWidth }} className="text-center py-1">
               <span className={`text-[9px] font-bold uppercase ${isWeekend(date) ? 'text-blue-500' : 'text-slate-400'}`}>
                  {weekdays_abbr[(date.getDay() + 6) % 7]}
               </span>
             </div>
           ))}
         </div>
      </div>

      <div className="flex flex-1 relative min-w-full">
        {/* Etichetta Mese */}
        <div className={`${isBirdEye ? 'w-16 px-1' : 'w-24 md:w-32 px-4'} flex-shrink-0 flex flex-col justify-center bg-white border-r border-slate-100 sticky left-0 z-20`}>
          <span className={`${isBirdEye ? 'text-[10px]' : 'text-sm'} font-black text-slate-900 uppercase tracking-tighter`}>
            {months[monthIndex].slice(0, 3)}
          </span>
          {!isBirdEye && <span className="text-[10px] text-slate-400 font-medium tabular-nums">{year}</span>}
        </div>

        {/* Griglia Giorni */}
        <div className="flex flex-1 relative items-stretch min-w-fit">
          {settings.viewMode === 'weekday' && Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="flex-shrink-0 border-r border-slate-50 bg-slate-50/20" style={{ flex: '1 1 0%', minWidth: minColWidth }} />
          ))}

          {days.map((date) => {
            const isWknd = isWeekend(date);
            const past = isPast(date) && !isToday(date);
            const today = isToday(date);
            const burnout = settings.showBurnoutWarnings && calculateBurnout(date, monthEvents);

            // Filtro eventi
            const activeEvents = monthEvents.filter(e => {
                const start = parseISO(e.startDate);
                const end = parseISO(e.endDate);
                const isStart = isSameDay(start, date);
                const isContinuationFromPrevMonth = isSameDay(date, monthStart) && isBefore(start, monthStart) && !isBefore(end, monthStart);
                return isStart || isContinuationFromPrevMonth;
            });

            return (
              <div 
                key={date.toISOString()}
                className={`flex-shrink-0 flex flex-col relative group/day cursor-pointer border-r border-slate-50 last:border-r-0 ${
                    isWknd ? 'bg-blue-50/40' : ''
                } ${today ? 'ring-2 ring-inset ring-indigo-500 z-10' : ''}`}
                style={{ flex: '1 1 0%', minWidth: minColWidth }}
                onClick={() => onSelectDay(date)}
              >
                {/* Numero Giorno */}
                <div className="text-center py-1">
                  <span className={`text-[10px] font-bold ${
                    today ? 'text-indigo-600' : isWknd ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    {format(date, 'd')}
                  </span>
                </div>

                {burnout && !isBirdEye && (
                  <div className="absolute top-1 right-1 text-orange-500 z-20">
                    <AlertTriangle size={12} fill="currentColor" className="text-orange-50" />
                  </div>
                )}

                <div className="absolute inset-x-0 top-7 bottom-1 flex flex-col gap-1 px-0.5 z-10 overflow-visible">
                  {activeEvents.map(event => {
                    const cat = categoryMap[event.categoryId];
                    if (!cat) return null;
                    
                    const start = parseISO(event.startDate);
                    const end = parseISO(event.endDate);
                    
                    const effectiveStart = isBefore(start, monthStart) ? monthStart : start;
                    const effectiveEnd = isAfter(end, monthEnd) ? monthEnd : end;
                    
                    const durationInMonth = Math.max(1, Math.round((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                    const isContinuation = isBefore(start, monthStart);

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(event);
                        }}
                        className={`
                          relative flex items-center h-5 md:h-6 rounded shadow-md cursor-pointer hover:brightness-105 transition-all active:scale-[0.98] overflow-hidden whitespace-nowrap
                          ${cat.bgClass} 
                          ${settings.fadePast && past ? 'opacity-40 grayscale' : 'opacity-100'}
                        `}
                        style={{ 
                          width: `calc(${durationInMonth}00% + ${durationInMonth - 1}px)`,
                          zIndex: 30 
                        }}
                      >
                        <span className="px-2 text-[9px] md:text-[10px] font-bold text-white truncate w-full text-center">
                          {isContinuation && <span className="opacity-70 mr-1">...</span>}
                          {event.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarRow);
