'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';
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
import { useTaskState, useTaskActions } from '@/contexts/TaskContext';
import type { TaskStatus } from '@/types';

// Status options with display labels
const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
];

export function FilterControls() {
  const state = useTaskState();
  const { setFilter, setSearch } = useTaskActions();
  
  // Local state for search input (for debouncing)
  // We maintain a separate local state to avoid triggering filter updates on every keystroke
  const [searchInput, setSearchInput] = useState(state.filters.searchText);
  
  /**
   * Get unique assignees from all tasks
   * Memoized to avoid recalculating on every render
   */
  const availableAssignees = React.useMemo(() => {
    const assignees = new Set(state.tasks.map((task) => task.assignee));
    return Array.from(assignees).sort();
  }, [state.tasks]);

  /**
   * Debounce search input effect
   * 
   * Delays the actual search filter update by 300ms after the user stops typing.
   * This improves performance by reducing the number of filter operations and
   * provides a better user experience by not filtering on every keystroke.
   * 
   * The cleanup function clears the timeout if the component unmounts or
   * if searchInput changes before the timeout completes.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  // Handle status filter toggle
  const handleStatusToggle = useCallback(
    (status: string) => {
      const currentStatuses = state.filters.status;
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status];
      
      setFilter({ status: newStatuses });
    },
    [state.filters.status, setFilter]
  );

  // Handle assignee filter toggle
  const handleAssigneeToggle = useCallback(
    (assignee: string) => {
      const currentAssignees = state.filters.assignee;
      const newAssignees = currentAssignees.includes(assignee)
        ? currentAssignees.filter((a) => a !== assignee)
        : [...currentAssignees, assignee];
      
      setFilter({ assignee: newAssignees });
    },
    [state.filters.assignee, setFilter]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilter({ status: [], assignee: [] });
    setSearchInput('');
    setSearch('');
  }, [setFilter, setSearch]);

  // Check if any filters are active
  const hasActiveFilters =
    state.filters.status.length > 0 ||
    state.filters.assignee.length > 0 ||
    state.filters.searchText.length > 0;

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white border-b">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="search-input" className="text-sm font-medium">
          Search Tasks
        </Label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="search-input"
            type="text"
            placeholder="Search by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
            aria-label="Search tasks by title"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="min-w-[180px]">
        <Label htmlFor="status-filter" className="text-sm font-medium">
          Filter by Status
        </Label>
        <div className="mt-1.5 space-y-2">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => {
              const isSelected = state.filters.status.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusToggle(option.value)}
                  className={`
                    px-3 py-1.5 text-sm rounded-md border transition-colors
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400
                    ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent hover:text-accent-foreground border-input'
                    }
                  `}
                  aria-pressed={isSelected}
                  aria-label={`Filter by ${option.label}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assignee Filter */}
      <div className="min-w-[180px]">
        <Label htmlFor="assignee-filter" className="text-sm font-medium">
          Filter by Assignee
        </Label>
        <div className="mt-1.5">
          <Select
            value={state.filters.assignee[0] || ''}
            onValueChange={(value) => {
              if (value) {
                handleAssigneeToggle(value);
              }
            }}
          >
            <SelectTrigger id="assignee-filter" aria-label="Filter by assignee">
              <SelectValue placeholder="Select assignee..." />
            </SelectTrigger>
            <SelectContent>
              {availableAssignees.map((assignee) => (
                <SelectItem key={assignee} value={assignee}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Selected assignees */}
          {state.filters.assignee.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {state.filters.assignee.map((assignee) => (
                <span
                  key={assignee}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary text-primary-foreground"
                >
                  {assignee}
                  <button
                    type="button"
                    onClick={() => handleAssigneeToggle(assignee)}
                    className="hover:bg-primary/80 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400"
                    aria-label={`Remove ${assignee} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleClearFilters}
            className="h-9"
            aria-label="Clear all filters"
          >
            <X className="size-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
