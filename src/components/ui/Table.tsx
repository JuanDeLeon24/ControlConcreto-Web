import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  className?: string;
  caption?: string;
  footer?: ReactNode;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: number[];
  };
  selection?: {
    selectedKeys: string[];
    onSelectionChange: (keys: string[]) => void;
    getRowKey: (row: T) => string;
  };
}

/**
 * Table component following El Cóndor design system
 * Supports sorting, pagination, selection, and responsive behavior
 */
export function Table<T>({
  columns,
  data,
  keyExtractor,
  striped = true,
  hoverable = true,
  bordered = true,
  compact = false,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  className = '',
  caption,
  footer,
  pagination,
  selection,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(sortBy ?? null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(sortOrder ?? 'asc');

  const handleSort = (key: string) => {
    if (!onSort) return;
    
    if (sortColumn === key) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      onSort(key);
    } else {
      setSortColumn(key);
      setSortDirection('asc');
      onSort(key);
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !onSort) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortColumn];
      const bVal = (b as Record<string, unknown>)[sortColumn];
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection, onSort]);

  const displayData = pagination ? sortedData : sortedData;

  const tableClasses = `
    w-full border-collapse
    ${bordered ? 'border border-neutral-200 dark:border-neutral-700' : ''}
    ${className}
  `;

  const thClasses = `
    px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
    bg-neutral-50 dark:bg-neutral-800
    text-neutral-500 dark:text-neutral-400
    border-b border-neutral-200 dark:border-neutral-700
    whitespace-nowrap
  `;

  const tdClasses = `
    px-4 py-3 text-sm text-neutral-900 dark:text-white
    border-b border-neutral-100 dark:border-neutral-800
    transition-colors duration-150
  `;

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <div className="animate-pulse space-y-4 p-4">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      {caption && <caption className="sr-only">{caption}</caption>}
      <table className={tableClasses} role="grid">
        <thead>
          <tr>
            {selection && (
              <th
                className={`${thClasses} w-12`}
                scope="col"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  checked={selection.selectedKeys.length === displayData.length && displayData.length > 0}
                  ref={(el) => {
                      if (el) {
                        el.indeterminate = selection.selectedKeys.length > 0 && selection.selectedKeys.length < displayData.length;
                      }
                    }}
                  onChange={(e) => {
                    if (e.target.checked) {
                      selection.onSelectionChange(displayData.map(selection.getRowKey));
                    } else {
                      selection.onSelectionChange([]);
                    }
                  }}
                  aria-label="Seleccionar todas las filas"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`${thClasses} ${column.headerClassName || ''} ${column.sortable ? 'cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-700' : ''} ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
                aria-sort={sortColumn === column.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center gap-1.5">
                  <span>{column.header}</span>
                  {column.sortable && sortColumn === column.key && (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selection ? 1 : 0)} className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            displayData.map((row, rowIndex) => {
              const rowKey = keyExtractor(row);
              const isSelected = selection?.selectedKeys.includes(rowKey);
              const rowClasses = `
                ${tdClasses}
                ${striped && rowIndex % 2 === 1 ? 'bg-neutral-50 dark:bg-neutral-800/50' : ''}
                ${hoverable && onRowClick ? 'cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20' : ''}
                ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                ${compact ? 'py-2' : ''}
              `;

              return (
                <tr
                  key={rowKey}
                  className={rowClasses}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {selection && (
                    <td className="px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newKeys = e.target.checked
                            ? [...selection.selectedKeys, rowKey]
                            : selection.selectedKeys.filter((k) => k !== rowKey);
                          selection.onSelectionChange(newKeys);
                        }}
                        aria-label={`Seleccionar fila ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`${tdClasses} ${column.className || ''} ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                    >
                      {column.render ? column.render(row, rowIndex) : (row as Record<string, unknown>)[column.key] as ReactNode}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
        {footer && (
          <tfoot>
            <tr>
              <td colSpan={columns.length + (selection ? 1 : 0)} className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                {footer}
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {pagination && (
        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} resultados
          </div>
          <div className="flex items-center gap-3">
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Elementos por página"
            >
              {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                <option key={size} value={size}>
                  {size} por página
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn--ghost btn--icon btn--sm"
                aria-label="Página anterior"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Página {pagination.page} de {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <button
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                className="btn btn--ghost btn--icon btn--sm"
                aria-label="Página siguiente"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Columnas helper functions */
export const createColumn = <T,>(config: Column<T>): Column<T> => config;

export const renderBadge = (variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral') => {
  const Badge = ({ children }: { children: ReactNode }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      variant === 'primary' ? 'bg-primary-100 text-primary-700' :
      variant === 'success' ? 'bg-green-100 text-green-700' :
      variant === 'warning' ? 'bg-amber-100 text-amber-700' :
      variant === 'danger' ? 'bg-red-100 text-red-700' :
      variant === 'info' ? 'bg-blue-100 text-blue-700' :
      'bg-neutral-100 text-neutral-700'
    }`}>
      {children}
    </span>
  );
  return Badge;
};