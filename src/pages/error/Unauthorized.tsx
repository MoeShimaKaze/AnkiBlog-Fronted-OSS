import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '@/hooks/business/usePageTitle'

const Unauthorized: React.FC = () => {
    usePageTitle('权限不足', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const navigate = useNavigate()

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Result
                status="403"
                title="403"
                subTitle="抱歉，您没有权限访问此页面。"
                extra={
                    <Button type="primary" onClick={() => navigate('/auth/login')}>
                        去登录
                    </Button>
                }
            />
        </div>
    )
}

export default Unauthorized