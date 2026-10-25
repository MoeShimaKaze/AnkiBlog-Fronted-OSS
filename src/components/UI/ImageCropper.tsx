// src/components/UI/ImageCropper.tsx (修复版本)
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Modal, Button, Space, Slider, message, Typography, ConfigProvider } from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    UndoOutlined,
    RotateLeftOutlined,
    RotateRightOutlined
} from '@ant-design/icons';
import { strongModalGlassCardStyle } from '@/constants/styles';

const { Title } = Typography;

interface ImageCropperProps {
    src: string;
    visible: boolean;
    onConfirm: (croppedFile: File) => void;
    onCancel: () => void;
    aspectRatio?: number;
    quality?: number;
    outputFormat?: 'jpeg' | 'png' | 'webp';
}

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageDisplay {
    x: number;
    y: number;
    width: number;
    height: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
                                                       src,
                                                       visible,
                                                       onConfirm,
                                                       onCancel,
                                                       aspectRatio = 1,
                                                       quality = 0.8,
                                                       outputFormat = 'jpeg'
                                                   }) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
    const [isDraggingCrop, setIsDraggingCrop] = useState(false);
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageDisplay, setImageDisplay] = useState<ImageDisplay>({ x: 0, y: 0, width: 0, height: 0 });
    const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 }); // 图片拖拽偏移
    const [loading, setLoading] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 计算图片显示尺寸和位置
    const calculateImageDisplay = useCallback(() => {
        if (!imageRef.current || !containerRef.current) return;

        const img = imageRef.current;
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        const imgNaturalWidth = img.naturalWidth;
        const imgNaturalHeight = img.naturalHeight;

        // 计算适应容器的基础缩放比例
        const fitScale = Math.min(containerWidth / imgNaturalWidth, containerHeight / imgNaturalHeight);
        const finalScale = fitScale * scale;

        const displayWidth = imgNaturalWidth * finalScale;
        const displayHeight = imgNaturalHeight * finalScale;

        // 基础居中位置 + 用户拖拽偏移
        const baseX = (containerWidth - displayWidth) / 2;
        const baseY = (containerHeight - displayHeight) / 2;
        const displayX = baseX + imageOffset.x;
        const displayY = baseY + imageOffset.y;

        setImageDisplay({ x: displayX, y: displayY, width: displayWidth, height: displayHeight });
        return { displayX, displayY, displayWidth, displayHeight };
    }, [scale, imageOffset]);

    // 重新居中裁剪框
    const centerCropArea = useCallback(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // 计算裁剪框尺寸（相对于容器的固定比例）
        const maxCropSize = Math.min(containerWidth, containerHeight) * 0.6;
        const cropWidth = maxCropSize;
        const cropHeight = maxCropSize / aspectRatio;

        // 裁剪框在容器中居中
        const cropX = (containerWidth - cropWidth) / 2;
        const cropY = (containerHeight - cropHeight) / 2;

        setCropArea({ x: cropX, y: cropY, width: cropWidth, height: cropHeight });
    }, [aspectRatio]);

    // 图片加载完成时初始化
    const handleImageLoad = useCallback(() => {
        setTimeout(() => {
            calculateImageDisplay();
            centerCropArea();
        }, 100);
    }, [calculateImageDisplay, centerCropArea]);

    // 缩放变化时重新计算
    useEffect(() => {
        if (imageRef.current && containerRef.current) {
            calculateImageDisplay();
            // 缩放变化时重新居中裁剪框
            centerCropArea();
        }
    }, [scale, calculateImageDisplay, centerCropArea]);

    // 旋转变化时重新计算
    useEffect(() => {
        if (imageRef.current && containerRef.current) {
            calculateImageDisplay();
        }
    }, [rotation, calculateImageDisplay]);

    // 裁剪框拖拽开始
    const handleCropMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        const relativeY = e.clientY - containerRect.top;

        setIsDraggingCrop(true);
        setDragStart({ x: relativeX - cropArea.x, y: relativeY - cropArea.y });
    };

    // 图片拖拽开始
    const handleImageMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        const relativeY = e.clientY - containerRect.top;

        setIsDraggingImage(true);
        setDragStart({ x: relativeX - imageOffset.x, y: relativeY - imageOffset.y });
    };

    // 鼠标移动处理
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        const relativeY = e.clientY - containerRect.top;

        if (isDraggingCrop) {
            // 拖拽裁剪框
            const newX = relativeX - dragStart.x;
            const newY = relativeY - dragStart.y;

            // 限制裁剪框在容器内
            const boundedX = Math.max(0, Math.min(newX, containerRect.width - cropArea.width));
            const boundedY = Math.max(0, Math.min(newY, containerRect.height - cropArea.height));

            setCropArea(prev => ({ ...prev, x: boundedX, y: boundedY }));
        } else if (isDraggingImage) {
            // 拖拽图片
            const newOffsetX = relativeX - dragStart.x;
            const newOffsetY = relativeY - dragStart.y;

            setImageOffset({ x: newOffsetX, y: newOffsetY });
        }
    }, [isDraggingCrop, isDraggingImage, dragStart, cropArea.width, cropArea.height]);

    // 鼠标抬起处理
    const handleMouseUp = useCallback(() => {
        setIsDraggingCrop(false);
        setIsDraggingImage(false);
    }, []);

    // 监听全局鼠标事件
    useEffect(() => {
        if (isDraggingCrop || isDraggingImage) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDraggingCrop, isDraggingImage, handleMouseMove, handleMouseUp]);

    // 重置所有状态
    const handleReset = () => {
        setScale(1);
        setRotation(0);
        setImageOffset({ x: 0, y: 0 });
        setTimeout(() => {
            calculateImageDisplay();
            centerCropArea();
        }, 100);
    };

    const handleRotateLeft = () => setRotation(prev => (prev - 90) % 360);
    const handleRotateRight = () => setRotation(prev => (prev + 90) % 360);

    // 生成裁剪图片
    const generateCroppedImage = async (): Promise<File | null> => {
        if (!imageRef.current || !canvasRef.current || !containerRef.current) return null;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const img = imageRef.current;
        const outputSize = 400;
        canvas.width = outputSize;
        canvas.height = outputSize / aspectRatio;

        // 计算裁剪区域相对于图片的位置
        const cropRelativeX = cropArea.x - imageDisplay.x;
        const cropRelativeY = cropArea.y - imageDisplay.y;

        // 转换为原始图片坐标
        const scaleToOriginal = img.naturalWidth / imageDisplay.width;
        const sourceX = cropRelativeX * scaleToOriginal;
        const sourceY = cropRelativeY * scaleToOriginal;
        const sourceWidth = cropArea.width * scaleToOriginal;
        const sourceHeight = cropArea.height * scaleToOriginal;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // 处理旋转
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height
        );

        ctx.restore();

        return new Promise(resolve => {
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(new File([blob], `cropped-image.${outputFormat}`, {
                        type: `image/${outputFormat}`,
                        lastModified: Date.now()
                    }));
                } else {
                    resolve(null);
                }
            }, `image/${outputFormat}`, quality);
        });
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const croppedFile = await generateCroppedImage();
            if (croppedFile) {
                onConfirm(croppedFile);
            } else {
                message.error('图片裁剪失败');
            }
        } catch (error) {
            console.error('图片裁剪失败:', error);
            message.error('图片裁剪失败');
        } finally {
            setLoading(false);
        }
    };

    const glassCardStyle: React.CSSProperties = {
        ...strongModalGlassCardStyle,
        padding: '24px',
    };

    const labelStyle: React.CSSProperties = {
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 500,
        marginBottom: '12px'
    };

    return (
        <>
            <Modal
                open={visible}
                onCancel={onCancel}
                width={800}
                destroyOnClose
                title={null}
                footer={null}
                closable={false}
                centered
                styles={{
                    content: { background: 'transparent', boxShadow: 'none', padding: 0 },
                    mask: { backdropFilter: 'blur(10px)' }
                }}
            >
                <div style={glassCardStyle}>
                    <Title level={4} style={{ color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                        裁剪图片
                    </Title>
                    <div style={{ padding: '0' }}>
                        <div
                            ref={containerRef}
                            style={{
                                position: 'relative',
                                width: '100%',
                                height: '400px',
                                overflow: 'hidden',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '8px',
                                cursor: isDraggingImage ? 'grabbing' : 'grab'
                            }}
                            onMouseDown={handleImageMouseDown}
                        >
                            <img
                                ref={imageRef}
                                src={src}
                                alt="待裁剪图片"
                                style={{
                                    position: 'absolute',
                                    left: `${imageDisplay.x}px`,
                                    top: `${imageDisplay.y}px`,
                                    width: `${imageDisplay.width}px`,
                                    height: `${imageDisplay.height}px`,
                                    transform: `rotate(${rotation}deg)`,
                                    transformOrigin: 'center center',
                                    transition: (isDraggingImage || isDraggingCrop) ? 'none' : 'all 0.3s ease',
                                    userSelect: 'none',
                                    pointerEvents: 'none'
                                }}
                                onLoad={handleImageLoad}
                                draggable={false}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${cropArea.x}px`,
                                    top: `${cropArea.y}px`,
                                    width: `${cropArea.width}px`,
                                    height: `${cropArea.height}px`,
                                    border: '2px solid #1677ff',
                                    borderRadius: aspectRatio === 1 ? '50%' : '8px',
                                    cursor: isDraggingCrop ? 'grabbing' : 'move',
                                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                                    transition: isDraggingCrop ? 'none' : 'all 0.1s ease',
                                    pointerEvents: 'auto'
                                }}
                                onMouseDown={handleCropMouseDown}
                            />
                        </div>
                        <ConfigProvider theme={{ token: { colorText: 'rgba(255, 255, 255, 0.85)' } }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                                <div>
                                    <div style={labelStyle}>缩放: {Math.round(scale * 100)}%</div>
                                    <Slider
                                        min={0.5}
                                        max={3}
                                        step={0.1}
                                        value={scale}
                                        onChange={setScale}
                                        marks={{ 0.5: '50%', 1: '100%', 2: '200%', 3: '300%' }}
                                    />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={labelStyle}>旋转操作</div>
                                    <Space>
                                        <Button onClick={handleRotateLeft} icon={<RotateLeftOutlined />}>逆时针</Button>
                                        <span style={{ display: 'inline-block', minWidth: '60px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.85)' }}>{rotation}°</span>
                                        <Button onClick={handleRotateRight} icon={<RotateRightOutlined />}>顺时针</Button>
                                    </Space>
                                </div>
                            </div>
                        </ConfigProvider>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Space size="large">
                            <Button onClick={onCancel} icon={<CloseOutlined />}>取消</Button>
                            <Button onClick={handleReset} icon={<UndoOutlined />}>重置</Button>
                            <Button type="primary" onClick={handleConfirm} loading={loading} icon={<CheckOutlined />}>确认裁剪</Button>
                        </Space>
                    </div>
                </div>
            </Modal>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
    );
};

export default ImageCropper;
