// src/components/Comment/CommentForm.tsx
import React, { useState } from 'react'
import { Form, Input, Button, Space } from 'antd'
import { primaryTextStyle } from '@/constants/styles'

const { TextArea } = Input

interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>
    placeholder?: string
}

const CommentForm: React.FC<CommentFormProps> = ({
                                                     onSubmit,
                                                     placeholder = "写下你的评论..."
                                                 }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (values: { content: string }) => {
        if (!values.content.trim()) return

        setLoading(true)
        try {
            await onSubmit(values.content.trim())
            form.resetFields()
        } catch (error) {
            console.error('提交评论失败:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
                name="content"
                rules={[
                    { required: true, message: '请输入评论内容' },
                    { min: 5, message: '评论内容至少5个字符' },
                    { max: 500, message: '评论内容最多2000个字符' }
                ]}
                style={{ marginBottom: '1rem' }}
            >
                <TextArea
                    placeholder={placeholder}
                    rows={4}
                    showCount
                    maxLength={2000}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        ...primaryTextStyle
                    }}
                />
            </Form.Item>

            <Form.Item style={{ margin: 0 }}>
                <Space>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '20px'
                        }}
                    >
                        发表评论
                    </Button>
                    <Button
                        onClick={() => form.resetFields()}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            borderRadius: '20px'
                        }}
                    >
                        清空
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    )
}

export default CommentForm
