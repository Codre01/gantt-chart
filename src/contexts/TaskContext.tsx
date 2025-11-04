'use client';

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Project, Task, Filters } from '@/types';
import { initialProjects, initialTasks } from '@/data/initialData';

// State interface
export interface TaskState {
  projects: Project[];
  tasks: Task[];
  selectedProjectId: string | null;
  filters: Filters;
  timelineView: 'day' | 'week' | 'month';
}

// Action types
type TaskAction =
  | { type: 'SELECT_PROJECT'; payload: string | null }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<Filters> }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_TIMELINE_VIEW'; payload: 'day' | 'week' | 'month' };

// Initial state
const initialState: TaskState = {
  projects: initialProjects,
  tasks: initialTasks,
  selectedProjectId: null,
  filters: {
    status: [],
    assignee: [],
    searchText: '',
  },
  timelineView: 'day',
};

// Reducer function
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SELECT_PROJECT':
      return {
        ...state,
        selectedProjectId: action.payload,
      };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks
          .filter((task) => task.id !== action.payload)
          .map((task) =>
            task.dependencyId === action.payload
              ? { ...task, dependencyId: undefined }
              : task
          ),
      };

    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case 'SET_SEARCH':
      return {
        ...state,
        filters: {
          ...state.filters,
          searchText: action.payload,
        },
      };

    case 'SET_TIMELINE_VIEW':
      return {
        ...state,
        timelineView: action.payload,
      };

    default:
      return state;
  }
}

// Context types
interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
}

// Create context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

// Utility functions for filtering and searching

/**
 * Filters tasks by status
 * @param tasks - Array of tasks to filter
 * @param statusFilters - Array of status values to filter by
 * @returns Filtered tasks matching any of the specified statuses
 */
function filterByStatus(tasks: Task[], statusFilters: string[]): Task[] {
  if (statusFilters.length === 0) {
    return tasks;
  }
  return tasks.filter((task) => statusFilters.includes(task.status));
}

/**
 * Filters tasks by assignee
 * @param tasks - Array of tasks to filter
 * @param assigneeFilters - Array of assignee names to filter by
 * @returns Filtered tasks matching any of the specified assignees
 */
function filterByAssignee(tasks: Task[], assigneeFilters: string[]): Task[] {
  if (assigneeFilters.length === 0) {
    return tasks;
  }
  return tasks.filter((task) => assigneeFilters.includes(task.assignee));
}

/**
 * Searches tasks by title (case-insensitive)
 * @param tasks - Array of tasks to search
 * @param searchText - Search query string
 * @returns Tasks with titles containing the search text
 */
function searchByTitle(tasks: Task[], searchText: string): Task[] {
  if (!searchText.trim()) {
    return tasks;
  }
  const lowerSearchText = searchText.toLowerCase();
  return tasks.filter((task) =>
    task.title.toLowerCase().includes(lowerSearchText)
  );
}

/**
 * Applies all filters and search to tasks
 * @param tasks - Array of tasks to filter
 * @param filters - Filter criteria including status, assignee, and search text
 * @returns Filtered and searched tasks
 */
function getFilteredTasks(tasks: Task[], filters: Filters): Task[] {
  let filteredTasks = tasks;
  
  // Apply status filter
  filteredTasks = filterByStatus(filteredTasks, filters.status);
  
  // Apply assignee filter
  filteredTasks = filterByAssignee(filteredTasks, filters.assignee);
  
  // Apply search
  filteredTasks = searchByTitle(filteredTasks, filters.searchText);
  
  return filteredTasks;
}

// Custom hook to access state
export function useTaskState() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskState must be used within a TaskProvider');
  }
  return context.state;
}

// Custom hook to access filtered tasks
export function useFilteredTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useFilteredTasks must be used within a TaskProvider');
  }
  
  const { state } = context;
  
  // Get tasks for selected project
  const projectTasks = state.selectedProjectId
    ? state.tasks.filter((task) => task.projectId === state.selectedProjectId)
    : state.tasks;
  
  // Apply filters and search
  return getFilteredTasks(projectTasks, state.filters);
}

// Custom hook to access actions
export function useTaskActions() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskActions must be used within a TaskProvider');
  }

  const { dispatch } = context;

  return {
    selectProject: (projectId: string | null) =>
      dispatch({ type: 'SELECT_PROJECT', payload: projectId }),
    
    addTask: (task: Task) =>
      dispatch({ type: 'ADD_TASK', payload: task }),
    
    updateTask: (task: Task) =>
      dispatch({ type: 'UPDATE_TASK', payload: task }),
    
    deleteTask: (taskId: string) =>
      dispatch({ type: 'DELETE_TASK', payload: taskId }),
    
    setFilter: (filters: Partial<Filters>) =>
      dispatch({ type: 'SET_FILTER', payload: filters }),
    
    setSearch: (searchText: string) =>
      dispatch({ type: 'SET_SEARCH', payload: searchText }),
    
    setTimelineView: (view: 'day' | 'week' | 'month') =>
      dispatch({ type: 'SET_TIMELINE_VIEW', payload: view }),
  };
}
