
import { 
  startOfMonth, 
  getDay, 
  getDaysInMonth, 
  format, 
  isWeekend, 
  isSameDay, 
  isWithinInterval, 
  parseISO,
  differenceInDays,
  startOfDay,
  endOfDay,
  startOfISOWeek,
  addWeeks,
  getYear,
  eachDayOfInterval,
  addDays
} from 'date-fns';
import { CalendarEvent } from '../types';

/**
 * Returns the 0-indexed day of the week (0=Mon, 6=Sun)
 */
export const getDayOfWeekIndex = (date: Date): number => {
  const day = getDay(date);
  return day === 0 ? 6 : day - 1; // Convert Sun=0..Sat=6 to Mon=0..Sun=6
};

export const getMonthDays = (year: number, month: number) => {
  const firstDay = startOfMonth(new Date(year, month));
  const daysInMonth = getDaysInMonth(firstDay);
  const startPadding = getDayOfWeekIndex(firstDay);
  
  return {
    daysInMonth,
    startPadding,
    days: Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  };
};

export const isEventInDay = (date: Date, event: CalendarEvent): boolean => {
  const start = startOfDay(parseISO(event.startDate));
  const end = endOfDay(parseISO(event.endDate));
  const current = startOfDay(date);
  return isWithinInterval(current, { start, end });
};

export const getEventsForDay = (date: Date, events: CalendarEvent[]): CalendarEvent[] => {
  return events.filter(event => isEventInDay(date, event));
};

export const calculateBurnout = (date: Date, events: CalendarEvent[]): boolean => {
  const activeEvents = getEventsForDay(date, events);
  return activeEvents.length >= 3;
};

export const detectChains = (events: CalendarEvent[]): string[] => {
  return events
    .filter(e => {
      const start = parseISO(e.startDate);
      const end = parseISO(e.endDate);
      return differenceInDays(end, start) >= 14;
    })
    .map(e => e.id);
};

/**
 * Generates data for the 364-day Cyclic system (13 weeks per quarter)
 */
export const getCyclicYearData = (year: number) => {
  // Start on the first Monday of the year (ISO Week 1)
  let current = startOfISOWeek(new Date(year, 0, 4));
  const data = [];

  for (let q = 0; q < 4; q++) {
    const quarterWeeks = [];
    for (let w = 0; w < 13; w++) {
      const weekStart = current;
      const weekEnd = addDays(current, 6);
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const type = w === 12 ? 'reset' : 'standard';
      const cycleIndex = Math.floor(w / 4);
      const weekInCycle = w % 4; // 0, 1, 2, 3

      quarterWeeks.push({
        id: `w-${q}-${w}`,
        weekNumber: q * 13 + w + 1,
        days,
        type,
        cycleIndex: type === 'reset' ? -1 : cycleIndex,
        weekInCycle: type === 'reset' ? -1 : weekInCycle,
        isCheckIn: weekInCycle === 1 || weekInCycle === 3 // End of 2nd and 4th weeks
      });
      current = addWeeks(current, 1);
    }
    data.push({ id: `q-${q}`, quarterIndex: q, weeks: quarterWeeks });
  }

  // Handle Prep Week (Week 53) if applicable
  const nextYearStart = startOfISOWeek(new Date(year + 1, 0, 4));
  if (differenceInDays(nextYearStart, current) >= 7) {
    data[3].weeks.push({
      id: `w-prep`,
      weekNumber: 53,
      days: eachDayOfInterval({ start: current, end: addDays(current, 6) }),
      type: 'prep',
      cycleIndex: -1,
      weekInCycle: -1,
      isCheckIn: false
    });
  }

  return data;
};
