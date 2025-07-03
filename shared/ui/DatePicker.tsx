'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';
import { Calendar } from '@/shared/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover';


type DatePickerProps = {
  field: any;
}

export function DatePicker({field}: DatePickerProps) {
  const [date, setDate] = useState<Date>(field.value ?? null);
  const handleDateChange = (date: Date) => {
    setDate(date);
    field.onChange(date);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-auto justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar selected={date} setSelected={handleDateChange} />
      </PopoverContent>
    </Popover>
  );
}
