import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '@/hooks/business/usePageTitle'

const NotFound: React.FC = () => {
    usePageTitle('页面找不到了', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })
    const navigate = useNavigate()

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Result
                status="404"
                title="404"
                subTitle="抱歉，您访问的页面不存在。"
                extra={
                    <Button type="primary" onClick={() => navigate('/')}>
                        返回首页
                    </Button>
                }
            />
        </div>
    )
}

export default NotFound