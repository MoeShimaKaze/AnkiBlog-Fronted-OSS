// src/components/Editor/MarkdownEditor.tsx
import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { elevatedGlassCardStyle } from '@/constants/styles';

interface MarkdownEditorProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    disabled?: boolean;
    height?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
                                                           value,
                                                           onChange,
                                                           disabled = false,
                                                           height = 500
                                                       }) => {
    return (
        <div style={{
            ...elevatedGlassCardStyle,
            borderRadius: '12px',
            overflow: 'hidden'
        }}>
            <style>
                {`
                .glass-editor[data-color-mode="dark"] .w-md-editor-splitter {
                    background: linear-gradient(90deg, 
                        rgba(54, 209, 220, 0.3) 0%, 
                        rgba(91, 134, 229, 0.3) 50%, 
                        rgba(54, 209, 220, 0.3) 100%
                    ) !important;
                    width: 4px !important;
                    position: relative;
                }
                .glass-editor[data-color-mode="dark"] .w-md-editor-splitter::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 20px;
                    height: 20px;
                    background: rgba(54, 209, 220, 0.8);
                    border-radius: 50%;
                    box-shadow: 0 0 10px rgba(54, 209, 220, 0.5);
                }
                .glass-editor[data-color-mode="dark"] .w-md-editor-splitter::after {
                    content: '⋮';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 1;
                }
                .glass-editor[data-color-mode="dark"] .w-md-editor-text {
                    border-right: 2px solid rgba(54, 209, 220, 0.2) !important;
                }
                .glass-editor[data-color-mode="dark"] .w-md-editor-preview {
                    border-left: 2px solid rgba(54, 209, 220, 0.2) !important;
                }
                `}
            </style>
            <MDEditor
                value={value}
                onChange={onChange}
                height={height}
                preview="live"
                className="glass-editor"
                data-color-mode="dark"
                style={{
                    background: 'transparent',
                    border: 'none'
                }}
                textareaProps={{
                    disabled,
                    style: {
                        background: 'transparent',
                        color: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        fontSize: '14px',
                        lineHeight: '1.6'
                    }
                }}
                previewOptions={{
                    style: {
                        background: 'transparent',
                        color: 'rgba(255, 255, 255, 0.9)',
                        padding: '16px'
                    }
                }}
            />
        </div>
    );
};

export default MarkdownEditor;
