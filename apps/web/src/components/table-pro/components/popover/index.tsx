import { useCallback, useMemo, useState } from 'react';
import { Button, Popover } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import useFilter from '../../hook/useFilter';
import { FilterValue } from '../../interface';

interface IProps {
    onFilterInfoChange: ((filterInfo: Record<string, FilterValue | null>) => void) | undefined;
}

const usePopover = (props: IProps) => {
    const { onFilterInfoChange } = props;
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

    const closePopover = () => {
        changeFilterObj('visible', false);
    };

    const renderPopover = () => {
        return (
            <Popover
                open={!!filterObj && filterObj.visible}
                anchorEl={anchorEl}
                onClose={closePopover}
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
        );
    };

    return {
        filterObj,
        renderHeader,
        renderPopover,
    };
};

export default usePopover;
