/**
 * 每日穿搭建议卡片组件
 * 展示单个建议记录
 */
import React, { useMemo } from 'react';
import { Tag, Image, Tooltip, Button } from 'antd';
import {
    CalendarOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { DailyOutfitSuggestion, SuggestionStatus, SuggestionItem } from '@/types/outfit';
import { interactiveGlassCardStyle, secondaryTextStyle } from '@/constants/styles';

interface DailyOutfitCardProps {
    suggestion: DailyOutfitSuggestion;
    onAccept?: (suggestion: DailyOutfitSuggestion) => void;
    onReject?: (suggestion: DailyOutfitSuggestion) => void;
    onView?: (suggestion: DailyOutfitSuggestion) => void;
    onDelete?: (suggestion: DailyOutfitSuggestion) => void;
    showActions?: boolean;
}

const statusConfig: Record<SuggestionStatus, { color: string; icon: React.ReactNode; text: string }> = {
    PENDING: { color: 'gold', icon: <ClockCircleOutlined />, text: '待决定' },
    ACCEPTED: { color: 'green', icon: <CheckOutlined />, text: '已接受' },
    REJECTED: { color: 'default', icon: <CloseOutlined />, text: '已拒绝' },
};

const DailyOutfitCard: React.FC<DailyOutfitCardProps> = ({
    suggestion,
    onAccept,
    onReject,
    onView,
    onDelete,
    showActions = true
}) => {
    const status = statusConfig[suggestion.status];

    // 根据状态过滤要显示的商品
    const displayItems = useMemo((): SuggestionItem[] => {
        if (suggestion.status === 'ACCEPTED') {
            // 已接受状态：只显示 accepted=true 的商品
            return suggestion.items.filter(item => item.accepted === true);
        }
        // PENDING 和 REJECTED 状态显示所有商品
        return suggestion.items;
    }, [suggestion.items, suggestion.status]);

    // 计算统计信息（用于ACCEPTED状态显示）
    const acceptedCount = useMemo(() =>
        suggestion.items.filter(item => item.accepted === true).length,
        [suggestion.items]
    );
    const rejectedCount = useMemo(() =>
        suggestion.items.filter(item => item.accepted === false).length,
        [suggestion.items]
    );

    // 获取显示图片（使用过滤后的第一个商品）
    const displayImage = displayItems[0]?.productMainImage || '/placeholder-outfit.jpg';

    return (
        <div
            style={interactiveGlassCardStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* 图片区域 */}
            <div style={{ position: 'relative', height: '160px' }}>
                <Image
                    src={displayImage}
                    alt="穿搭建议"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    preview={false}
                />
                {/* 日期标签 */}
                <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                    <Tag color="blue" style={{ fontSize: '0.75rem' }}>
                        <CalendarOutlined /> {dayjs(suggestion.suggestionDate).format('MM/DD')}
                    </Tag>
                </div>
                {/* 状态标签 */}
                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <Tag color={status.color} style={{ fontSize: '0.75rem' }}>
                        {status.icon} {status.text}
                    </Tag>
                </div>
            </div>

            {/* 内容区域 */}
            <div style={{ padding: '12px' }}>
                {/* ACCEPTED状态下显示统计信息 */}
                {suggestion.status === 'ACCEPTED' && (
                    <div style={{
                        marginBottom: '8px',
                        padding: '4px 8px',
                        background: 'rgba(82, 196, 26, 0.15)',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.85)'
                    }}>
                        接受 <span style={{ color: '#52c41a', fontWeight: 500 }}>{acceptedCount}</span> 件
                        {rejectedCount > 0 && (
                            <>，放弃 <span style={{ color: '#ff4d4f', fontWeight: 500 }}>{rejectedCount}</span> 件</>
                        )}
                    </div>
                )}

                {/* 商品缩略图组 - 使用过滤后的displayItems */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {displayItems.slice(0, 5).map((item, index) => (
                        <Tooltip key={index} title={`${item.productName}${item.brand ? ` - ${item.brand}` : ''}${suggestion.status === 'ACCEPTED' ? ' (已接受)' : ''}`}>
                            <div style={{ position: 'relative' }}>
                                <Image
                                    src={item.productMainImage}
                                    alt={item.productName}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        objectFit: 'cover',
                                        borderRadius: '6px',
                                        border: suggestion.status === 'ACCEPTED'
                                            ? '2px solid rgba(82, 196, 26, 0.6)'
                                            : '1px solid rgba(255, 255, 255, 0.2)'
                                    }}
                                    preview={false}
                                />
                                {suggestion.status === 'ACCEPTED' && (
                                    <CheckCircleFilled style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        color: '#52c41a',
                                        fontSize: '12px',
                                        background: 'rgba(35,35,35,0.9)',
                                        borderRadius: '50%'
                                    }} />
                                )}
                            </div>
                        </Tooltip>
                    ))}
                    {displayItems.length > 5 && (
                        <span style={{ ...secondaryTextStyle, fontSize: '0.75rem', alignSelf: 'center' }}>
                            +{displayItems.length - 5}
                        </span>
                    )}
                </div>

                {/* 备注 */}
                {suggestion.note && (
                    <p style={{
                        ...secondaryTextStyle,
                        fontSize: '0.8rem',
                        margin: '0 0 12px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {suggestion.note}
                    </p>
                )}

                {/* 操作按钮 */}
                {showActions && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {suggestion.status === 'PENDING' && (
                            <>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<CheckOutlined />}
                                    onClick={() => onAccept?.(suggestion)}
                                    style={{ flex: 1 }}
                                >
                                    接受
                                </Button>
                                <Button
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={() => onReject?.(suggestion)}
                                    style={{ flex: 1 }}
                                >
                                    拒绝
                                </Button>
                            </>
                        )}
                        <Tooltip title="查看详情">
                            <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => onView?.(suggestion)}
                            />
                        </Tooltip>
                        {onDelete && (
                            <Tooltip title="删除">
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => onDelete?.(suggestion)}
                                />
                            </Tooltip>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyOutfitCard;
