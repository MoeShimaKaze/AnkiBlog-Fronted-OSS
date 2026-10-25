import { config } from '@/config/env'
import { Modal } from 'antd'
import { MAX_FILE_SIZE } from '@/utils/constants'

const IMAGE_COMPRESSION_CONFIRMED = '__imageCompressionConfirmed'

type ImageFileWithMeta = File & {
    [IMAGE_COMPRESSION_CONFIRMED]?: boolean
}

export const getImageUrl = (path?: string, defaultImage = '/default-image.png') => {
    if (!path) return defaultImage

    // 如果已经是完整URL，直接返回
    if (path.startsWith('http')) return path

    // 如果是相对路径，添加基础URL
    return `${config.apiBaseUrl}/files${path}`
}

export const generateImageSizes = (baseUrl: string) => {
    return {
        thumbnail: `${baseUrl}?w=150&h=150&fit=crop`,
        small: `${baseUrl}?w=300&h=200&fit=crop`,
        medium: `${baseUrl}?w=600&h=400&fit=crop`,
        large: `${baseUrl}?w=1200&h=800&fit=crop`,
        original: baseUrl,
    }
}

export const validateImageFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
        throw new Error('只支持 JPEG、PNG、GIF、WebP 格式的图片')
    }

    if (file.size > MAX_FILE_SIZE.IMAGE) {
        throw new Error(`图片大小不能超过 ${(MAX_FILE_SIZE.IMAGE / 1024 / 1024).toFixed(0)}MB`)
    }

    return true
}

export const shouldPromptImageCompression = (file: File) => {
    return file.size > MAX_FILE_SIZE.IMAGE_PROMPT
}

export const markImageCompressionConfirmed = (file: File) => {
    ;(file as ImageFileWithMeta)[IMAGE_COMPRESSION_CONFIRMED] = true
}

export const isImageCompressionConfirmed = (file: File) => {
    return Boolean((file as ImageFileWithMeta)[IMAGE_COMPRESSION_CONFIRMED])
}

export const ensureImageUploadAllowed = async (file: File): Promise<boolean> => {
    validateImageFile(file)

    if (!shouldPromptImageCompression(file) || isImageCompressionConfirmed(file)) {
        return true
    }

    return new Promise(resolve => {
        Modal.confirm({
            title: '图片较大',
            content: '大图将由后端压缩，是否继续上传？',
            okText: '继续上传',
            cancelText: '取消',
            onOk: () => {
                markImageCompressionConfirmed(file)
                resolve(true)
            },
            onCancel: () => resolve(false),
        })
    })
}
