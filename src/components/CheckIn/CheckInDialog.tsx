import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    InputNumber,
    Input,
    DatePicker,
    Space,
    Button,
    message,
    ConfigProvider
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { GoalDetail, CheckInRequest } from '@/types/checkIn';
import { MOOD_OPTIONS } from '@/types/checkIn';
import { checkIn, updateCheckIn } from '@/services/checkInService';

// 玻璃态主题配置
const glassTheme = {
    token: {
        colorText: 'rgba(255, 255, 255, 0.9)',
        colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
        colorBgElevated: 'rgba(35, 35, 45, 0.95)',
        borderRadius: 8,
    },
    components: {
        Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
            activeBorderColor: '#1890ff',
        },
        InputNumber: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
        },
        DatePicker: {
            colorBgContainer: 'rgba(255, 255, 255, 0.1)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
        },
        Form: {
            labelColor: 'rgba(255, 255, 255, 0.85)',
        },
        Modal: {
            contentBg: 'rgba(35, 35, 45, 0.95)',
            headerBg: 'rgba(35, 35, 45, 0.95)',
            titleColor: 'rgba(255, 255, 255, 0.9)',
        },
    },
};

interface CheckInDialogProps {
    open: boolean;
    goal: GoalDetail;
    selectedDate?: string;
    onCancel: () => void;
    onSuccess: () => void;
}

const CheckInDialog: React.FC<CheckInDialogProps> = ({
    open,
    goal,
    selectedDate,
    onCancel,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);

    const isAccumulate = goal.goalType === 'ACCUMULATE';
    const isEditMode = selectedDate && goal.todayCheckIn && selectedDate === dayjs().format('YYYY-MM-DD');

    useEffect(() => {
        if (open) {
            if (isEditMode && goal.todayCheckIn) {
                form.setFieldsValue({
                    date: dayjs(goal.todayCheckIn.checkInDate),
                    value: goal.todayCheckIn.value,
                    note: goal.todayCheckIn.note
                });
                setSelectedMood(goal.todayCheckIn.mood);
            } else {
                form.setFieldsValue({
                    date: selectedDate ? dayjs(selectedDate) : dayjs(),
                    value: goal.stepValue || 1,
                    note: ''
                });
                setSelectedMood(undefined);
            }
        }
    }, [open, selectedDate, goal, isEditMode, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const request: CheckInRequest = {
                date: (values.date as Dayjs).format('YYYY-MM-DD'),
                value: isAccumulate ? values.value : 1,
                note: values.note,
                mood: selectedMood
            };

            let res;
            if (isEditMode && goal.todayCheckIn) {
                res = await updateCheckIn(goal.todayCheckIn.id, request);
            } else {
                res = await checkIn(goal.id, request);
            }

            if (res.success) {
                const result = res.data;
                if (result && 'newlyUnlockedMilestones' in result && result.newlyUnlockedMilestones && result.newlyUnlockedMilestones.length > 0) {
                    message.success(`🎉 ${result.message}`);
                } else {
                    message.success(isEditMode ? '修改成功' : '打卡成功！');
                }
                onSuccess();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || '操作失败');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickValue = (value: number) => {
        form.setFieldsValue({ value });
    };

    const quickValues = [0.5, 1, 1.5, 2, 3, 4];

    return (
        <ConfigProvider theme={glassTheme}>
            <Modal
                title={
                    <Space>
                        <span>{goal.icon || '🎯'}</span>
                        <span>{goal.name}</span>
                    </Space>
                }
                open={open}
                onCancel={onCancel}
                footer={[
                    <Button
                        key="cancel"
                        onClick={onCancel}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
                        }}
                    >
                        取消
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                        {isEditMode ? '保存修改' : '确认打卡'}
                    </Button>
                ]}
                destroyOnClose
                styles={{
                    content: {
                        background: 'rgba(35, 35, 45, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    header: {
                        background: 'transparent',
                    },
                }}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="date"
                        label="打卡日期"
                        rules={[{ required: true, message: '请选择日期' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => current && current > dayjs().endOf('day')}
                            disabled={!!isEditMode}
                        />
                    </Form.Item>

                    {isAccumulate && (
                        <>
                            <Form.Item
                                name="value"
                                label={`本次${goal.targetUnit || '数值'}`}
                                rules={[
                                    { required: true, message: '请输入数值' },
                                    { type: 'number', min: 0.5, message: '数值必须大于0' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0.5}
                                    step={goal.stepValue || 0.5}
                                    precision={1}
                                    addonAfter={goal.targetUnit || ''}
                                />
                            </Form.Item>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-white/60 text-sm">快捷:</span>
                                <Space wrap>
                                    {quickValues.map((v) => (
                                        <Button
                                            key={v}
                                            size="small"
                                            onClick={() => handleQuickValue(v)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                color: 'rgba(255, 255, 255, 0.8)',
                                            }}
                                        >
                                            {v}
                                        </Button>
                                    ))}
                                </Space>
                            </div>
                        </>
                    )}

                    <Form.Item name="note" label="备注">
                        <Input.TextArea
                            rows={2}
                            placeholder="记录一下今天的心得..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item label="心情">
                        <div className="flex gap-2 flex-wrap">
                            {MOOD_OPTIONS.map((mood) => (
                                <span
                                    key={mood.emoji}
                                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg cursor-pointer transition-all ${
                                        selectedMood === mood.emoji
                                            ? 'bg-blue-500 scale-110'
                                            : 'bg-white/10 hover:bg-white/20'
                                    }`}
                                    onClick={() => setSelectedMood(
                                        selectedMood === mood.emoji ? undefined : mood.emoji
                                    )}
                                    title={mood.label}
                                >
                                    {mood.emoji}
                                </span>
                            ))}
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </ConfigProvider>
    );
};

export default CheckInDialog;
