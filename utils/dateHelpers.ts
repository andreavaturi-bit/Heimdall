
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
  endOfDay
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
  // Simple heuristic: events longer than 14 days without a break
  return events
    .filter(e => {
      const start = parseISO(e.startDate);
      const end = parseISO(e.endDate);
      return differenceInDays(end, start) >= 14;
    })
    .map(e => e.id);
};
