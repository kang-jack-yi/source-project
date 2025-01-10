import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import cls from 'classnames';
import { isEqual, isEmpty, cloneDeep } from 'lodash-es';
import { useThrottleEffect, useDebounceEffect } from 'ahooks';
import { Stack, IconButton, Divider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon, HelpIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import useFlowStore from '../../store';
import useWorkflow from '../../hooks/useWorkflow';
import useValidate from '../../hooks/useValidate';
import { DEFAULT_VALUES } from './constants';
import {
    useCommonFormItems,
    useNodeFormItems,
    type CommonFormDataProps,
    type NodeFormDataProps,
} from './hooks';
import { MoreMenu, TestDrawer } from './components';
import './style.less';

type FormDataProps = CommonFormDataProps & NodeFormDataProps;

interface Props {
    readonly?: boolean;
}

/**
 * Config Panel
 */
const ConfigPanel: React.FC<Props> = ({ readonly }) => {
    const { getIntlText } = useI18n();
    const { getNode, updateNode, updateNodeData } = useReactFlow<WorkflowNode, WorkflowEdge>();

    // ---------- Handle Node-related logic ----------
    const { selectedNode, nodeConfigs } = useFlowStore(
        useStoreShallow(['selectedNode', 'nodeConfigs']),
    );
    const [finalSelectedNode, setFinalSelectedNode] = useState(selectedNode);
    const openPanel = !!finalSelectedNode;
    const nodeConfig = useMemo(() => {
        if (!finalSelectedNode) return;

        return nodeConfigs[finalSelectedNode.type as WorkflowNodeType];
    }, [finalSelectedNode, nodeConfigs]);

    useDebounceEffect(
        () => {
            formDataInit.current = false;
            setFinalSelectedNode(selectedNode);
        },
        [selectedNode],
        { wait: 300 },
    );

    // ---------- Handle Form-related logic ----------
    const { clearExcessEdges } = useWorkflow();
    const { control, setValue, getValues, watch, reset } = useForm<FormDataProps>();
    const commonFormItems = useCommonFormItems();
    const nodeFormGroups = useNodeFormItems({ nodeType: finalSelectedNode?.type, readonly });
    const formDataInit = useRef(false);
    const fields = useMemo(() => {
        const result: string[] = [];

        commonFormItems.forEach(item => {
            result.push(item.name);
        });

        nodeFormGroups.forEach(group => {
            group.children?.forEach(item => {
                result.push(item.name);
            });
        });

        return result;
    }, [commonFormItems, nodeFormGroups]);
    const formDataArr = watch(fields);
    const [latestFormData, setLatestFormData] = useState<Record<string, any>>();

    useEffect(() => {
        setLatestFormData(data => {
            const formData = fields.reduce(
                (acc, field, index) => {
                    acc[field] = formDataArr[index];
                    return acc;
                },
                {} as Record<string, any>,
            );
            if (isEqual(formData, data)) {
                return data;
            }
            return formData;
        });
    }, [fields, formDataArr]);

    // Backfill form data
    useEffect(() => {
        if (!finalSelectedNode) {
            reset();
            clearExcessEdges();
            formDataInit.current = false;
            return;
        }
        const defaultValue = cloneDeep(DEFAULT_VALUES[finalSelectedNode.type!]);
        const { nodeName, nodeRemark, parameters } = cloneDeep(finalSelectedNode.data) || {};
        const data: Record<string, any> = { nodeName, nodeRemark, ...parameters };

        reset(defaultValue);
        /**
         * Since node form items are rendered dynamically, `SetTimeout` is used here to
         * ensure that the initial data is filled in after the rendering is complete.
         */
        setTimeout(() => {
            Object.keys(data).forEach(key => {
                setValue(key, data[key]);
            });
            formDataInit.current = true;
        }, 0);
    }, [finalSelectedNode, reset, setValue, getValues, clearExcessEdges]);

    // Save node data
    useThrottleEffect(
        () => {
            if (!openPanel || !finalSelectedNode?.id || !formDataInit.current) return;
            const { nodeName, nodeRemark, ...formData } = latestFormData || {};

            // console.log(finalSelectedNode?.id, { formData });
            updateNodeData(finalSelectedNode.id, { nodeName, nodeRemark, parameters: formData });
        },
        [openPanel, latestFormData, updateNodeData],
        { wait: 100 },
    );

    // ---------- Show Test Drawer ----------
    const { checkNodesData } = useValidate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    useEffect(() => setDrawerOpen(false), [finalSelectedNode]);

    return (
        <Panel
            position="top-right"
            className={cls('ms-workflow-panel-config-root', {
                hidden: !finalSelectedNode,
                readonly,
            })}
        >
            <div className="ms-workflow-panel-config">
                <div className="ms-workflow-panel-config-header">
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ flex: 1, width: 0, alignItems: 'center' }}
                    >
                        <span className="icon" style={{ backgroundColor: nodeConfig?.iconBgColor }}>
                            {nodeConfig?.icon}
                        </span>
                        <Tooltip
                            autoEllipsis
                            className="title"
                            title={
                                latestFormData?.nodeName ||
                                (!nodeConfig?.labelIntlKey
                                    ? ''
                                    : getIntlText(nodeConfig?.labelIntlKey))
                            }
                        />
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        {nodeConfig?.testable && !readonly && (
                            <Tooltip title={getIntlText('workflow.editor.node_test_tip')}>
                                <IconButton
                                    onClick={() => {
                                        if (!finalSelectedNode) return;
                                        const node = getNode(finalSelectedNode.id)!;
                                        const result = checkNodesData([node], {
                                            validateFirst: true,
                                        });

                                        if (!isEmpty(result)) return;
                                        setDrawerOpen(true);
                                    }}
                                >
                                    <PlayArrowIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <MoreMenu />
                        <Divider
                            flexItem
                            orientation="vertical"
                            sx={{ height: 20, alignSelf: 'center' }}
                        />
                        <IconButton
                            onClick={() => {
                                if (!finalSelectedNode) return;
                                updateNode(finalSelectedNode.id, {
                                    selected: false,
                                });
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </div>
                <div className="ms-workflow-panel-config-body">
                    <div className="ms-common-form-items">
                        {commonFormItems.map(props => (
                            <Controller<CommonFormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                    </div>
                    <Divider className="ms-divider" />
                    <div className="ms-node-form-items">
                        {nodeFormGroups.map(
                            ({ groupName, helperText, children: formItems }, index) => (
                                <div
                                    className="ms-node-form-group"
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`${groupName || ''}-${index}`}
                                >
                                    {!!groupName && (
                                        <div className="ms-node-form-group-title">
                                            {groupName}
                                            {helperText && (
                                                <Tooltip
                                                    enterDelay={300}
                                                    enterNextDelay={300}
                                                    title={helperText}
                                                >
                                                    <IconButton size="small">
                                                        <HelpIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </div>
                                    )}
                                    <div className="ms-node-form-group-item">
                                        {formItems?.map(props => {
                                            const { shouldRender, ...restProps } = props;

                                            /**
                                             * Whether render current form item
                                             */
                                            if (
                                                shouldRender &&
                                                typeof shouldRender === 'function' &&
                                                !shouldRender(getValues())
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <Controller<NodeFormDataProps>
                                                    {...restProps}
                                                    key={`${restProps.name}-${groupName || ''}`}
                                                    control={control}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>
                <TestDrawer
                    open={drawerOpen}
                    node={finalSelectedNode}
                    onClose={() => setDrawerOpen(false)}
                />
            </div>
        </Panel>
    );
};

export default React.memo(ConfigPanel);
