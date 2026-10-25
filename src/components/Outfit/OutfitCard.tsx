/**
 * 穿搭卡片组件
 * 展示单个穿搭记录
 */
import React from 'react';
import { Tag, Image, Tooltip } from 'antd';
import { CalendarOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { OutfitLog } from '@/types/outfit';
import { interactiveGlassCardStyle, secondaryTextStyle } from '@/constants/styles';
import { getOutfitDisplayImage } from '@/utils/outfit';

interface OutfitCardProps {
    outfit: OutfitLog;
    onView?: (outfit: OutfitLog) => void;
    onDelete?: (outfit: OutfitLog) => void;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onView, onDelete }) => {
    const glassCardStyle = interactiveGlassCardStyle;

    // 获取主要单品和配饰
    const mainItems = outfit.items.filter(item => item.itemType === 'MAIN');
    const accessories = outfit.items.filter(item => item.itemType === 'ACCESSORY');

    // 获取显示图片（优先使用穿搭实拍图，否则使用第一个商品图）
    const displayImage = getOutfitDisplayImage(outfit);

    return (
        <div
            style={glassCardStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => onView?.(outfit)}
        >
            {/* 图片区域 */}
            <div style={{ position: 'relative', height: '180px' }}>
                <Image
                    src={displayImage}
                    alt="穿搭"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    preview={false}
                />
                {/* 日期标签 */}
                <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                    <Tag color="blue" style={{ fontSize: '0.75rem' }}>
                        <CalendarOutlined /> {dayjs(outfit.outfitDate).format('MM/DD')}
                    </Tag>
                </div>
                {/* 操作按钮 */}
                <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                    <Tooltip title="查看详情">
                        <Tag
                            color="green"
                            style={{ cursor: 'pointer', margin: 0 }}
                            onClick={(e) => { e.stopPropagation(); onView?.(outfit); }}
                        >
                            <EyeOutlined />
                        </Tag>
                    </Tooltip>
                    {onDelete && (
                        <Tooltip title="删除">
                            <Tag
                                color="red"
                                style={{ cursor: 'pointer', margin: 0 }}
                                onClick={(e) => { e.stopPropagation(); onDelete(outfit); }}
                            >
                                <DeleteOutlined />
                            </Tag>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* 内容区域 */}
            <div style={{ padding: '12px' }}>
                {/* 商品缩略图组 */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    {outfit.items.slice(0, 4).map((item, index) => (
                        <Tooltip key={index} title={`${item.productName} (${item.itemType === 'MAIN' ? '主要' : '配饰'})`}>
                            <Image
                                src={item.productMainImage}
                                alt={item.productName}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: item.itemType === 'MAIN'
                                        ? '2px solid rgba(59, 130, 246, 0.6)'
                                        : '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                                preview={false}
                            />
                        </Tooltip>
                    ))}
                    {outfit.items.length > 4 && (
                        <span style={{ ...secondaryTextStyle, fontSize: '0.75rem', alignSelf: 'center' }}>
                            +{outfit.items.length - 4}
                        </span>
                    )}
                </div>

                {/* 统计信息 */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <Tag color="blue" style={{ fontSize: '0.7rem', margin: 0 }}>
                        主要 {mainItems.length}
                    </Tag>
                    <Tag color="purple" style={{ fontSize: '0.7rem', margin: 0 }}>
                        配饰 {accessories.length}
                    </Tag>
                </div>

                {/* 备注 */}
                {outfit.note && (
                    <p style={{
                        ...secondaryTextStyle,
                        fontSize: '0.8rem',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {outfit.note}
                    </p>
                )}
            </div>
        </div>
    );
};

export default OutfitCard;
