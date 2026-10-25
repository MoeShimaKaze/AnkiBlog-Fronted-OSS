// BasicSettingsCard.tsx - 移除未使用的profile参数
import React from 'react';
import { Card, Form, Input, Row, Col } from 'antd';

const { TextArea } = Input;

interface BasicSettingsCardProps {
    form: any;
}

const BasicSettingsCard: React.FC<BasicSettingsCardProps> = ({ }) => {
    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
                <Card
                    title="基本信息"
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-6"
                >
                    <Form.Item
                        label={<span className="text-white">站点名称</span>}
                        name="siteName"
                        rules={[{ required: true, message: '请输入站点名称' }]}
                    >
                        <Input
                            placeholder="例如：AnkiBlog"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">站点URL</span>}
                        name="siteUrl"
                        rules={[
                            { required: true, message: '请输入站点URL' },
                            { type: 'url', message: '请输入有效的URL' }
                        ]}
                    >
                        <Input
                            placeholder="https://yourdomain.com"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">站点标语</span>}
                        name="siteTagline"
                    >
                        <Input
                            placeholder="例如：Anki の歇脚处"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">站点描述</span>}
                        name="siteDescription"
                    >
                        <TextArea
                            rows={4}
                            placeholder="站点的详细描述..."
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">联系邮箱</span>}
                        name="contactEmail"
                        rules={[
                            { required: true, message: '请输入联系邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <Input
                            placeholder="contact@yourdomain.com"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card
                    title="首页设置"
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-6"
                >
                    <Form.Item
                        label={<span className="text-white">首页标题</span>}
                        name="heroTitle"
                    >
                        <Input
                            placeholder="例如：欢迎来到我的个人空间"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">首页副标题</span>}
                        name="heroSubtitle"
                        help={<span className="text-white/60">支持换行，使用 \n 分隔</span>}
                    >
                        <TextArea
                            rows={3}
                            placeholder="例如：这里记录着我的思考、分享着有趣的内容..."
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">主题色</span>}
                        name="themeColor"
                        help={<span className="text-white/60">用于网站主色调</span>}
                    >
                        <Input
                            type="color"
                            className="w-25 bg-white/15 border-white/30"
                        />
                    </Form.Item>
                </Card>
            </Col>
        </Row>
    );
};

export default BasicSettingsCard;