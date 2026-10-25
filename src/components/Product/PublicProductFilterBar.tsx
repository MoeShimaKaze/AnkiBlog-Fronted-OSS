import React, { useState, useEffect, useCallback } from 'react';
import {
    Input,
    Select,
    DatePicker,
    TreeSelect,
    Button,
    Space,
    Row,
    Col,
    Tag,
    ConfigProvider
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
    DownOutlined,
    UpOutlined
} from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import {
    getProductCategoryTree,
    getProductTags,
    type PublicProductFilterParams,
    type CategoryTreeItem,
    type TagItem
} from '@/services/products';
import { glassCardStyle } from '@/constants/styles';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 排序选项
const SORT_OPTIONS = [
    { value: 'createdAt,desc', label: '最新上架' },
    { value: 'clickCount,desc', label: '热门程度' },
    { value: 'viewCount,desc', label: '浏览最多' },
    { value: 'price,asc', label: '价格从低到高' },
    { value: 'price,desc', label: '价格从高到低' },
];

export interface PublicProductFilterBarProps {
    onFilterChange: (filters: Partial<PublicProductFilterParams>) => void;
    initialFilters?: Partial<PublicProductFilterParams>;
    showSearch?: boolean;
    showFeatured?: boolean;
    showPurchased?: boolean;
    showCategory?: boolean;
    showTags?: boolean;
    showDateRange?: boolean;
    showPriceRange?: boolean;
    showSort?: boolean;
    defaultCollapsed?: boolean;
}

const PublicProductFilterBar: React.FC<PublicProductFilterBarProps> = ({
    onFilterChange,
    initialFilters = {},
    showSearch = true,
    showFeatured = true,
    showPurchased = true,
    showCategory = true,
    showTags = true,
    showDateRange = false,
    showPriceRange = true,
    showSort = true,
    defaultCollapsed = true,
}) => {
    // 筛选状态
    const [keyword, setKeyword] = useState(initialFilters.keyword || '');
    const [featured, setFeatured] = useState<boolean | undefined>(initialFilters.featured);
    const [isPurchased, setIsPurchased] = useState<boolean | undefined>(initialFilters.isPurchased);
    const [categoryId, setCategoryId] = useState<string | undefined>(initialFilters.categoryId);
    const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters.tags || []);
    const [createdAtRange, setCreatedAtRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [minPrice, setMinPrice] = useState<number | undefined>(initialFilters.minPrice);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(initialFilters.maxPrice);
    const [sort, setSort] = useState<string>(initialFilters.sort || 'createdAt,desc');

    // 数据加载状态
    const [tags, setTags] = useState<TagItem[]>([]);
    const [categories, setCategories] = useState<CategoryTreeItem[]>([]);
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    // 加载标签和分类数据（使用公开 API）
    useEffect(() => {
        const loadData = async () => {
            try {
                const [tagsRes, categoriesRes] = await Promise.all([
                    getProductTags(),
                    getProductCategoryTree()
                ]);
                if (tagsRes.success && tagsRes.data) {
                    setTags(tagsRes.data);
                }
                if (categoriesRes.success && categoriesRes.data) {
                    setCategories(categoriesRes.data);
                }
            } catch (error) {
                console.error('加载筛选数据失败:', error);
            }
        };
        loadData();
    }, []);

    // 转换分类数据为TreeSelect格式
    const transformCategoryData = (data: CategoryTreeItem[]): any[] => {
        return data.map(item => ({
            title: `${item.name} (${item.productCount})`,
            value: item.id,
            key: item.id,
            children: item.children ? transformCategoryData(item.children) : undefined
        }));
    };

    // 构建筛选参数
    const buildFilterParams = useCallback((): Partial<PublicProductFilterParams> => {
        const params: Partial<PublicProductFilterParams> = {};

        if (keyword.trim()) params.keyword = keyword.trim();
        if (featured !== undefined) params.featured = featured;
        if (isPurchased !== undefined) params.isPurchased = isPurchased;
        if (categoryId) params.categoryId = categoryId;
        if (selectedTags.length > 0) params.tags = selectedTags;
        if (createdAtRange && createdAtRange[0]) {
            params.createdAtStart = createdAtRange[0].startOf('day').toISOString();
        }
        if (createdAtRange && createdAtRange[1]) {
            params.createdAtEnd = createdAtRange[1].endOf('day').toISOString();
        }
        if (minPrice !== undefined) params.minPrice = minPrice;
        if (maxPrice !== undefined) params.maxPrice = maxPrice;
        if (sort) params.sort = sort;

        return params;
    }, [keyword, featured, isPurchased, categoryId, selectedTags, createdAtRange, minPrice, maxPrice, sort]);

    // 应用筛选
    const handleApplyFilter = () => {
        onFilterChange(buildFilterParams());
    };

    // 搜索时应用
    const handleSearch = (value: string) => {
        setKeyword(value);
        const params = buildFilterParams();
        params.keyword = value.trim() || undefined;
        onFilterChange(params);
    };

    // 排序变更时立即应用
    const handleSortChange = (value: string) => {
        setSort(value);
        const params = buildFilterParams();
        params.sort = value;
        onFilterChange(params);
    };

    // 清除所有筛选
    const handleClearAll = () => {
        setKeyword('');
        setFeatured(undefined);
        setIsPurchased(undefined);
        setCategoryId(undefined);
        setSelectedTags([]);
        setCreatedAtRange(null);
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setSort('createdAt,desc');
        onFilterChange({ sort: 'createdAt,desc' });
    };

    // 计算活跃筛选数量
    const activeFilterCount = [
        featured !== undefined ? featured : null,
        isPurchased !== undefined ? isPurchased : null,
        categoryId,
        selectedTags.length > 0,
        createdAtRange && (createdAtRange[0] || createdAtRange[1]),
        minPrice !== undefined || maxPrice !== undefined,
    ].filter(Boolean).length;

    // 玻璃态主题配置
    const glassTheme = {
        token: {
            colorText: 'rgba(255, 255, 255, 0.9)',
            colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
            colorBgElevated: 'rgba(35, 35, 45, 0.85)',
            borderRadius: 8,
        },
        components: {
            Input: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
            },
            Select: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
                optionSelectedBg: 'rgba(255, 255, 255, 0.2)',
            },
            TreeSelect: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
            },
            DatePicker: {
                colorBgContainer: 'rgba(255, 255, 255, 0.1)',
                colorBorder: 'rgba(255, 255, 255, 0.3)',
                hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
            },
        },
    };

    const labelStyle: React.CSSProperties = {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '12px',
        marginBottom: '4px',
        display: 'block',
    };

    return (
        <ConfigProvider theme={glassTheme}>
            <div style={{
                ...glassCardStyle,
                padding: '16px',
            }}>
                {/* 主筛选栏 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                }}>
                    <Space size="middle" wrap>
                        {/* 搜索框 */}
                        {showSearch && (
                            <Input.Search
                                placeholder="搜索衣橱..."
                                allowClear
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onSearch={handleSearch}
                                enterButton={<SearchOutlined />}
                                style={{ width: 260 }}
                            />
                        )}

                        {/* 排序 */}
                        {showSort && (
                            <Select
                                value={sort}
                                onChange={handleSortChange}
                                style={{ width: 140 }}
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                ))}
                            </Select>
                        )}
                    </Space>

                    <Space>
                        {/* 展开/收起高级筛选 */}
                        <Button
                            type="text"
                            icon={collapsed ? <DownOutlined /> : <UpOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                        >
                            <FilterOutlined />
                            高级筛选
                            {activeFilterCount > 0 && (
                                <Tag color="blue" style={{ marginLeft: 4 }}>{activeFilterCount}</Tag>
                            )}
                        </Button>

                        {/* 应用筛选 */}
                        <Button type="primary" onClick={handleApplyFilter}>
                            应用筛选
                        </Button>

                        {/* 清除筛选 */}
                        {activeFilterCount > 0 && (
                            <Button
                                icon={<ClearOutlined />}
                                onClick={handleClearAll}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                }}
                            >
                                清除
                            </Button>
                        )}
                    </Space>
                </div>

                {/* 高级筛选面板 */}
                {!collapsed && (
                    <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                        <Row gutter={[16, 16]}>
                            {/* 推荐筛选 */}
                            {showFeatured && (
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <span style={labelStyle}>是否推荐</span>
                                    <Select
                                        placeholder="全部"
                                        allowClear
                                        value={featured}
                                        onChange={setFeatured}
                                        style={{ width: '100%' }}
                                    >
                                        <Option value={true}>
                                            <Tag color="gold">推荐</Tag>
                                        </Option>
                                        <Option value={false}>
                                            <Tag>普通</Tag>
                                        </Option>
                                    </Select>
                                </Col>
                            )}

                            {/* 已购买筛选 */}
                            {showPurchased && (
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <span style={labelStyle}>购买状态</span>
                                    <Select
                                        placeholder="全部"
                                        allowClear
                                        value={isPurchased}
                                        onChange={setIsPurchased}
                                        style={{ width: '100%' }}
                                    >
                                        <Option value={true}>
                                            <Tag color="green">已购买</Tag>
                                        </Option>
                                        <Option value={false}>
                                            <Tag>未购买</Tag>
                                        </Option>
                                    </Select>
                                </Col>
                            )}

                            {/* 分类筛选 */}
                            {showCategory && categories.length > 0 && (
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <span style={labelStyle}>商品分类</span>
                                    <TreeSelect
                                        placeholder="选择分类"
                                        allowClear
                                        treeData={transformCategoryData(categories)}
                                        value={categoryId}
                                        onChange={setCategoryId}
                                        treeDefaultExpandAll
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                            )}

                            {/* 标签筛选 */}
                            {showTags && tags.length > 0 && (
                                <Col xs={24} sm={16} md={12} lg={8}>
                                    <span style={labelStyle}>标签筛选</span>
                                    <Select
                                        mode="multiple"
                                        placeholder="选择标签"
                                        allowClear
                                        value={selectedTags}
                                        onChange={setSelectedTags}
                                        style={{ width: '100%' }}
                                        maxTagCount={3}
                                        maxTagPlaceholder={(omitted) => `+${omitted.length}...`}
                                    >
                                        {tags.map(tag => (
                                            <Option key={tag.name} value={tag.name}>{tag.name}</Option>
                                        ))}
                                    </Select>
                                </Col>
                            )}

                            {/* 创建时间筛选 */}
                            {showDateRange && (
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <span style={labelStyle}>上架时间</span>
                                    <RangePicker
                                        value={createdAtRange}
                                        onChange={(dates) => setCreatedAtRange(dates as [Dayjs | null, Dayjs | null] | null)}
                                        style={{ width: '100%' }}
                                        placeholder={['开始日期', '结束日期']}
                                    />
                                </Col>
                            )}

                            {/* 价格范围筛选 */}
                            {showPriceRange && (
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <span style={labelStyle}>价格范围</span>
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input
                                            placeholder="最低"
                                            type="number"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                                            prefix="¥"
                                            style={{ width: '50%' }}
                                        />
                                        <Input
                                            placeholder="最高"
                                            type="number"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                                            prefix="¥"
                                            style={{ width: '50%' }}
                                        />
                                    </Space.Compact>
                                </Col>
                            )}
                        </Row>
                    </div>
                )}
            </div>
        </ConfigProvider>
    );
};

export default PublicProductFilterBar;
