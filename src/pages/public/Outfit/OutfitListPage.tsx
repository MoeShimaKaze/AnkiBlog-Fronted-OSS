import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Pagination, Spin, Typography, Tag, Button, Modal, Image, DatePicker } from 'antd';
import { SkinOutlined, AppstoreOutlined, UnorderedListOutlined, CalendarOutlined, PlusOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Common/Navbar';
import { getPublicOutfits } from '@/services/outfitService';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import { useAuth } from '@/hooks/auth/useAuth';
import OutfitCreateModal from '@/components/Outfit/OutfitCreateModal';
import dayjs, { Dayjs } from 'dayjs';
import type { OutfitLog } from '@/types/outfit';
import { interactiveGlassCardStyle, secondaryTextStyle } from '@/constants/styles';
import { getOutfitDisplayImage } from '@/utils/outfit';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ViewType = 'grid' | 'list';

const OutfitListPage: React.FC = () => {
    usePageTitle('穿搭记录', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    });

    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [outfits, setOutfits] = useState<OutfitLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(12);
    const [viewType, setViewType] = useState<ViewType>('grid');
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    // 管理员新增弹窗
    const [createModalVisible, setCreateModalVisible] = useState(false);

    // 详情弹窗
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedOutfit, setSelectedOutfit] = useState<OutfitLog | null>(null);

    const fetchOutfits = useCallback(async (page = 1, range: [Dayjs | null, Dayjs | null] | null = dateRange) => {
        setLoading(true);
        try {
            const params: { page: number; size: number; startDate?: string; endDate?: string } = {
                page: page - 1,
                size: pageSize,
            };
            if (range && range[0] && range[1]) {
                params.startDate = range[0].format('YYYY-MM-DD');
                params.endDate = range[1].format('YYYY-MM-DD');
            }
            const response = await getPublicOutfits(params);
            if (response && response.success && response.data) {
                setOutfits(response.data.content || []);
                setTotal(response.data.totalElements || 0);
            } else {
                setOutfits([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('获取穿搭记录失败:', error);
            setOutfits([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [pageSize, dateRange]);

    useEffect(() => {
        fetchOutfits(current, dateRange);
    }, [current]);

    const handlePageChange = (page: number) => setCurrent(page);

    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        setDateRange(dates);
        setCurrent(1);
        fetchOutfits(1, dates);
    };

    const handleClearFilter = () => {
        setDateRange(null);
        setCurrent(1);
        fetchOutfits(1, null);
    };

    const handleViewOutfit = (outfit: OutfitLog) => {
        setSelectedOutfit(outfit);
        setDetailModalVisible(true);
    };

    const handleCreateSuccess = () => {
        setCreateModalVisible(false);
        fetchOutfits(current, dateRange);
    };

    const glassCardStyle: React.CSSProperties = {
        ...interactiveGlassCardStyle,
        height: '100%'
    };

    // 获取显示图片
    const renderGridView = () => (
        <Row gutter={[24, 24]}>
            {outfits.map(outfit => {
                const mainItems = outfit.items?.filter(item => item.itemType === 'MAIN') || [];
                const accessories = outfit.items?.filter(item => item.itemType === 'ACCESSORY') || [];

                return (
                    <Col key={outfit.id} xs={24} sm={12} md={8} lg={6}>
                        <div
                            style={{
                                ...glassCardStyle,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '380px'
                            }}
                            onClick={() => handleViewOutfit(outfit)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ position: 'relative', height: '200px', flexShrink: 0 }}>
                                <img
                                    src={getOutfitDisplayImage(outfit)}
                                    alt="穿搭"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                                    <Tag color="blue" style={{ fontSize: '0.75rem' }}>
                                        <CalendarOutlined /> {dayjs(outfit.outfitDate).format('MM/DD')}
                                    </Tag>
                                </div>
                            </div>
                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                    {outfit.items?.slice(0, 4).map((item, index) => (
                                        <img
                                            key={index}
                                            src={item.productMainImage}
                                            alt={item.productName}
                                            style={{
                                                width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px',
                                                border: item.itemType === 'MAIN' ? '2px solid rgba(59, 130, 246, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)'
                                            }}
                                        />
                                    ))}
                                    {(outfit.items?.length || 0) > 4 && (
                                        <span style={{ ...secondaryTextStyle, fontSize: '0.75rem', alignSelf: 'center' }}>+{(outfit.items?.length || 0) - 4}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <Tag color="blue" style={{ fontSize: '0.7rem', margin: 0 }}>主要 {mainItems.length}</Tag>
                                    <Tag color="purple" style={{ fontSize: '0.7rem', margin: 0 }}>配饰 {accessories.length}</Tag>
                                </div>
                                {outfit.note && (
                                    <p style={{ ...secondaryTextStyle, fontSize: '0.8rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {outfit.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Col>
                );
            })}
        </Row>
    );

    const renderListView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {outfits.map(outfit => {
                const mainItems = outfit.items?.filter(item => item.itemType === 'MAIN') || [];
                const accessories = outfit.items?.filter(item => item.itemType === 'ACCESSORY') || [];

                return (
                    <div
                        key={outfit.id}
                        style={{ ...glassCardStyle, padding: '1.5rem' }}
                        onClick={() => handleViewOutfit(outfit)}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ flexShrink: 0, position: 'relative' }}>
                                <img src={getOutfitDisplayImage(outfit)} alt="穿搭" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ position: 'absolute', top: '4px', left: '4px' }}>
                                    <Tag color="blue" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>{dayjs(outfit.outfitDate).format('MM/DD')}</Tag>
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <h3 style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                                        {dayjs(outfit.outfitDate).format('YYYY年MM月DD日')} 穿搭
                                    </h3>
                                    <Tag color="blue">主要 {mainItems.length}</Tag>
                                    <Tag color="purple">配饰 {accessories.length}</Tag>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                    {outfit.items?.slice(0, 6).map((item, index) => (
                                        <img key={index} src={item.productMainImage} alt={item.productName} title={item.productName}
                                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px',
                                                border: item.itemType === 'MAIN' ? '2px solid rgba(59, 130, 246, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)' }} />
                                    ))}
                                    {(outfit.items?.length || 0) > 6 && <span style={{ ...secondaryTextStyle, fontSize: '0.8rem', alignSelf: 'center' }}>+{(outfit.items?.length || 0) - 6}</span>}
                                </div>
                                {outfit.note && <p style={{ ...secondaryTextStyle, margin: 0, fontSize: '0.9rem' }}>{outfit.note}</p>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundImage: `url('/background_placeholder.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
            {/* 移动端响应式样式 */}
            <style>{`
                @media (max-width: 640px) {
                    .outfit-filter-bar { flex-direction: column !important; align-items: stretch !important; }
                    .outfit-filter-bar > div { width: 100% !important; justify-content: center !important; }
                    .outfit-filter-bar .ant-picker { width: 100% !important; }
                    .outfit-view-buttons { justify-content: center !important; }
                    .outfit-page-title { font-size: 1.8rem !important; }
                }
            `}</style>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(2px)', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 10 }}><Navbar /></div>
            <div style={{ position: 'relative', zIndex: 10, paddingTop: '2rem', paddingBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Title level={1} className="outfit-page-title" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontSize: '2.5rem', margin: 0 }}>穿搭记录</Title>
                    {isAdmin && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)} style={{ marginTop: '16px' }}>新增穿搭</Button>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '100%', maxWidth: '1200px', padding: '0 1rem' }}>
                        <div className="outfit-filter-bar" style={{ ...glassCardStyle, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FilterOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />
                                    <RangePicker
                                        value={dateRange}
                                        onChange={handleDateRangeChange}
                                        placeholder={['开始日期', '结束日期']}
                                        style={{ width: 240 }}
                                    />
                                    {dateRange && (
                                        <Button type="text" icon={<ClearOutlined />} onClick={handleClearFilter} style={{ color: 'rgba(255,255,255,0.7)' }}>清除</Button>
                                    )}
                                </div>
                                <span style={{ ...secondaryTextStyle }}>共 {total} 条记录</span>
                            </div>
                            <div className="outfit-view-buttons" style={{ display: 'flex', gap: '8px' }}>
                                <Button type={viewType === 'grid' ? 'primary' : 'default'} icon={<AppstoreOutlined />} onClick={() => setViewType('grid')}>网格</Button>
                                <Button type={viewType === 'list' ? 'primary' : 'default'} icon={<UnorderedListOutlined />} onClick={() => setViewType('list')}>列表</Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: viewType === 'grid' ? '1200px' : '800px', padding: '0 1rem' }}>
                        {loading ? (
                            <div style={{ ...glassCardStyle, padding: '3rem', textAlign: 'center', cursor: 'default' }}>
                                <Spin size="large" /><div style={{ marginTop: '1rem', color: 'white' }}>正在加载穿搭记录...</div>
                            </div>
                        ) : outfits.length === 0 ? (
                            <div style={{ ...glassCardStyle, padding: '3rem', textAlign: 'center', cursor: 'default' }}>
                                <SkinOutlined style={{ fontSize: '3rem', color: 'white', opacity: 0.6, marginBottom: '1rem' }} />
                                <Title level={3} style={{ color: 'white', margin: '0 0 1rem 0' }}>{dateRange ? '该时间段暂无穿搭记录' : '暂无穿搭记录'}</Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{dateRange ? '请尝试选择其他日期范围' : '还没有穿搭记录，请稍后再来看看吧'}</Text>
                            </div>
                        ) : (
                            <div>
                                {viewType === 'grid' ? renderGridView() : renderListView()}
                                {total > pageSize && (
                                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                        <div style={{ ...glassCardStyle, padding: '1rem', display: 'inline-block', cursor: 'default' }}>
                                            <Pagination current={current} total={total} pageSize={pageSize} onChange={handlePageChange} showSizeChanger={false} showQuickJumper
                                                showTotal={(total, range) => <span style={{ color: 'white' }}>第 {range[0]}-{range[1]} 条，共 {total} 条</span>} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isAdmin && <OutfitCreateModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} onSuccess={handleCreateSuccess} />}

            <Modal
                title={selectedOutfit ? `${dayjs(selectedOutfit.outfitDate).format('YYYY年MM月DD日')} 穿搭` : '穿搭详情'}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={600}
                styles={{ content: { background: 'rgba(35, 35, 35, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)' },
                    header: { background: 'transparent', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' } }}
            >
                {selectedOutfit && (
                    <div style={{ color: 'white' }}>
                        {selectedOutfit.outfitImage && (
                            <div style={{ marginBottom: '16px' }}><Image src={selectedOutfit.outfitImage} alt="穿搭实拍" style={{ width: '100%', borderRadius: '8px' }} /></div>
                        )}
                        {selectedOutfit.note && (
                            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <p style={{ margin: 0, ...secondaryTextStyle }}>{selectedOutfit.note}</p>
                            </div>
                        )}
                        <div>
                            <h4 style={{ marginBottom: '12px' }}>穿搭单品 ({selectedOutfit.items?.length || 0})</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selectedOutfit.items?.map((item, index) => (
                                    <Link key={index} to={`/products/${item.productSlug || item.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                                            <img src={item.productMainImage} alt={item.productName} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500 }}>{item.productName}</div>
                                                {item.brand && <div style={{ ...secondaryTextStyle, fontSize: '0.85rem' }}>{item.brand}</div>}
                                            </div>
                                            <Tag color={item.itemType === 'MAIN' ? 'blue' : 'purple'}>{item.itemType === 'MAIN' ? '主要' : '配饰'}</Tag>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OutfitListPage;
