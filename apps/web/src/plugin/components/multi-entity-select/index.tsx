import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EntitySelect, type EntitySelectProps } from '@/components';
import { filterEntityMap } from '@/plugin/utils';

type MultipleEntitySelectProps = EntitySelectProps<EntityOptionType, true, false>;
interface IProps extends MultipleEntitySelectProps {
    entityValueTypes: MultipleEntitySelectProps['entityValueType'];
    entityAccessMods: MultipleEntitySelectProps['entityAccessMod'];
    entityExcludeChildren: MultipleEntitySelectProps['excludeChildren'];
    customFilterEntity: keyof typeof filterEntityMap;
}
/**
 * Entity Select drop-down components (multiple selections)
 */
export default React.memo((props: IProps) => {
    const {
        entityType,
        entityValueType,
        entityValueTypes,
        entityAccessMod,
        entityAccessMods,
        entityExcludeChildren,
        maxCount = 5,
        customFilterEntity,
        value,
        error,
        ...restProps
    } = props;

    // is beyond mutiSelect number
    const [isBeyondNum, setIsBeyondNum] = useState<boolean>(false);

    const filterOption = useMemo(
        () =>
            Reflect.get(
                filterEntityMap,
                customFilterEntity,
            ) as MultipleEntitySelectProps['filterOption'],
        [customFilterEntity],
    );

    const getOptionValue = useCallback<
        Required<EntitySelectProps<any, false, false>>['getOptionValue']
    >(option => option?.value, []);

    useEffect(() => {
        if ((value || []).length > maxCount) {
            !isBeyondNum && setIsBeyondNum(true);
        } else {
            isBeyondNum && setIsBeyondNum(false);
        }
    }, [value]);

    return (
        <EntitySelect
            fieldName="entityId"
            multiple
            maxCount={maxCount}
            entityType={entityType}
            entityValueType={entityValueTypes || entityValueType}
            entityAccessMod={entityAccessMods || entityAccessMod}
            excludeChildren={entityExcludeChildren}
            filterOption={filterOption}
            getOptionValue={getOptionValue}
            value={value}
            error={isBeyondNum || error}
            {...restProps}
        />
    );
});
