// src/components/admin/Settings/VerificationModal.tsx
import React, { useState } from 'react';
import { Modal, Button, Input, Typography, message } from 'antd';
import { UseVerificationCodeReturn } from '@/hooks/common/useVerificationCode.ts';
import { modalGlassCardStyle } from '@/constants/styles';

const { Title } = Typography;

interface VerificationModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (code?: string) => Promise<void>;
    isSubmitting: boolean;
    title: string;
    content?: React.ReactNode;
    requireVerification?: boolean;
    verificationHook?: UseVerificationCodeReturn;
    sendCodeFn?: () => Promise<any>; // 动态发送验证码函数
    okText?: string;
    cancelText?: string;
    danger?: boolean;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
                                                                 visible,
                                                                 onCancel,
                                                                 onSubmit,
                                                                 isSubmitting,
                                                                 title,
                                                                 content,
                                                                 requireVerification = true,
                                                                 verificationHook,
                                                                 sendCodeFn,
                                                                 okText = '确认保存',
                                                                 cancelText = '取消',
                                                                 danger = false
                                                             }) => {
    const [verificationCode, setVerificationCode] = useState('');
    const { sendingCode, codeSent, countdown, sendCode } = verificationHook || {};

    // 动态发送验证码函数
    const handleSendCode = async () => {
        if (sendCodeFn) {
            try {
                await sendCodeFn();
                message.success('验证码已发送到您的邮箱');
            } catch (error) {
                console.error('Send code failed:', error);
                message.error('发送验证码失败');
            }
        } else if (sendCode) {
            await sendCode();
        }
    };

    const handleSubmit = async () => {
        if (requireVerification) {
            if (!verificationCode || verificationCode.length !== 6) {
                return;
            }
            await onSubmit(verificationCode);
        } else {
            await onSubmit();
        }
        setVerificationCode('');
    };

    const handleCancel = () => {
        setVerificationCode('');
        onCancel();
    };

    const isSubmitDisabled = requireVerification
        ? (!verificationCode || verificationCode.length !== 6)
        : false;

    return (
        <Modal
            open={visible}
            title={null}
            footer={null}
            onCancel={handleCancel}
            destroyOnClose
            centered
            closable={false}
            maskStyle={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            styles={{
                content: { background: 'transparent', boxShadow: 'none', padding: 0 }
            }}
        >
            <div style={{
                ...modalGlassCardStyle,
                padding: '24px',
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={4} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
                        {title}
                    </Title>

                    {requireVerification ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                                {content || '修改核心配置需要验证您的身份。请获取并输入邮箱验证码。'}
                            </p>
                            <Button
                                onClick={handleSendCode}
                                loading={sendingCode}
                                disabled={codeSent}
                                type="primary"
                                size="small"
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    border: 'none',
                                    marginLeft: '12px'
                                }}
                            >
                                {codeSent ? `重新发送(${countdown}s)` : '发送验证码'}
                            </Button>
                        </div>
                    ) : (
                        <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            {content || '此操作不可撤销，请确认是否继续。'}
                        </div>
                    )}
                </div>

                {requireVerification && (
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, fontSize: '16px', lineHeight: '40px' }}>
                                验证码
                            </label>
                            <div className="glass-otp-container" style={{ flex: 1 }}>
                                <Input.OTP
                                    length={6}
                                    value={verificationCode}
                                    onChange={setVerificationCode}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button
                        onClick={handleCancel}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white'
                        }}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitDisabled}
                        style={{
                            background: danger
                                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            border: 'none'
                        }}
                    >
                        {okText}
                    </Button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    .glass-otp-container .ant-otp-input {
                        background: rgba(55, 65, 81, 0.8) !important;
                        border: 1px solid rgba(255, 255, 255, 0.3) !important;
                        color: white !important;
                        border-radius: 8px !important;
                        text-align: center !important;
                        font-weight: 500 !important;
                        font-size: 16px !important;
                        height: 40px !important;
                        width: 40px !important;
                    }
                    
                    .glass-otp-container .ant-otp-input:hover {
                        border-color: rgba(255, 255, 255, 0.5) !important;
                        background: rgba(75, 85, 99, 0.8) !important;
                    }
                    
                    .glass-otp-container .ant-otp-input:focus {
                        border-color: #60a5fa !important;
                        background: rgba(75, 85, 99, 0.8) !important;
                        box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2) !important;
                        outline: none !important;
                    }
                    
                    .glass-otp-container .ant-otp {
                        gap: 8px !important;
                        display: flex !important;
                        justify-content: center !important;
                    }
                `
            }} />
        </Modal>
    );
};

export default VerificationModal;
