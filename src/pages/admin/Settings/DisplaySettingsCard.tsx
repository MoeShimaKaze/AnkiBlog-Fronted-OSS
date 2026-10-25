// DisplaySettingsCard.tsx - 移除未使用的profile参数
import React from 'react';
import { Card, Form, InputNumber, Row, Col } from 'antd';

interface DisplaySettingsCardProps {
    form: any;
}

const DisplaySettingsCard: React.FC<DisplaySettingsCardProps> = ({ }) => {
    return (
        <Row gutter={[24, 24]} justify="center">
            <Col xs={24} lg={16}>
                <Card
                    title="显示配置"
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
                >
                    <Form.Item
                        label={<span className="text-white">首页文章数量</span>}
                        name="homepagePostCount"
                        help={<span className="text-white/60">首页显示的文章数量</span>}
                    >
                        <InputNumber
                            min={1}
                            max={50}
                            placeholder="默认10"
                            className="w-full bg-white/15 border-white/30 text-white"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">摘要长度</span>}
                        name="excerptLength"
                        help={<span className="text-white/60">文章摘要显示的字符数</span>}
                    >
                        <InputNumber
                            min={50}
                            max={500}
                            placeholder="默认200"
                            className="w-full bg-white/15 border-white/30 text-white"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">RSS订阅数量</span>}
                        name="rssFeedCount"
                        help={<span className="text-white/60">RSS源包含的文章数量</span>}
                    >
                        <InputNumber
                            min={5}
                            max={100}
                            placeholder="默认20"
                            className="w-full bg-white/15 border-white/30 text-white"
                        />
                    </Form.Item>
                </Card>
            </Col>
        </Row>
    );
};

export default DisplaySettingsCard;