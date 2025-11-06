'use client';

import React from 'react';
import { Clock, PlayCircle, CheckCircle, AlertCircle } from 'lucide-react';
import type { Task, TaskStatus } from '@/types';
import { calculateTaskPosition } from '@/lib/timelineUtils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface TaskBarProps {
  task: Task;
  timelineStart: Date;
  pixelsPerDay: number;
  onSelect?: (taskId: string) => void;
  isSelected?: boolean;
  taskIndex?: number;
}

/**
 * Format date for display in tooltip
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format status for display
 */
function formatStatus(status: TaskStatus): string {
  return status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * TaskTooltip component - Displays task details in a tooltip
 */
interface TaskTooltipProps {
  task: Task;
}

function TaskTooltip({ task }: TaskTooltipProps) {
  return (
    <div className="space-y-1">
      <div className="font-semibold">{task.title}</div>
      <div className="text-xs">
        <div>
          {formatDate(task.startDate)} - {formatDate(task.endDate)}
        </div>
        <div>Status: {formatStatus(task.status)}</div>
        <div>Assignee: {task.assignee}</div>
      </div>
    </div>
  );
}

function getStatusConfig(status: TaskStatus) {
  switch (status) {
    case 'not-started':
      return {
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
        borderStyle: 'border-dashed',
        textColor: 'text-gray-700 dark:text-gray-400',
        icon: Clock,
      };
    case 'in-progress':
      return {
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-600/20',
        borderStyle: 'border-solid',
        textColor: 'text-blue-700 dark:text-blue-400',
        icon: PlayCircle,
      };
    case 'completed':
      return {
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        borderStyle: 'border-solid',
        textColor: 'text-green-700 dark:text-green-400',
        icon: CheckCircle,
      };
    case 'blocked':
      return {
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        borderStyle: 'border-solid',
        textColor: 'text-red-700 dark:text-red-400 ',
        icon: AlertCircle,
        pattern: 'blocked-stripes',
      };
    default:
      return {
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
        borderStyle: 'border-dashed',
        textColor: 'text-gray-700 dark:text-gray-400',
        icon: Clock,
      };
  }
}

/**
 * TaskBar component - Individual task visualization within the Gantt timeline
 * Renders as an absolutely positioned div with calculated position and width
 */
export function TaskBar({
  task,
  timelineStart,
  pixelsPerDay,
  onSelect,
  isSelected = false,
  taskIndex,
}: TaskBarProps) {
  // Calculate position and width based on task dates
  const { left, width } = calculateTaskPosition(task, timelineStart, pixelsPerDay);

  // Get status-based styling
  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  // Handle click/selection
  const handleClick = () => {
    if (onSelect) {
      onSelect(task.id);
    }
  };

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onSelect) {
        onSelect(task.id);
      }
    }
  };

  // Generate unique ID for aria-describedby
  const descriptionId = `task-${task.id}-description`;
  
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`group absolute h-11 cursor-pointer rounded-md border-2 px-3 py-2 text-xs font-medium transition-all hover:shadow-lg hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              statusConfig.bgColor
            } ${statusConfig.borderColor} ${statusConfig.borderStyle} ${statusConfig.textColor} ${
              isSelected ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : ''
            } ${statusConfig.pattern === 'blocked-stripes' ? 'relative overflow-hidden' : ''}`}
            style={{
              left: `${left}px`,
              width: `${width}px`,
              minWidth: '48px',
            }}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="listitem"
            aria-label={task.title}
            aria-describedby={descriptionId}
            data-task-index={taskIndex}
          >
            {statusConfig.pattern === 'blocked-stripes' && (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 8px, currentColor 8px, currentColor 16px)',
                }}
              />
            )}
            
            <div className="relative flex items-center gap-1.5">
              <StatusIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span className="truncate font-medium">{task.title}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <TaskTooltip task={task} />
        </TooltipContent>
      </Tooltip>
      
      <div id={descriptionId} className="sr-only">
        {task.title}, {formatDate(task.startDate)} to {formatDate(task.endDate)}, Status: {formatStatus(task.status)}, Assigned to {task.assignee}
      </div>
    </>
  );
}
