// src/pages/public/Home/HomePage.tsx
import React from 'react'
import { usePageTitle } from '@/hooks/business/usePageTitle'
import HeroSection from '../../../components/Home/HeroSection'

const HomePage: React.FC = () => {
    // 只添加这一行，设置动态标题
    usePageTitle('首页', {
        siteName: 'Ankiの歇脚处',
        siteTagline: '首页'  // 改为siteTagline匹配后端模板
    })

    return (
        <div className="min-h-screen">
            <HeroSection />
        </div>
    )
}

export default HomePage