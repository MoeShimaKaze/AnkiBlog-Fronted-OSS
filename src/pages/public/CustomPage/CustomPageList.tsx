import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Select, Pagination, Spin, Typography, Card } from 'antd';
import { SearchOutlined, FileTextOutlined, StarFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Common/Navbar';
import { getPublishedPages, searchPages, getFeaturedPages } from '@/services/customPageService';
import { CustomPage } from '@/types/customPage';
import { ApiResponse, PageResponse } from '@/types/api';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import CustomPageCard from '@/components/CustomPage/CustomPageCard';
import { glassCardStyle as baseGlassCardStyle, primaryTextStyle, secondaryTextStyle } from '@/constants/styles';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const CustomPageList: React.FC = () => {
    usePageTitle('自定义页面', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    });

    const [pages, setPages] = useState<CustomPage[]>([]);
    const [featuredPages, setFeaturedPages] = useState<CustomPage[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(12);
    const [keyword, setKeyword] = useState('');
    const [sortBy, setSortBy] = useState('sortOrder');

    const fetchPages = async (page = 1, search?: string) => {
        setLoading(true);
        try {
            const params = {
                page: page - 1,
                size: pageSize,
                sort: sortBy,
                direction: 'ASC' as const
            };

            let response: ApiResponse<PageResponse<CustomPage>>;

            if (search?.trim()) {
                response = await searchPages(search.trim(), params);
            } else {
                response = await getPublishedPages(params);
            }

            if (response && response.success && response.data) {
                setPages(response.data.content || []);
                setTotal(response.data.totalElements || 0);
            } else {
                console.warn('获取页面失败:', response?.message);
                setPages([]);
                setTotal(0);
            }
        } catch (error: any) {
            console.error('获取页面失败:', error);
            setPages([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeaturedPages = async () => {
        try {
            const response = await getFeaturedPages();
            if (response.success) {
                setFeaturedPages(response.data);
            }
        } catch (error) {
            console.error('获取推荐页面失败:', error);
        }
    };

    useEffect(() => {
        fetchPages(current, keyword);
    }, [current, sortBy]);

    useEffect(() => {
        fetchFeaturedPages();
    }, []);

    const handleSearch = (value: string) => {
        setKeyword(value);
        setCurrent(1);
        fetchPages(1, value);
    };

    const handlePageChange = (page: number) => {
        setCurrent(page);
    };

    const glassCardStyle: React.CSSProperties = {
        ...baseGlassCardStyle,
        padding: '24px',
        cursor: 'default',
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: "url('/background_placeholder.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
        }}>
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(102, 126, 234, 0.4)',
                backdropFilter: 'blur(1px)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 10 }}>
                <Navbar />
            </div>

            <div style={{ position: 'relative', zIndex: 10, paddingTop: '2rem', paddingBottom: '4rem' }}>
                {/* 页面标题 */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Title
                        level={1}
                        style={{
                            ...primaryTextStyle,
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            margin: 0,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                        }}
                    >
                        自定义页面
                    </Title>
                </div>

                {/* 搜索和筛选 */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '100%', maxWidth: '1152px', padding: '0 1rem' }}>
                        <div style={glassCardStyle}>
                            <Row gutter={[16, 16]} align="middle">
                                <Col xs={24} md={16}>
                                    <Search
                                        placeholder="搜索页面标题、内容..."
                                        allowClear
                                        enterButton="搜索"
                                        size="large"
                                        onSearch={handleSearch}
                                        prefix={<SearchOutlined />}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <Select
                                        value={sortBy}
                                        onChange={setSortBy}
                                        size="large"
                                        style={{ width: '100%' }}
                                        dropdownStyle={{
                                            background: 'rgba(35, 35, 45, 0.85)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <Option value="sortOrder">默认排序</Option>
                                        <Option value="updatedAt">最近更新</Option>
                                        <Option value="viewCount">热门页面</Option>
                                        <Option value="title">标题排序</Option>
                                    </Select>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>

                {/* 推荐页面 */}
                {featuredPages.length > 0 && !keyword && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: '100%', maxWidth: '1152px', padding: '0 1rem' }}>
                            <div style={glassCardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                    <StarFilled style={{ color: '#FFD700', fontSize: '20px' }} />
                                    <Title level={3} style={{ ...primaryTextStyle, margin: 0, fontSize: '1.5rem' }}>
                                        推荐页面
                                    </Title>
                                </div>
                                <Row gutter={[16, 16]}>
                                    {featuredPages.slice(0, 4).map((page) => (
                                        <Col key={page.id} xs={24} sm={12} md={6}>
                                            <Link to={page.fullPath} style={{ textDecoration: 'none' }}>
                                                <Card
                                                    size="small"
                                                    className="bg-white/10 border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
                                                    bodyStyle={{ padding: '12px' }}
                                                    hoverable
                                                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)'}}
                                                >
                                                    <div style={{ textAlign: 'center' }}>
                                                        {page.pageIcon && (
                                                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                                                {page.pageIcon}
                                                            </div>
                                                        )}
                                                        <Title level={5} style={{ ...primaryTextStyle, margin: '0 0 4px 0', fontSize: '1rem' }} ellipsis>
                                                            {page.title}
                                                        </Title>
                                                        <Text style={{ ...secondaryTextStyle, fontSize: '0.8rem' }} ellipsis>
                                                            {page.subtitle || page.summary}
                                                        </Text>
                                                    </div>
                                                </Card>
                                            </Link>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </div>
                    </div>
                )}

                {/* 页面列表 */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '1152px', padding: '0 1rem' }}>
                        {loading ? (
                            <div style={{...glassCardStyle, padding: '3rem', textAlign: 'center'}}>
                                <Spin size="large" />
                                <div style={{ marginTop: '1rem', ...primaryTextStyle }}>正在加载页面...</div>
                            </div>
                        ) : pages.length === 0 ? (
                            <div style={{...glassCardStyle, padding: '3rem', textAlign: 'center'}}>
                                <FileTextOutlined style={{ fontSize: '3rem', ...secondaryTextStyle, marginBottom: '1rem' }} />
                                <Title level={3} style={{ ...primaryTextStyle, margin: '0 0 1rem 0' }}>
                                    {keyword ? '没有找到相关页面' : '暂无页面内容'}
                                </Title>
                                <Text style={secondaryTextStyle}>
                                    {keyword
                                        ? `搜索 "${keyword}" 没有找到匹配的页面，请尝试其他关键词`
                                        : '还没有发布的自定义页面，请稍后再来看看吧'
                                    }
                                </Text>
                            </div>
                        ) : (
                            <div>
                                <Row gutter={[24, 24]}>
                                    {pages.map((page) => (
                                        <Col key={page.id} xs={24} sm={12} lg={8} style={{ display: 'flex' }}>
                                            <CustomPageCard page={page} />
                                        </Col>
                                    ))}
                                </Row>

                                {/* 分页 */}
                                {total > pageSize && (
                                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                        <div style={{...glassCardStyle, padding: '1rem', display: 'inline-block' }}>
                                            <Pagination
                                                current={current}
                                                total={total}
                                                pageSize={pageSize}
                                                onChange={handlePageChange}
                                                showSizeChanger={false}
                                                showQuickJumper
                                                showTotal={(total, range) =>
                                                    <span style={primaryTextStyle}>
                                                        第 {range[0]}-{range[1]} 条 / 共 {total} 条
                                                    </span>
                                                }
                                                className="custom-pagination" // 你可能需要一些自定义CSS来调整分页器内部颜色
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomPageList;
