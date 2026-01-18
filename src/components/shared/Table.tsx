/**
 * Table Component
 * Modern reusable data table with sorting, selection, and glass morphism styling
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, ArrowUp, ArrowDown, ArrowUpDown, Inbox } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export interface Column<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  onRowClick?: (row: T, index: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  loading?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  hover?: boolean;
  striped?: boolean;
  bordered?: boolean;
  className?: string;
}

export function Table<T extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  onRowClick,
  onSort,
  sortKey,
  sortDirection: _sortDirection,
  loading = false,
  emptyMessage = 'No data available',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  hover = true,
  striped = true,
  bordered = false,
  className = '',
}: TableProps<T>) {
  const [localSortKey, setLocalSortKey] = React.useState<string | undefined>(sortKey);
  const [localSortDirection, setLocalSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    const newDirection = localSortKey === key && localSortDirection === 'asc' ? 'desc' : 'asc';
    setLocalSortKey(key);
    setLocalSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const allIds = data.map((row) => String(row[keyField]));
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedRows, id]);
    } else {
      onSelectionChange(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl',
      'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm',
      'shadow-soft',
      bordered && 'border border-slate-200/60 dark:border-slate-700/60',
      className
    )}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-700/60">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/50">
              {selectable && (
                <th className="px-6 py-4 text-left w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(el: HTMLButtonElement | null) => {
                      if (el) {
                        const input = el.querySelector('input');
                        if (input) input.indeterminate = someSelected;
                      }
                    }}
                    className="border-slate-300 dark:border-slate-600"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-4 text-xs font-semibold uppercase tracking-wider',
                    'text-slate-500 dark:text-slate-400',
                    column.sortable && 'cursor-pointer select-none hover:text-primary transition-colors',
                    alignClasses[column.align || 'left']
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={cn(
                    'flex items-center gap-2',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}>
                    {column.header}
                    {column.sortable && (
                      <span className="text-slate-400 dark:text-slate-500">
                        {localSortKey === column.key ? (
                          localSortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                      <Inbox className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const rowId = String(row[keyField]);
                const isSelected = selectedRows.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'transition-colors duration-150',
                      hover && 'hover:bg-primary/5 dark:hover:bg-primary/10',
                      striped && rowIndex % 2 === 1 && 'bg-slate-50/50 dark:bg-slate-800/30',
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-primary/10 dark:bg-primary/20'
                    )}
                    onClick={() => onRowClick?.(row, rowIndex)}
                  >
                    {selectable && (
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(rowId, checked as boolean)}
                          className="border-slate-300 dark:border-slate-600"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-6 py-4 whitespace-nowrap text-sm',
                          'text-slate-700 dark:text-slate-300',
                          alignClasses[column.align || 'left']
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key], row, rowIndex)
                          : (row[column.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
