import { useMemo } from 'react';
import { Stack, IconButton } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { RemoveCircleOutlineIcon } from '@milesight/shared/src/components';
import { Tooltip, type ColumnType } from '@/components';
import { type UserAPISchema } from '@/services/http';

type OperationType = 'remove';

export type TableRowDataType = ObjectToCamelCase<
    UserAPISchema['getRoleAllIntegrations']['response']['content'][0]
>;

export interface UseColumnsProps<T> {
    /**
     * 操作 Button 点击回调
     */
    onButtonClick: (type: OperationType, record: T) => void;
}

const useColumns = <T extends TableRowDataType>({ onButtonClick }: UseColumnsProps<T>) => {
    const { getIntlText } = useI18n();

    const columns: ColumnType<T>[] = useMemo(() => {
        return [
            {
                field: 'integrationName',
                headerName: getIntlText('user.role.title_table_integration_name'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'deviceNum',
                headerName: getIntlText('user.role.title_table_integration_num_device'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: 'entityNum',
                headerName: getIntlText('user.role.title_table_integration_num_entity'),
                flex: 1,
                minWidth: 150,
                ellipsis: true,
            },
            {
                field: '$operation',
                headerName: getIntlText('common.label.operation'),
                flex: 2,
                minWidth: 100,
                renderCell({ row }) {
                    return (
                        <Stack
                            direction="row"
                            spacing="4px"
                            sx={{ height: '100%', alignItems: 'center', justifyContent: 'end' }}
                        >
                            <Tooltip title={getIntlText('common.label.remove')}>
                                <IconButton
                                    color="error"
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        color: 'text.secondary',
                                        '&:hover': { color: 'error.light' },
                                    }}
                                    onClick={() => onButtonClick('remove', row)}
                                >
                                    <RemoveCircleOutlineIcon sx={{ width: 20, height: 20 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    );
                },
            },
        ];
    }, [getIntlText, onButtonClick]);

    return columns;
};

export default useColumns;
