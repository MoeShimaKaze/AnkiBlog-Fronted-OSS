// src/components/Upload/FileUploader.tsx
import React, { useState } from 'react'
import { Upload, Button, List, message, Progress } from 'antd'
import { UploadOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { formatFileSize } from '@/utils/format.ts'

interface FileUploaderProps {
    value?: string[]
    onChange?: (urls: string[]) => void
    accept?: string
    maxSize?: number
    multiple?: boolean
    disabled?: boolean
}

const FileUploader: React.FC<FileUploaderProps> = ({
                                                       value = [],
                                                       onChange,
                                                       accept = '*',
                                                       maxSize = 10 * 1024 * 1024, // 10MB
                                                       multiple = true,
                                                       disabled = false,
                                                   }) => {
    const [fileList, setFileList] = useState<UploadFile[]>(
        value.map((url, index) => ({
            uid: `${index}`,
            name: url.split('/').pop() || `file-${index}`,
            status: 'done',
            url,
        }))
    )
    const [uploading, setUploading] = useState(false)

    const uploadProps: UploadProps = {
        name: 'file',
        action: '/api/admin/upload/file',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        fileList,
        multiple,
        disabled: disabled || uploading,
        showUploadList: false,
        accept,
        beforeUpload: (file) => {
            if (file.size > maxSize) {
                message.error(`文件大小不能超过 ${formatFileSize(maxSize)}`)
                return false
            }
            return true
        },
        onChange: ({ fileList: newFileList, file }) => {
            setFileList(newFileList)

            if (file.status === 'uploading') {
                setUploading(true)
            }

            if (file.status === 'done') {
                setUploading(false)
                const urls = newFileList
                    .filter(f => f.status === 'done')
                    .map(f => f.response?.data || f.url)
                onChange?.(urls)
                message.success('文件上传成功')
            }

            if (file.status === 'error') {
                setUploading(false)
                message.error(`${file.name} 上传失败`)
            }
        },
    }

    const handleRemove = (file: UploadFile) => {
        const newFileList = fileList.filter(f => f.uid !== file.uid)
        setFileList(newFileList)
        const urls = newFileList
            .filter(f => f.status === 'done')
            .map(f => f.response?.data || f.url)
        onChange?.(urls)
    }

    const handleDownload = (file: UploadFile) => {
        const url = file.response?.data || file.url
        if (url) {
            const a = document.createElement('a')
            a.href = url
            a.download = file.name
            a.click()
        }
    }

    return (
        <div className="space-y-4">
            <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} loading={uploading} disabled={disabled}>
                    {uploading ? '上传中...' : '选择文件'}
                </Button>
            </Upload>

            {fileList.length > 0 && (
                <List
                    size="small"
                    dataSource={fileList}
                    renderItem={(file) => (
                        <List.Item
                            actions={[
                                <Button
                                    key="download"
                                    type="text"
                                    size="small"
                                    onClick={() => handleDownload(file)}
                                >
                                    下载
                                </Button>,
                                <Button
                                    key="delete"
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemove(file)}
                                    disabled={disabled}
                                />,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<FileOutlined />}
                                title={file.name}
                                description={
                                    file.status === 'uploading' ? (
                                        <Progress percent={file.percent} size="small" />
                                    ) : (
                                        `${formatFileSize(file.size || 0)} - ${file.status === 'done' ? '已上传' : '上传失败'}`
                                    )
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    )
}

export default FileUploader