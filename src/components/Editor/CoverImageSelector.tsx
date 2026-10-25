// src/components/Editor/CoverImageSelector.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Button, Modal, Input, Tabs, message, Image, Card, Upload, ConfigProvider, Select } from 'antd';
import { PictureOutlined, UploadOutlined, LinkOutlined, RedoOutlined, PlusOutlined } from '@ant-design/icons';
import { ensureImageUploadAllowed } from '@/utils/image';
import type { FileWithPreview } from '@/components/Upload/ImageUploader';
import { useBackgroundActions } from '@/hooks/api/useBackground';
import type { BackgroundSettingsResponse } from '@/types/background';
import { elevatedGlassCardStyle, primaryTextStyle, secondaryTextStyle } from '@/constants/styles';

interface CoverImageSelectorProps {
    value?: string;
    onChange?: ((url: string) => void) | ((file: FileWithPreview | null, url: string) => void);
    disabled?: boolean;
    mode?: 'immediate' | 'delayed';
}

export const CoverImageSelector: React.FC<CoverImageSelectorProps> = ({
                                                                          value = '',
                                                                          onChange,
                                                                          disabled = false,
                                                                          mode = 'immediate'
                                                                      }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [externalUrl, setExternalUrl] = useState('');
    const [randomImageUrl, setRandomImageUrl] = useState('');
    const [selectedApiId, setSelectedApiId] = useState<string | undefined>(undefined);
    const [activeApis, setActiveApis] = useState<BackgroundSettingsResponse[]>([]);

    const { refreshing, loadingApis, refreshImage, getActiveApis } = useBackgroundActions();

    // 获取激活的API列表
    useEffect(() => {
        if (isModalVisible) {
            getActiveApis().then(setActiveApis);
        }
    }, [isModalVisible, getActiveApis]);

    const handleSelect = useCallback((url: string, file?: FileWithPreview | null) => {
        if (mode === 'delayed' && onChange) {
            (onChange as (file: FileWithPreview | null, url: string) => void)(file || null, url);
        } else {
            (onChange as (url: string) => void)?.(url);
        }
        setIsModalVisible(false);
        setExternalUrl('');
        setRandomImageUrl('');
        setSelectedApiId(undefined);
    }, [onChange, mode]);

    const fetchRandomImage = async () => {
        try {
            const imageUrl = await refreshImage(selectedApiId);
            if (imageUrl) {
                setRandomImageUrl(imageUrl);
            }
        } catch (e: any) {
            console.error('Service error:', e);
        }
    };

    const handleFileSelect = useCallback(async (file: File) => {
        try {
            const allowed = await ensureImageUploadAllowed(file);
            if (!allowed) {
                return false;
            }
        } catch (err: any) {
            message.error(err.message);
            return false;
        }

        if (mode === 'delayed') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = e.target?.result as string;
                const fileWithPreview: FileWithPreview = Object.assign(file, {
                    uid: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    preview
                });
                handleSelect(preview, fileWithPreview);
            };
            reader.readAsDataURL(file);
        }
        return false;
    }, [mode, handleSelect]);

    const handleExternalUrlSelect = () => {
        if (!externalUrl.trim()) {
            message.error('请输入有效的图片URL');
            return;
        }
        handleSelect(externalUrl);
    };

    const handleRandomImageSelect = () => {
        if (!randomImageUrl) {
            message.error('请先获取随机图片');
            return;
        }
        handleSelect(randomImageUrl);
    };

    const cardStyle: React.CSSProperties = {
        ...elevatedGlassCardStyle,
        borderRadius: '12px',
    };

    const modalTheme = {
        token: {
            colorText: 'rgba(255, 255, 255, 0.9)',
            colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
            colorBgElevated: 'rgba(35, 35, 35, 0.95)',
            colorBorder: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 8,
        },
        components: {
            Modal: {
                contentBg: 'rgba(35, 35, 35, 0.95)',
                headerBg: 'transparent',
            },
            Tabs: {
                itemColor: 'rgba(255, 255, 255, 0.7)',
                itemSelectedColor: 'rgba(255, 255, 255, 0.95)',
                itemHoverColor: 'rgba(255, 255, 255, 0.85)',
                inkBarColor: '#36d1dc',
                cardBg: 'transparent',
            },
            Input: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
                colorText: 'rgba(255, 255, 255, 0.9)',
            },
            Button: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                colorText: 'rgba(255, 255, 255, 0.9)',
            },
            Upload: {
                colorBgMask: 'rgba(0, 0, 0, 0.45)',
            },
            Select: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                colorText: 'rgba(255, 255, 255, 0.9)',
            }
        }
    };

    const getApiDisplayName = (api: BackgroundSettingsResponse) => {
        if (api.value?.includes('loliapi.com')) return '二次元动漫图片API';
        if (api.value?.includes('dmoe.cc')) return '随机二次元图片API';
        if (api.value?.includes('vvhan.com')) return '风景图片API';
        return `API: ${api.value?.substring(0, 30)}...`;
    };

    return (
        <>
            <Card
                style={cardStyle}
                styles={{
                    body: {
                        textAlign: 'center',
                        background: 'transparent'
                    }
                }}
            >
                {value ? (
                    <Image
                        width="100%"
                        src={value}
                        fallback="/img/placeholder.jpg"
                        style={{ borderRadius: '6px' }}
                    />
                ) : (
                    <div style={{
                        padding: '40px 20px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        border: '2px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)'
                    }}>
                        <PictureOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                        <div>暂无封面图片</div>
                    </div>
                )}
                <Button
                    icon={<PictureOutlined />}
                    style={{
                        marginTop: 12,
                        background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
                        border: 'none',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                    onClick={() => setIsModalVisible(true)}
                    disabled={disabled}
                >
                    {value ? '更换封面' : '选择封面'}
                </Button>
            </Card>

            <ConfigProvider theme={modalTheme}>
                <Modal
                    title={
                        <span style={primaryTextStyle}>选择封面图片</span>
                    }
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setExternalUrl('');
                        setRandomImageUrl('');
                        setSelectedApiId(undefined);
                    }}
                    footer={null}
                    width={800}
                    destroyOnClose
                    styles={{
                        mask: {
                            backdropFilter: 'blur(8px)'
                        },
                        content: {
                            background: 'rgba(35, 35, 35, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px'
                        },
                        header: {
                            background: 'transparent',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        },
                        body: {
                            background: 'transparent'
                        }
                    }}
                >
                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            {
                                key: '1',
                                label: (
                                    <span style={secondaryTextStyle}>
                                        <UploadOutlined /> 本地上传
                                    </span>
                                ),
                                children: (
                                    <div style={{ padding: '16px' }}>
                                        <Upload
                                            beforeUpload={handleFileSelect}
                                            showUploadList={false}
                                            disabled={disabled}
                                            accept="image/*"
                                        >
                                            <Button
                                                icon={<PlusOutlined />}
                                                disabled={disabled}
                                                style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    fontSize: '16px',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                                                    color: 'rgba(255, 255, 255, 0.8)',
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                点击选择图片
                                            </Button>
                                        </Upload>
                                        <div style={{
                                            marginTop: '12px',
                                            fontSize: '12px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            textAlign: 'center'
                                        }}>
                                            支持 JPG、PNG、GIF、WebP 格式，超过 10MB 将提示并由后端压缩
                                        </div>
                                    </div>
                                )
                            },
                            {
                                key: '2',
                                label: (
                                    <span style={secondaryTextStyle}>
                                        <LinkOutlined /> 外部链接
                                    </span>
                                ),
                                children: (
                                    <div style={{ padding: '16px' }}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <Input.Group compact>
                                                <Input
                                                    style={{
                                                        width: 'calc(100% - 100px)',
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                                        color: 'rgba(255, 255, 255, 0.9)'
                                                    }}
                                                    placeholder="粘贴图片URL（支持 http:// 或 https://）"
                                                    value={externalUrl}
                                                    onChange={e => setExternalUrl(e.target.value)}
                                                    disabled={disabled}
                                                    onPressEnter={handleExternalUrlSelect}
                                                />
                                                <Button
                                                    type="primary"
                                                    onClick={handleExternalUrlSelect}
                                                    disabled={disabled || !externalUrl.trim()}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
                                                        border: 'none'
                                                    }}
                                                >
                                                    确认
                                                </Button>
                                            </Input.Group>
                                        </div>
                                        {externalUrl && (
                                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                                <Image
                                                    src={externalUrl}
                                                    alt="外部图片预览"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: 200,
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                                    }}
                                                    fallback="/img/placeholder.jpg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            },
                            {
                                key: '3',
                                label: (
                                    <span style={secondaryTextStyle}>
                                        <RedoOutlined /> 随机图片
                                    </span>
                                ),
                                children: (
                                    <div style={{ textAlign: 'center', padding: '16px' }}>
                                        <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                                            <div style={{
                                                marginBottom: '8px',
                                                color: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: '14px'
                                            }}>
                                                选择API来源：
                                            </div>
                                            <Select
                                                placeholder="选择API（留空为随机）"
                                                allowClear
                                                value={selectedApiId}
                                                onChange={setSelectedApiId}
                                                style={{ width: '100%' }}
                                                disabled={disabled}
                                                loading={loadingApis}
                                            >
                                                {activeApis.map(api => (
                                                    <Select.Option key={api.id} value={api.id}>
                                                        {getApiDisplayName(api)}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </div>

                                        <Button
                                            onClick={fetchRandomImage}
                                            loading={refreshing}
                                            disabled={disabled}
                                            style={{
                                                marginBottom: '16px',
                                                background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
                                                border: 'none',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                            icon={<RedoOutlined />}
                                        >
                                            {refreshing ? '获取中...' :
                                                selectedApiId ? '获取指定API图片' : '获取随机图片'}
                                        </Button>

                                        {randomImageUrl && (
                                            <div style={{ marginTop: 16 }}>
                                                <Image
                                                    src={randomImageUrl}
                                                    alt="随机图片"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: 300,
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                                    }}
                                                    fallback="/img/placeholder.jpg"
                                                />
                                                <br />
                                                <Button
                                                    type="primary"
                                                    style={{
                                                        marginTop: 12,
                                                        background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
                                                        border: 'none',
                                                        fontWeight: 'bold'
                                                    }}
                                                    onClick={handleRandomImageSelect}
                                                    disabled={disabled}
                                                >
                                                    使用这张图片
                                                </Button>
                                            </div>
                                        )}

                                        {!randomImageUrl && !refreshing && (
                                            <div style={{
                                                color: 'rgba(255, 255, 255, 0.5)',
                                                fontSize: '14px',
                                                padding: '20px',
                                                border: '1px dashed rgba(255, 255, 255, 0.2)',
                                                borderRadius: '6px',
                                                background: 'rgba(255, 255, 255, 0.05)'
                                            }}>
                                                点击按钮获取{selectedApiId ? '指定API' : '随机'}图片
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                        ]}
                    />
                </Modal>
            </ConfigProvider>
        </>
    );
};
