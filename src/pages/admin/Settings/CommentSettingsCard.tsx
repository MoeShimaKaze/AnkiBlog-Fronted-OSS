// CommentSettingsCard.tsx - 移除未使用的profile参数
import React from 'react';
import { Card, Form, Switch, Select, Row, Col } from 'antd';

const { Option } = Select;

interface CommentSettingsCardProps {
    form: any;
}

const CommentSettingsCard: React.FC<CommentSettingsCardProps> = ({ form }) => {
    return (
        <Row gutter={[24, 24]} justify="center">
            <Col xs={24} lg={16}>
                <Card
                    title="评论功能"
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-6"
                >
                    <Form.Item
                        name="commentsEnabled"
                        valuePropName="checked"
                        help={<span className="text-white/60">开启后用户可以发表评论</span>}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-white">启用评论</span>
                            <Switch
                                checkedChildren="启用"
                                unCheckedChildren="禁用"
                                checked={form.getFieldValue('commentsEnabled')}
                                onChange={(checked) => {
                                    form.setFieldValue('commentsEnabled', checked);
                                }}
                            />
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="allowGuestComments"
                        valuePropName="checked"
                        help={<span className="text-white/60">开启后访客也可以发表评论</span>}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-white">访客评论</span>
                            <Switch
                                checkedChildren="允许"
                                unCheckedChildren="仅限登录"
                                checked={form.getFieldValue('allowGuestComments')}
                                onChange={(checked) => {
                                    form.setFieldValue('allowGuestComments', checked);
                                }}
                            />
                        </div>
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">评论审核</span>}
                        name="commentModeration"
                        help={<span className="text-white/60">控制评论的审核策略</span>}
                    >
                        <Select className="w-full">
                            <Option value="auto_approve">自动通过</Option>
                            <Option value="first_time_manual">首次评论需审核</Option>
                            <Option value="always_manual">总是需要审核</Option>
                        </Select>
                    </Form.Item>
                </Card>
            </Col>
        </Row>
    );
};

export default CommentSettingsCard;