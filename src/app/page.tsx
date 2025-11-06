'use client';

import { useState } from 'react';
import { TaskProvider, useTaskState, useTaskActions, useFilteredTasks } from '@/contexts/TaskContext';
import { TaskForm } from '@/components/TaskForm';
import { ProjectSelector } from '@/components/ProjectSelector';
import { ZoomControl } from '@/components/ZoomControl';
import { FilterControls } from '@/components/FilterControls';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { GanttTimeline } from '@/components/GanttTimeline';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from 'sonner';
import { calculateDateRangeFromPreset } from '@/lib/timelineUtils';
import type { Task } from '@/types';
import type { DateRangePreset } from '@/contexts/TaskContext';

function DashboardContent() {
  const state = useTaskState();
  const { selectProject, addTask, updateTask, deleteTask, setTimelineView, setDateRange } = useTaskActions();
  const filteredTasks = useFilteredTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Get tasks for selected project
  const projectTasks = state.selectedProjectId
    ? state.tasks.filter((task) => task.projectId === state.selectedProjectId)
    : [];

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (task: Task) => {
    if (editingTask) {
      // Edit mode - call UPDATE_TASK action
      updateTask(task);
    } else {
      // Create mode - call ADD_TASK action
      addTask(task);
    }

    // Close form after successful submission
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleFormCancel = () => {
    // Close form and reset state
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    // Call DELETE_TASK action
    deleteTask(taskId);

    // Close form after deletion
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleDateRangeChange = (preset: DateRangePreset) => {
    const dateRange = calculateDateRangeFromPreset(preset);
    setDateRange(dateRange);
  };

  const handleCustomDateChange = (startDate: Date, endDate: Date) => {
    setDateRange({
      start: startDate,
      end: endDate,
      preset: 'custom',
    });
  };

  return (
    <div className="min-h-screen bg-muted font-sans">
      <div className="mx-auto space-y-6 p-6 md:p-8">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Task Tracker Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your projects and visualize timelines</p>
          </div>
          <ThemeToggle />
        </header>

        {/* Project Selector */}
        <section className="">
          <ProjectSelector
            projects={state.projects}
            selectedProjectId={state.selectedProjectId}
            onSelectProject={selectProject}
          />
        </section>

        {/* Task Management */}
        {state.selectedProjectId && (
          <section className="space-y-4">
            <div className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-md sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Gantt Timeline
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ZoomControl
                  currentView={state.timelineView}
                  onViewChange={setTimelineView}
                />
                <Button onClick={handleCreateTask} className="shadow-sm">Create New Task</Button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="rounded-xl bg-card p-4 shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <FilterControls />
                <DateRangeFilter
                  currentPreset={state.dateRange.preset}
                  currentDateRange={state.dateRange}
                  onPresetChange={handleDateRangeChange}
                  onCustomDateChange={handleCustomDateChange}
                />
              </div>
            </div>

            {/* Gantt Timeline */}
            <div className="overflow-hidden rounded-xl bg-card shadow-md">
              <GanttTimeline
                tasks={filteredTasks}
                timelineView={state.timelineView}
                onTaskSelect={(taskId) => {
                  const task = projectTasks.find(t => t.id === taskId);
                  if (task) handleEditTask(task);
                }}
              />
            </div>
          </section>
        )}

        {/* Task Form Modal/Dialog */}
        {isFormOpen && state.selectedProjectId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-title"
          >
            <div className="m-4 w-full max-w-2xl rounded-2xl bg-card p-8 shadow-2xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <h2
                  id="task-form-title"
                  className="text-2xl font-bold text-card-foreground"
                >
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
              </div>
              <TaskForm
                task={editingTask}
                projectId={state.selectedProjectId}
                availableTasks={projectTasks}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                onDelete={handleDeleteTask}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <TaskProvider>
      <Toaster position="top-right" richColors />
      <DashboardContent />
    </TaskProvider>
  );
}
