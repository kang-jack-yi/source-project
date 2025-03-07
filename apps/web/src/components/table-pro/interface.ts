import React from 'react';
import { type GridValidRowModel, type GridColDef } from '@mui/x-data-grid';

export type Key = React.Key;
// filterInfo key
export type FilterValue = (Key | boolean)[];

// filter component type
export type FilterSearchType = 'search' | 'dateRangePicker';

export type ColumnType<R extends GridValidRowModel = any, V = any, F = V> = GridColDef<R, V, F> & {
    /**
     * Whether the copy is automatically omitted
     */
    ellipsis?: boolean;
    // search type
    filterSearchType?: FilterSearchType;
    // filter icon
    filterIcon?: React.ReactNode | ((filtered: boolean) => React.ReactNode);
};
