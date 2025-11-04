'use client';

import { Calendar, CalendarDays } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface ZoomControlProps {
  currentView: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
}

export function ZoomControl({ currentView, onViewChange }: ZoomControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Timeline View:
      </span>
      <ToggleGroup
        type="single"
        value={currentView}
        onValueChange={(value) => {
          if (value === 'day' || value === 'week' || value === 'month') {
            onViewChange(value);
          }
        }}
        aria-label="Select timeline view"
      >
        <ToggleGroupItem
          value="day"
          aria-label="Day view"
          className="gap-2"
        >
          <Calendar className="size-4" />
          Day
        </ToggleGroupItem>
        <ToggleGroupItem
          value="week"
          aria-label="Week view"
          className="gap-2"
        >
          <CalendarDays className="size-4" />
          Week
        </ToggleGroupItem>
        <ToggleGroupItem
          value="month"
          aria-label="Month view"
          className="gap-2"
        >
          <CalendarDays className="size-4" />
          Month
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
