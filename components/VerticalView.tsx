
import React from 'react';
import { format, isWeekend, isPast, isToday, isSameDay, getDaysInMonth, parseISO } from 'date-fns';
import { getDayOfWeekIndex, calculateBurnout } from '../utils/dateHelpers';
import { CalendarEvent, CalendarSettings, CategoryConfig } from '../types';
import { WEEKDAYS, TRANSLATIONS, getLocalizedMonths } from '../constants';
import { AlertTriangle } from 'lucide-react';

interface VerticalViewProps {
  year: number;
  events: CalendarEvent[];
  categories: CategoryConfig[];
  settings: CalendarSettings;
  onSelectDay: (date: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
}

const VerticalView: React.FC<VerticalViewProps> = ({ year, events, categories, settings, onSelectDay, onEditEvent }) => {
  const isBirdEye = settings.isBirdEyeView;
  const filteredEvents = events.filter(e => settings.activeCategoryIds.has(e.categoryId));
  const t = TRANSLATIONS[settings.language];
  const months = getLocalizedMonths(settings.language);

  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, CategoryConfig>);
  }, [categories]);

  const renderBlock = (monthRange: number[]) => {
    const monthData = monthRange.map(m => {
      const firstDay = new Date(year, m, 1);
      const daysInMonth = getDaysInMonth(firstDay);
      const startPadding = getDayOfWeekIndex(firstDay);
      return { monthIndex: m, daysInMonth, startPadding };
    });

    const isWeekdayMode = settings.viewMode === 'weekday';
    const maxVerticalPadding = isWeekdayMode ? 6 : 0;
    const totalRows = 31 + maxVerticalPadding;

    const rowHeightClass = isBirdEye ? 'h-[1.8vh] min-h-[22px]' : 'h-10';
    const gutterWidth = isBirdEye ? 'w-12' : 'w-16';

    return (
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${isBirdEye ? 'shadow-md mb-4' : 'mb-12 shadow-lg'} min-w-full`}>
        
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex flex-col min-w-full">
            
            {/* Headers dei mesi - Usano flex-1 per riempire lo spazio */}
            <div className={`flex border-b border-slate-100 bg-slate-50/50 sticky top-0 z-30 ${isBirdEye ? 'py-0.5' : ''}`}>
              <div className={`${gutterWidth} flex-shrink-0 border-r border-slate-200 bg-slate-50`} />
              {monthData.map(md => (
                <div key={md.monthIndex} className={`flex-1 min-w-[120px] text-center border-r border-slate-100 last:border-r-0 flex items-center justify-center ${isBirdEye ? 'py-1' : 'px-2 py-3'}`}>
                  <span className={`${isBirdEye ? 'text-[10px]' : 'text-xs'} font-black text-slate-800 uppercase tracking-tighter`}>
                    {months[md.monthIndex]}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex relative min-w-full">
              {/* Colonna dei giorni (Gutter) */}
              <div className={`${gutterWidth} flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-20`}>
                {Array.from({ length: totalRows }).map((_, rowIndex) => {
                  const weekdayName = WEEKDAYS[rowIndex % 7].slice(0, 1);
                  const isWeekendRow = (rowIndex % 7) >= 5;

                  return (
                    <div 
                      key={rowIndex} 
                      className={`${rowHeightClass} flex flex-col items-center justify-center border-b border-slate-50 last:border-b-0 ${isWeekdayMode && isWeekendRow ? 'bg-blue-50/50' : ''}`}
                    >
                       {isWeekdayMode ? (
                         <span className={`${isBirdEye ? 'text-[9px]' : 'text-[9px]'} font-black uppercase ${isWeekendRow ? 'text-blue-600' : 'text-slate-400'}`}>
                           {weekdayName}
                         </span>
                       ) : (
                         <span className={`${isBirdEye ? 'text-[9px]' : 'text-[10px]'} font-bold text-slate-400 tabular-nums`}>
                           {rowIndex + 1}
                         </span>
                       )}
                    </div>
                  );
                })}
              </div>

              {/* Dati dei Mesi - Usano flex-1 per riempire lo spazio */}
              {monthData.map(md => {
                const days = Array.from({ length: md.daysInMonth }, (_, i) => new Date(year, md.monthIndex, i + 1));
                const padding = isWeekdayMode ? md.startPadding : 0;

                return (
                  <div key={md.monthIndex} className="flex-1 min-w-[120px] flex flex-col border-r border-slate-100 last:border-r-0 relative">
                    {Array.from({ length: padding }).map((_, i) => (
                      <div 
                        key={`pad-${i}`} 
                        className={`${rowHeightClass} border-b border-slate-50 last:border-b-0 ${isWeekdayMode && (i % 7 >= 5) ? 'bg-blue-50/30' : 'bg-slate-50/20'}`} 
                      />
                    ))}

                    {days.map((date) => {
                      const today = isToday(date);
                      const isWknd = isWeekend(date);
                      const past = isPast(date) && !today;
                      const burnout = settings.showBurnoutWarnings && calculateBurnout(date, filteredEvents);

                      return (
                        <div
                          key={date.toISOString()}
                          onClick={() => onSelectDay(date)}
                          className={`${rowHeightClass} border-b border-slate-50 last:border-b-0 relative group cursor-pointer transition-colors ${
                            today 
                              ? 'bg-indigo-50/50 ring-1 ring-inset ring-indigo-500 z-10' 
                              : isWknd 
                                ? 'bg-blue-50/40'
                                : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="absolute top-1 right-1 flex flex-col items-end pointer-events-none z-0">
                             <span className={`${isBirdEye ? 'text-[8px]' : 'text-[9px]'} font-black leading-none ${today ? 'text-indigo-600' : 'text-slate-300'}`}>
                               {format(date, 'd')}
                             </span>
                          </div>

                          {burnout && !isBirdEye && (
                            <div className="absolute top-1 left-1 text-orange-400 opacity-60">
                              <AlertTriangle size={10} />
                            </div>
                          )}

                          {filteredEvents
                            .filter(e => isSameDay(parseISO(e.startDate), date))
                            .map(event => {
                              const cat = categoryMap[event.categoryId];
                              if (!cat) return null;
                              const start = parseISO(event.startDate);
                              const end = parseISO(event.endDate);
                              const monthEnd = new Date(year, md.monthIndex, md.daysInMonth);
                              const effectiveEnd = end > monthEnd ? monthEnd : end;
                              const duration = Math.max(1, Math.round((effectiveEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

                              return (
                                <div
                                  key={event.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditEvent(event);
                                  }}
                                  className={`absolute left-0.5 right-0.5 z-10 rounded shadow-md p-1 font-bold text-white overflow-hidden hover:brightness-110 transition-all active:scale-95 flex flex-col ${cat.bgClass} ${settings.fadePast && past ? 'opacity-50 grayscale' : ''}`}
                                  style={{ 
                                    height: `calc(${duration}00% - 4px)`,
                                    top: '2px'
                                  }}
                                >
                                  <span className="truncate text-[8px] md:text-[9px]">{event.title}</span>
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${isBirdEye ? 'p-2 flex flex-col flex-grow' : 'm-6 flex flex-col gap-12'}`}>
      <section className="flex flex-col">
        <h2 className={`${isBirdEye ? 'text-sm mb-2' : 'text-xl mb-6'} font-black text-slate-900 flex items-center gap-2`}>
          <span className={`${isBirdEye ? 'w-6 h-6 rounded text-[10px]' : 'w-8 h-8 rounded-lg text-xs'} bg-indigo-600 flex items-center justify-center text-white`}>1</span>
          {t.firstHalf}
        </h2>
        {renderBlock([0, 1, 2, 3, 4, 5])}
      </section>

      <section className="flex flex-col">
        <h2 className={`${isBirdEye ? 'text-sm mb-2' : 'text-xl mb-6'} font-black text-slate-900 flex items-center gap-2`}>
          <span className={`${isBirdEye ? 'w-6 h-6 rounded text-[10px]' : 'w-8 h-8 rounded-lg text-xs'} bg-indigo-600 flex items-center justify-center text-white`}>2</span>
          {t.secondHalf}
        </h2>
        {renderBlock([6, 7, 8, 9, 10, 11])}
      </section>
    </div>
  );
};

export default VerticalView;
