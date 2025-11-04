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
      <div className="flex border-b border-border bg-muted/30 backdrop-blur-sm">
        {dates.map((date, index) => {
          const isToday = 
            date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`flex-shrink-0 border-r border-border/50 px-3 py-3 text-[11px] font-medium transition-colors ${
                isToday ? 'bg-primary/5 text-primary' : 'text-muted-foreground'
              }`}
              style={{ width: `${pixelsPerDay}px` }}
            >
              <div className="leading-tight">{formatTimelineDate(date, 'day')}</div>
            </div>
          );
        })}
      </div>
    );
  } else if(timelineView === 'week') {
    // Week view
    const weeks = generateWeekRange(startDate, endDate);
    const pixelsPerWeek = pixelsPerDay * 7;
    
    return (
      <div className="flex border-b border-border bg-muted/30 backdrop-blur-sm">
        {weeks.map((weekStart, index) => {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          return (
            <div
              key={index}
              className="flex-shrink-0 border-r border-border/50 px-3 py-3 text-[11px] font-medium text-muted-foreground"
              style={{ width: `${pixelsPerWeek}px` }}
            >
              <div className="leading-tight">{formatTimelineDate(weekStart, 'week')}</div>
              <div className="text-[10px] opacity-60 mt-0.5">
                {formatTimelineDate(weekEnd, 'week')}
              </div>
            </div>
          );
        })}
      </div>
    );
  } else {
    // Month view
    const months = generateMonthRange(startDate, endDate);
    const pixelsPerMonth = pixelsPerDay * 30;

    return (
      <div className="flex border-b border-border bg-muted/30 backdrop-blur-sm">
        {months.map((monthStart, index) => {
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setDate(monthEnd.getDate() - 1);

          return (
            <div
              key={index}
              className="flex-shrink-0 border-r border-border/50 px-3 py-3 text-[11px] font-medium text-muted-foreground"
              style={{ width: `${pixelsPerMonth}px` }}
            >
              <div className="leading-tight">{formatTimelineDate(monthStart, 'week')}</div>
              <div className="text-[10px] opacity-60 mt-0.5">
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
  
  /**
   * Focus management effect
   * When focusedTaskIndex changes, programmatically focus the corresponding task bar element
   * This ensures keyboard navigation provides visual feedback and screen reader announcements
   */
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
  
  // If no tasks, show empty state
  if (!timelineRange) {
    return (
      <div 
        className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-16"
        role="region"
        aria-label="Gantt timeline"
      >
        <p className="text-sm text-muted-foreground">No tasks to display. Create a task to get started.</p>
      </div>
    );
  }
  
  const { start: startDate, end: endDate } = timelineRange;
  
  // Calculate total width based on actual date range
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const totalWidth = totalDays * pixelsPerDay;
  
  // Calculate today's position
  const todayPosition = calculateTodayPosition(startDate, pixelsPerDay);
  
  return (
    <div 
      ref={timelineRef}
      className="rounded-lg border border-border bg-card shadow-sm overflow-hidden"
      role="region"
      aria-label="Gantt timeline"
      onKeyDown={handleKeyDown}
    >
      {/* Horizontal scrolling container */}
      <div className="overflow-x-auto scrollbar-thin">
        <div className='max-w-fit min-w-full'>
          {/* Timeline Header */}
          <TimelineHeader
            startDate={startDate}
            endDate={endDate}
            timelineView={timelineView}
            pixelsPerDay={pixelsPerDay}
          />
          
          {/* Task bars container */}
          <div className="relative min-h-[240px] p-6 bg-gradient-to-b from-background/50 to-background" role="list" aria-label="Project tasks">
            {/* Grid lines for visual guidance */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: totalDays }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-border/20"
                  style={{ left: `${i * pixelsPerDay}px` }}
                />
              ))}
            </div>
            
            {/* Today Marker */}
            <div
              className="absolute top-0 bottom-0 z-10 w-[2px] bg-gradient-to-b from-destructive/80 to-destructive shadow-sm"
              style={{ left: `${todayPosition}px` }}
              aria-label="Today marker"
            >
              <div className="absolute -top-1 -left-7 rounded-sm bg-destructive px-2.5 py-1 text-[10px] font-semibold text-destructive-foreground shadow-md uppercase tracking-wide">
                Today
              </div>
            </div>
            
            {/* Render task bars */}
            {tasks.map((task, index) => (
              <div
                key={task.id}
                style={{ top: `${index * 52}px` }}
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
