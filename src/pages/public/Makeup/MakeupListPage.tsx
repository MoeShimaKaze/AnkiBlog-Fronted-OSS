import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Pagination, Spin, Typography, Tag, Button, Modal, Image, Input, DatePicker } from 'antd';
import { SmileOutlined, AppstoreOutlined, UnorderedListOutlined, LinkOutlined, PlusOutlined, SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Common/Navbar';
import { getPublicMakeups, searchPublicMakeups } from '@/services/makeupService';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import { useAuth } from '@/hooks/auth/useAuth';
import MakeupCreateModal from '@/components/Makeup/MakeupCreateModal';
import dayjs, { Dayjs } from 'dayjs';
import type { MakeupLog } from '@/types/makeup';
import { interactiveGlassCardStyle, primaryTextStyle, secondaryTextStyle } from '@/constants/styles';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

type ViewType = 'grid' | 'list';

const MakeupListPage: React.FC = () => {
    usePageTitle('化妆记录', { siteName: 'AnkiBlog', siteTagline: 'Ankiの歇脚处' });

    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [makeups, setMakeups] = useState<MakeupLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(12);
    const [viewType, setViewType] = useState<ViewType>('grid');
    const [keyword, setKeyword] = useState<string>('');
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedMakeup, setSelectedMakeup] = useState<MakeupLog | null>(null);

    const fetchMakeups = useCallback(async (
        page = 1,
        searchKeyword = keyword,
        range: [Dayjs | null, Dayjs | null] | null = dateRange
    ) => {
        setLoading(true);
        try {
            let response;
            if (searchKeyword.trim()) {
                response = await searchPublicMakeups({ keyword: searchKeyword.trim(), page: page - 1, size: pageSize });
            } else {
                const params: { page: number; size: number; startDate?: string; endDate?: string } = { page: page - 1, size: pageSize };
                if (range && range[0] && range[1]) {
                    params.startDate = range[0].format('YYYY-MM-DD');
                    params.endDate = range[1].format('YYYY-MM-DD');
                }
                response = await getPublicMakeups(params);
            }
            if (response && response.success && response.data) {
                setMakeups(response.data.content || []);
                setTotal(response.data.totalElements || 0);
            } else {
                setMakeups([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('获取化妆记录失败:', error);
            setMakeups([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [pageSize, keyword, dateRange]);

    useEffect(() => { fetchMakeups(current, keyword, dateRange); }, [current]);

    const handleSearch = (value: string) => {
        setKeyword(value);
        setCurrent(1);
        fetchMakeups(1, value, dateRange);
    };

    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        setDateRange(dates);
        setCurrent(1);
        fetchMakeups(1, keyword, dates);
    };

    const handleClearFilter = () => {
        setKeyword('');
        setDateRange(null);
        setCurrent(1);
        fetchMakeups(1, '', null);
    };

    const handlePageChange = (page: number) => setCurrent(page);
    const handleViewMakeup = (makeup: MakeupLog) => { setSelectedMakeup(makeup); setDetailModalVisible(true); };
    const handleCreateSuccess = () => { setCreateModalVisible(false); fetchMakeups(current, keyword, dateRange); };

    const glassCardStyle: React.CSSProperties = { ...interactiveGlassCardStyle, height: '100%' };

    const hasFilter = keyword || dateRange;

    const renderGridView = () => (
        <Row gutter={[24, 24]}>
            {makeups.map(makeup => {
                const usageTypes = [...new Set(makeup.items?.filter(i => i.usageTypeName).map(i => i.usageTypeName) || [])];
                return (
                    <Col key={makeup.id} xs={24} sm={12} md={8} lg={6}>
                        <div
                            style={{ ...glassCardStyle, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '360px' }}
                            onClick={() => handleViewMakeup(makeup)}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(235, 47, 150, 0.2)'; e.currentTarget.style.borderColor = 'rgba(235, 47, 150, 0.4)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
                        >
                            <div style={{ display: 'flex', gap: '2px', padding: '12px', background: 'rgba(0, 0, 0, 0.2)', minHeight: '100px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                                {makeup.items?.slice(0, 6).map((item, idx) => (
                                    <img key={idx} src={item.productMainImage} alt={item.productName} title={item.productName}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                                ))}
                                {(makeup.items?.length || 0) > 6 && (
                                    <div style={{ width: '50px', height: '50px', borderRadius: '6px', background: 'rgba(235, 47, 150, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                                        +{(makeup.items?.length || 0) - 6}
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                <div style={{ ...secondaryTextStyle, fontSize: '0.8rem', marginBottom: '8px' }}>{dayjs(makeup.makeupDate).format('YYYY-MM-DD HH:mm')}</div>
                                {makeup.lookName && (
                                    <h3 style={{ ...primaryTextStyle, fontSize: '1rem', fontWeight: 'bold', margin: '0 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{makeup.lookName}</h3>
                                )}
                                <Tag color="pink" style={{ background: 'rgba(235, 47, 150, 0.2)', borderColor: 'rgba(235, 47, 150, 0.4)', color: '#f759ab', marginBottom: '8px', width: 'fit-content' }}>
                                    {makeup.items?.length || 0} 件化妆品
                                </Tag>
                                {usageTypes.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {usageTypes.slice(0, 3).map(typeName => (
                                            <Tag key={typeName} style={{ background: 'rgba(114, 46, 209, 0.2)', borderColor: 'rgba(114, 46, 209, 0.4)', color: '#b37feb', fontSize: '0.7rem' }}>{typeName}</Tag>
                                        ))}
                                    </div>
                                )}
                                {makeup.referenceUrl && <div style={{ marginTop: '8px' }}><Tag color="cyan" icon={<LinkOutlined />} style={{ fontSize: '0.7rem' }}>有参考</Tag></div>}
                            </div>
                        </div>
                    </Col>
                );
            })}
        </Row>
    );

    const renderListView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {makeups.map(makeup => {
                const usageTypes = [...new Set(makeup.items?.filter(i => i.usageTypeName).map(i => i.usageTypeName) || [])];
                return (
                    <div key={makeup.id} style={{ ...glassCardStyle, padding: '1.5rem' }} onClick={() => handleViewMakeup(makeup)}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(235, 47, 150, 0.2)'; e.currentTarget.style.borderColor = 'rgba(235, 47, 150, 0.4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
                    >
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ flexShrink: 0, display: 'flex', gap: '4px', flexWrap: 'wrap', width: '120px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', justifyContent: 'center' }}>
                                {makeup.items?.slice(0, 4).map((item, idx) => (
                                    <img key={idx} src={item.productMainImage} alt={item.productName} title={item.productName}
                                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                                ))}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <h3 style={{ ...primaryTextStyle, fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                                        {makeup.lookName || dayjs(makeup.makeupDate).format('YYYY年MM月DD日') + ' 妆容'}
                                    </h3>
                                    <Tag color="pink" style={{ background: 'rgba(235, 47, 150, 0.2)', borderColor: 'rgba(235, 47, 150, 0.4)', color: '#f759ab' }}>{makeup.items?.length || 0} 件</Tag>
                                    {makeup.referenceUrl && <Tag color="cyan" icon={<LinkOutlined />}>有参考</Tag>}
                                </div>
                                <div style={{ ...secondaryTextStyle, fontSize: '0.85rem', marginBottom: '8px' }}>{dayjs(makeup.makeupDate).format('YYYY-MM-DD HH:mm')}</div>
                                {usageTypes.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {usageTypes.map(typeName => (
                                            <Tag key={typeName} style={{ background: 'rgba(114, 46, 209, 0.2)', borderColor: 'rgba(114, 46, 209, 0.4)', color: '#b37feb', fontSize: '0.75rem' }}>{typeName}</Tag>
                                        ))}
                                    </div>
                                )}
                                {makeup.note && <p style={{ ...secondaryTextStyle, margin: '8px 0 0 0', fontSize: '0.9rem' }}>{makeup.note}</p>}
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
                    .makeup-filter-bar { flex-direction: column !important; align-items: stretch !important; }
                    .makeup-filter-bar > div { width: 100% !important; justify-content: center !important; }
                    .makeup-filter-bar .ant-picker { width: 100% !important; }
                    .makeup-filter-bar .ant-input-search { width: 100% !important; }
                    .makeup-view-buttons { justify-content: center !important; }
                    .makeup-page-title { font-size: 1.8rem !important; }
                }
            `}</style>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(2px)', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 10 }}><Navbar /></div>
            <div style={{ position: 'relative', zIndex: 10, paddingTop: '2rem', paddingBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Title level={1} className="makeup-page-title" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontSize: '2.5rem', margin: 0 }}>化妆记录</Title>
                    {isAdmin && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)} style={{ marginTop: '16px', background: '#eb2f96', borderColor: '#eb2f96' }}>新增化妆记录</Button>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '100%', maxWidth: '1200px', padding: '0 1rem' }}>
                        <div className="makeup-filter-bar" style={{ ...glassCardStyle, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                <Search placeholder="搜索妆面名称" allowClear onSearch={handleSearch} value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 180 }}
                                    prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FilterOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />
                                    <RangePicker value={dateRange} onChange={handleDateRangeChange} placeholder={['开始日期', '结束日期']} style={{ width: 240 }} />
                                </div>
                                {hasFilter && <Button type="text" icon={<ClearOutlined />} onClick={handleClearFilter} style={{ color: 'rgba(255,255,255,0.7)' }}>清除</Button>}
                                <span style={{ ...secondaryTextStyle }}>共 {total} 条记录</span>
                            </div>
                            <div className="makeup-view-buttons" style={{ display: 'flex', gap: '8px' }}>
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
                                <Spin size="large" /><div style={{ marginTop: '1rem', color: 'white' }}>正在加载化妆记录...</div>
                            </div>
                        ) : makeups.length === 0 ? (
                            <div style={{ ...glassCardStyle, padding: '3rem', textAlign: 'center', cursor: 'default' }}>
                                <SmileOutlined style={{ fontSize: '3rem', color: '#eb2f96', opacity: 0.6, marginBottom: '1rem' }} />
                                <Title level={3} style={{ color: 'white', margin: '0 0 1rem 0' }}>{hasFilter ? '没有找到符合条件的记录' : '暂无化妆记录'}</Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{hasFilter ? '请尝试其他筛选条件' : '还没有化妆记录，请稍后再来看看吧'}</Text>
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

            {isAdmin && <MakeupCreateModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} onSuccess={handleCreateSuccess} />}

            <Modal
                title={selectedMakeup?.lookName || `${dayjs(selectedMakeup?.makeupDate).format('YYYY年MM月DD日')} 妆容`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={600}
                styles={{ content: { background: 'rgba(35, 35, 35, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)' },
                    header: { background: 'transparent', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' } }}
            >
                {selectedMakeup && (
                    <div style={{ color: 'white' }}>
                        {selectedMakeup.makeupImage && <div style={{ marginBottom: '16px' }}><Image src={selectedMakeup.makeupImage} alt="妆容实拍" style={{ width: '100%', borderRadius: '8px' }} /></div>}
                        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ ...secondaryTextStyle }}>{dayjs(selectedMakeup.makeupDate).format('YYYY-MM-DD HH:mm')}</span>
                            <Tag color="pink">{selectedMakeup.items?.length || 0} 件化妆品</Tag>
                            {selectedMakeup.referenceUrl && (
                                <Button type="link" icon={<LinkOutlined />} onClick={() => window.open(selectedMakeup.referenceUrl, '_blank')} style={{ padding: 0, color: '#eb2f96' }}>查看参考</Button>
                            )}
                        </div>
                        {selectedMakeup.note && (
                            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <p style={{ margin: 0, ...secondaryTextStyle }}>{selectedMakeup.note}</p>
                            </div>
                        )}
                        <div>
                            <h4 style={{ marginBottom: '12px' }}>使用化妆品 ({selectedMakeup.items?.length || 0})</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selectedMakeup.items?.map((item, index) => (
                                    <Link key={index} to={`/products/${item.productSlug || item.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                                            <img src={item.productMainImage} alt={item.productName} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500 }}>{item.productName}</div>
                                                {item.brand && <div style={{ ...secondaryTextStyle, fontSize: '0.85rem' }}>{item.brand}</div>}
                                            </div>
                                            {item.usageTypeName && <Tag style={{ background: 'rgba(114, 46, 209, 0.2)', borderColor: 'rgba(114, 46, 209, 0.4)', color: '#b37feb' }}>{item.usageTypeName}</Tag>}
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

export default MakeupListPage;
