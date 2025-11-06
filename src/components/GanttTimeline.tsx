'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Task } from '@/types';
import {
  calculateTimelineRange,
  generateDateRange,
  generateWeekRange,
  formatTimelineDate,
  differenceInDays,
  calculateTodayPosition,
  generateMonthRange,
} from '@/lib/timelineUtils';
import { TaskBar } from './TaskBar';

interface GanttTimelineProps {
  tasks: Task[];
  timelineView: 'day' | 'week' | 'month';
  onTaskSelect?: (taskId: string) => void;
}

interface TimelineHeaderProps {
  startDate: Date;
  endDate: Date;
  timelineView: 'day' | 'week' | 'month';
  pixelsPerDay: number;
}

/**
 * TimelineHeader sub-component that renders the date axis
 */
function TimelineHeader({ startDate, endDate, timelineView, pixelsPerDay }: TimelineHeaderProps) {
  if (timelineView === 'day') {
    const dates = generateDateRange(startDate, endDate);
    return (
      <div className="flex border-b border-border/60 bg-muted/50">
        {dates.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`shrink-0 border-r border-border/40 px-3 py-3.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${isToday ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`}
              style={{ width: `${pixelsPerDay}px` }}
            >
              <div className="leading-tight">{formatTimelineDate(date, 'day')}</div>
            </div>
          );
        })}
      </div>
    );
  } else if (timelineView === 'week') {
    const weeks = generateWeekRange(startDate, endDate);
    const pixelsPerWeek = pixelsPerDay * 7;

    return (
      <div className="flex border-b border-border/60 bg-muted/50">
        {weeks.map((weekStart, index) => {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);

          return (
            <div
              key={index}
              className="border-r border-border/40 px-3 py-3.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
              style={{ width: `${pixelsPerWeek}px` }}
            >
              <div className="leading-tight">{formatTimelineDate(weekStart, 'week')}</div>
              <div className="text-[9px] opacity-60 mt-1">
                {formatTimelineDate(weekEnd, 'week')}
              </div>
            </div>
          );
        })}
      </div>
    );
  } else {
    const months = generateMonthRange(startDate, endDate);
    const pixelsPerMonth = pixelsPerDay * 30;

    return (
      <div className="flex border-b border-border/60 bg-muted/50">
        {months.map((monthStart, index) => {
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setDate(monthEnd.getDate() - 1);

          return (
            <div
              key={index}
              className="shrink-0 border-r border-border/40 px-3 py-3.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
              style={{ width: `${pixelsPerMonth}px` }}
            >
              <div className="leading-tight">{formatTimelineDate(monthStart, 'week')}</div>
              <div className="text-[9px] opacity-60 mt-1">
                {formatTimelineDate(monthEnd, 'week')}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

/**
 * GanttTimeline component - Main timeline visualization
 * 
 * This component renders an interactive Gantt chart with:
 * - Horizontal scrolling timeline with date axis
 * - Task bars positioned based on start/end dates
 * - Today marker showing current date
 * - Full keyboard navigation support
 * - ARIA labels for accessibility
 * 
 * Keyboard Navigation:
 * - Arrow Up/Down: Navigate between tasks
 * - Enter: Open selected task for editing
 * - Home/End: Jump to first/last task
 * - Tab: Focus individual task bars
 */
export function GanttTimeline({ tasks, timelineView, onTaskSelect }: GanttTimelineProps) {
  // State for managing focused task index for keyboard navigation
  // -1 means no task is focused via keyboard
  const [focusedTaskIndex, setFocusedTaskIndex] = useState<number>(-1);

  // Ref for the timeline container to manage focus
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate timeline range from task dates (with padding)
  const timelineRange = calculateTimelineRange(tasks);

  // Define pixels per day based on view mode
  // Day view: 40px per day for detailed view
  // Week view: ~11.43px per day (80px per week / 7 days) for broader view
  const pixelsPerDay = timelineView === 'day' ? 40 : 80 / 7;

  /**
   * Handle keyboard navigation within the timeline
   * Supports arrow keys, Enter, Home, and End keys
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (tasks.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        // Move focus to next task (down in the list)
        e.preventDefault();
        setFocusedTaskIndex((prev) => {
          const nextIndex = prev < tasks.length - 1 ? prev + 1 : prev;
          return nextIndex;
        });
        break;

      case 'ArrowUp':
        // Move focus to previous task (up in the list)
        e.preventDefault();
        setFocusedTaskIndex((prev) => {
          const nextIndex = prev > 0 ? prev - 1 : prev;
          return nextIndex;
        });
        break;

      case 'Enter':
        // Open the focused task for editing
        if (focusedTaskIndex >= 0 && focusedTaskIndex < tasks.length) {
          e.preventDefault();
          const task = tasks[focusedTaskIndex];
          if (onTaskSelect) {
            onTaskSelect(task.id);
          }
        }
        break;

      case 'Home':
        // Jump to first task
        e.preventDefault();
        setFocusedTaskIndex(0);
        break;

      case 'End':
        // Jump to last task
        e.preventDefault();
        setFocusedTaskIndex(tasks.length - 1);
        break;
    }
  };

  useEffect(() => {
    if (focusedTaskIndex >= 0 && timelineRef.current) {
      const taskElement = timelineRef.current.querySelector(
        `[data-task-index="${focusedTaskIndex}"]`
      ) as HTMLElement;

      if (taskElement) {
        taskElement.focus();
      }
    }
  }, [focusedTaskIndex]);

  if (!timelineRange) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/30 p-20"
        role="region"
        aria-label="Gantt timeline"
      >
        <p className="text-sm font-medium text-muted-foreground">No tasks to display. Create a task to get started.</p>
      </div>
    );
  }

  let { start: startDate, end: endDate } = timelineRange;

  // Extend end date to today if it's less than today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (endDate < today) {
    endDate = today;
  }

  // Calculate total width based on actual date range
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const totalWidth = totalDays * pixelsPerDay;

  // Check if today is within the timeline range
  const isTodayInRange = today >= startDate && today <= endDate;
  const todayPosition = isTodayInRange ? calculateTodayPosition(startDate, pixelsPerDay) : 0;

  return (
    <div
      ref={timelineRef}
      className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm"
      role="region"
      aria-label="Gantt timeline"
      onKeyDown={handleKeyDown}
    >
      <div className="overflow-x-auto scrollbar-minimal">
        <div style={{ width: `${totalWidth}px` }}>
          <TimelineHeader
            startDate={startDate}
            endDate={endDate}
            timelineView={timelineView}
            pixelsPerDay={pixelsPerDay}
          />

          <div className="relative min-h-[350px] bg-background p-6" role="list" aria-label="Project tasks">
            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: totalDays }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-border/30"
                  style={{ left: `${i * pixelsPerDay}px` }}
                />
              ))}
            </div>

            {/* Today Marker */}
            {isTodayInRange && (
              <div
                className="absolute top-0 bottom-0 z-10 w-[1.5px] bg-destructive"
                style={{ left: `${todayPosition}px` }}
                aria-label="Today marker"
              >
                <div className="absolute -top-0.5 -left-6 rounded bg-destructive px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-destructive-foreground shadow-sm">
                  Today
                </div>
              </div>
            )}

            {/* Task bars */}
            {tasks.map((task, index) => (
              <div
                key={task.id}
                style={{ top: `${index * 56}px` }}
                className="absolute transition-all duration-200"
              >
                <TaskBar
                  task={task}
                  timelineStart={startDate}
                  pixelsPerDay={pixelsPerDay}
                  onSelect={onTaskSelect}
                  isSelected={focusedTaskIndex === index}
                  taskIndex={index}
                />
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
