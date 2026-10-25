// FriendLinksPage.tsx - 重构版本，与ProductListPage样式一致
import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Card, Button, Modal, Form, Input, Select, message, Space } from 'antd';
import { PlusOutlined, HeartOutlined } from '@ant-design/icons';
import FriendLinkCard from '@/components/Friend/FriendLinkCard';
import Navbar from '@/components/Common/Navbar';
import { usePageTitle } from '@/hooks/business/usePageTitle';
import { getApprovedFriendLinks, applyFriendLink } from '@/services/friendLinkService';
import type { FriendLink, FriendLinkCreateRequest } from '@/services/friendLinkService';
import {
    brightShadowedSecondaryTextStyle,
    modalGlassCardStyle,
    primaryTextStyle,
    shadowedGlassCardStyle,
} from '@/constants/styles';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FriendLinksPage: React.FC = () => {
    usePageTitle('友情链接');

    const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyModalVisible, setApplyModalVisible] = useState(false);
    const [applyForm] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadFriendLinks = async () => {
        try {
            setLoading(true);
            const response = await getApprovedFriendLinks();
            if (response.success) {
                setFriendLinks(response.data);
            }
        } catch (error) {
            console.error('加载友链失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFriendLinks();
    }, []);

    const handleApplySubmit = async (values: FriendLinkCreateRequest) => {
        try {
            setIsSubmitting(true);
            const response = await applyFriendLink(values);
            if (response.success) {
                message.success('友链申请已提交，请等待审核');
                setApplyModalVisible(false);
                applyForm.resetFields();
            }
        } catch (error) {
            message.error('申请失败，请稍后重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    const secondaryTextStyle = brightShadowedSecondaryTextStyle;

    const glassInputStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: 'white',
    };

    const labelStyle: React.CSSProperties = {
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 500,
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    };

    const glassCardStyle: React.CSSProperties = {
        ...shadowedGlassCardStyle,
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundImage: `url('/background_placeholder.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* 背景遮罩层 */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(102, 126, 234, 0.4)',
                    backdropFilter: 'blur(1px)',
                    zIndex: -1
                }}
            />

            {/* 导航栏 */}
            <Navbar />

            {/* 主内容区域 */}
            <div style={{ padding: '40px 24px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {/* 页面标题区域 */}
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <div style={{
                            ...glassCardStyle,
                            padding: '40px 32px',
                            margin: '0 auto',
                            maxWidth: '800px'
                        }}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <HeartOutlined style={{ fontSize: '48px', color: '#ff6b6b' }} />
                                <Title level={1} style={{
                                    ...primaryTextStyle,
                                    fontSize: '2.5rem',
                                    margin: 0,
                                    fontWeight: 700
                                }}>
                                    友情链接
                                </Title>
                                <Paragraph style={{
                                    ...secondaryTextStyle,
                                    fontSize: '1.1rem',
                                    margin: 0,
                                    lineHeight: 1.6
                                }}>
                                    这里汇聚了一些优秀的博客和网站，我们相互分享知识、交流思想。
                                    <br />
                                    如果你也有不错的站点，欢迎申请友链，一起构建更好的网络社区。
                                </Paragraph>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    size="large"
                                    onClick={() => setApplyModalVisible(true)}
                                    style={{
                                        background: 'rgba(24, 144, 255, 0.8)',
                                        border: 'none',
                                        borderRadius: '25px',
                                        height: '50px',
                                        padding: '0 32px',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        boxShadow: '0 4px 15px rgba(24, 144, 255, 0.3)'
                                    }}
                                >
                                    申请友链
                                </Button>
                            </Space>
                        </div>
                    </div>

                    {/* 友链展示区域 */}
                    <div style={{
                        ...glassCardStyle,
                        padding: '32px',
                        marginBottom: '48px'
                    }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <Spin size="large" />
                                <div style={{ marginTop: '1rem', ...primaryTextStyle }}>
                                    正在加载友链...
                                </div>
                            </div>
                        ) : friendLinks.length > 0 ? (
                            <>
                                <Title level={3} style={{
                                    ...primaryTextStyle,
                                    marginBottom: '32px',
                                    textAlign: 'center'
                                }}>
                                    我的朋友们 ({friendLinks.length})
                                </Title>
                                <Row gutter={[24, 24]}>
                                    {friendLinks.map(friendLink => (
                                        <Col key={friendLink.id} xs={24} sm={12} lg={8} xl={6}>
                                            <FriendLinkCard friendLink={friendLink} />
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <Title level={4} style={primaryTextStyle}>
                                    暂无友链
                                </Title>
                                <Paragraph style={secondaryTextStyle}>
                                    还没有收录任何友链，欢迎优质站点申请加入
                                </Paragraph>
                            </div>
                        )}
                    </div>

                    {/* 友链申请说明 */}
                    <Card
                        style={glassCardStyle}
                        title={<span style={primaryTextStyle}>友链申请说明</span>}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div style={{ ...secondaryTextStyle, lineHeight: '1.8' }}>
                            <Title level={4} style={{ ...primaryTextStyle, marginTop: 0 }}>
                                申请条件
                            </Title>
                            <ul style={{ paddingLeft: '20px' }}>
                                <li>网站内容健康，无不良信息</li>
                                <li>网站可正常访问，更新频率合理</li>
                                <li>网站有一定的原创内容</li>
                                <li>如需互换友链，请先添加本站链接</li>
                            </ul>

                            <Title level={4} style={primaryTextStyle}>
                                本站信息
                            </Title>
                            <Row gutter={[24, 0]}>
                                <Col span={8}>
                                    <strong>站点名称：</strong>AnkiBlog
                                </Col>
                                <Col span={8}>
                                    <strong>站点描述：</strong>Ankiの歇脚处
                                </Col>
                                <Col span={8}>
                                    <strong>站点链接：</strong>
                                    <a href={window.location.origin} style={{ color: '#1890ff' }}>
                                        {window.location.origin}
                                    </a>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </div>
            </div>

            {/* 申请模态框 */}
            <Modal
                open={applyModalVisible}
                title={null}
                footer={null}
                onCancel={() => setApplyModalVisible(false)}
                destroyOnClose
                centered
                closable={false}
                styles={{
                    content: { background: 'transparent', boxShadow: 'none', padding: 0 },
                    mask: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }
                }}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{
                    ...modalGlassCardStyle,
                    padding: '32px',
                    minWidth: '500px'
                }}>
                    <Title level={4} style={{
                        color: 'white',
                        margin: 0,
                        marginBottom: '24px',
                        textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                        textAlign: 'center'
                    }}>
                        <HeartOutlined style={{ marginRight: '8px', color: '#ff6b6b' }} />
                        申请友链
                    </Title>
                    <Form form={applyForm} layout="vertical" onFinish={handleApplySubmit}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="siteName"
                                    label={<span style={labelStyle}>站点名称</span>}
                                    rules={[{ required: true, message: '请输入站点名称' }]}
                                >
                                    <Input style={glassInputStyle} placeholder="您的站点名称" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="category"
                                    label={<span style={labelStyle}>站点分类</span>}
                                    initialValue="个人博客"
                                >
                                    <Select
                                        style={glassInputStyle}
                                        placeholder="请选择站点分类"
                                        dropdownStyle={{
                                            background: 'rgba(50, 50, 50, 0.85)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        <Option value="个人博客" style={{ background: 'transparent', color: 'rgba(255,255,255,0.9)' }}>个人博客</Option>
                                        <Option value="技术博客" style={{ background: 'transparent', color: 'rgba(255,255,255,0.9)' }}>技术博客</Option>
                                        <Option value="生活博客" style={{ background: 'transparent', color: 'rgba(255,255,255,0.9)' }}>生活博客</Option>
                                        <Option value="摄影博客" style={{ background: 'transparent', color: 'rgba(255,255,255,0.9)' }}>摄影博客</Option>
                                        <Option value="其他" style={{ background: 'transparent', color: 'rgba(255,255,255,0.9)' }}>其他</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="siteUrl"
                            label={<span style={labelStyle}>站点URL</span>}
                            rules={[
                                { required: true, message: '请输入站点URL' },
                                { type: 'url', message: '请输入有效的URL' }
                            ]}
                        >
                            <Input style={glassInputStyle} placeholder="https://yoursite.com" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label={<span style={labelStyle}>站点描述</span>}
                        >
                            <TextArea
                                rows={3}
                                style={glassInputStyle}
                                placeholder="简单介绍一下您的站点内容和特色..."
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="ownerName"
                                    label={<span style={labelStyle}>站长名称</span>}
                                >
                                    <Input style={glassInputStyle} placeholder="您的昵称（可选）" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="ownerEmail"
                                    label={<span style={labelStyle}>联系邮箱</span>}
                                    rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
                                >
                                    <Input style={glassInputStyle} placeholder="联系邮箱（可选）" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="avatarUrl"
                            label={<span style={labelStyle}>头像URL</span>}
                        >
                            <Input style={glassInputStyle} placeholder="站点头像/Logo链接（可选）" />
                        </Form.Item>
                    </Form>

                    <div style={{ textAlign: 'right', marginTop: '32px' }}>
                        <Button
                            onClick={() => setApplyModalVisible(false)}
                            style={{ marginRight: 16 }}
                        >
                            取消
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => applyForm.submit()}
                            loading={isSubmitting}
                            style={{
                                background: 'rgba(24, 144, 255, 0.8)',
                                border: 'none',
                                borderRadius: '8px'
                            }}
                        >
                            提交申请
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FriendLinksPage;
