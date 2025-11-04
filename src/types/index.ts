/**
 * Core data models for the Task Tracker Dashboard
 * 
 * This file defines the TypeScript interfaces and types used throughout the application
 * for type safety and IntelliSense support.
 */

/**
 * TaskStatus - Represents the current state of a task
 * 
 * - not-started: Task has not been started yet (gray color)
 * - in-progress: Task is currently being worked on (blue color)
 * - completed: Task has been finished (green color)
 * - blocked: Task is blocked by dependencies or issues (red color with stripes)
 */
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked';

/**
 * Project - Represents a project that contains multiple tasks
 * 
 * @property id - Unique identifier for the project
 * @property name - Display name of the project
 * @property description - Optional detailed description of the project
 * @property createdAt - Timestamp when the project was created
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

/**
 * Task - Represents a single task within a project
 * 
 * Tasks are displayed as horizontal bars on the Gantt timeline,
 * positioned based on their start and end dates.
 * 
 * @property id - Unique identifier for the task
 * @property projectId - ID of the project this task belongs to
 * @property title - Display title of the task
 * @property status - Current status of the task (affects visual styling)
 * @property assignee - Name of the person assigned to this task
 * @property startDate - Date when the task starts
 * @property endDate - Date when the task ends (must be >= startDate)
 * @property dependencyId - Optional ID of another task this task depends on
 * @property createdAt - Timestamp when the task was created
 * @property updatedAt - Timestamp when the task was last modified
 */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  assignee: string;
  startDate: Date;
  endDate: Date;
  dependencyId?: string; // ID of task this depends on
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Filters - Represents the current filter state for task display
 * 
 * Used to filter which tasks are visible on the Gantt timeline.
 * Multiple filters can be applied simultaneously (AND logic).
 * 
 * @property status - Array of status values to filter by (OR logic within array)
 * @property assignee - Array of assignee names to filter by (OR logic within array)
 * @property searchText - Text to search for in task titles (case-insensitive)
 */
export interface Filters {
  status: string[];
  assignee: string[];
  searchText: string;
}
