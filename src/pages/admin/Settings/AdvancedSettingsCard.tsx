// AdvancedSettingsCard.tsx - 移除未使用的profile参数
import React from 'react';
import { Card, Form, Input, Row, Col } from 'antd';

const { TextArea } = Input;

interface AdvancedSettingsCardProps {
    form: any;
}

const AdvancedSettingsCard: React.FC<AdvancedSettingsCardProps> = ({ }) => {
    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
                <Card
                    title="自定义代码"
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
                >
                    <Form.Item
                        label={<span className="text-white">自定义CSS</span>}
                        name="customCss"
                        help={<span className="text-white/60">注入到页面的自定义样式</span>}
                    >
                        <TextArea
                            rows={6}
                            placeholder="/* 在此添加自定义CSS代码 */"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">自定义JavaScript</span>}
                        name="customJs"
                        help={<span className="text-white/60">注入到页面的自定义脚本</span>}
                    >
                        <TextArea
                            rows={6}
                            placeholder="// 在此添加自定义JavaScript代码"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card
                    title="SEO设置"
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
                >
                    <Form.Item
                        label={<span className="text-white">默认SEO描述</span>}
                        name="defaultSeoDescription"
                    >
                        <TextArea
                            rows={3}
                            placeholder="网站的SEO描述..."
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">Google验证码</span>}
                        name="googleVerification"
                    >
                        <Input
                            placeholder="Google Search Console验证码"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">百度验证码</span>}
                        name="baiduVerification"
                    >
                        <Input
                            placeholder="百度站长工具验证码"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>
                </Card>
            </Col>
        </Row>
    );
};

export default AdvancedSettingsCard;
