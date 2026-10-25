/**
 * 化妆记录卡片组件
 */
import React from 'react';
import { Card, Image, Tag, Button, Tooltip } from 'antd';
import { DeleteOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { MakeupLog } from '@/types/makeup';

interface MakeupCardProps {
    makeup: MakeupLog;
    onView?: (makeup: MakeupLog) => void;
    onDelete?: (makeup: MakeupLog) => void;
}

const MakeupCard: React.FC<MakeupCardProps> = ({ makeup, onView, onDelete }) => {
    const cardStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)'
    };

    const hoverStyle = `
        .makeup-card:hover {
            transform: translateY(-4px);
            border-color: rgba(235, 47, 150, 0.4);
            box-shadow: 0 8px 24px rgba(235, 47, 150, 0.2);
        }
    `;

    return (
        <>
            <style>{hoverStyle}</style>
            <Card
                className="makeup-card"
                style={cardStyle}
                cover={
                    <div style={{
                        display: 'flex',
                        gap: '2px',
                        padding: '8px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        minHeight: '80px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {makeup.items.slice(0, 6).map((item, idx) => (
                            <Tooltip key={idx} title={item.productName}>
                                <Image
                                    src={item.productMainImage}
                                    alt={item.productName}
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        objectFit: 'cover',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}
                                    preview={false}
                                />
                            </Tooltip>
                        ))}
                        {makeup.items.length > 6 && (
                            <div style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '6px',
                                background: 'rgba(235, 47, 150, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                +{makeup.items.length - 6}
                            </div>
                        )}
                    </div>
                }
                actions={[
                    <Tooltip key="view" title="查看详情">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => onView?.(makeup)}
                            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        />
                    </Tooltip>,
                    makeup.referenceUrl ? (
                        <Tooltip key="link" title="查看参考">
                            <Button
                                type="text"
                                icon={<LinkOutlined />}
                                onClick={() => window.open(makeup.referenceUrl, '_blank')}
                                style={{ color: '#eb2f96' }}
                            />
                        </Tooltip>
                    ) : (
                        <Button
                            key="link-disabled"
                            type="text"
                            icon={<LinkOutlined />}
                            disabled
                            style={{ color: 'rgba(255, 255, 255, 0.2)' }}
                        />
                    ),
                    <Tooltip key="delete" title="删除">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => onDelete?.(makeup)}
                            style={{ color: 'rgba(255, 77, 79, 0.7)' }}
                        />
                    </Tooltip>
                ]}
                styles={{
                    body: { padding: '12px' },
                    actions: {
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                <div style={{ minHeight: '60px' }}>
                    {/* 日期和时间 */}
                    <div style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '12px',
                        marginBottom: '6px'
                    }}>
                        {dayjs(makeup.makeupDate).format('YYYY-MM-DD HH:mm')}
                    </div>

                    {/* 妆面名称 */}
                    {makeup.lookName && (
                        <div style={{
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '14px',
                            marginBottom: '8px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {makeup.lookName}
                        </div>
                    )}

                    {/* 使用产品数量 */}
                    <Tag
                        color="pink"
                        style={{
                            background: 'rgba(235, 47, 150, 0.2)',
                            borderColor: 'rgba(235, 47, 150, 0.4)',
                            color: '#f759ab'
                        }}
                    >
                        {makeup.items.length} 件化妆品
                    </Tag>

                    {/* 使用类型标签 */}
                    {makeup.items.some(item => item.usageTypeName) && (
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {[...new Set(makeup.items.filter(i => i.usageTypeName).map(i => i.usageTypeName))].slice(0, 3).map(typeName => (
                                <Tag
                                    key={typeName}
                                    style={{
                                        background: 'rgba(114, 46, 209, 0.2)',
                                        borderColor: 'rgba(114, 46, 209, 0.4)',
                                        color: '#b37feb',
                                        fontSize: '10px'
                                    }}
                                >
                                    {typeName}
                                </Tag>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </>
    );
};

export default MakeupCard;
