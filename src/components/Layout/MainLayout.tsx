// src/components/Layout/MainLayout.tsx
import React from 'react'
import { Layout } from 'antd'
import BackToTop from '@/components/Common/BackToTop'
import Footer from '../Common/Footer'

const { Content } = Layout

interface MainLayoutProps {
    children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Layout className="min-h-screen">
            <Content className="flex-1">
                {children}
            </Content>

            <BackToTop />
            <Footer></Footer>
        </Layout>
    )
}

export default MainLayout