"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ChevronDown, Search } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataTableProps<TData, TValue> {
  /** Column definitions from TanStack Table. */
  columns: ColumnDef<TData, TValue>[];
  /** Data rows to display. */
  data: TData[];

  // ── Feature flags ────────────────────────────────────────────────────────────
  /** Enable global text search input. Default: false */
  searchable?: boolean;
  /** The column accessor key to filter on. Required when searchable=true. */
  searchColumn?: string;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;

  /** Enable click-to-sort column headers. Default: false */
  sortable?: boolean;

  /** Enable built-in client-side pagination. Default: false */
  paginated?: boolean;
  /** Rows per page when paginated=true. Default: 10 */
  pageSize?: number;

  /** Enable column visibility toggler. Default: false */
  columnVisibility?: boolean;

  /**
   * Enable row checkboxes for multi-selection.
   * A checkbox column is automatically prepended. Default: false
   */
  rowSelection?: boolean;
  /** Called with the selected rows whenever selection changes. */
  onRowSelectionChange?: (rows: TData[]) => void;
  /**
   * Stable row id for selection. Required for correct selection after data
   * changes (delete/refresh). Defaults to index — prefer a unique field.
   */
  getRowId?: (originalRow: TData, index: number) => string;

  /** Optional extra toolbar content rendered between search and Columns button. */
  toolbar?: React.ReactNode;

  /** Empty state message. Default: "Không có dữ liệu." */
  emptyMessage?: string;
}

// ─── Selection checkbox column (auto-injected) ───────────────────────────────

function buildCheckboxColumn<TData>(): ColumnDef<TData> {
  return {
    id: "__select__",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => {
      const allSelected = table.getIsAllPageRowsSelected();
      const someSelected = table.getIsSomePageRowsSelected();
      return (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = !allSelected && someSelected;
          }}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Chọn tất cả"
          className="h-4 w-4 cursor-pointer accent-primary"
        />
      );
    },
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        aria-label="Chọn hàng"
        className="h-4 w-4 cursor-pointer accent-primary"
      />
    ),
  };
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function DataTableToolbar<TData>({
  table,
  searchable,
  searchColumn,
  searchPlaceholder,
  showVisibility,
  toolbar,
}: {
  table: TanstackTable<TData>;
  searchable?: boolean;
  searchColumn?: string;
  searchPlaceholder?: string;
  showVisibility?: boolean;
  toolbar?: React.ReactNode;
}) {
  const hasToolbar = searchable || showVisibility || toolbar;
  if (!hasToolbar) return null;

  return (
    <div className="flex flex-col gap-3 pb-4 lg:flex-row lg:items-center lg:justify-between">
      {searchable && searchColumn && (
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={searchPlaceholder ?? "Tìm kiếm..."}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn(searchColumn)?.setFilterValue(e.target.value)
            }
            className="h-10 rounded-md border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
        {toolbar}

        {showVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm">
                  Columns <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {typeof col.columnDef.header === "string"
                      ? col.columnDef.header
                      : col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// ─── Footer (selection count + Previous / Next) ───────────────────────────────

function DataTableFooter<TData>({
  table,
  enableRowSelection,
  paginated,
}: {
  table: TanstackTable<TData>;
  enableRowSelection: boolean;
  paginated: boolean;
}) {
  if (!enableRowSelection && !paginated) return null;

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-400">
      {enableRowSelection ? (
        <span>
          {selectedCount} of {totalCount} row(s) selected.
        </span>
      ) : (
        <span />
      )}

      {paginated && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DataTable<TData, TValue>({
  columns,
  data,
  searchable = false,
  searchColumn,
  searchPlaceholder,
  sortable = false,
  paginated = false,
  pageSize = 10,
  columnVisibility: showColumnVisibility = false,
  rowSelection: enableRowSelection = false,
  onRowSelectionChange,
  getRowId,
  toolbar,
  emptyMessage = "Không có dữ liệu.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [visibility, setVisibility] = React.useState<VisibilityState>({});
  const [rowSel, setRowSel] = React.useState<RowSelectionState>({});

  const resolveRowId = React.useCallback(
    (row: TData, index: number) => getRowId?.(row, index) ?? String(index),
    [getRowId],
  );

  const onRowSelectionChangeRef = React.useRef(onRowSelectionChange);
  onRowSelectionChangeRef.current = onRowSelectionChange;

  // Drop selection for rows that no longer exist after delete/refresh
  React.useEffect(() => {
    if (!enableRowSelection) return;

    const validIds = new Set(data.map((row, index) => resolveRowId(row, index)));
    setRowSel((prev) => {
      const next: RowSelectionState = {};
      let changed = false;
      for (const [id, selected] of Object.entries(prev)) {
        if (selected && validIds.has(id)) {
          next[id] = true;
        } else if (selected) {
          changed = true;
        }
      }
      if (!changed && Object.keys(next).length === Object.keys(prev).length) {
        return prev;
      }
      return next;
    });
  }, [data, enableRowSelection, resolveRowId]);

  React.useEffect(() => {
    if (!enableRowSelection || !onRowSelectionChangeRef.current) return;
    const selectedRows = data.filter((row, index) => rowSel[resolveRowId(row, index)]);
    onRowSelectionChangeRef.current(selectedRows);
  }, [rowSel, data, enableRowSelection, resolveRowId]);

  // Auto-inject checkbox column at the front when row selection is on
  const effectiveColumns = React.useMemo<ColumnDef<TData, TValue>[]>(
    () =>
      enableRowSelection
        ? [buildCheckboxColumn<TData>() as ColumnDef<TData, TValue>, ...columns]
        : columns,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableRowSelection, columns],
  );

  const table = useReactTable({
    data,
    columns: effectiveColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: resolveRowId,

    // Sorting
    ...(sortable && {
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
    }),

    // Filtering
    ...(searchable && {
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
    }),

    // Pagination
    ...(paginated && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize } },
    }),

    // Column visibility
    ...(showColumnVisibility && {
      onColumnVisibilityChange: setVisibility,
    }),

    // Row selection
    ...(enableRowSelection && {
      enableRowSelection: true,
      onRowSelectionChange: setRowSel,
    }),

    state: {
      ...(sortable && { sorting }),
      ...(searchable && { columnFilters }),
      ...(showColumnVisibility && { columnVisibility: visibility }),
      ...(enableRowSelection && { rowSelection: rowSel }),
    },
  });

  return (
    <div>
      <DataTableToolbar
        table={table}
        searchable={searchable}
        searchColumn={searchColumn}
        searchPlaceholder={searchPlaceholder}
        showVisibility={showColumnVisibility}
        toolbar={toolbar}
      />

      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => {
                const canSort = sortable && header.column.getCanSort();
                const sortDir = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    style={{ cursor: canSort ? "pointer" : "default" }}
                  >
                    {header.isPlaceholder ? null : (
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <ArrowUpDown
                            className={`h-3.5 w-3.5 shrink-0 transition-opacity ${
                              sortDir ? "opacity-100" : "opacity-40"
                            }`}
                          />
                        )}
                      </span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={effectiveColumns.length}
                className="h-24 text-center text-dark-4 dark:text-dark-6"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      <DataTableFooter
        table={table}
        enableRowSelection={enableRowSelection}
        paginated={paginated}
      />
    </div>
  );
}
