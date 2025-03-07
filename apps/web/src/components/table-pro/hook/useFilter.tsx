import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import { FilterAltIcon, SearchIcon } from '@milesight/shared/src/components';
import DateRangePicker, { DateRangePickerValueType } from '@/components/date-range-picker';
import { ColumnType, FilterValue } from '../interface';

const enum FilterObjKey {
    Key = 'key',
    Value = 'value',
    Type = 'type',
    Visible = 'visible',
}

type Props = {
    setAnchorElement: (element: null | HTMLButtonElement) => void;
    onFilterInfoChange?: (filterInfo: Record<string, FilterValue | null>) => void;
};

// table  column searchFilter
const useFilter = (props: Props) => {
    const { setAnchorElement, onFilterInfoChange } = props;
    const [filterInfo, setFilterInfo] = useState<Record<string, FilterValue | null>>({});
    const [filterObj, setFilterObj] = useState<Record<FilterObjKey, any>>();
    const inputRef = useRef<HTMLDivElement>();

    useEffect(() => {
        if (filterObj?.visible) {
            setTimeout(() => {
                inputRef?.current?.focus();
            }, 50);
        }
    }, [filterObj?.visible]);

    const handleResetFilter = () => {
        if (filterObj) {
            const filterObjTmp = { ...filterObj, value: '', visible: false };
            setFilterObj(filterObjTmp);
            if (filterInfo[filterObj.key]) {
                const filterInfoTmp = { ...filterInfo, [filterObj.key]: '' };
                handleChangeFilterInfo(filterInfoTmp);
            }
        }
    };

    const handleConfirmFilter = () => {
        const filterInfoTmp = { ...filterInfo };
        if (filterObj) {
            filterInfoTmp[filterObj.key] = filterObj.value;
            !!filterObj && setFilterObj({ ...filterObj, visible: false });
            handleChangeFilterInfo(filterInfoTmp);
        }
    };

    const handleChangeFilterInfo = (info: Record<string, FilterValue | null>) => {
        setFilterInfo(info);
        if (typeof onFilterInfoChange === 'function') {
            onFilterInfoChange(info);
        }
    };

    const changeFilterObj = (key: string, value: any) => {
        const filterObjTmp = {
            ...filterObj,
            [key]: value,
        } as Record<FilterObjKey, any>;
        setFilterObj(filterObjTmp);
    };

    const generateInputComponent = (type: string) => {
        switch (type) {
            case 'search': {
                return (
                    <div className="ms-table-pro-popover-filter-searchInput">
                        <OutlinedInput
                            inputRef={inputRef}
                            placeholder="Search"
                            sx={{ width: 200 }}
                            value={filterObj?.value || ''}
                            onChange={e => {
                                changeFilterObj('value', e.target.value);
                            }}
                            startAdornment={
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            }
                        />
                    </div>
                );
            }
            case 'dateRange': {
                return (
                    <div className="ms-table-pro-popover-filter-rangePicker">
                        <DateRangePicker
                            label={{ start: 'Start date', end: 'End date' }}
                            onChange={(values: DateRangePickerValueType | null) => {
                                changeFilterObj('value', values);
                            }}
                            value={filterObj?.value || ''}
                            views={['year', 'month', 'day']}
                        />
                    </div>
                );
            }
            default: {
                break;
            }
        }
    };

    const getFilterIcon = (col: ColumnType, filtered: boolean): React.ReactNode => {
        let filterIcon: React.ReactNode;
        const { filterIcon: customIcon } = col;
        if (typeof customIcon === 'function') {
            filterIcon = customIcon(filtered);
        } else if (customIcon) {
            filterIcon = customIcon;
        } else {
            filterIcon = <FilterAltIcon />;
        }

        return (
            <div
                style={{ display: 'flex' }}
                className={classNames('ms-table-pro-columns-header-icon', {
                    'ms-table-pro-columns-header-icon-active':
                        filtered && typeof col.filterIcon !== 'function',
                })}
            >
                {filterIcon}
            </div>
        );
    };

    const renderHeader = useCallback(
        (col: ColumnType): React.ReactNode => {
            const filtered: boolean =
                !!filterInfo?.[col.field] || (filterObj?.visible && filterObj?.key === col.field);
            return (
                <div className="ms-table-pro-columns-header">
                    <div className="'ms-table-pro-columns-header-label">{col.headerName}</div>
                    <IconButton
                        aria-label="filter"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            setFilterObj({
                                key: col.field,
                                value: filterInfo[col.field],
                                type: col.filterSearchType,
                                visible: true,
                            });
                            setAnchorElement(e.currentTarget);
                        }}
                    >
                        {getFilterIcon(col, filtered)}
                    </IconButton>
                </div>
            );
        },
        [filterObj, filterInfo],
    );

    return {
        filterInfo,
        filterObj,
        setFilterInfo,
        setFilterObj,
        changeFilterObj,

        handleResetFilter,
        handleConfirmFilter,

        generateInputComponent,
        renderHeader,
    };
};

export default useFilter;
