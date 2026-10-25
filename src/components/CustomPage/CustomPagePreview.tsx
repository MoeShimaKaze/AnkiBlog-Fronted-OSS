// src/components/CustomPage/CustomPagePreview.tsx
import React, { useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { EyeOutlined, FullscreenOutlined } from '@ant-design/icons';
import { CustomPage } from '@/types/customPage';

interface CustomPagePreviewProps {
    page: CustomPage;
    trigger?: React.ReactNode;
}

const CustomPagePreview: React.FC<CustomPagePreviewProps> = ({ page, trigger }) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePreview = () => {
        setVisible(true);
        setLoading(true);
        // 模拟加载时间
        setTimeout(() => setLoading(false), 500);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-96">
                    <Spin size="large" />
                </div>
            );
        }

        return (
            <div className="preview-container">
                {/* 应用自定义CSS */}
                {page.customCss && (
                    <style dangerouslySetInnerHTML={{ __html: page.customCss }} />
                )}

                {/* 页面头部 */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        {page.pageIcon && <span className="text-2xl">{page.pageIcon}</span>}
                        <h1 className="text-2xl font-bold text-gray-900 m-0">{page.title}</h1>
                    </div>
                    {page.subtitle && (
                        <p className="text-gray-600 text-lg">{page.subtitle}</p>
                    )}
                </div>

                {/* 页面内容 */}
                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.content || '' }}
                />
            </div>
        );
    };

    return (
        <>
            {trigger ? (
                <div onClick={handlePreview} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    className="bg-blue-500 text-white border-none hover:bg-blue-600"
                >
                    预览
                </Button>
            )}

            <Modal
                title={
                    <div className="flex items-center justify-between">
                        <span className="text-white/90">页面预览</span>
                        <Button
                            icon={<FullscreenOutlined />}
                            onClick={() => window.open(page.fullPath, '_blank')}
                            size="small"
                            className="bg-black/20 border-white/30 text-white/80 hover:bg-black/40 hover:border-white/50"
                        >
                            全屏预览
                        </Button>
                    </div>
                }
                open={visible}
                onCancel={() => setVisible(false)}
                footer={null}
                width="90%"
                style={{ top: 20 }}
                styles={{
                    mask: {
                        backdropFilter: 'blur(5px)',
                    },
                    content: {
                        background: 'rgba(35, 35, 35, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    },
                    header: {
                        background: 'transparent',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '12px 20px',
                    },
                }}
                bodyStyle={{
                    height: '80vh',
                    overflow: 'auto',
                    background: '#fff',
                    padding: '24px',
                    borderRadius: '0 0 8px 8px'
                }}
            >
                {renderContent()}
            </Modal>
        </>
    );
};

export default CustomPagePreview;