'use client';

import React, { useState, useEffect } from 'react';
import type { Task, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  task?: Task; // undefined for create, populated for edit
  projectId: string;
  availableTasks?: Task[]; // For dependency selection
  onSubmit: (task: Task) => void;
  onCancel: () => void;
  onDelete?: (taskId: string) => void; // Optional delete handler
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
];

const ASSIGNEE_OPTIONS = [
  'Alice Johnson',
  'Bob Smith',
  'Charlie Davis',
  'Diana Martinez',
  'Eve Wilson',
  'Frank Brown',
  'Grace Lee',
  'Henry Taylor',
];

export function TaskForm({
  task,
  projectId,
  availableTasks = [],
  onSubmit,
  onCancel,
  onDelete,
}: TaskFormProps) {
  // Form state
  const [title, setTitle] = useState(task?.title || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'not-started');
  const [assignee, setAssignee] = useState(task?.assignee || '');
  const [startDate, setStartDate] = useState<Date | undefined>(task?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(task?.endDate);
  const [dependencyId, setDependencyId] = useState(task?.dependencyId || '');

  // Validation state
  const [errors, setErrors] = useState<{
    title?: string;
    status?: string;
    assignee?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const [touched, setTouched] = useState<{
    title?: boolean;
    status?: boolean;
    assignee?: boolean;
    startDate?: boolean;
    endDate?: boolean;
  }>({});

  // Update form when task prop changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setStatus(task.status);
      setAssignee(task.assignee);
      setStartDate(task.startDate);
      setEndDate(task.endDate);
      setDependencyId(task.dependencyId || '');
    }
  }, [task]);

  /**
   * Validation function - Validates all form fields
   * 
   * Validation Rules:
   * - Title: Required, cannot be empty or whitespace only
   * - Status: Required, must be one of the valid TaskStatus values
   * - Assignee: Required, must be selected from available assignees
   * - Start Date: Required, must be a valid date
   * - End Date: Required, must be a valid date and >= start date
   * 
   * @returns true if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate title - trim to check for whitespace-only input
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Validate status - ensure a status is selected
    if (!status) {
      newErrors.status = 'Please select a status';
    }

    // Validate assignee - ensure an assignee is selected
    if (!assignee) {
      newErrors.assignee = 'Please select an assignee';
    }

    // Validate start date - ensure a date is provided
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    // Validate end date - ensure a date is provided
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    // Validate date range - end date must be >= start date
    // This prevents invalid task durations and ensures logical timeline
    if (startDate && endDate) {
      if (endDate < startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Real-time validation effect
   * Validates form whenever field values change, but only for fields that have been touched
   * This provides immediate feedback without overwhelming the user on initial render
   */
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [title, status, assignee, startDate, endDate, touched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      title: true,
      status: true,
      assignee: true,
      startDate: true,
      endDate: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    const taskData: Task = {
      id: task?.id || `task-${Date.now()}`,
      projectId,
      title,
      status,
      assignee,
      startDate: startDate as Date,
      endDate: endDate as Date,
      dependencyId: dependencyId || undefined,
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Call onSubmit callback (will trigger ADD_TASK or UPDATE_TASK action)
    onSubmit(taskData);

    // Reset form state after successful submission
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setStatus('not-started');
    setAssignee('');
    setStartDate(undefined);
    setEndDate(undefined);
    setDependencyId('');
    setErrors({});
    setTouched({});
  };

  // Handle field blur to mark as touched
  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Filter out current task from dependency options (prevent self-dependency)
  const dependencyOptions = availableTasks.filter(
    (t) => t.id !== task?.id && t.projectId === projectId
  );

  // Handle delete confirmation
  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Task Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleBlur('title')}
          placeholder="Enter task title"
          aria-invalid={touched.title && errors.title ? 'true' : 'false'}
          aria-describedby={touched.title && errors.title ? 'title-error' : undefined}
        />
        {touched.title && errors.title && (
          <p id="title-error" className="text-sm text-red-500">
            {errors.title}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as TaskStatus);
              handleBlur('status');
            }}
          >
            <SelectTrigger
              id="status"
              aria-invalid={touched.status && errors.status ? 'true' : 'false'}
              aria-describedby={touched.status && errors.status ? 'status-error' : undefined}
              className='w-full'
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {touched.status && errors.status && (
            <p id="status-error" className="text-sm text-red-500">
              {errors.status}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignee">
            Assignee <span className="text-red-500">*</span>
          </Label>
          <Select
            value={assignee}
            onValueChange={(value) => {
              setAssignee(value);
              handleBlur('assignee');
            }}
          >
            <SelectTrigger
              id="assignee"
              aria-invalid={touched.assignee && errors.assignee ? 'true' : 'false'}
              aria-describedby={touched.assignee && errors.assignee ? 'assignee-error' : undefined}
              className='w-full'
            >
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNEE_OPTIONS.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {touched.assignee && errors.assignee && (
            <p id="assignee-error" className="text-sm text-red-500">
              {errors.assignee}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
                aria-invalid={touched.startDate && errors.startDate ? 'true' : 'false'}
                aria-describedby={touched.startDate && errors.startDate ? 'startDate-error' : undefined}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  handleBlur('startDate');
                }}
                fromYear={startDate ? startDate.getFullYear() - 5 : undefined}
                toYear={endDate ? endDate.getFullYear() : undefined}
                captionLayout='dropdown'
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {touched.startDate && errors.startDate && (
            <p id="startDate-error" className="text-sm text-red-500">
              {errors.startDate}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">
            End Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="endDate"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
                aria-invalid={touched.endDate && errors.endDate ? 'true' : 'false'}
                aria-describedby={touched.endDate && errors.endDate ? 'endDate-error' : undefined}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  handleBlur('endDate');
                }}
                captionLayout='dropdown'
                toYear={startDate ? startDate.getFullYear() + 5 : undefined}
                initialFocus
                disabled={(date) => startDate ? date < startDate : false}
              />
            </PopoverContent>
          </Popover>
          {touched.endDate && errors.endDate && (
            <p id="endDate-error" className="text-sm text-red-500">
              {errors.endDate}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dependency">Task Dependency (Optional)</Label>
        <Select value={dependencyId} onValueChange={setDependencyId}>
          <SelectTrigger id="dependency">
            <SelectValue placeholder="Select dependency (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">None</SelectItem>
            {dependencyOptions.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between gap-3 pt-4">
        {/* Delete button - only show when editing an existing task */}
        {task && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "<span className='font-semibold'>{task.title}</span>"? This action cannot be undone.
                  Any tasks that depend on this task will have their dependencies removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        <div className="flex gap-3 ml-auto">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </div>
    </form>
  );
}
