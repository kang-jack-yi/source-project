import React, { useMemo } from 'react';
import { thousandSeparate } from '@milesight/shared/src/utils/tools';
import Tooltip from '../tooltip';

export interface Props {
    data: string | number;
    emptyTip?: string;
}

// transform number to thousand digit display
const ThousandDigitNumber: React.FC<Props> = props => {
    const { data = '', emptyTip = '' } = props;

    const value = useMemo(() => {
        if (!!data && !isNaN(Number(data))) {
            return thousandSeparate(data);
        }
        return data || emptyTip;
    }, [data]);

    return (
        <span>
            <Tooltip autoEllipsis title={value} />
        </span>
    );
};

export default ThousandDigitNumber;
