// src/components/Common/Footer.tsx
import React from 'react'
import { Space, Typography } from 'antd'

const { Text } = Typography

const Footer: React.FC = () => {
    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px 16px',
                textAlign: 'center'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                }}
                className="md:flex-row md:justify-center md:gap-0"
            >
                {/* 版权信息 */}
                <Text
                    style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '12px'
                    }}
                    className="md:mr-4"
                >
                    © 2025 AnkiBlog. All rights reserved.
                </Text>

                {/* 链接组 */}
                <Space
                    split={<span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>|</span>}
                    size="middle"
                >
                    <Text
                        className="cursor-pointer hover:text-white transition-colors"
                        style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '12px'
                        }}
                        onClick={() => window.location.href = '/articles/article-739711f7'}
                    >
                        关于站长
                    </Text>

                    <Text
                        className="cursor-pointer hover:text-white transition-colors"
                        style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '12px'
                        }}
                        onClick={() => window.location.href = '/social-links'}
                    >
                        联系方式
                    </Text>

                    <Text
                        className="cursor-pointer hover:text-white transition-colors"
                        style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '12px'
                        }}
                        onClick={() => window.location.href = '/articles/article-eb88f9d0'}
                    >
                        隐私政策
                    </Text>
                </Space>
            </div>
        </div>
    )
}

export default Footer