/**
 * 今天穿什么 - 生成建议组件
 * 用于抽取和展示今日穿搭建议
 * 支持选择部分商品接受或拒绝
 */
import React, { useState } from 'react';
import { Button, Image, Tooltip, Space, message, Spin, Modal, Input, InputNumber } from 'antd';
import {
    ThunderboltOutlined,
    ReloadOutlined,
    CheckOutlined,
    CloseOutlined,
    SettingOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { DailyOutfitSuggestion, DailyOutfitGenerateRequest } from '@/types/outfit';
import * as dailyOutfitService from '@/services/dailyOutfitService';
import { glassCardStyle } from '@/constants/styles';

interface DailyOutfitGeneratorProps {
    onSuccess?: () => void;
}

const DailyOutfitGenerator: React.FC<DailyOutfitGeneratorProps> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<DailyOutfitSuggestion | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
    // 记录被接受的商品ID（用于接受后只展示选中的商品）
    const [, setAcceptedProductIds] = useState<string[]>([]);
    // 当前展示的商品索引（用于切换显示）
    const [, setCurrentDisplayIndex] = useState(0);
    const [settings, setSettings] = useState<DailyOutfitGenerateRequest>({
        itemCount: 3,
        isPublic: true
    });

    // 切换商品选中状态
    const toggleProductSelection = (productId: string) => {
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    // 全选/取消全选
    const toggleSelectAll = () => {
        if (!suggestion) return;
        if (selectedProductIds.size === suggestion.items.length) {
            setSelectedProductIds(new Set());
        } else {
            setSelectedProductIds(new Set(suggestion.items.map(item => item.productId)));
        }
    };

    // 生成建议
    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await dailyOutfitService.generateSuggestion(settings);
            if (res.success) {
                setSuggestion(res.data);
                // 默认全选所有商品
                setSelectedProductIds(new Set(res.data.items.map(item => item.productId)));
                // 重置接受状态
                setAcceptedProductIds([]);
                setCurrentDisplayIndex(0);
                message.success('抽取成功！点击商品卡片可选择要接受的单品');
            } else {
                message.error(res.message || '生成失败');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '生成失败');
        } finally {
            setLoading(false);
        }
    };

    // 重新抽取
    const handleRegenerate = async () => {
        setLoading(true);
        try {
            const res = await dailyOutfitService.regenerateSuggestion(settings);
            if (res.success) {
                setSuggestion(res.data);
                // 默认全选所有商品
                setSelectedProductIds(new Set(res.data.items.map(item => item.productId)));
                // 重置接受状态
                setAcceptedProductIds([]);
                setCurrentDisplayIndex(0);
                message.success('重新抽取成功！');
            } else {
                message.error(res.message || '重新抽取失败');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '重新抽取失败');
        } finally {
            setLoading(false);
        }
    };

    // 接受建议（只接受选中的商品）
    const handleAccept = async () => {
        if (!suggestion) return;
        if (selectedProductIds.size === 0) {
            message.warning('请至少选择一件商品');
            return;
        }
        setLoading(true);
        try {
            const selectedIds = Array.from(selectedProductIds);
            const res = await dailyOutfitService.acceptSuggestion(suggestion.id, {
                selectedProductIds: selectedIds
            });
            if (res.success) {
                setSuggestion(res.data);
                // 保存被接受的商品ID用于展示
                setAcceptedProductIds(selectedIds);
                setCurrentDisplayIndex(0);
                const count = selectedProductIds.size;
                message.success(`已接受 ${count} 件商品，穿搭记录已创建！`);
                onSuccess?.();
            } else {
                message.error(res.message || '接受失败');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '接受失败');
        } finally {
            setLoading(false);
        }
    };

    // 拒绝建议
    const handleReject = async () => {
        if (!suggestion) return;
        setLoading(true);
        try {
            const res = await dailyOutfitService.rejectSuggestion(suggestion.id);
            if (res.success) {
                setSuggestion(res.data);
                message.info('已拒绝该建议');
                onSuccess?.();
            } else {
                message.error(res.message || '拒绝失败');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '拒绝失败');
        } finally {
            setLoading(false);
        }
    };

    // 暗色玻璃拟态 Modal 样式
    const darkModalStyles = `
        .dark-glass-modal .ant-modal-content {
            background: rgba(35, 35, 35, 0.9) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 16px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
        }

        .dark-glass-modal .ant-modal-header {
            background: transparent !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 16px 24px !important;
        }

        .dark-glass-modal .ant-modal-title {
            color: rgba(255, 255, 255, 0.95) !important;
            font-weight: 600 !important;
        }

        .dark-glass-modal .ant-modal-close {
            color: rgba(255, 255, 255, 0.65) !important;
        }

        .dark-glass-modal .ant-modal-close:hover {
            color: rgba(255, 255, 255, 0.95) !important;
            background: rgba(255, 255, 255, 0.1) !important;
        }

        .dark-glass-modal .ant-modal-body {
            padding: 24px !important;
            color: rgba(255, 255, 255, 0.85) !important;
        }

        .dark-glass-modal .ant-modal-footer {
            background: transparent !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 12px 24px !important;
        }

        .dark-glass-modal .ant-modal-footer .ant-btn-default {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: rgba(255, 255, 255, 0.85) !important;
        }

        .dark-glass-modal .ant-modal-footer .ant-btn-default:hover {
            background: rgba(255, 255, 255, 0.15) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
            color: white !important;
        }

        .dark-glass-modal .ant-modal-footer .ant-btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            border: none !important;
        }

        .dark-glass-modal .ant-input-number,
        .dark-glass-modal .ant-input,
        .dark-glass-modal .ant-input-affix-wrapper,
        .dark-glass-modal textarea.ant-input {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: rgba(255, 255, 255, 0.9) !important;
        }

        .dark-glass-modal .ant-input-number:hover,
        .dark-glass-modal .ant-input:hover,
        .dark-glass-modal .ant-input-affix-wrapper:hover,
        .dark-glass-modal textarea.ant-input:hover {
            border-color: rgba(255, 255, 255, 0.4) !important;
        }

        .dark-glass-modal .ant-input-number:focus,
        .dark-glass-modal .ant-input:focus,
        .dark-glass-modal .ant-input-affix-wrapper:focus,
        .dark-glass-modal textarea.ant-input:focus,
        .dark-glass-modal .ant-input-number-focused,
        .dark-glass-modal .ant-input-affix-wrapper-focused {
            border-color: #667eea !important;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
        }

        .dark-glass-modal .ant-input::placeholder,
        .dark-glass-modal textarea.ant-input::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
        }

        .dark-glass-modal .ant-input-number-handler-wrap {
            background: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
        }

        .dark-glass-modal .ant-input-number-handler {
            border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .dark-glass-modal .ant-input-number-handler:hover {
            background: rgba(255, 255, 255, 0.1) !important;
        }

        .dark-glass-modal .ant-input-number-handler-up-inner,
        .dark-glass-modal .ant-input-number-handler-down-inner {
            color: rgba(255, 255, 255, 0.65) !important;
        }

        .dark-glass-modal label {
            color: rgba(255, 255, 255, 0.85) !important;
        }
    `;

    return (
        <>
            <style>{darkModalStyles}</style>
            <div style={glassCardStyle}>
                <Spin spinning={loading}>
                    <div style={{ padding: '20px' }}>
                        {/* 标题栏 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>
                                <ThunderboltOutlined style={{ marginRight: '8px', color: '#ffc107' }} />
                                今天穿什么？
                            </h3>
                            <Tooltip title="设置">
                                <Button
                                    type="text"
                                    icon={<SettingOutlined />}
                                    onClick={() => setShowSettings(true)}
                                    style={{ color: 'rgba(255,255,255,0.7)' }}
                                />
                            </Tooltip>
                        </div>

                        {/* 未生成时显示按钮 */}
                        {!suggestion && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '20px' }}>
                                    点击下方按钮，让系统为您随机推荐今日穿搭
                                </p>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ThunderboltOutlined />}
                                    onClick={handleGenerate}
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        height: '48px',
                                        fontSize: '1rem',
                                        borderRadius: '24px',
                                        padding: '0 32px'
                                    }}
                                >
                                    抽取今日穿搭
                                </Button>
                            </div>
                        )}

                        {/* 已生成时显示结果 */}
                        {suggestion && (
                            <div>
                                {/* 选择提示和全选按钮 */}
                                {suggestion.status === 'PENDING' && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                        padding: '8px 12px',
                                        background: 'rgba(255, 193, 7, 0.15)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 193, 7, 0.3)'
                                    }}>
                                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
                                            点击商品卡片选择要接受的单品（已选 {selectedProductIds.size}/{suggestion.items.length}）
                                        </span>
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={toggleSelectAll}
                                            style={{ color: 'rgba(255,193,7,0.9)', padding: '0 8px' }}
                                        >
                                            {selectedProductIds.size === suggestion.items.length ? '取消全选' : '全选'}
                                        </Button>
                                    </div>
                                )}

                                {/* 商品展示 - PENDING状态：显示所有可选择 */}
                                {suggestion.status === 'PENDING' && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                        gap: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        {suggestion.items.map((item, index) => {
                                            const isSelected = selectedProductIds.has(item.productId);
                                            return (
                                                <Tooltip key={index} title={`${item.productName}${item.brand ? ` - ${item.brand}` : ''} ${isSelected ? '(已选中)' : '(点击选中)'}`}>
                                                    <div
                                                        onClick={() => toggleProductSelection(item.productId)}
                                                        style={{
                                                            background: isSelected ? 'rgba(82, 196, 26, 0.2)' : 'rgba(255,255,255,0.1)',
                                                            borderRadius: '12px',
                                                            padding: '8px',
                                                            textAlign: 'center',
                                                            cursor: 'pointer',
                                                            border: isSelected ? '2px solid rgba(82, 196, 26, 0.6)' : '2px solid transparent',
                                                            transition: 'all 0.2s ease',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '4px',
                                                                right: '4px',
                                                                zIndex: 1
                                                            }}>
                                                                <CheckCircleFilled style={{ color: '#52c41a', fontSize: '16px' }} />
                                                            </div>
                                                        )}
                                                        <Image
                                                            src={item.productMainImage}
                                                            alt={item.productName}
                                                            style={{
                                                                width: '64px',
                                                                height: '64px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px',
                                                                opacity: isSelected ? 1 : 0.5
                                                            }}
                                                            preview={false}
                                                        />
                                                        <p style={{
                                                            color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)',
                                                            fontSize: '0.7rem',
                                                            margin: '6px 0 0 0',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {item.productName}
                                                        </p>
                                                    </div>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* 商品展示 - ACCEPTED状态：只显示被接受的商品 */}
                                {suggestion.status === 'ACCEPTED' && (() => {
                                    // 只显示被接受的商品
                                    const acceptedItems = suggestion.items.filter(item => item.accepted === true);
                                    const rejectedCount = suggestion.items.filter(item => item.accepted === false).length;

                                    return (
                                        <div style={{ marginBottom: '16px' }}>
                                            {/* 统计信息 */}
                                            <div style={{
                                                marginBottom: '12px',
                                                padding: '8px 12px',
                                                background: 'rgba(82, 196, 26, 0.15)',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(82, 196, 26, 0.3)',
                                                color: 'rgba(255,255,255,0.85)',
                                                fontSize: '0.85rem'
                                            }}>
                                                已接受 <span style={{ color: '#52c41a', fontWeight: 500 }}>{acceptedItems.length}</span> 件
                                                {rejectedCount > 0 && (
                                                    <>，放弃 <span style={{ color: '#ff4d4f', fontWeight: 500 }}>{rejectedCount}</span> 件</>
                                                )}
                                            </div>

                                            {/* 商品列表 - 只显示接受的商品 */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                                gap: '12px'
                                            }}>
                                                {acceptedItems.map((item, index) => (
                                                    <Tooltip
                                                        key={index}
                                                        title={`${item.productName}${item.brand ? ` - ${item.brand}` : ''}`}
                                                    >
                                                        <div style={{
                                                            background: 'rgba(82, 196, 26, 0.15)',
                                                            borderRadius: '12px',
                                                            padding: '8px',
                                                            textAlign: 'center',
                                                            border: '2px solid rgba(82, 196, 26, 0.5)',
                                                            position: 'relative'
                                                        }}>
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '4px',
                                                                right: '4px',
                                                                zIndex: 1
                                                            }}>
                                                                <CheckCircleFilled style={{ color: '#52c41a', fontSize: '14px' }} />
                                                            </div>
                                                            <Image
                                                                src={item.productMainImage}
                                                                alt={item.productName}
                                                                style={{
                                                                    width: '64px',
                                                                    height: '64px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '8px'
                                                                }}
                                                                preview={true}
                                                            />
                                                            <p style={{
                                                                color: 'rgba(255,255,255,0.95)',
                                                                fontSize: '0.7rem',
                                                                margin: '6px 0 0 0',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {item.productName}
                                                            </p>
                                                        </div>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* 商品展示 - REJECTED状态：显示所有被拒绝的商品 */}
                                {suggestion.status === 'REJECTED' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        {/* 统计信息 */}
                                        <div style={{
                                            marginBottom: '12px',
                                            padding: '8px 12px',
                                            background: 'rgba(255, 77, 79, 0.15)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 77, 79, 0.3)',
                                            color: 'rgba(255,255,255,0.85)',
                                            fontSize: '0.85rem'
                                        }}>
                                            已拒绝全部 <span style={{ color: '#ff4d4f', fontWeight: 500 }}>{suggestion.items.length}</span> 件商品
                                        </div>

                                        {/* 商品列表 */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                            gap: '12px'
                                        }}>
                                            {suggestion.items.map((item, index) => (
                                                <Tooltip
                                                    key={index}
                                                    title={`${item.productName}${item.brand ? ` - ${item.brand}` : ''} (已拒绝)`}
                                                >
                                                    <div style={{
                                                        background: 'rgba(255, 77, 79, 0.1)',
                                                        borderRadius: '12px',
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        border: '2px solid rgba(255, 77, 79, 0.3)',
                                                        position: 'relative'
                                                    }}>
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '4px',
                                                            right: '4px',
                                                            zIndex: 1
                                                        }}>
                                                            <CloseOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
                                                        </div>
                                                        <Image
                                                            src={item.productMainImage}
                                                            alt={item.productName}
                                                            style={{
                                                                width: '64px',
                                                                height: '64px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px',
                                                                opacity: 0.5
                                                            }}
                                                            preview={false}
                                                        />
                                                        <p style={{
                                                            color: 'rgba(255,255,255,0.5)',
                                                            fontSize: '0.7rem',
                                                            margin: '6px 0 0 0',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            textDecoration: 'line-through'
                                                        }}>
                                                            {item.productName}
                                                        </p>
                                                    </div>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 状态信息 */}
                                <div style={{
                                    marginBottom: '16px',
                                    padding: '8px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    color: 'rgba(255,255,255,0.65)'
                                }}>
                                    <span>日期：{dayjs(suggestion.suggestionDate).format('YYYY-MM-DD')}</span>
                                    <span style={{ marginLeft: '16px' }}>状态：{suggestion.statusDisplayName}</span>
                                </div>

                                {/* 操作按钮 */}
                                <Space style={{ width: '100%' }} wrap>
                                    {suggestion.status === 'PENDING' && (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<CheckOutlined />}
                                                onClick={handleAccept}
                                                disabled={selectedProductIds.size === 0}
                                                style={{
                                                    background: selectedProductIds.size > 0 ? '#52c41a' : 'rgba(255,255,255,0.1)',
                                                    borderColor: selectedProductIds.size > 0 ? '#52c41a' : 'rgba(255,255,255,0.2)'
                                                }}
                                            >
                                                接受选中 ({selectedProductIds.size})
                                            </Button>
                                            <Button
                                                icon={<CloseOutlined />}
                                                onClick={handleReject}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    borderColor: 'rgba(255,255,255,0.2)',
                                                    color: 'rgba(255,255,255,0.85)'
                                                }}
                                            >
                                                全部拒绝
                                            </Button>
                                            <Button
                                                icon={<ReloadOutlined />}
                                                onClick={handleRegenerate}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    borderColor: 'rgba(255,255,255,0.2)',
                                                    color: 'rgba(255,255,255,0.85)'
                                                }}
                                            >
                                                重新抽取
                                            </Button>
                                        </>
                                    )}
                                    {suggestion.status !== 'PENDING' && (
                                        <Button
                                            type="primary"
                                            icon={<ThunderboltOutlined />}
                                            onClick={handleGenerate}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none'
                                            }}
                                        >
                                            再次抽取
                                        </Button>
                                    )}
                                </Space>
                            </div>
                        )}
                    </div>
                </Spin>

                {/* 设置弹窗 */}
                <Modal
                    title={
                        <span style={{ color: 'rgba(255,255,255,0.95)' }}>
                            <SettingOutlined style={{ marginRight: '8px' }} />
                            抽取设置
                        </span>
                    }
                    open={showSettings}
                    onCancel={() => setShowSettings(false)}
                    onOk={() => setShowSettings(false)}
                    okText="确定"
                    cancelText="取消"
                    className="dark-glass-modal"
                >
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.85)' }}>
                            抽取数量：
                        </label>
                        <InputNumber
                            min={1}
                            max={10}
                            value={settings.itemCount}
                            onChange={(value) => setSettings({ ...settings, itemCount: value || 3 })}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.85)' }}>
                            备注：
                        </label>
                        <Input.TextArea
                            value={settings.note}
                            onChange={(e) => setSettings({ ...settings, note: e.target.value })}
                            placeholder="可选：添加备注信息"
                            rows={3}
                        />
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default DailyOutfitGenerator;
