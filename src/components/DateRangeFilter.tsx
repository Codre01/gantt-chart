'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRangePreset, DateRange } from '@/contexts/TaskContext';

interface DateRangeFilterProps {
  currentPreset: DateRangePreset;
  currentDateRange: DateRange;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomDateChange: (startDate: Date, endDate: Date) => void;
}

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'this-month', label: 'This Month' },
  { value: 'next-month', label: 'Next Month' },
  { value: 'this-quarter', label: 'This Quarter' },
  { value: 'next-quarter', label: 'Next Quarter' },
  { value: 'this-year', label: 'This Year' },
  { value: 'next-year', label: 'Next Year' },
  { value: 'custom', label: 'Custom Range' },
];

/**
 * DateRangeFilter component
 * Allows users to select a date range preset or custom dates to filter the timeline
 */
export function DateRangeFilter({ 
  currentPreset, 
  currentDateRange,
  onPresetChange,
  onCustomDateChange 
}: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handlePresetChange = (value: DateRangePreset) => {
    if (value !== 'custom') {
      onPresetChange(value);
    } else {
      onPresetChange(value);
    }
  };

  const handleApplyCustomDates = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (endDate <= startDate) {
      toast.error('End date must be greater than start date');
      return;
    }

    // Apply custom date range
    onCustomDateChange(startDate, endDate);
    toast.success('Custom date range applied successfully');
  };

  return (
    <div className="min-w-[200px]">
      <Label htmlFor="date-range-select" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
        Date Range
      </Label>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-[15px] text-muted-foreground/60" />
          <Select value={currentPreset} onValueChange={handlePresetChange}>
            <SelectTrigger id="date-range-select" aria-label="Select date range" className="h-9 text-sm">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom date pickers - shown when custom is selected */}
        {currentPreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 ml-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-9 text-sm justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 size-[15px]" />
                  {startDate ? format(startDate, 'PPP') : 'Pick start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  captionLayout={'dropdown'}
                  fromYear={currentDateRange.start ? currentDateRange.start.getFullYear() - 5 : undefined}
                  toYear={endDate ? endDate.getFullYear()  : undefined}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <span className="text-sm text-muted-foreground">to</span>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-9 text-sm justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 size-[15px]" />
                  {endDate ? format(endDate, 'PPP') : 'Pick end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  captionLayout={'dropdown'}
                  fromYear={startDate ? startDate.getFullYear() - 15 : undefined}
                  toYear={startDate ? startDate.getFullYear() + 20 : undefined}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : false}
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={handleApplyCustomDates}
              size="sm"
              variant="default"
              className="h-9 text-sm font-medium"
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
