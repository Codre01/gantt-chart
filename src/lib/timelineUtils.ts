import type { Task } from '@/types';

/**
 * Pixels per day for day view (40px per day)
 */
export const PIXELS_PER_DAY_DAY_VIEW = 40;

/**
 * Pixels per day for week view (80px per week / 7 days)
 */
export const PIXELS_PER_DAY_WEEK_VIEW = 80 / 7;

/**
 * Calculates the date range for the timeline based on tasks
 * @param tasks - Array of tasks to calculate range from
 * @returns Object with start and end dates, or null if no tasks
 */
export function calculateTimelineRange(tasks: Task[]): { start: Date; end: Date } | null {
  if (tasks.length === 0) {
    return null;
  }

  const allDates = tasks.flatMap(t => [t.startDate, t.endDate]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  // Add padding (7 days before and after)
  const paddedStart = new Date(minDate);
  paddedStart.setDate(paddedStart.getDate() - 7);
  
  const paddedEnd = new Date(maxDate);
  paddedEnd.setDate(paddedEnd.getDate() + 7);
  
  return { start: paddedStart, end: paddedEnd };
}

/**
 * Calculates the difference in days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates
 */
export function differenceInDays(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc1 - utc2) / msPerDay);
}

/**
 * Generates an array of dates between start and end
 * @param start - Start date
 * @param end - End date
 * @returns Array of dates
 */
export function generateDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Formats a date for display in the timeline header
 * @param date - Date to format
 * @param view - Timeline view mode
 * @returns Formatted date string
 */
export function formatTimelineDate(date: Date, view: 'day' | 'week'): string {
  if (view === 'day') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    // For week view, show the week start date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Gets the start of the week for a given date (Sunday)
 * @param date - Date to get week start for
 * @returns Date representing the start of the week
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Generates an array of week start dates between start and end
 * @param start - Start date
 * @param end - End date
 * @returns Array of week start dates
 */
export function generateWeekRange(start: Date, end: Date): Date[] {
  const weeks: Date[] = [];
  const current = getWeekStart(start);
  
  while (current <= end) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  
  return weeks;
}

export function generateMonthRange(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

/**
 * Calculates the position and width of a task bar on the timeline
 * @param task - Task to calculate position for
 * @param timelineStart - Start date of the timeline
 * @param pixelsPerDay - Number of pixels per day (depends on view mode)
 * @returns Object with left offset and width in pixels
 */
export function calculateTaskPosition(
  task: Task,
  timelineStart: Date,
  pixelsPerDay: number
): { left: number; width: number } {
  const daysSinceStart = differenceInDays(task.startDate, timelineStart);
  const taskDuration = differenceInDays(task.endDate, task.startDate) + 1;
  
  return {
    left: daysSinceStart * pixelsPerDay,
    width: taskDuration * pixelsPerDay
  };
}

/**
 * Calculates the position of today's marker on the timeline
 * @param timelineStart - Start date of the timeline
 * @param pixelsPerDay - Number of pixels per day (depends on view mode)
 * @returns Left offset in pixels for today's position
 */
export function calculateTodayPosition(
  timelineStart: Date,
  pixelsPerDay: number
): number {
  const today = new Date();
  const daysSinceStart = differenceInDays(today, timelineStart);
  return daysSinceStart * pixelsPerDay;
}
