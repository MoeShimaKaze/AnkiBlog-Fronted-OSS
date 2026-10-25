import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD') => {
    return dayjs(date).format(format)
}

export const formatRelativeTime = (date: string | Date) => {
    return dayjs(date).fromNow()
}

export const formatNumber = (num: number) => {
    if (num >= 10000) {
        return `${(num / 10000).toFixed(1)}万`
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
}

export const formatPrice = (price: number, currency = '¥') => {
    return `${currency}${price.toLocaleString()}`
}

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}