// src/components/CustomPage/CustomPageToolbar.tsx
import React from 'react';
import { Space, Button, Dropdown, Tooltip, message } from 'antd';
import type { MenuProps } from 'antd';
import {
    EditOutlined,
    ShareAltOutlined,
    CopyOutlined,
    DownloadOutlined,
    PrinterOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { CustomPage } from '@/types/customPage';

interface CustomPageToolbarProps {
    page: CustomPage;
    onEdit?: () => void;
    showEditButton?: boolean;
    className?: string;
    compact?: boolean;
}

const CustomPageToolbar: React.FC<CustomPageToolbarProps> = ({
                                                                 page,
                                                                 onEdit,
                                                                 showEditButton = false,
                                                                 className,
                                                                 compact = false
                                                             }) => {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: page.title,
                    text: page.summary,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('分享取消');
            }
        } else {
            await handleCopyLink();
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            message.success('链接已复制到剪贴板');
        } catch (error) {
            message.error('复制失败');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const element = document.createElement('a');
        const file = new Blob([page.content || ''], { type: 'text/html' });
        element.href = URL.createObjectURL(file);
        element.download = `${page.slug}.html`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const moreMenuItems: MenuProps['items'] = [
        {
            key: 'copy',
            label: '复制链接',
            icon: <CopyOutlined />,
            onClick: handleCopyLink
        },
        {
            key: 'print',
            label: '打印页面',
            icon: <PrinterOutlined />,
            onClick: handlePrint
        },
        {
            key: 'export',
            label: '导出HTML',
            icon: <DownloadOutlined />,
            onClick: handleExport
        }
    ];

    return (
        <div className={`flex items-center justify-between ${compact ? 'p-0' : 'p-4'} ${className || ''}`}>
            <Space>
                {showEditButton && onEdit && (
                    <Tooltip title="编辑页面">
                        <Button
                            icon={<EditOutlined />}
                            onClick={onEdit}
                            className="bg-blue-500 text-white border-none hover:bg-blue-600"
                        >
                            编辑
                        </Button>
                    </Tooltip>
                )}
            </Space>

            <Space>
                <Tooltip title="分享页面">
                    <Button
                        icon={<ShareAltOutlined />}
                        onClick={handleShare}
                        className="bg-green-500 text-white border-none hover:bg-green-600"
                    >
                        {!compact && '分享'}
                    </Button>
                </Tooltip>

                <Dropdown menu={{ items: moreMenuItems }} trigger={['click']}>
                    <Button icon={<MoreOutlined />} />
                </Dropdown>
            </Space>
        </div>
    );
};

export default CustomPageToolbar;
