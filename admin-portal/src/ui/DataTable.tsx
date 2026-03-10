// DataTable.tsx — Futuristic enterprise table (glass + subtle neon accents)
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
        className="min-w-full rounded-2xl bg-white/5 backdrop-blur-md border border-white/8 shadow-[0_8px_30px_rgba(2,6,23,0.6)] overflow-hidden"
        role="region"
        aria-label="Data table"
      >
        <table className="min-w-full w-full text-sm text-gray-200">
          <thead className="bg-white/3">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.accessor)}
                  className="px-4 py-3 text-left font-medium text-gray-300 tracking-tight"
                  scope="col"
                >
                  {col.header}
                </th>
              ))}
              {showActions && (
                <th
                  className="px-4 py-3 text-left font-medium text-gray-300 tracking-tight"
                  scope="col"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/6">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-400" colSpan={columns.length + (showActions ? 1 : 0)}>
                  No records found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="group hover:bg-white/5 transition-colors cursor-default"
                >
                  {columns.map((col) => (
                    <td key={String(col.accessor)} className="px-4 py-3 align-top">
                      {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor])}
                    </td>
                  ))}

                  {showActions && (
                    <td className="px-4 py-3 flex gap-2 items-center">
                      <button
                        onClick={() => onEdit?.(row)}
                        className="px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-br from-indigo-500 to-cyan-400 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                        aria-label={`Edit row ${row.id}`}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete?.(row)}
                        className="px-3 py-1 rounded-full text-sm font-medium text-red-300 bg-red-900/30 hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
                        aria-label={`Delete row ${row.id}`}
                      >
                        Delete
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
