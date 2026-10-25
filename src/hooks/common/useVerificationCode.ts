// src/hooks/useVerificationCode.ts
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { sendUpdateCode } from '@/services/siteSettings.ts';

export interface UseVerificationCodeReturn {
    sendingCode: boolean;
    codeSent: boolean;
    countdown: number;
    sendCode: () => Promise<void>;
    submitWithCode: <T>(code: string, submitFn: (data: any) => Promise<T>, data?: any) => Promise<T>;
    resetState: () => void;
}

interface UseVerificationCodeOptions {
    // 自定义发送验证码函数，如果不提供则使用默认的 sendUpdateCode
    sendCodeFn?: () => Promise<any>;
    // 成功发送后的提示信息
    successMessage?: string;
    // 失败时的提示信息
    errorMessage?: string;
}

export const useVerificationCode = (options: UseVerificationCodeOptions = {}): UseVerificationCodeReturn => {
    const {
        sendCodeFn = sendUpdateCode,
        successMessage = '验证码已发送到您的邮箱',
        errorMessage = '发送验证码失败'
    } = options;

    const [sendingCode, setSendingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const sendCode = useCallback(async () => {
        try {
            setSendingCode(true);
            await sendCodeFn();
            message.success(successMessage);
            setCodeSent(true);
            setCountdown(60);

            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCodeSent(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: any) {
            message.error(error.message || errorMessage);
            throw error;
        } finally {
            setSendingCode(false);
        }
    }, [sendCodeFn, successMessage, errorMessage]);

    const submitWithCode = useCallback(async <T>(
        code: string,
        submitFn: (data: any) => Promise<T>,
        data?: any
    ): Promise<T> => {
        if (!code || code.length !== 6) {
            throw new Error('请输入6位验证码');
        }

        const submitData = data ? { ...data, verificationCode: code } : { verificationCode: code };
        return await submitFn(submitData);
    }, []);

    const resetState = useCallback(() => {
        setSendingCode(false);
        setCodeSent(false);
        setCountdown(0);
    }, []);

    return {
        sendingCode,
        codeSent,
        countdown,
        sendCode,
        submitWithCode,
        resetState
    };
};