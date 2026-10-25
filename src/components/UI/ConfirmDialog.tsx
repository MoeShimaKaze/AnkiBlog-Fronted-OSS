// src/components/UI/ConfirmDialog.tsx
import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const { confirm } = Modal

export interface ConfirmDialogOptions {
    title: string
    content: string
    onOk: () => void | Promise<void>
    onCancel?: () => void
    okText?: string
    cancelText?: string
    okType?: 'primary' | 'danger' | 'dashed' | 'default'
}

export const showConfirmDialog = ({
                                      title,
                                      content,
                                      onOk,
                                      onCancel,
                                      okText = '确定',
                                      cancelText = '取消',
                                      okType = 'primary',
                                  }: ConfirmDialogOptions) => {
    confirm({
        title,
        icon: <ExclamationCircleOutlined />,
        content,
        okText,
        okType,
        cancelText,
        onOk,
        onCancel,
    })
}

export const showDeleteConfirm = (onOk: () => void | Promise<void>) => {
    showConfirmDialog({
        title: '确认删除',
        content: '删除后无法恢复，是否确认删除？',
        onOk,
        okType: 'danger',
        okText: '删除',
    })
}