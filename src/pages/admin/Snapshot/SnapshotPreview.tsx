// src/components/Admin/SnapshotPreview.tsx
import React from 'react';
import {
    Descriptions,
    Tag,
    Image,
    Typography,
    Space,
    Card,
    Row,
    Col,
    Divider
} from 'antd';
import {
    FileTextOutlined,
    ShoppingOutlined,
    TagOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import type { ArticleSnapshot, ProductSnapshot } from '@/types/snapshot';
import { SnapshotTypeLabels, SnapshotTypeColors } from '@/types/snapshot';
import { elevatedGlassCardStyle, primaryTextStyle, secondaryTextStyle } from '@/constants/styles';

const { Title, Paragraph, Text } = Typography;

interface SnapshotPreviewProps {
    snapshot: ArticleSnapshot | ProductSnapshot;
    type: 'article' | 'product';
}

const SnapshotPreview: React.FC<SnapshotPreviewProps> = ({ snapshot, type }) => {
    const formatPrice = (price?: number) => price ? `¥${price.toFixed(2)}` : '-';

    const getSnapshotTypeTag = (snapshotType: string) => {
        const typeKey = snapshotType as keyof typeof SnapshotTypeLabels;
        return (
            <Tag color={SnapshotTypeColors[typeKey] || 'default'}>
                {SnapshotTypeLabels[typeKey] || snapshotType}
            </Tag>
        );
    };

    const cardStyle: React.CSSProperties = {
        marginBottom: '24px',
        ...elevatedGlassCardStyle,
        borderRadius: '12px',
    };

    const renderArticlePreview = (articleSnapshot: ArticleSnapshot) => (
        <div>
            <Card
                style={cardStyle}
                title={
                    <Space style={primaryTextStyle}>
                        <FileTextOutlined />
                        <span>文章快照信息</span>
                    </Space>
                }
                styles={{
                    header: {
                        background: 'rgba(54, 209, 220, 0.1)',
                        borderBottom: '1px solid rgba(54, 209, 220, 0.2)',
                        borderRadius: '12px 12px 0 0'
                    },
                    body: {
                        background: 'transparent'
                    }
                }}
            >
                <Descriptions
                    column={2}
                    bordered
                    styles={{
                        label: {
                            background: 'rgba(54, 209, 220, 0.1)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 600,
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        },
                        content: {
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.85)',
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        }
                    }}
                >
                    <Descriptions.Item label="版本号">
                        <span style={{ color: '#36d1dc', fontWeight: 'bold', fontSize: '16px' }}>
                            v{articleSnapshot.versionNumber}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="快照类型">
                        {getSnapshotTypeTag(articleSnapshot.snapshotType)}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建者">
                        <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                            {articleSnapshot.createdByName}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                        <Space style={secondaryTextStyle}>
                            <CalendarOutlined style={{ color: '#36d1dc' }} />
                            <span style={{ fontWeight: 500 }}>
                                {new Date(articleSnapshot.createdAt).toLocaleString('zh-CN')}
                            </span>
                        </Space>
                    </Descriptions.Item>
                    {articleSnapshot.description && (
                        <Descriptions.Item label="快照描述" span={2}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontStyle: 'italic' }}>
                                {articleSnapshot.description}
                            </span>
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Card>

            <Card
                style={cardStyle}
                title={
                    <Space style={primaryTextStyle}>
                        <FileTextOutlined />
                        <span>文章内容</span>
                    </Space>
                }
                styles={{
                    header: {
                        background: 'rgba(54, 209, 220, 0.1)',
                        borderBottom: '1px solid rgba(54, 209, 220, 0.2)',
                        borderRadius: '12px 12px 0 0'
                    },
                    body: {
                        background: 'transparent'
                    }
                }}
            >
                <Row gutter={[16, 16]}>
                    {articleSnapshot.coverImage && (
                        <Col span={24}>
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                <Image
                                    src={articleSnapshot.coverImage}
                                    alt="封面图片"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                    }}
                                />
                            </div>
                        </Col>
                    )}
                    <Col span={24}>
                        <Title level={3} style={{ ...primaryTextStyle, marginBottom: '16px' }}>
                            {articleSnapshot.title}
                        </Title>
                    </Col>
                    {articleSnapshot.excerpt && (
                        <Col span={24}>
                            <Card
                                size="small"
                                style={{
                                    background: 'rgba(54, 209, 220, 0.15)',
                                    border: '1px solid rgba(54, 209, 220, 0.3)',
                                    borderRadius: '8px'
                                }}
                                styles={{
                                    body: {
                                        background: 'transparent'
                                    }
                                }}
                            >
                                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>摘要：</Text>
                                <Paragraph style={{ marginBottom: 0, ...secondaryTextStyle, marginTop: '8px' }}>
                                    {articleSnapshot.excerpt}
                                </Paragraph>
                            </Card>
                        </Col>
                    )}
                    <Col span={24}>
                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>正文内容</span>
                        </Divider>
                        <div
                            style={{
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                padding: '20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                maxHeight: '400px',
                                overflow: 'auto',
                                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
                            }}
                        >
                            <div
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    margin: 0,
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    fontFamily: 'Consolas, Monaco, "Courier New", monospace'
                                }}
                            >
                                {articleSnapshot.content || '暂无内容'}
                            </div>
                        </div>
                    </Col>
                </Row>

                {(articleSnapshot.tags || articleSnapshot.seoTitle || articleSnapshot.seoDescription) && (
                    <>
                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>SEO信息</span>
                        </Divider>
                        <Descriptions
                            column={1}
                            bordered
                            size="small"
                            styles={{
                                label: {
                                    background: 'rgba(54, 209, 220, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 600,
                                    borderColor: 'rgba(255, 255, 255, 0.1)'
                                },
                                content: {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            {articleSnapshot.tags && (
                                <Descriptions.Item label="标签">
                                    <Space wrap>
                                        {articleSnapshot.tags.split(',').map((tag, index) => (
                                            <Tag key={index} icon={<TagOutlined />} color="blue">
                                                {tag.trim()}
                                            </Tag>
                                        ))}
                                    </Space>
                                </Descriptions.Item>
                            )}
                            {articleSnapshot.seoTitle && (
                                <Descriptions.Item label="SEO标题">
                                    <span style={secondaryTextStyle}>{articleSnapshot.seoTitle}</span>
                                </Descriptions.Item>
                            )}
                            {articleSnapshot.seoDescription && (
                                <Descriptions.Item label="SEO描述">
                                    <span style={secondaryTextStyle}>{articleSnapshot.seoDescription}</span>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </>
                )}
            </Card>
        </div>
    );

    const renderProductPreview = (productSnapshot: ProductSnapshot) => (
        <div>
            <Card
                style={cardStyle}
                title={
                    <Space style={primaryTextStyle}>
                        <ShoppingOutlined />
                        <span>商品快照信息</span>
                    </Space>
                }
                styles={{
                    header: {
                        background: 'rgba(54, 209, 220, 0.1)',
                        borderBottom: '1px solid rgba(54, 209, 220, 0.2)',
                        borderRadius: '12px 12px 0 0'
                    },
                    body: {
                        background: 'transparent'
                    }
                }}
            >
                <Descriptions
                    column={2}
                    bordered
                    styles={{
                        label: {
                            background: 'rgba(54, 209, 220, 0.1)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 600,
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        },
                        content: {
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.85)',
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        }
                    }}
                >
                    <Descriptions.Item label="版本号">
                        <span style={{ color: '#36d1dc', fontWeight: 'bold', fontSize: '16px' }}>
                            v{productSnapshot.versionNumber}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="快照类型">
                        {getSnapshotTypeTag(productSnapshot.snapshotType)}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建者">
                        <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                            {productSnapshot.createdByName}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                        <Space style={secondaryTextStyle}>
                            <CalendarOutlined style={{ color: '#36d1dc' }} />
                            <span style={{ fontWeight: 500 }}>
                                {new Date(productSnapshot.createdAt).toLocaleString('zh-CN')}
                            </span>
                        </Space>
                    </Descriptions.Item>
                    {productSnapshot.snapshotDescription && (
                        <Descriptions.Item label="快照描述" span={2}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontStyle: 'italic' }}>
                                {productSnapshot.snapshotDescription}
                            </span>
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Card>

            <Card
                style={cardStyle}
                title={
                    <Space style={primaryTextStyle}>
                        <ShoppingOutlined />
                        <span>商品内容</span>
                    </Space>
                }
                styles={{
                    header: {
                        background: 'rgba(54, 209, 220, 0.1)',
                        borderBottom: '1px solid rgba(54, 209, 220, 0.2)',
                        borderRadius: '12px 12px 0 0'
                    },
                    body: {
                        background: 'transparent'
                    }
                }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        {productSnapshot.mainImage && (
                            <div style={{ textAlign: 'center' }}>
                                <Image
                                    src={productSnapshot.mainImage}
                                    alt="商品主图"
                                    style={{
                                        width: '100%',
                                        maxHeight: '300px',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                    }}
                                />
                            </div>
                        )}
                        {productSnapshot.images && productSnapshot.images.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <Text strong style={primaryTextStyle}>更多图片：</Text>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {productSnapshot.images.map((img, index) => (
                                        <Image
                                            key={index}
                                            src={img}
                                            alt={`商品图片${index + 1}`}
                                            width={60}
                                            height={60}
                                            style={{ borderRadius: '4px' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Col>
                    <Col xs={24} md={16}>
                        <Title level={3} style={{ ...primaryTextStyle, marginBottom: '16px' }}>
                            {productSnapshot.name}
                        </Title>

                        <div style={{ marginBottom: '16px' }}>
                            <Space size="large">
                                <div>
                                    <Text style={secondaryTextStyle}>价格：</Text>
                                    <Text strong style={{ fontSize: '18px', color: '#f50' }}>
                                        {formatPrice(productSnapshot.price)}
                                    </Text>
                                    {productSnapshot.originalPrice && productSnapshot.originalPrice > (productSnapshot.price || 0) && (
                                        <Text delete style={{ marginLeft: '8px', color: 'rgba(255, 255, 255, 0.5)' }}>
                                            {formatPrice(productSnapshot.originalPrice)}
                                        </Text>
                                    )}
                                </div>
                                {productSnapshot.brand && (
                                    <div>
                                        <Text style={secondaryTextStyle}>品牌：</Text>
                                        <Text strong style={primaryTextStyle}>{productSnapshot.brand}</Text>
                                    </div>
                                )}
                            </Space>
                        </div>

                        {productSnapshot.summary && (
                            <Card
                                size="small"
                                style={{
                                    background: 'rgba(54, 209, 220, 0.15)',
                                    border: '1px solid rgba(54, 209, 220, 0.3)',
                                    borderRadius: '8px',
                                    marginBottom: '16px'
                                }}
                                styles={{
                                    body: {
                                        background: 'transparent'
                                    }
                                }}
                            >
                                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>简介：</Text>
                                <Paragraph style={{ marginBottom: 0, ...secondaryTextStyle, marginTop: '8px' }}>
                                    {productSnapshot.summary}
                                </Paragraph>
                            </Card>
                        )}

                        <Descriptions
                            column={1}
                            size="small"
                            styles={{
                                label: {
                                    background: 'rgba(54, 209, 220, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 600,
                                    borderColor: 'rgba(255, 255, 255, 0.1)'
                                },
                                content: {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            {productSnapshot.model && (
                                <Descriptions.Item label="型号">
                                    <span style={secondaryTextStyle}>{productSnapshot.model}</span>
                                </Descriptions.Item>
                            )}
                            {productSnapshot.status && (
                                <Descriptions.Item label="状态">
                                    <Tag color={productSnapshot.status === 'ACTIVE' ? 'green' : 'red'}>
                                        {productSnapshot.status}
                                    </Tag>
                                </Descriptions.Item>
                            )}
                            {productSnapshot.featured !== undefined && (
                                <Descriptions.Item label="是否精选">
                                    <Tag color={productSnapshot.featured ? 'orange' : 'default'}>
                                        {productSnapshot.featured ? '是' : '否'}
                                    </Tag>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Col>
                </Row>

                {productSnapshot.description && (
                    <>
                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>详细描述</span>
                        </Divider>
                        <div
                            style={{
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                padding: '20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                maxHeight: '300px',
                                overflow: 'auto',
                                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
                            }}
                        >
                            <div
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    margin: 0,
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    fontFamily: 'Consolas, Monaco, "Courier New", monospace'
                                }}
                            >
                                {productSnapshot.description}
                            </div>
                        </div>
                    </>
                )}

                {(productSnapshot.tags || productSnapshot.purchaseUrl || productSnapshot.seoTitle) && (
                    <>
                        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>其他信息</span>
                        </Divider>
                        <Descriptions
                            column={1}
                            bordered
                            size="small"
                            styles={{
                                label: {
                                    background: 'rgba(54, 209, 220, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 600,
                                    borderColor: 'rgba(255, 255, 255, 0.1)'
                                },
                                content: {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    borderColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            {productSnapshot.tags && (
                                <Descriptions.Item label="标签">
                                    <Space wrap>
                                        {productSnapshot.tags.split(',').map((tag, index) => (
                                            <Tag key={index} icon={<TagOutlined />} color="blue">
                                                {tag.trim()}
                                            </Tag>
                                        ))}
                                    </Space>
                                </Descriptions.Item>
                            )}
                            {productSnapshot.purchaseUrl && (
                                <Descriptions.Item label="购买链接">
                                    <a
                                        href={productSnapshot.purchaseUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#36d1dc' }}
                                    >
                                        {productSnapshot.purchaseUrl}
                                    </a>
                                </Descriptions.Item>
                            )}
                            {productSnapshot.seoTitle && (
                                <Descriptions.Item label="SEO标题">
                                    <span style={secondaryTextStyle}>{productSnapshot.seoTitle}</span>
                                </Descriptions.Item>
                            )}
                            {productSnapshot.seoDescription && (
                                <Descriptions.Item label="SEO描述">
                                    <span style={secondaryTextStyle}>{productSnapshot.seoDescription}</span>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </>
                )}
            </Card>
        </div>
    );

    return (
        <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            {type === 'article'
                ? renderArticlePreview(snapshot as ArticleSnapshot)
                : renderProductPreview(snapshot as ProductSnapshot)
            }
        </div>
    );
};

export default SnapshotPreview;
