import React, { useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Button,
    FormControlLabel,
} from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingWrapper } from '@milesight/shared/src/components';

import { type UserMenuType } from '@/services/http';
import { useFunctions } from './hooks';

import styles from './style.module.less';

/**
 * functions table component
 */
const FunctionsTable = () => {
    const { getIntlText } = useI18n();
    const {
        isEditing,
        openEditing,
        closeEditing,
        permissions,
        getModelTableRowSpan,
        loading,
        handleFunctionsChecked,
        isDisabledFunction,
        checkedPermissions,
        handlePagesChecked,
        isPageChecked,
        isPageIndeterminate,
        handleSave,
    } = useFunctions();

    /**
     * common table button styles override
     */
    const btnSx = useMemo(() => {
        return {
            sx: { height: 36, textTransform: 'none' },
        };
    }, []);

    /**
     * common table cell styles override
     */
    const cellSx = useMemo(() => {
        return {
            sx: {
                borderLeft: '1px solid var(--border-color-base)',
            },
        };
    }, []);

    const renderButtons = () => {
        if (isEditing) {
            return (
                <>
                    <Button onClick={handleSave} variant="contained" {...btnSx}>
                        {getIntlText('common.button.save')}
                    </Button>
                    <Button onClick={closeEditing} variant="outlined" {...btnSx}>
                        {getIntlText('common.button.cancel')}
                    </Button>
                </>
            );
        }

        return (
            <Button onClick={openEditing} variant="contained" {...btnSx}>
                {getIntlText('common.button.edit')}
            </Button>
        );
    };

    const renderPageFunctions = (
        model: ObjectToCamelCase<UserMenuType>,
        pages: ObjectToCamelCase<UserMenuType[]>,
    ) => {
        const renderRows = (
            page: ObjectToCamelCase<UserMenuType>,
            functions: ObjectToCamelCase<UserMenuType[]>,
        ) => {
            return (
                <TableRow key={page.menuId}>
                    <TableCell {...cellSx}>
                        <FormControlLabel
                            key={page.menuId}
                            label={page.name}
                            disabled={!isEditing}
                            control={
                                <Checkbox
                                    disableRipple
                                    indeterminate={isPageIndeterminate(functions)}
                                    checked={isPageChecked(functions)}
                                />
                            }
                            onChange={(_, isChecked) =>
                                handlePagesChecked({
                                    isChecked,
                                    permissions: functions,
                                })
                            }
                        />
                    </TableCell>
                    <TableCell {...cellSx}>
                        {functions.map(func => {
                            return (
                                <FormControlLabel
                                    key={func.menuId}
                                    label={String(func?.name || '')
                                        .split('.')
                                        .pop()}
                                    disabled={isDisabledFunction({
                                        permission: func,
                                        siblingPermissions: functions,
                                    })}
                                    control={
                                        <Checkbox
                                            disableRipple
                                            checked={checkedPermissions.includes(func.menuId)}
                                        />
                                    }
                                    onChange={() =>
                                        handleFunctionsChecked({
                                            permission: func,
                                            siblingPermissions: functions,
                                        })
                                    }
                                />
                            );
                        })}
                    </TableCell>
                </TableRow>
            );
        };

        /**
         * There are no other submenus under the current menu
         */
        const isFunctions = pages.every(p => p.type === 'FUNCTION');
        if (isFunctions) {
            return renderRows(model, pages);
        }

        /**
         * The current menu has submenus
         */
        return pages.map(page => renderRows(page, page.children));
    };

    return (
        <div className={styles['functions-container']}>
            <div className={styles.operation}>{renderButtons()}</div>
            <div className={styles.permissions}>
                <LoadingWrapper loading={loading}>
                    <TableContainer>
                        <Table sx={{ border: '1px solid var(--border-color-base)' }}>
                            <TableHead sx={{ background: 'var(--component-background-gray)' }}>
                                <TableRow>
                                    <TableCell>
                                        {getIntlText('user.role.title_table_model')}
                                    </TableCell>
                                    <TableCell {...cellSx}>
                                        {getIntlText('user.role.title_table_page')}
                                    </TableCell>
                                    <TableCell {...cellSx}>
                                        {getIntlText('user.role.title_table_function')}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {permissions.map(model => (
                                    <React.Fragment key={model.menuId}>
                                        <TableRow>
                                            <TableCell rowSpan={getModelTableRowSpan(model)}>
                                                {model.name}
                                            </TableCell>
                                        </TableRow>
                                        {renderPageFunctions(model, model.children)}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </LoadingWrapper>
            </div>
        </div>
    );
};

export default FunctionsTable;
