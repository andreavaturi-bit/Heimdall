
import React from 'react';
import { format, isToday, isPast, isSameDay, parseISO, isWeekend } from 'date-fns';
import { getCyclicYearData, isEventInDay } from '../utils/dateHelpers';
import { CalendarEvent, CalendarSettings, CategoryConfig } from '../types';
import { TRANSLATIONS, getLocalizedMonths } from '../constants';
import { Flag, CheckCircle2 } from 'lucide-react';

interface CyclicViewProps {
  year: number;
  events: CalendarEvent[];
  categories: CategoryConfig[];
  settings: CalendarSettings;
  onSelectDay: (date: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
}

const CyclicView: React.FC<CyclicViewProps> = ({ year, events, categories, settings, onSelectDay, onEditEvent }) => {
  const t = TRANSLATIONS[settings.language];
  const months = getLocalizedMonths(settings.language);
  const cyclicData = React.useMemo(() => getCyclicYearData(year), [year]);
  const isBirdEye = settings.isBirdEyeView;

  const categoryMap = React.useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, CategoryConfig>);
  }, [categories]);

  const filteredEvents = React.useMemo(() => 
    events.filter(e => settings.activeCategoryIds.has(e.categoryId)),
    [events, settings.activeCategoryIds]
  );

  /**
   * Helper to calculate month spans for the horizontal headers
   */
  const getMonthSpans = (weeks: any[]) => {
    const spans: { name: string; span: number }[] = [];
    if (weeks.length === 0) return spans;

    let currentMonth = weeks[0].days[0].getMonth();
    let currentSpan = 0;

    weeks.forEach((week) => {
      const weekMonth = week.days[0].getMonth();
      if (weekMonth === currentMonth) {
        currentSpan++;
      } else {
        spans.push({ name: months[currentMonth], span: currentSpan });
        currentMonth = weekMonth;
        currentSpan = 1;
      }
    });

    spans.push({ name: months[currentMonth], span: currentSpan });
    return spans;
  };

  return (
    <div className={`flex flex-col gap-12 ${isBirdEye ? 'p-2 overflow-y-auto' : 'p-6'}`}>
      {cyclicData.map((quarter, qIdx) => {
        const monthSpans = getMonthSpans(quarter.weeks);

        return (
          <section key={quarter.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <h2 className={`${isBirdEye ? 'text-xs' : 'text-lg'} font-black text-slate-900 uppercase tracking-tighter`}>
                {t.quarter} {qIdx + 1}
              </h2>
              <div className="h-px flex-grow bg-slate-200" />
            </div>

            <div className="flex flex-col min-w-[1200px]">
              {/* Horizontal Month Headers Row */}
              {!isBirdEye && (
                <div className="grid grid-cols-13 gap-1 mb-1 px-1">
                  {monthSpans.map((m, idx) => (
                    <div 
                      key={`${m.name}-${idx}`} 
                      className="text-center border-b-2 border-slate-100 pb-1"
                      style={{ gridColumn: `span ${m.span}` }}
                    >
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {m.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Weeks Grid */}
              <div className="grid grid-cols-13 gap-1 relative pr-4">
                {quarter.weeks.map((week) => {
                  const isReset = week.type === 'reset';
                  const isPrep = week.type === 'prep';

                  return (
                    <div 
                      key={week.id} 
                      className={`relative flex flex-col border rounded-xl overflow-visible transition-all ${
                        isReset ? 'bg-indigo-50/40 border-indigo-200 shadow-sm' : 
                        isPrep ? 'bg-amber-50/40 border-amber-200 border-dashed' : 
                        'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      {/* Week Header */}
                      <div className={`px-2 py-1.5 border-b flex items-center justify-between rounded-t-xl ${
                        isReset ? 'bg-indigo-100/50 border-indigo-100' : 
                        isPrep ? 'bg-amber-100/50 border-amber-100' : 
                        'bg-slate-50/50 border-slate-100'
                      }`}>
                        <span className={`${isBirdEye ? 'text-[8px]' : 'text-[10px]'} font-black text-slate-500 uppercase`}>
                          W{week.weekNumber}
                        </span>
                        {week.isCheckIn && !isBirdEye && (
                          <CheckCircle2 size={12} className="text-emerald-500" title={t.checkIn} />
                        )}
                        {isReset && !isBirdEye && (
                          <Flag size={12} className="text-indigo-500" title={t.resetWeek} />
                        )}
                      </div>

                      {/* Week Content */}
                      <div className={`p-1 flex flex-col gap-1 ${isBirdEye ? 'h-16' : 'h-48'}`}>
                        {/* Progress Bar */}
                        {!isReset && !isPrep && (
                          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            {[0, 1, 2, 3].map(step => (
                              <div 
                                key={step} 
                                className={`flex-1 border-r border-white/50 last:border-r-0 ${
                                  step <= week.weekInCycle ? 'bg-indigo-500' : 'bg-transparent'
                                }`} 
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex flex-col gap-0.5 overflow-y-auto no-scrollbar flex-grow">
                          {week.days.map((day, dIdx) => {
                            // Fix: Use isEventInDay to check if the current day is part of an event's duration
                            const dayEvents = filteredEvents.filter(e => isEventInDay(day, e));
                            const today = isToday(day);
                            const past = isPast(day) && !today;
                            const isWknd = isWeekend(day);

                            return (
                              <div 
                                key={day.toISOString()} 
                                onClick={() => onSelectDay(day)}
                                className={`flex flex-col gap-0.5 rounded p-0.5 cursor-pointer transition-colors ${
                                  today ? 'bg-indigo-100 ring-1 ring-indigo-200 z-10' : 
                                  isWknd ? 'bg-slate-50/80' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`${isBirdEye ? 'text-[7px]' : 'text-[9px]'} font-black ${
                                    today ? 'text-indigo-600' : isWknd ? 'text-slate-600' : 'text-slate-400'
                                  }`}>
                                    {format(day, 'd')}
                                  </span>
                                  {!isBirdEye && (
                                    <span className={`text-[7px] font-black uppercase ${
                                      today ? 'text-indigo-500' : isWknd ? 'text-slate-900' : 'text-slate-300'
                                    }`}>
                                      {format(day, 'EE').slice(0, 1)}
                                    </span>
                                  )}
                                </div>
                                
                                {dayEvents.map(event => {
                                  const cat = categoryMap[event.categoryId];
                                  if (!cat) return null;
                                  
                                  const isFirstDayOfEvent = isSameDay(parseISO(event.startDate), day);
                                  const isFirstDayOfWeek = dIdx === 0;
                                  
                                  // Intelligence: Only show the title if it's the start of the event 
                                  // or the first day of the week to show continuation.
                                  const showTitle = isFirstDayOfEvent || isFirstDayOfWeek;

                                  return (
                                    <div
                                      key={event.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditEvent(event);
                                      }}
                                      className={`rounded-sm px-1 py-0.5 ${isBirdEye ? 'h-1.5' : 'h-auto'} ${cat.bgClass} ${settings.fadePast && past ? 'opacity-40 grayscale' : ''} transition-all hover:brightness-110 active:scale-95`}
                                    >
                                      {!isBirdEye && showTitle && (
                                        <div className="flex items-center gap-1 overflow-hidden">
                                          {!isFirstDayOfEvent && <span className="text-[7px] opacity-70">...</span>}
                                          <span className="text-[8px] font-bold text-white truncate block leading-none">
                                            {event.title}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cycle/Reset Label */}
                      <div className="px-2 py-1 text-center border-t border-slate-50 bg-white rounded-b-xl">
                        <span className={`${isBirdEye ? 'text-[7px]' : 'text-[8px]'} font-black uppercase tracking-tighter text-slate-400`}>
                          {isReset ? t.resetWeek : isPrep ? t.prepWeek : `${t.cycle} ${week.cycleIndex + 1}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* Grid specific utility styles */}
      <style>{`
        .grid-cols-13 {
          grid-template-columns: repeat(13, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
};

export default React.memo(CyclicView);
