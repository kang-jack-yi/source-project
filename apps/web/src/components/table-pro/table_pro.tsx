import React, { useCallback, useMemo, useState } from 'react';
import { isUndefined } from 'lodash-es';
import { OutlinedInput, InputAdornment, Popover, Button } from '@mui/material';
import {
    DataGrid,
    type DataGridProps,
    type GridValidRowModel,
    type GridColDef,
} from '@mui/x-data-grid';
import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon } from '@milesight/shared/src/components';
import Tooltip from '../tooltip';
import { Footer, NoDataOverlay, NoResultsOverlay } from './components';
import './style.less';
import useFilter from './hook/useFilter';
import { ColumnType, FilterValue } from './interface';

export interface Props<T extends GridValidRowModel> extends DataGridProps<T> {
    columns: ColumnType<T>[];

    /**
     * Toolbar slot (Custom render Node on the left)
     */
    toolbarRender?: React.ReactNode;

    /** Search box input callback */
    onSearch?: (value: string) => void;

    /** Refresh button click callback */
    onRefreshButtonClick?: () => void;
    // filer info change
    onFilterInfoChange?: (filterInfo: Record<string, FilterValue | null>) => void;

    /**
     * toolbar sort
     */
    toolbarSort?: React.ReactNode;
}

/** The number of options per page is displayed by default */
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

/** Default paging model */
const DEFAULT_PAGINATION_MODEL = { page: 0, pageSize: DEFAULT_PAGE_SIZE_OPTIONS[0] };

/**
 * Data form element
 */
const TablePro = <DataType extends GridValidRowModel>({
    columns,
    initialState,
    slots,
    slotProps,
    toolbarRender,
    toolbarSort,
    onSearch,
    onRefreshButtonClick,
    onFilterInfoChange,
    paginationMode = 'server',
    ...props
}: Props<DataType>) => {
    const { getIntlText } = useI18n();
    const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
    const setAnchorElement = useCallback((el: null | HTMLButtonElement) => {
        setAnchorEl(el);
    }, []);
    const {
        filterObj,
        changeFilterObj,
        handleResetFilter,
        generateInputComponent,
        handleConfirmFilter,
        renderHeader,
    } = useFilter({ setAnchorElement, onFilterInfoChange });

    const memoColumns = useMemo(() => {
        const result = columns.map((column, index) => {
            const col = { ...column };

            col.sortable = isUndefined(col.sortable) ? false : col.sortable;
            col.filterable = isUndefined(col.filterable) ? false : col.filterable;
            col.disableColumnMenu = isUndefined(col.disableColumnMenu)
                ? true
                : column.disableColumnMenu;

            if (columns.length === index + 1) {
                col.align = isUndefined(col.align) ? 'right' : col.align;
                col.headerAlign = isUndefined(col.headerAlign) ? 'right' : col.headerAlign;
                col.resizable = isUndefined(col.resizable) ? false : col.resizable;
            }

            if (col.filterSearchType) {
                col.renderHeader = () => renderHeader(col);
            }

            if (col.ellipsis) {
                const originalRenderCell = col.renderCell;

                col.renderCell = (...args) => {
                    const { value } = args[0];
                    const title = originalRenderCell?.(...args) || value;

                    return (
                        <Tooltip
                            autoEllipsis
                            title={title || '-'}
                            slotProps={{
                                popper: {
                                    modifiers: [{ name: 'offset', options: { offset: [0, -20] } }],
                                },
                            }}
                        />
                    );
                };
            }

            return col;
        });

        return result as readonly GridColDef<DataType>[];
    }, [columns, filterObj]);

    return (
        <div className="ms-table-pro">
            {!!(toolbarRender || onSearch || toolbarSort) && (
                <div className="ms-table-pro__header">
                    <div className="ms-table-pro__topbar-operations">{toolbarRender}</div>
                    {!!onSearch && (
                        <div className="ms-table-pro__topbar-search">
                            <OutlinedInput
                                placeholder="Search"
                                sx={{ width: 220 }}
                                onChange={e => onSearch?.(e.target.value)}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                }
                            />
                        </div>
                    )}
                    {!!toolbarSort && (
                        <div className="ms-table-pro__topbar-sort">{toolbarSort}</div>
                    )}
                </div>
            )}
            <div className="ms-table-pro__body">
                <DataGrid<DataType>
                    disableColumnSelector
                    disableRowSelectionOnClick
                    hideFooterSelectedRowCount
                    sx={{ border: 0 }}
                    columnHeaderHeight={44}
                    rowHeight={48}
                    paginationMode={paginationMode}
                    pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
                    columns={memoColumns}
                    initialState={{
                        pagination: { paginationModel: DEFAULT_PAGINATION_MODEL },
                        ...initialState,
                    }}
                    slots={{
                        noRowsOverlay: NoDataOverlay,
                        noResultsOverlay: NoResultsOverlay,
                        footer: Footer,
                        ...slots,
                    }}
                    slotProps={{
                        footer: {
                            // @ts-ignore
                            onRefreshButtonClick,
                        },
                        baseCheckbox: {
                            // disabled: true,
                            onDoubleClick(e) {
                                e.stopPropagation();
                            },
                        },
                        ...slotProps,
                    }}
                    {...props}
                />
            </div>
            <Popover
                open={!!filterObj && filterObj.visible}
                anchorEl={anchorEl}
                onClose={() => changeFilterObj('visible', false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <div className="ms-table-pro-popover">
                    {generateInputComponent(filterObj?.type)}
                    <div className="ms-table-pro-popover-footer">
                        <div
                            className={`ms-table-pro-popover-footer-reset ${
                                !filterObj?.value ? 'ms-table-pro-popover-footer-reset-disable' : ''
                            }`}
                        >
                            <Button
                                onClick={handleResetFilter}
                                variant="outlined"
                                disabled={!filterObj?.value}
                            >
                                {getIntlText('common.button.reset')}
                            </Button>
                        </div>
                        <Button onClick={handleConfirmFilter} variant="contained">
                            {getIntlText('common.button.confirm')}
                        </Button>
                    </div>
                </div>
            </Popover>
        </div>
    );
};

// export type { GridColDef as ColumnType };
export default TablePro;
