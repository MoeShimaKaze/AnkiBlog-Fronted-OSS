// OwnerInfoCard.tsx - 移除未使用的profile参数
import React from 'react';
import { Card, Form, Input, Row, Col } from 'antd';

const { TextArea } = Input;

interface OwnerInfoCardProps {
    form: any;
}

const OwnerInfoCard: React.FC<OwnerInfoCardProps> = ({ }) => {
    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
                <Card
                    title="个人信息"
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
                >
                    <Form.Item
                        label={<span className="text-white">站长姓名</span>}
                        name="ownerName"
                    >
                        <Input
                            placeholder="请输入姓名"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">头像URL</span>}
                        name="ownerAvatar"
                    >
                        <Input
                            placeholder="https://example.com/avatar.jpg"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">个人简介</span>}
                        name="ownerBio"
                    >
                        <TextArea
                            rows={4}
                            placeholder="介绍一下自己..."
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card
                    title="职业信息"
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
                >
                    <Form.Item
                        label={<span className="text-white">职业</span>}
                        name="ownerProfession"
                    >
                        <Input
                            placeholder="例如：软件工程师"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">工作单位</span>}
                        name="ownerCompany"
                    >
                        <Input
                            placeholder="例如：某某科技有限公司"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">所在地</span>}
                        name="ownerLocation"
                    >
                        <Input
                            placeholder="例如：北京市"
                            className="bg-white/15 border-white/30 text-white placeholder:text-white/50"
                        />
                    </Form.Item>
                </Card>
            </Col>
        </Row>
    );
};

export default OwnerInfoCard;
