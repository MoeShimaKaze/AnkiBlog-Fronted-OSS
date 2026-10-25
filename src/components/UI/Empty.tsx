// src/components/UI/Empty.tsx
import React from 'react'
import { Empty as AntEmpty } from 'antd'

interface EmptyProps {
    description?: string
    image?: React.ReactNode
    action?: React.ReactNode
    className?: string
}

const Empty: React.FC<EmptyProps> = ({
                                         description = '暂无数据',
                                         image,
                                         action,
                                         className = '',
                                     }) => {
    return (
        <div className={`py-12 ${className}`}>
            <AntEmpty
                image={image || AntEmpty.PRESENTED_IMAGE_SIMPLE}
                description={description}
            >
                {action}
            </AntEmpty>
        </div>
    )
}

export default Empty