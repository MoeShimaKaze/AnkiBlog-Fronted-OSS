// src/components/UI/Loading.tsx
import React, { useState, useEffect } from 'react';
import { Spin, Typography } from 'antd';
import { usePageTitle } from '@/hooks/business/usePageTitle';

const { Text } = Typography;

interface LoadingProps {
    size?: 'small' | 'default' | 'large';
    tip?: string;
    className?: string;
    fullScreen?: boolean;
    pageTitle?: string; // 新增：页面标题
    pageTitleParams?: Record<string, string>; // 新增：页面标题参数
}

const Loading: React.FC<LoadingProps> = ({
                                             size = 'default',
                                             tip = '加载中...',
                                             className = '',
                                             fullScreen = false,
                                             pageTitle,
                                             pageTitleParams,
                                         }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // 使用页面标题Hook
    usePageTitle(pageTitle, pageTitleParams);

    // 图片预加载检测
    useEffect(() => {
        if (fullScreen) {
            const img = new Image();
            img.onload = () => setImageLoaded(true);
            img.onerror = () => setImageError(true);
            img.src = '/background_placeholder.png';
        }
    }, [fullScreen]);

    const content = (
        <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-12'} ${className}`}>
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)', // Safari支持
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    padding: '3rem 4rem',
                    textAlign: 'center' as const,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    minWidth: '200px',
                }}
            >
                <Spin size={size} />
                {tip && (
                    <Text
                        className="mt-4 block"
                        style={{
                            color: 'white',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                            fontSize: size === 'large' ? '18px' : '16px',
                            fontWeight: 500,
                        }}
                    >
                        {tip}
                    </Text>
                )}
                {/* 调试信息 */}
                {fullScreen && (
                    <div style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '12px',
                        marginTop: '10px'
                    }}>
                        图片: {imageLoaded ? '✅' : imageError ? '❌' : '⏳'}
                    </div>
                )}
            </div>
        </div>
    );

    if (fullScreen) {
        const fullScreenStyle: React.CSSProperties = {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundImage: `url('/background_placeholder.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            width: '100vw',
            overflow: 'hidden',
        };

        const overlayStyle: React.CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(102, 126, 234, 0.4)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
        };

        const contentWrapperStyle: React.CSSProperties = {
            position: 'relative',
            zIndex: 10,
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
        };

        return (
            <div style={fullScreenStyle}>
                <div style={overlayStyle} />
                <div style={contentWrapperStyle}>
                    {content}
                </div>
            </div>
        );
    }

    return content;
};

export default Loading;