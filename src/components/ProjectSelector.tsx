'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Project } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onSelectProject,
}: ProjectSelectorProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const projectRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Set initial focused index when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const index = projects.findIndex((p) => p.id === selectedProjectId);
      if (index !== -1) {
        setFocusedIndex(index);
      }
    }
  }, [selectedProjectId, projects]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = index < projects.length - 1 ? index + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = index > 0 ? index - 1 : projects.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = projects.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelectProject(projects[index].id);
        return;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    projectRefs.current[newIndex]?.focus();
  };

  const handleClick = (projectId: string, index: number) => {
    setFocusedIndex(index);
    onSelectProject(projectId);
  };

  return (
    <div
      role="region"
      aria-label="Project selector"
      className="w-full"
    >
      <h2 className="text-sm font-medium mb-4 text-muted-foreground tracking-wide uppercase">Projects</h2>
      <div
        role="list"
        aria-label="Available projects"
        className="flex flex-wrap gap-2"
      >
        {projects.map((project, index) => {
          const isSelected = project.id === selectedProjectId;
          
          return (
            <button
              key={project.id}
              ref={(el) => {
                projectRefs.current[index] = el;
              }}
              role="listitem"
              type="button"
              onClick={() => handleClick(project.id, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-label={`${project.name}${project.description ? `: ${project.description}` : ''}`}
              aria-pressed={isSelected}
              tabIndex={index === 0 && focusedIndex === -1 ? 0 : focusedIndex === index ? 0 : -1}
              className={cn(
                'group relative px-5 py-2.5 transition-all rounded-lg duration-300',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                isSelected
                  ? 'bg-primary/90 text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent hover:shadow-sm border border-primary/80'
              )}
            >
              <div className="text-left">
                <div className="font-medium text-[15px] leading-tight">{project.name}</div>
                {project.description && (
                  <div className="text-xs mt-1 opacity-70">
                    {project.description}
                  </div>
                )}
              </div>
              {isSelected && (
                <div className="absolute inset-0 rounded-lg ring-1 ring-primary/20 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
      {projects.length === 0 && (
        <p className="text-muted-foreground text-sm">No projects available</p>
      )}
    </div>
  );
}
