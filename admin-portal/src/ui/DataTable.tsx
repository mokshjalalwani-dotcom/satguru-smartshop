// DataTable.tsx — Strict 5-color enterprise table
import React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  rows: T[];
  showActions?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  className?: string;
}

function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  showActions = false,
  onEdit,
  onDelete,
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div
        className="min-w-full rounded-2xl bg-surface/40 border border-white/5 overflow-hidden"
        role="region"
        aria-label="Data table"
      >
        <table className="min-w-full w-full text-sm text-muted">
          <thead className="bg-white/3">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.accessor)}
                  className="px-4 py-4 text-left font-bold text-muted/40 tracking-wider uppercase text-[10px]"
                  scope="col"
                >
                  {col.header}
                </th>
              ))}
              {showActions && (
                <th
                  className="px-4 py-4 text-left font-bold text-muted/40 tracking-wider uppercase text-[10px]"
                  scope="col"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-muted/20 font-bold uppercase tracking-widest text-[10px]" colSpan={columns.length + (showActions ? 1 : 0)}>
                  No records found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="group hover:bg-white/3 transition-colors cursor-default"
                >
                  {columns.map((col) => (
                    <td key={String(col.accessor)} className="px-4 py-4 align-middle text-white/80 font-medium">
                      {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor])}
                    </td>
                  ))}

                  {showActions && (
                    <td className="px-4 py-4 flex gap-2 items-center">
                      <button
                        onClick={() => onEdit?.(row)}
                        className="px-3 py-1 rounded-lg text-[11px] font-bold text-black bg-accent hover:brightness-110 transition shadow-lg shadow-accent/10"
                        aria-label={`Edit row ${row.id}`}
                      >
                        EDIT
                      </button>

                      <button
                        onClick={() => onDelete?.(row)}
                        className="px-3 py-1 rounded-lg text-[11px] font-bold text-muted hover:text-white border border-white/10 hover:border-white/20 transition"
                        aria-label={`Delete row ${row.id}`}
                      >
                        REMOVE
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
