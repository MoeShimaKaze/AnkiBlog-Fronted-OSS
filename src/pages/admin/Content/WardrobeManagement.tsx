/**
 * 我的衣橱管理页面
 * 展示已购买商品、闲置物品提醒、风格统计
 */
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Table, Image, Tag, Statistic, Spin, Empty, Progress, Button, message, Tooltip, TreeSelect, Switch } from 'antd';
import {
    ShoppingOutlined,
    ClockCircleOutlined,
    PieChartOutlined,
    FireOutlined,
    WarningOutlined,
    SkinOutlined,
    EyeOutlined,
    FilterOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { usePageTitle } from '@/hooks/business/usePageTitle';
import type { Product } from '@/types/product';
import type { WardrobeOverview, StyleStat } from '@/types/outfit';
import * as wardrobeService from '@/services/wardrobeService';
import * as adminCategoryService from '@/services/adminProductCategoryService';
import type { AdminCategoryListItem } from '@/services/adminProductCategoryService';
import * as siteSettingsService from '@/services/siteSettings';
import { glassCardStyle } from '@/constants/styles';

const WardrobeManagement: React.FC = () => {
    usePageTitle('我的衣橱', {
        siteName: 'AnkiBlog',
        siteTagline: 'Anki的歇脚处'
    });

    const [loading, setLoading] = useState(false);
    const [overview, setOverview] = useState<WardrobeOverview | null>(null);
    const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
    const [idleItems, setIdleItems] = useState<Product[]>([]);
    const [styleStats, setStyleStats] = useState<StyleStat[]>([]);
    const [mostWorn, setMostWorn] = useState<Product[]>([]);
    const [activeTab, setActiveTab] = useState('overview');

    // 分页状态
    const [purchasedPage, setPurchasedPage] = useState(1);
    const [purchasedTotal, setPurchasedTotal] = useState(0);
    const [idlePage, setIdlePage] = useState(1);
    const [idleTotal, setIdleTotal] = useState(0);
    const pageSize = 10;

    // 筛选状态
    const [categories, setCategories] = useState<AdminCategoryListItem[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [onlyPurchased, setOnlyPurchased] = useState<boolean>(true);
    const [idleDays, setIdleDays] = useState<number>(30);

    // 加载分类数据和系统设置
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 并行加载分类数据和系统设置
                const [categoriesRes, settingsRes] = await Promise.all([
                    adminCategoryService.getCategoryTree(),
                    siteSettingsService.getSiteProfile()
                ]);

                if (categoriesRes.success) {
                    setCategories(categoriesRes.data);
                }

                if (settingsRes.success) {
                    const settings = settingsRes.data;
                    // 设置默认筛选值
                    if (settings.wardrobeCategoryIds && settings.wardrobeCategoryIds.length > 0) {
                        setSelectedCategoryIds(settings.wardrobeCategoryIds);
                    }
                    setOnlyPurchased(settings.wardrobeOnlyPurchased ?? true);
                    setIdleDays(settings.wardrobeIdleDays ?? 30);
                }
            } catch (error) {
                console.error('加载初始数据失败:', error);
            }
        };

        loadInitialData();
        loadOverview();
        loadStyleStats();
        loadMostWorn();
    }, []);

    useEffect(() => {
        loadPurchasedProducts();
    }, [purchasedPage, selectedCategoryIds, onlyPurchased]);

    useEffect(() => {
        loadIdleItems();
    }, [idlePage, idleDays]);

    // 转换分类数据为 TreeSelect 格式
    const transformCategoryData = (data: AdminCategoryListItem[]): any[] => {
        return data.map(item => ({
            title: item.name,
            value: item.id,
            key: item.id,
            children: item.children ? transformCategoryData(item.children) : undefined
        }));
    };

    const loadOverview = async () => {
        try {
            const res = await wardrobeService.getWardrobeOverview();
            if (res.success) {
                setOverview(res.data);
            }
        } catch (error) {
            console.error('加载衣橱概览失败:', error);
        }
    };

    const loadPurchasedProducts = async () => {
        setLoading(true);
        try {
            const res = await wardrobeService.getPurchasedProducts({
                page: purchasedPage - 1,
                size: pageSize,
                categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
                onlyPurchased: onlyPurchased,
                useDefaultSettings: false  // 使用前端传递的筛选条件
            });
            if (res.success) {
                setPurchasedProducts(res.data.content || []);
                setPurchasedTotal(res.data.totalElements);
            }
        } catch (error) {
            console.error('加载已购买商品失败:', error);
            message.error('加载已购买商品失败');
        } finally {
            setLoading(false);
        }
    };

    const loadIdleItems = async () => {
        try {
            const res = await wardrobeService.getIdleItems(idleDays, { page: idlePage - 1, size: pageSize });
            if (res.success) {
                setIdleItems(res.data.content || []);
                setIdleTotal(res.data.totalElements);
            }
        } catch (error) {
            console.error('加载闲置物品失败:', error);
        }
    };

    const loadStyleStats = async () => {
        try {
            const res = await wardrobeService.getStyleStats();
            if (res.success) {
                setStyleStats(res.data || []);
            }
        } catch (error) {
            console.error('加载风格统计失败:', error);
        }
    };

    const loadMostWorn = async () => {
        try {
            const res = await wardrobeService.getMostWornProducts();
            if (res.success) {
                setMostWorn(res.data || []);
            }
        } catch (error) {
            console.error('加载最常穿商品失败:', error);
        }
    };

    const statsCardStyle: React.CSSProperties = {
        ...glassCardStyle,
        padding: '20px',
        textAlign: 'center'
    };

    // 商品表格列定义
    const productColumns: ColumnsType<Product> = [
        {
            title: '商品',
            dataIndex: 'name',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Image
                        src={record.mainImage}
                        alt={record.name}
                        width={50}
                        height={50}
                        style={{ borderRadius: '8px', objectFit: 'cover' }}
                        preview={false}
                    />
                    <div>
                        <a
                            href={`/products/${record.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'white', fontWeight: 500 }}
                        >
                            {record.name}
                        </a>
                        {record.brand && (
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                {record.brand}
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            title: '分类',
            dataIndex: 'categoryName',
            width: 120,
            render: (name) => <Tag color="blue">{name || '未分类'}</Tag>
        },
        {
            title: '价格',
            dataIndex: 'price',
            width: 100,
            render: (price) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>¥{price?.toFixed(2)}</span>
        },
        {
            title: '穿着次数',
            dataIndex: 'wearCount',
            width: 100,
            render: (count) => (
                <span style={{ color: count > 0 ? '#1890ff' : 'rgba(255,255,255,0.5)' }}>
                    {count || 0} 次
                </span>
            )
        },
        {
            title: '操作',
            key: 'action',
            width: 80,
            render: (_, record) => (
                <Tooltip title="查看详情">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => window.open(`/products/${record.slug}`, '_blank')}
                    />
                </Tooltip>
            )
        }
    ];

    // 闲置物品表格列
    const idleColumns: ColumnsType<Product> = [
        ...productColumns.slice(0, -1),
        {
            title: '状态',
            key: 'status',
            width: 100,
            render: (_, record) => (
                <Tag color="orange" icon={<WarningOutlined />}>
                    {record.wearCount === 0 ? '未穿过' : '闲置中'}
                </Tag>
            )
        }
    ];

    // 渲染概览标签页
    const renderOverviewTab = () => (
        <div>
            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={12} sm={6}>
                    <div style={statsCardStyle}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>衣橱总数</span>}
                            value={overview?.totalItems || 0}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<ShoppingOutlined />}
                        />
                    </div>
                </Col>
                <Col xs={12} sm={6}>
                    <div style={statsCardStyle}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>总价值</span>}
                            value={overview?.totalValue || 0}
                            valueStyle={{ color: '#52c41a' }}
                            prefix="¥"
                            precision={2}
                        />
                    </div>
                </Col>
                <Col xs={12} sm={6}>
                    <div style={statsCardStyle}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>总穿着次数</span>}
                            value={overview?.totalWearCount || 0}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<SkinOutlined />}
                        />
                    </div>
                </Col>
                <Col xs={12} sm={6}>
                    <div style={statsCardStyle}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>闲置物品</span>}
                            value={overview?.idleItemCount || 0}
                            valueStyle={{ color: overview?.idleItemCount ? '#faad14' : 'rgba(255,255,255,0.5)' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </div>
                </Col>
            </Row>

            {/* 最常穿单品 */}
            <Card
                title={<span style={{ color: 'white' }}><FireOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />最常穿单品</span>}
                style={glassCardStyle}
                bodyStyle={{ padding: '16px' }}
            >
                {mostWorn.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {mostWorn.slice(0, 6).map((product, index) => (
                            <Col key={product.id} xs={12} sm={8} md={4}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    textAlign: 'center',
                                    position: 'relative'
                                }}>
                                    {index < 3 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            left: '-8px',
                                            background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                                            color: 'black',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '12px'
                                        }}>
                                            {index + 1}
                                        </div>
                                    )}
                                    <Image
                                        src={product.mainImage}
                                        alt={product.name}
                                        style={{
                                            width: '100%',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            marginBottom: '8px'
                                        }}
                                        preview={false}
                                    />
                                    <div style={{
                                        color: 'white',
                                        fontSize: '12px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {product.name}
                                    </div>
                                    <div style={{ color: '#1890ff', fontSize: '11px', marginTop: '4px' }}>
                                        穿着 {product.wearCount || 0} 次
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span style={{ color: 'rgba(255,255,255,0.6)' }}>暂无穿着记录</span>}
                    />
                )}
            </Card>

            {/* 风格分布 */}
            <Card
                title={<span style={{ color: 'white' }}><PieChartOutlined style={{ marginRight: '8px', color: '#722ed1' }} />风格分布</span>}
                style={{ ...glassCardStyle, marginTop: '16px' }}
                bodyStyle={{ padding: '16px' }}
            >
                {styleStats.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {styleStats.map((stat, index) => {
                            const colors = ['#1890ff', '#52c41a', '#722ed1', '#faad14', '#eb2f96', '#13c2c2'];
                            const color = colors[index % colors.length];
                            const maxCount = Math.max(...styleStats.map(s => s.count));
                            const percent = (stat.count / maxCount) * 100;

                            return (
                                <Col key={stat.style} xs={24} sm={12} md={8}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ color: 'white' }}>{stat.style}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{stat.count} 件</span>
                                        </div>
                                        <Progress
                                            percent={percent}
                                            showInfo={false}
                                            strokeColor={color}
                                            trailColor="rgba(255,255,255,0.1)"
                                        />
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span style={{ color: 'rgba(255,255,255,0.6)' }}>暂无风格数据</span>}
                    />
                )}
            </Card>
        </div>
    );

    // 渲染已购买商品标签页
    const renderPurchasedTab = () => (
        <Card style={glassCardStyle} bodyStyle={{ padding: '16px' }}>
            {/* 筛选栏 */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px'
            }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} sm={24} md={8}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FilterOutlined style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'nowrap' }}>分类:</span>
                            <TreeSelect
                                treeData={transformCategoryData(categories)}
                                value={selectedCategoryIds}
                                onChange={(value) => {
                                    setSelectedCategoryIds(value || []);
                                    setPurchasedPage(1);
                                }}
                                placeholder="全部分类"
                                treeDefaultExpandAll
                                multiple
                                allowClear
                                treeCheckable
                                showCheckedStrategy={TreeSelect.SHOW_PARENT}
                                style={{ flex: 1, minWidth: 0 }}
                                dropdownStyle={{
                                    maxHeight: 400,
                                    overflow: 'auto',
                                    background: 'rgba(35, 35, 45, 0.95)',
                                }}
                            />
                        </div>
                    </Col>
                    <Col xs={12} sm={12} md={8}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'nowrap', fontSize: '13px' }}>只显示已购:</span>
                            <Switch
                                checked={onlyPurchased}
                                onChange={(checked) => {
                                    setOnlyPurchased(checked);
                                    setPurchasedPage(1);
                                }}
                                checkedChildren="是"
                                unCheckedChildren="否"
                            />
                        </div>
                    </Col>
                    <Col xs={12} sm={12} md={8}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setSelectedCategoryIds([]);
                                setOnlyPurchased(true);
                                setPurchasedPage(1);
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                width: '100%'
                            }}
                        >
                            重置筛选
                        </Button>
                    </Col>
                </Row>
            </div>

            <Spin spinning={loading}>
                <Table
                    columns={productColumns}
                    dataSource={purchasedProducts}
                    rowKey="id"
                    pagination={{
                        current: purchasedPage,
                        total: purchasedTotal,
                        pageSize: pageSize,
                        onChange: setPurchasedPage,
                        showTotal: (total) => <span style={{ color: 'rgba(255,255,255,0.8)' }}>共 {total} 件商品</span>
                    }}
                />
            </Spin>
        </Card>
    );

    // 渲染闲置物品标签页
    const renderIdleTab = () => (
        <Card style={glassCardStyle} bodyStyle={{ padding: '24px' }}>
            {idleItems.length > 0 ? (
                <>
                    <div style={{
                        background: 'rgba(250, 173, 20, 0.1)',
                        border: '1px solid rgba(250, 173, 20, 0.3)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        color: '#faad14'
                    }}>
                        <WarningOutlined style={{ marginRight: '8px' }} />
                        以下商品已超过 {idleDays} 天未穿着，建议整理或搭配使用
                    </div>
                    <Table
                        columns={idleColumns}
                        dataSource={idleItems}
                        rowKey="id"
                        pagination={{
                            current: idlePage,
                            total: idleTotal,
                            pageSize: pageSize,
                            onChange: setIdlePage,
                            showTotal: (total) => <span style={{ color: 'rgba(255,255,255,0.8)' }}>共 {total} 件闲置</span>
                        }}
                    />
                </>
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                            太棒了！没有闲置物品
                        </span>
                    }
                />
            )}
        </Card>
    );

    const tabItems = [
        {
            key: 'overview',
            label: (
                <span>
                    <PieChartOutlined />
                    概览
                </span>
            ),
            children: renderOverviewTab()
        },
        {
            key: 'purchased',
            label: (
                <span>
                    <ShoppingOutlined />
                    已购买 ({purchasedTotal})
                </span>
            ),
            children: renderPurchasedTab()
        },
        {
            key: 'idle',
            label: (
                <span style={{ color: idleTotal > 0 ? '#faad14' : undefined }}>
                    <ClockCircleOutlined />
                    闲置提醒 {idleTotal > 0 && `(${idleTotal})`}
                </span>
            ),
            children: renderIdleTab()
        }
    ];

    return (
        <div style={{ padding: '16px', minHeight: '100vh' }}>
            {/* 页面标题 */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{
                    color: 'white',
                    fontSize: 'clamp(20px, 5vw, 28px)',
                    fontWeight: 'bold',
                    margin: 0,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}>
                    <ShoppingOutlined style={{ marginRight: '12px' }} />
                    我的衣橱
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 0 0', fontSize: '14px' }}>
                    管理你的已购买商品，追踪穿着频率
                </p>
            </div>

            {/* 标签页 */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                style={{ color: 'white' }}
            />

            {/* 自定义样式 */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    .ant-tabs-tab {
                        color: rgba(255, 255, 255, 0.7) !important;
                    }
                    .ant-tabs-tab-active .ant-tabs-tab-btn {
                        color: #1890ff !important;
                    }
                    .ant-tabs-ink-bar {
                        background: #1890ff !important;
                    }
                    .ant-table {
                        background: transparent !important;
                    }
                    .ant-table-thead > tr > th {
                        background: rgba(255, 255, 255, 0.1) !important;
                        color: rgba(255, 255, 255, 0.9) !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    }
                    .ant-table-tbody > tr > td {
                        background: transparent !important;
                        color: rgba(255, 255, 255, 0.85) !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    }
                    .ant-table-tbody > tr:hover > td {
                        background: rgba(255, 255, 255, 0.05) !important;
                    }
                    .ant-pagination-item {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    }
                    .ant-pagination-item a {
                        color: rgba(255, 255, 255, 0.9) !important;
                    }
                    .ant-pagination-item-active {
                        background: #1890ff !important;
                        border-color: #1890ff !important;
                    }
                    .ant-pagination-prev .ant-pagination-item-link,
                    .ant-pagination-next .ant-pagination-item-link {
                        background: rgba(255, 255, 255, 0.1) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                        color: rgba(255, 255, 255, 0.9) !important;
                    }
                `
            }} />
        </div>
    );
};

export default WardrobeManagement;
