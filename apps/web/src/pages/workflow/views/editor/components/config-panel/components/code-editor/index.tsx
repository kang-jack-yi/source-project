import React, { useCallback, useMemo } from 'react';
import { CodeEditor as CodeMirror, type EditorSupportLang } from '@/components';
import './style.less';

interface CodeEditorData {
    language: EditorSupportLang;
    expression: string;
}
export interface IProps {
    value: CodeEditorData;
    onChange: (value: CodeEditorData) => void;
}
const DEFAULT_LANGUAGE = 'javascript';
/**
 * Code Editor Component
 *
 * Note: Use in CodeNode, IfelseNode
 */
const CodeEditor: React.FC<IProps> = ({ value, onChange }) => {
    const { language = DEFAULT_LANGUAGE, expression } = value || {};

    /** Actual form change callbacks */
    const handleChange = useCallback(
        (data: CodeEditorData) => {
            const { language, expression } = data;

            onChange?.({
                language,
                expression,
            });
        },
        [onChange],
    );

    /** Callback function triggered when the language changes. */
    const handleEditorLangChange = useCallback(
        (language: EditorSupportLang) => {
            handleChange?.({ language, expression });
        },
        [expression, handleChange],
    );
    /** Callback function triggered when the content value changes. */
    const handleEditorValueChange = useCallback(
        (expression: string) => {
            handleChange?.({ language, expression });
        },
        [handleChange, language],
    );
    const supportLangs = useMemo<EditorSupportLang[]>(
        () => ['groovy', 'javascript', 'python', 'mvel'],
        [],
    );
    return (
        <CodeMirror
            height="200px"
            editorLang={language}
            onLangChange={handleEditorLangChange}
            value={expression}
            onChange={handleEditorValueChange}
            supportLangs={supportLangs}
        />
    );
};

export default CodeEditor;
