/**
 * 今天穿什么 - 管理页面
 * 支持生成建议、查看历史记录
 */
import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Empty, Modal, message, Pagination, Tag, Statistic, Select } from 'antd';
import {
    ThunderboltOutlined,
    HistoryOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CheckCircleFilled,
    CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { usePageTitle } from '@/hooks/business/usePageTitle';
import DailyOutfitGenerator from '@/components/Outfit/DailyOutfitGenerator';
import DailyOutfitCard from '@/components/Outfit/DailyOutfitCard';
import type { DailyOutfitSuggestion, SuggestionStatus } from '@/types/outfit';
import * as dailyOutfitService from '@/services/dailyOutfitService';
import { glassCardStyle } from '@/constants/styles';

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

    .dark-glass-modal .ant-modal-footer .ant-btn-dangerous {
        background: rgba(255, 77, 79, 0.2) !important;
        border-color: rgba(255, 77, 79, 0.5) !important;
        color: #ff4d4f !important;
    }

    .dark-glass-modal .ant-modal-footer .ant-btn-dangerous:hover {
        background: rgba(255, 77, 79, 0.3) !important;
        border-color: rgba(255, 77, 79, 0.7) !important;
    }

    /* 确认对话框样式 */
    .dark-confirm-modal .ant-modal-content {
        background: rgba(35, 35, 35, 0.95) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
    }

    .dark-confirm-modal .ant-modal-confirm-title {
        color: rgba(255, 255, 255, 0.95) !important;
    }

    .dark-confirm-modal .ant-modal-confirm-content {
        color: rgba(255, 255, 255, 0.75) !important;
    }

    .dark-confirm-modal .ant-btn-default {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
        color: rgba(255, 255, 255, 0.85) !important;
    }

    .dark-confirm-modal .ant-btn-default:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
        color: white !important;
    }

    .dark-confirm-modal .ant-btn-dangerous {
        background: rgba(255, 77, 79, 0.2) !important;
        border-color: rgba(255, 77, 79, 0.5) !important;
        color: #ff4d4f !important;
    }

    .dark-confirm-modal .ant-btn-dangerous:hover {
        background: rgba(255, 77, 79, 0.35) !important;
        border-color: rgba(255, 77, 79, 0.7) !important;
    }
`;

const DailyOutfitManagement: React.FC = () => {
    usePageTitle('今天穿什么', {
        siteName: 'AnkiBlog',
        siteTagline: 'Anki的歇脚处'
    });

    const [suggestions, setSuggestions] = useState<DailyOutfitSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<SuggestionStatus | undefined>(undefined);
    const pageSize = 12;

    // 统计数据
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0
    });

    // 详情弹窗
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<DailyOutfitSuggestion | null>(null);

    useEffect(() => {
        loadSuggestions();
    }, [currentPage, statusFilter]);

    const loadSuggestions = async () => {
        setLoading(true);
        try {
            const res = await dailyOutfitService.getSuggestions({
                page: currentPage - 1,
                size: pageSize,
                status: statusFilter
            });
            if (res.success) {
                setSuggestions(res.data.content || []);
                setTotal(res.data.totalElements);

                // 简单统计（实际可以从后端获取）
                if (!statusFilter) {
                    const all = res.data.content || [];
                    setStats({
                        total: res.data.totalElements,
                        pending: all.filter((s: DailyOutfitSuggestion) => s.status === 'PENDING').length,
                        accepted: all.filter((s: DailyOutfitSuggestion) => s.status === 'ACCEPTED').length,
                        rejected: all.filter((s: DailyOutfitSuggestion) => s.status === 'REJECTED').length
                    });
                }
            }
        } catch (error) {
            console.error('加载建议列表失败:', error);
            message.error('加载建议列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (suggestion: DailyOutfitSuggestion) => {
        try {
            const res = await dailyOutfitService.acceptSuggestion(suggestion.id);
            if (res.success) {
                message.success('已接受建议，穿搭记录已创建');
                loadSuggestions();
            } else {
                message.error(res.message || '操作失败');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '操作失败');
        }
    };

    const handleReject = async (suggestion: DailyOutfitSuggestion) => {
        try {
            const res = await dailyOutfitService.rejectSuggestion(suggestion.id);
            if (res.success) {
                message.info('已拒绝该建议');
                loadSuggestions();
            } else {
                message.error(res.message || '操作失败');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '操作失败');
        }
    };

    const handleView = (suggestion: DailyOutfitSuggestion) => {
        setSelectedSuggestion(suggestion);
        setDetailModalVisible(true);
    };

    const handleDelete = async (suggestion: DailyOutfitSuggestion) => {
        Modal.confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
            content: `确定要删除 ${dayjs(suggestion.suggestionDate).format('YYYY-MM-DD')} 的穿搭建议吗？`,
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            className: 'dark-confirm-modal',
            onOk: async () => {
                try {
                    const res = await dailyOutfitService.deleteSuggestion(suggestion.id);
                    if (res.success) {
                        message.success('删除成功');
                        loadSuggestions();
                    }
                } catch (error) {
                    message.error('删除失败');
                }
            }
        });
    };

    const statsCardStyle: React.CSSProperties = {
        ...glassCardStyle,
        padding: '16px',
        textAlign: 'center'
    };

    return (
        <>
            <style>{darkModalStyles}</style>
            <div style={{ padding: '24px' }}>
                {/* 页面标题 */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ color: '#fff', fontSize: '1.5rem', margin: 0 }}>
                        <ThunderboltOutlined style={{ marginRight: '8px', color: '#ffc107' }} />
                        今天穿什么
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.65)', margin: '8px 0 0 0' }}>
                        随机推荐今日穿搭，帮您轻松决定每天穿什么
                    </p>
                </div>

                <Row gutter={[24, 24]}>
                    {/* 左侧：生成器 */}
                    <Col xs={24} lg={10}>
                        <DailyOutfitGenerator onSuccess={loadSuggestions} />

                        {/* 统计卡片 */}
                        <Row gutter={[12, 12]} style={{ marginTop: '16px' }}>
                            <Col span={8}>
                                <div style={statsCardStyle}>
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255,255,255,0.65)' }}>总建议</span>}
                                        value={stats.total}
                                        valueStyle={{ color: '#fff', fontSize: '1.2rem' }}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={statsCardStyle}>
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255,255,255,0.65)' }}>已接受</span>}
                                        value={stats.accepted}
                                        valueStyle={{ color: '#52c41a', fontSize: '1.2rem' }}
                                        prefix={<CheckCircleOutlined />}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={statsCardStyle}>
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255,255,255,0.65)' }}>待决定</span>}
                                        value={stats.pending}
                                        valueStyle={{ color: '#faad14', fontSize: '1.2rem' }}
                                        prefix={<ClockCircleOutlined />}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Col>

                    {/* 右侧：历史记录 */}
                    <Col xs={24} lg={14}>
                        <div style={glassCardStyle}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, color: '#fff' }}>
                                        <HistoryOutlined style={{ marginRight: '8px' }} />
                                        历史记录
                                    </h3>
                                    <Select
                                        style={{ width: 120 }}
                                        placeholder="筛选状态"
                                        allowClear
                                        value={statusFilter}
                                        onChange={(value) => {
                                            setStatusFilter(value);
                                            setCurrentPage(1);
                                        }}
                                        options={[
                                            { value: 'PENDING', label: '待决定' },
                                            { value: 'ACCEPTED', label: '已接受' },
                                            { value: 'REJECTED', label: '已拒绝' }
                                        ]}
                                    />
                                </div>
                            </div>

                            <div style={{ padding: '16px 20px', minHeight: '400px' }}>
                                <Spin spinning={loading}>
                                    {suggestions.length > 0 ? (
                                        <>
                                            <Row gutter={[12, 12]}>
                                                {suggestions.map((suggestion) => (
                                                    <Col key={suggestion.id} xs={24} sm={12} xl={8}>
                                                        <DailyOutfitCard
                                                            suggestion={suggestion}
                                                            onAccept={handleAccept}
                                                            onReject={handleReject}
                                                            onView={handleView}
                                                            onDelete={handleDelete}
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                            <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                                <Pagination
                                                    current={currentPage}
                                                    total={total}
                                                    pageSize={pageSize}
                                                    onChange={setCurrentPage}
                                                    showSizeChanger={false}
                                                    showTotal={(total) => `共 ${total} 条`}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <Empty
                                            description={<span style={{ color: 'rgba(255,255,255,0.45)' }}>暂无建议记录</span>}
                                            style={{ padding: '60px 0' }}
                                        />
                                    )}
                                </Spin>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* 详情弹窗 */}
                <Modal
                    title={
                        <span style={{ color: 'rgba(255,255,255,0.95)' }}>
                            <ThunderboltOutlined style={{ marginRight: '8px', color: '#ffc107' }} />
                            穿搭建议详情
                        </span>
                    }
                    open={detailModalVisible}
                    onCancel={() => setDetailModalVisible(false)}
                    footer={null}
                    width={600}
                    className="dark-glass-modal"
                >
                    {selectedSuggestion && (() => {
                        // 根据状态过滤要显示的商品
                        const displayItems = selectedSuggestion.status === 'ACCEPTED'
                            ? selectedSuggestion.items.filter(item => item.accepted === true)
                            : selectedSuggestion.items;
                        const acceptedCount = selectedSuggestion.items.filter(item => item.accepted === true).length;
                        const rejectedCount = selectedSuggestion.items.filter(item => item.accepted === false).length;

                        return (
                        <div>
                            <div style={{ marginBottom: '16px' }}>
                                <Tag color={
                                    selectedSuggestion.status === 'ACCEPTED' ? 'green' :
                                    selectedSuggestion.status === 'REJECTED' ? 'default' : 'gold'
                                }>
                                    {selectedSuggestion.statusDisplayName}
                                </Tag>
                                <span style={{ marginLeft: '8px', color: 'rgba(255,255,255,0.75)' }}>
                                    {dayjs(selectedSuggestion.suggestionDate).format('YYYY-MM-DD')}
                                </span>
                            </div>

                            {/* ACCEPTED状态显示统计信息 */}
                            {selectedSuggestion.status === 'ACCEPTED' && (
                                <div style={{
                                    marginBottom: '16px',
                                    padding: '8px 12px',
                                    background: 'rgba(82, 196, 26, 0.15)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(82, 196, 26, 0.3)',
                                    color: 'rgba(255,255,255,0.85)',
                                    fontSize: '0.9rem'
                                }}>
                                    已接受 <span style={{ color: '#52c41a', fontWeight: 500 }}>{acceptedCount}</span> 件
                                    {rejectedCount > 0 && (
                                        <>，放弃 <span style={{ color: '#ff4d4f', fontWeight: 500 }}>{rejectedCount}</span> 件</>
                                    )}
                                </div>
                            )}

                            <h4 style={{ color: 'rgba(255,255,255,0.95)', marginBottom: '12px' }}>
                                {selectedSuggestion.status === 'ACCEPTED' ? '已接受单品：' : '推荐单品：'}
                            </h4>
                            <Row gutter={[12, 12]}>
                                {displayItems.map((item, index) => (
                                    <Col key={index} span={8}>
                                        <div style={{
                                            border: selectedSuggestion.status === 'ACCEPTED'
                                                ? '2px solid rgba(82, 196, 26, 0.5)'
                                                : selectedSuggestion.status === 'REJECTED'
                                                    ? '2px solid rgba(255, 77, 79, 0.3)'
                                                    : '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            textAlign: 'center',
                                            background: selectedSuggestion.status === 'ACCEPTED'
                                                ? 'rgba(82, 196, 26, 0.1)'
                                                : selectedSuggestion.status === 'REJECTED'
                                                    ? 'rgba(255, 77, 79, 0.1)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                            position: 'relative'
                                        }}>
                                            {/* 状态图标 */}
                                            {selectedSuggestion.status === 'ACCEPTED' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    zIndex: 1
                                                }}>
                                                    <CheckCircleFilled style={{ color: '#52c41a', fontSize: '16px' }} />
                                                </div>
                                            )}
                                            {selectedSuggestion.status === 'REJECTED' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    zIndex: 1
                                                }}>
                                                    <CloseOutlined style={{ color: '#ff4d4f', fontSize: '14px' }} />
                                                </div>
                                            )}
                                            <img
                                                src={item.productMainImage}
                                                alt={item.productName}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    opacity: selectedSuggestion.status === 'REJECTED' ? 0.5 : 1
                                                }}
                                            />
                                            <p style={{
                                                margin: '8px 0 0 0',
                                                fontSize: '0.85rem',
                                                color: selectedSuggestion.status === 'REJECTED'
                                                    ? 'rgba(255, 255, 255, 0.5)'
                                                    : 'rgba(255, 255, 255, 0.9)',
                                                textDecoration: selectedSuggestion.status === 'REJECTED' ? 'line-through' : 'none'
                                            }}>
                                                {item.productName}
                                            </p>
                                            {item.brand && (
                                                <p style={{
                                                    margin: '4px 0 0 0',
                                                    fontSize: '0.75rem',
                                                    color: 'rgba(255, 255, 255, 0.5)'
                                                }}>
                                                    {item.brand}
                                                </p>
                                            )}
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            {selectedSuggestion.note && (
                                <div style={{ marginTop: '20px' }}>
                                    <h4 style={{ color: 'rgba(255,255,255,0.95)', marginBottom: '8px' }}>备注：</h4>
                                    <p style={{
                                        color: 'rgba(255,255,255,0.75)',
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '8px'
                                    }}>
                                        {selectedSuggestion.note}
                                    </p>
                                </div>
                            )}

                            {selectedSuggestion.outfitLogId && (
                                <div style={{ marginTop: '16px' }}>
                                    <Tag color="green">已生成穿搭记录</Tag>
                                </div>
                            )}

                            <div style={{
                                marginTop: '20px',
                                fontSize: '0.85rem',
                                color: 'rgba(255, 255, 255, 0.5)',
                                paddingTop: '16px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <p style={{ margin: 0 }}>
                                    创建时间：{dayjs(selectedSuggestion.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                                </p>
                            </div>
                        </div>
                        );
                    })()}
                </Modal>
            </div>
        </>
    );
};

export default DailyOutfitManagement;
