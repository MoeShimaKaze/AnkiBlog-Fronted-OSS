// src/hooks/ui/useToast.ts
import { message } from 'antd'

export const useToast = () => {
    const success = (content: string) => {
        message.success(content)
    }

    const error = (content: string) => {
        message.error(content)
    }

    const warning = (content: string) => {
        message.warning(content)
    }

    const info = (content: string) => {
        message.info(content)
    }

    const loading = (content: string) => {
        return message.loading(content, 0)
    }

    return {
        success,
        error,
        warning,
        info,
        loading,
    }
}