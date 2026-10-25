// src/components/UI/ImageViewer.tsx
import React, { useState } from 'react';
import { Modal, Button, Space } from 'antd';
import {
    ZoomInOutlined,
    ZoomOutOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    UndoOutlined,
    DownloadOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { modalGlassCardStyle } from '@/constants/styles';

interface ImageViewerProps {
    src: string;
    alt?: string;
    visible: boolean;
    onClose: () => void;
    title?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
                                                     src,
                                                     alt = '图片',
                                                     visible,
                                                     onClose,
                                                     title = '图片预览'
                                                 }) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    const resetImage = () => {
        setScale(1);
        setRotation(0);
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.1));
    const handleRotateLeft = () => setRotation(prev => prev - 90);
    const handleRotateRight = () => setRotation(prev => prev + 90);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        link.download = alt || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClose = () => {
        resetImage();
        onClose();
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;
        setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
        });
    };

    // 计算最佳显示尺寸
    const getOptimalSize = () => {
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.7;

        if (imageDimensions.width === 0 || imageDimensions.height === 0) {
            return { width: maxWidth, height: maxHeight };
        }

        const aspectRatio = imageDimensions.width / imageDimensions.height;

        let width = Math.min(imageDimensions.width, maxWidth);
        let height = width / aspectRatio;

        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }

        return { width, height };
    };

    const optimalSize = getOptimalSize();

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={handleClose}
            width={Math.min(optimalSize.width + 100, window.innerWidth * 0.95)}
            style={{ top: 20 }}
            footer={null}
            destroyOnHidden
            centered
            closable={false}
            maskStyle={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
            }}
            styles={{
                content: {
                    background: 'transparent',
                    boxShadow: 'none',
                    padding: 0
                }
            }}
        >
            {/* 玻璃拟态容器 */}
            <div style={{
                ...modalGlassCardStyle,
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* 标题栏 */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h4 style={{
                        color: 'white',
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 500
                    }}>
                        {title}
                    </h4>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={handleClose}
                        style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />
                </div>

                {/* 图片显示区域 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: optimalSize.width,
                    height: optimalSize.height,
                    background: 'rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    margin: '0 auto'
                }}>
                    <img
                        src={src}
                        alt={alt}
                        onLoad={handleImageLoad}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            transform: `scale(${scale}) rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            objectFit: 'contain'
                        }}
                        draggable={false}
                    />
                </div>

                {/* 控制栏 */}
                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        padding: '8px 16px',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<ZoomOutOutlined />}
                                onClick={handleZoomOut}
                                style={{ color: 'white' }}
                                size="small"
                                disabled={scale <= 0.1}
                            />
                            <span style={{
                                color: 'white',
                                fontSize: '12px',
                                minWidth: '50px',
                                textAlign: 'center',
                                display: 'inline-block',
                                fontWeight: 500
                            }}>
                                {Math.round(scale * 100)}%
                            </span>
                            <Button
                                type="text"
                                icon={<ZoomInOutlined />}
                                onClick={handleZoomIn}
                                style={{ color: 'white' }}
                                size="small"
                                disabled={scale >= 5}
                            />
                            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.3)' }} />
                            <Button
                                type="text"
                                icon={<RotateLeftOutlined />}
                                onClick={handleRotateLeft}
                                style={{ color: 'white' }}
                                size="small"
                            />
                            <Button
                                type="text"
                                icon={<RotateRightOutlined />}
                                onClick={handleRotateRight}
                                style={{ color: 'white' }}
                                size="small"
                            />
                            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.3)' }} />
                            <Button
                                type="text"
                                icon={<UndoOutlined />}
                                onClick={resetImage}
                                style={{ color: 'white' }}
                                size="small"
                            />
                            <Button
                                type="text"
                                icon={<DownloadOutlined />}
                                onClick={handleDownload}
                                style={{ color: 'white' }}
                                size="small"
                            />
                        </Space>
                    </div>
                </div>

                {/* ESC 提示 */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '70px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                }}>
                    ESC 关闭
                </div>
            </div>
        </Modal>
    );
};

export default ImageViewer;
