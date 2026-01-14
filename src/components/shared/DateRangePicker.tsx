/**
 * DateRangePicker Component
 * Date range selector for filtering
 */

import React from 'react';
import { Input } from './Input';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  label,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  minDate,
  maxDate,
  className = '',
}) => {
  return (
    <div className={`date-range-picker ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          type="date"
          label={startLabel}
          value={value.startDate}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          min={minDate}
          max={value.endDate || maxDate}
        />
        <Input
          type="date"
          label={endLabel}
          value={value.endDate}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          min={value.startDate || minDate}
          max={maxDate}
        />
      </div>
    </div>
  );
};
