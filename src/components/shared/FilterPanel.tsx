/**
 * FilterPanel Component
 * Sidebar panel for advanced filtering
 * Fully responsive with mobile-first design
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, type SelectOption } from './Select';
import { Input } from './Input';
import { Checkbox } from './Checkbox';
import { cn } from '@/lib/utils';
import type { FilterValue } from '@/types/common.types';

export interface Filter {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text' | 'number' | 'checkbox';
  options?: SelectOption[];
  value?: FilterValue;
  placeholder?: string;
}

export interface FilterPanelProps {
  filters: Filter[];
  values: Record<string, FilterValue>;
  onChange: (id: string, value: FilterValue) => void;
  onApply: () => void;
  onClear: () => void;
  title?: string;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onChange,
  onApply,
  onClear,
  title = 'Filters',
  className = '',
}) => {
  const hasActiveFilters = Object.values(values).some((v) => v !== undefined && v !== '' && v !== null);
  
  const renderFilter = (filter: Filter) => {
    const value = values[filter.id];
    
    switch (filter.type) {
      case 'select':
        return (
          <Select
            label={filter.label}
            options={filter.options || []}
            value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
            onChange={(newValue) => onChange(filter.id, newValue || undefined)}
            placeholder={filter.placeholder}
          />
        );
      
      case 'text':
        return (
          <Input
            label={filter.label}
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(filter.id, e.target.value || undefined)}
            placeholder={filter.placeholder}
          />
        );
      
      case 'number':
        return (
          <Input
            label={filter.label}
            type="number"
            value={typeof value === 'number' ? String(value) : ''}
            onChange={(e) => onChange(filter.id, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={filter.placeholder}
          />
        );
      
      case 'date':
        return (
          <Input
            label={filter.label}
            type="date"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(filter.id, e.target.value || undefined)}
          />
        );
      
      case 'checkbox':
        return (
          <Checkbox
            label={filter.label}
            checked={typeof value === 'boolean' ? value : false}
            onCheckedChange={(checked) => onChange(filter.id, checked)}
          />
        );
      
      case 'multiselect':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium">{filter.label}</label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {filter.options?.map((option) => {
                const selectedValues = Array.isArray(value) ? value as (string | number)[] : [];
                const isChecked = selectedValues.includes(option.value);
                
                return (
                  <Checkbox
                    key={String(option.value)}
                    label={option.label}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter((v) => v !== option.value);
                      onChange(filter.id, newValues.length > 0 ? (newValues as unknown as FilterValue) : undefined);
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className={cn('bg-card border rounded-lg p-4 sm:p-6 space-y-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-sm self-start sm:self-auto"
          >
            Clear all
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.id}>{renderFilter(filter)}</div>
        ))}
      </div>
      
      <div className="pt-4 border-t">
        <Button variant="default" className="w-full" onClick={onApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
