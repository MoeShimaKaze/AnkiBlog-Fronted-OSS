/**
 * 化妆记录管理页面
 * 支持日历视图和卡片画廊视图切换
 */
import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Row, Col, Spin, Empty, Modal, message, Segmented, Statistic } from 'antd';
import {
    CalendarOutlined,
    AppstoreOutlined,
    PlusOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    SkinOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { usePageTitle } from '@/hooks/business/usePageTitle';
import MakeupCalendar from '@/components/Makeup/MakeupCalendar';
import MakeupCard from '@/components/Makeup/MakeupCard';
import MakeupCreateModal from '@/components/Makeup/MakeupCreateModal';
import type { MakeupLog, MakeupStats } from '@/types/makeup';
import * as makeupService from '@/services/makeupService';
import { glassCardStyle } from '@/constants/styles';

type ViewMode = 'calendar' | 'gallery';

const MakeupManagement: React.FC = () => {
    usePageTitle('化妆记录', {
        siteName: 'AnkiBlog',
        siteTagline: 'Anki的歇脚处'
    });

    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [makeups, setMakeups] = useState<MakeupLog[]>([]);
    const [stats, setStats] = useState<MakeupStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 12;

    // 弹窗状态
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedMakeup, setSelectedMakeup] = useState<MakeupLog | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        if (viewMode === 'gallery') {
            loadMakeups();
        }
    }, [viewMode, currentPage]);

    const loadMakeups = async () => {
        setLoading(true);
        try {
            const res = await makeupService.getMakeups({ page: currentPage - 1, size: pageSize });
            if (res.success) {
                setMakeups(res.data.content || []);
                setTotal(res.data.totalElements);
            }
        } catch (error) {
            console.error('加载化妆记录列表失败:', error);
            message.error('加载化妆记录列表失败');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const res = await makeupService.getMakeupStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    };

    const handleAddMakeup = (date: Dayjs) => {
        setSelectedDate(date);
        setCreateModalVisible(true);
    };

    const handleViewMakeup = (makeup: MakeupLog) => {
        setSelectedMakeup(makeup);
        setDetailModalVisible(true);
    };

    const handleDeleteMakeup = async (makeup: MakeupLog) => {
        Modal.confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
            content: `确定要删除 ${dayjs(makeup.makeupDate).format('YYYY-MM-DD')} 的化妆记录吗？`,
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            className: 'dark-confirm-modal',
            onOk: async () => {
                try {
                    const res = await makeupService.deleteMakeup(makeup.id);
                    if (res.success) {
                        message.success('删除成功');
                        if (viewMode === 'gallery') {
                            loadMakeups();
                        }
                        loadStats();
                    }
                } catch (error) {
                    message.error('删除失败');
                }
            }
        });
    };

    const handleCreateSuccess = () => {
        setCreateModalVisible(false);
        if (viewMode === 'gallery') {
            loadMakeups();
        }
        loadStats();
    };

    const handleDateSelect = (date: Dayjs, makeups: MakeupLog[]) => {
        if (makeups.length > 0) {
            setSelectedMakeup(makeups[0]);
            setDetailModalVisible(true);
        } else {
            setSelectedDate(date);
        }
    };

    const statsCardStyle: React.CSSProperties = {
        ...glassCardStyle,
        padding: '20px',
        textAlign: 'center'
    };

    // 暗色玻璃拟态Modal样式
    const detailModalStyles = {
        mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
        },
        content: {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        },
        header: {
            backgroundColor: 'transparent',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
        },
        body: {
            backgroundColor: 'transparent',
            padding: '24px',
        },
        footer: {
            backgroundColor: 'transparent',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        },
    };

    return (
        <div style={{ padding: '16px', minHeight: '100vh' }}>
            {/* 全局暗色样式 */}
            <style>{`
                /* Segmented 暗色玻璃拟态样式 */
                .dark-segmented.ant-segmented {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 10px !important;
                    padding: 3px !important;
                }
                .dark-segmented .ant-segmented-item {
                    color: rgba(255, 255, 255, 0.7) !important;
                    transition: all 0.3s ease !important;
                }
                .dark-segmented .ant-segmented-item:hover {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .dark-segmented .ant-segmented-item-selected {
                    background: linear-gradient(135deg, rgba(235, 47, 150, 0.8) 0%, rgba(114, 46, 209, 0.8) 100%) !important;
                    color: white !important;
                    border-radius: 8px !important;
                    box-shadow: 0 4px 12px rgba(235, 47, 150, 0.3) !important;
                }
                .dark-segmented .ant-segmented-thumb {
                    background: transparent !important;
                }
                .dark-segmented .ant-segmented-item-label {
                    min-height: 32px !important;
                    line-height: 32px !important;
                    padding: 0 12px !important;
                }
                .dark-segmented .ant-segmented-item-icon {
                    margin-right: 6px !important;
                }
                @media (max-width: 640px) {
                    .dark-segmented .ant-segmented-item-label {
                        padding: 0 8px !important;
                    }
                    .dark-segmented .ant-segmented-item-icon + span {
                        display: none !important;
                    }
                }

                /* 详情弹窗样式 */
                .detail-modal .ant-modal-title {
                    color: white !important;
                }
                .detail-modal .ant-modal-close {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                .detail-modal .ant-modal-close:hover {
                    color: white !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .detail-modal .ant-modal-footer .ant-btn-default {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .detail-modal .ant-modal-footer .ant-btn-default:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                }
                .detail-modal .ant-modal-footer .ant-btn-dangerous {
                    background: rgba(255, 77, 79, 0.2) !important;
                    border: 1px solid rgba(255, 77, 79, 0.4) !important;
                    color: #ff7875 !important;
                }
                .detail-modal .ant-modal-footer .ant-btn-dangerous:hover {
                    background: rgba(255, 77, 79, 0.3) !important;
                    border-color: rgba(255, 77, 79, 0.6) !important;
                    color: #ff4d4f !important;
                }

                /* 确认弹窗暗色样式 */
                .dark-confirm-modal .ant-modal-content {
                    background: rgba(30, 30, 30, 0.95) !important;
                    backdrop-filter: blur(20px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 16px !important;
                }
                .dark-confirm-modal .ant-modal-confirm-title {
                    color: white !important;
                }
                .dark-confirm-modal .ant-modal-confirm-content {
                    color: rgba(255, 255, 255, 0.8) !important;
                }
                .dark-confirm-modal .ant-btn-default {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .dark-confirm-modal .ant-btn-default:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                }
                .dark-confirm-modal .ant-btn-dangerous {
                    background: rgba(255, 77, 79, 0.8) !important;
                    border: none !important;
                }
                .dark-confirm-modal .ant-btn-dangerous:hover {
                    background: rgba(255, 77, 79, 1) !important;
                }

                /* 分页按钮暗色样式 */
                .dark-pagination .ant-btn {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    color: rgba(255, 255, 255, 0.9) !important;
                }
                .dark-pagination .ant-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                }
                .dark-pagination .ant-btn:disabled {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(255, 255, 255, 0.1) !important;
                    color: rgba(255, 255, 255, 0.3) !important;
                }
            `}</style>

            {/* 页面标题 */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '24px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <h1 style={{
                        color: 'white',
                        fontSize: 'clamp(20px, 5vw, 28px)',
                        fontWeight: 'bold',
                        margin: 0,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}>
                        <SkinOutlined style={{ marginRight: '12px' }} />
                        化妆记录
                    </h1>
                    <Space wrap size={8}>
                        <Segmented
                            value={viewMode}
                            onChange={(value) => setViewMode(value as ViewMode)}
                            options={[
                                { label: '日历', value: 'calendar', icon: <CalendarOutlined /> },
                                { label: '画廊', value: 'gallery', icon: <AppstoreOutlined /> }
                            ]}
                            className="dark-segmented"
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleAddMakeup(dayjs())}
                            style={{
                                background: 'linear-gradient(135deg, #eb2f96 0%, #722ed1 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                height: '40px',
                                boxShadow: '0 4px 12px rgba(235, 47, 150, 0.3)'
                            }}
                        >
                            <span className="hidden sm:inline">记录化妆</span>
                        </Button>
                    </Space>
                </div>
            </div>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={12} sm={6}>
                    <div style={statsCardStyle}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>总化妆次数</span>}
                            value={stats?.totalMakeupCount || 0}
                            valueStyle={{ color: '#eb2f96' }}
                        />
                    </div>
                </Col>
                <Col xs={12} sm={6}>
                    <div style={statsCardStyle}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>本月化妆</span>}
                            value={stats?.monthlyMakeupCount || 0}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </div>
                </Col>
                <Col xs={12} sm={6}>
                    <div style={statsCardStyle}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>使用化妆品数</span>}
                            value={stats?.uniqueProductCount || 0}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </div>
                </Col>
                <Col xs={12} sm={6}>
                    <div style={statsCardStyle}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>平均化妆品/次</span>}
                            value={stats?.averageItemsPerMakeup?.toFixed(1) || '0'}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </div>
                </Col>
            </Row>

            {/* 主内容区 */}
            {viewMode === 'calendar' ? (
                <MakeupCalendar
                    onDateSelect={handleDateSelect}
                    onAddMakeup={handleAddMakeup}
                />
            ) : (
                <Card style={glassCardStyle} styles={{ body: { padding: '24px' } }}>
                    <Spin spinning={loading}>
                        {makeups.length > 0 ? (
                            <>
                                <Row gutter={[16, 16]}>
                                    {makeups.map(makeup => (
                                        <Col key={makeup.id} xs={24} sm={12} md={8} lg={6}>
                                            <MakeupCard
                                                makeup={makeup}
                                                onView={handleViewMakeup}
                                                onDelete={handleDeleteMakeup}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                                {/* 分页 */}
                                {total > pageSize && (
                                    <div className="dark-pagination" style={{ textAlign: 'center', marginTop: '24px' }}>
                                        <Button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            style={{ marginRight: '8px' }}
                                        >
                                            上一页
                                        </Button>
                                        <span style={{ color: 'rgba(255,255,255,0.8)', margin: '0 16px' }}>
                                            第 {currentPage} 页 / 共 {Math.ceil(total / pageSize)} 页
                                        </span>
                                        <Button
                                            disabled={currentPage >= Math.ceil(total / pageSize)}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                        >
                                            下一页
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                        暂无化妆记录，快去记录你的第一次妆容吧！
                                    </span>
                                }
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleAddMakeup(dayjs())}
                                    style={{
                                        background: 'linear-gradient(135deg, #eb2f96 0%, #722ed1 100%)',
                                        border: 'none'
                                    }}
                                >
                                    记录化妆
                                </Button>
                            </Empty>
                        )}
                    </Spin>
                </Card>
            )}

            {/* 创建化妆记录弹窗 */}
            <MakeupCreateModal
                visible={createModalVisible}
                initialDate={selectedDate}
                onClose={() => setCreateModalVisible(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* 化妆记录详情弹窗 */}
            <Modal
                title={`化妆详情 - ${selectedMakeup ? dayjs(selectedMakeup.makeupDate).format('YYYY-MM-DD HH:mm') : ''}`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                className="detail-modal"
                footer={[
                    <Button
                        key="delete"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            if (selectedMakeup) {
                                handleDeleteMakeup(selectedMakeup);
                                setDetailModalVisible(false);
                            }
                        }}
                    >
                        删除
                    </Button>,
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        关闭
                    </Button>
                ]}
                width={600}
                styles={detailModalStyles}
            >
                {selectedMakeup && (
                    <div>
                        {/* 妆面名称 */}
                        {selectedMakeup.lookName && (
                            <div style={{
                                marginBottom: '16px',
                                padding: '12px',
                                background: 'rgba(235, 47, 150, 0.1)',
                                borderRadius: '8px',
                                border: '1px solid rgba(235, 47, 150, 0.3)'
                            }}>
                                <h3 style={{ color: '#f759ab', margin: 0 }}>{selectedMakeup.lookName}</h3>
                            </div>
                        )}

                        {/* 参考链接 */}
                        {selectedMakeup.referenceUrl && (
                            <div style={{ marginBottom: '16px' }}>
                                <a
                                    href={selectedMakeup.referenceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#eb2f96' }}
                                >
                                    查看参考教程 →
                                </a>
                            </div>
                        )}

                        {/* 使用化妆品列表 */}
                        <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ color: 'white', marginBottom: '12px' }}>使用化妆品 ({selectedMakeup.items.length})</h4>
                            <Row gutter={[8, 8]}>
                                {selectedMakeup.items.map((item, index) => (
                                    <Col key={index} span={8}>
                                        <div style={{
                                            background: 'rgba(255,255,255,0.08)',
                                            borderRadius: '10px',
                                            padding: '10px',
                                            textAlign: 'center',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(8px)'
                                        }}>
                                            <img
                                                src={item.productMainImage}
                                                alt={item.productName}
                                                style={{
                                                    width: '100%',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: '6px',
                                                    marginBottom: '8px'
                                                }}
                                            />
                                            <div style={{
                                                color: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: '12px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {item.productName}
                                            </div>
                                            {item.usageTypeName && (
                                                <div style={{
                                                    color: item.usageTypeColor || '#f759ab',
                                                    fontSize: '10px',
                                                    marginTop: '4px',
                                                    fontWeight: 500
                                                }}>
                                                    {item.usageTypeName}
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MakeupManagement;
