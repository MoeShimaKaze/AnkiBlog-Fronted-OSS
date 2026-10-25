// src/components/Product/ProductImageGallery.tsx - 增强版本
import React, { useState, useEffect } from 'react'
import {Row, Col, Modal, Button } from 'antd'
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons'

interface ProductImageGalleryProps {
    images: string[]
    title: string
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, title }) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewIndex, setPreviewIndex] = useState(0)

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">暂无图片</span>
            </div>
        )
    }

    // 键盘事件处理
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!previewVisible) return

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault()
                    handlePrevImage()
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    handleNextImage()
                    break
                case 'Escape':
                    e.preventDefault()
                    setPreviewVisible(false)
                    break
            }
        }

        if (previewVisible) {
            document.addEventListener('keydown', handleKeyPress)
            return () => document.removeEventListener('keydown', handleKeyPress)
        }
    }, [previewVisible, previewIndex])

    const handlePrevImage = () => {
        setPreviewIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)
    }

    const handleNextImage = () => {
        setPreviewIndex((prev) => prev === images.length - 1 ? 0 : prev + 1)
    }

    const openPreview = (index: number) => {
        setPreviewIndex(index)
        setPreviewVisible(true)
    }

    return (
        <div style={{ width: '100%', maxWidth: '100%' }}>
            {/* 主图 */}
            <div style={{
                aspectRatio: '1/1',
                overflow: 'hidden',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '1rem',
                position: 'relative',
                width: '100%',
                cursor: 'pointer'
            }}
                 onClick={() => openPreview(activeIndex)}
            >
                <img
                    src={images[activeIndex]}
                    alt={title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                    }}
                />

                {/* 预览提示 */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    opacity: 0.8
                }}>
                    点击预览
                </div>
            </div>

            {/* 缩略图 */}
            {images.length > 1 && (
                <div style={{ width: '100%', maxWidth: '100%' }}>
                    <Row gutter={[8, 8]}>
                        {images.map((image, index) => (
                            <Col key={index} span={6} style={{ maxWidth: '25%' }}>
                                <div
                                    style={{
                                        aspectRatio: '1/1',
                                        overflow: 'hidden',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        border: `2px solid ${
                                            index === activeIndex
                                                ? 'rgba(102, 126, 234, 0.8)'
                                                : 'rgba(255, 255, 255, 0.2)'
                                        }`,
                                        transition: 'all 0.3s ease',
                                        width: '100%',
                                        position: 'relative'
                                    }}
                                    onClick={() => setActiveIndex(index)}
                                    onDoubleClick={() => openPreview(index)}
                                    onMouseEnter={(e) => {
                                        if (index !== activeIndex) {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (index !== activeIndex) {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                        }
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt={`${title} ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                    />
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            {/* 自定义预览模态框 */}
            <Modal
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={null}
                width="90vw"
                style={{ top: 20 }}
                closeIcon={<CloseOutlined style={{ color: 'white', fontSize: '18px' }} />}
                styles={{
                    mask: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
                    body: { padding: 0 },
                    content: { backgroundColor: 'transparent' }
                }}
            >
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* 主预览图 */}
                    <img
                        src={images[previewIndex]}
                        alt={`${title} ${previewIndex + 1}`}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: '8px'
                        }}
                    />

                    {/* 左右切换按钮 */}
                    {images.length > 1 && (
                        <>
                            <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={<LeftOutlined />}
                                onClick={handlePrevImage}
                                style={{
                                    position: 'absolute',
                                    left: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '18px',
                                    width: '50px',
                                    height: '50px'
                                }}
                            />
                            <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={<RightOutlined />}
                                onClick={handleNextImage}
                                style={{
                                    position: 'absolute',
                                    right: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '18px',
                                    width: '50px',
                                    height: '50px'
                                }}
                            />
                        </>
                    )}

                    {/* 图片信息和索引 */}
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        {previewIndex + 1} / {images.length} - {title}
                    </div>

                    {/* 缩略图导航 */}
                    {images.length > 1 && (
                        <div style={{
                            position: 'absolute',
                            bottom: '60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '8px',
                            maxWidth: '90%',
                            overflowX: 'auto',
                            padding: '10px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => setPreviewIndex(index)}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: `2px solid ${
                                            index === previewIndex ? '#1890ff' : 'transparent'
                                        }`,
                                        transition: 'all 0.3s ease',
                                        flexShrink: 0
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt={`缩略图 ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}

export default ProductImageGallery