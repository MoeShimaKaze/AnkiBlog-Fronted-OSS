// src/components/Layout/AdminLayout.tsx
import React, { useState, useEffect } from 'react'
import { Layout, Drawer } from 'antd'
import AdminSidebar from '@/components/Navigation/AdminSidebar'
import AdminHeader from '@/components/Navigation/AdminHeader'

const { Content } = Layout

interface AdminLayoutProps {
    children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [drawerVisible, setDrawerVisible] = useState(false)

    // 监听窗口大小变化，判断是否为移动端
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            // 移动端自动关闭抽屉
            if (mobile) {
                setDrawerVisible(false)
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleToggle = () => {
        if (isMobile) {
            setDrawerVisible(!drawerVisible)
        } else {
            setCollapsed(!collapsed)
        }
    }

    const handleDrawerClose = () => {
        setDrawerVisible(false)
    }

    // 移动端点击菜单项后关闭抽屉
    const handleMenuClick = () => {
        if (isMobile) {
            setDrawerVisible(false)
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundImage: `url('/background_placeholder.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* 背景遮罩 */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(102, 126, 234, 0.4)',
                    backdropFilter: 'blur(1px)',
                    zIndex: 0
                }}
            />

            <Layout style={{ minHeight: '100vh', background: 'transparent', position: 'relative', zIndex: 10 }}>
                {/* 桌面端固定侧边栏 */}
                {!isMobile && <AdminSidebar collapsed={collapsed} onMenuClick={handleMenuClick} />}

                {/* 移动端抽屉式侧边栏 */}
                {isMobile && (
                    <Drawer
                        placement="left"
                        open={drawerVisible}
                        onClose={handleDrawerClose}
                        width={280}
                        styles={{
                            body: { padding: 0 },
                            header: { display: 'none' }
                        }}
                        style={{
                            background: 'transparent'
                        }}
                        rootClassName="admin-mobile-drawer"
                    >
                        <AdminSidebar
                            collapsed={false}
                            isMobile={true}
                            onMenuClick={handleMenuClick}
                        />
                    </Drawer>
                )}

                <Layout style={{
                    marginLeft: isMobile ? 0 : (collapsed ? 80 : 256),
                    transition: 'margin-left 0.2s',
                    background: 'transparent'
                }}>
                    <AdminHeader
                        collapsed={collapsed}
                        onToggle={handleToggle}
                        isMobile={isMobile}
                        drawerVisible={drawerVisible}
                    />

                    <Content style={{
                        padding: isMobile ? '12px' : '24px',
                        background: 'transparent'
                    }}>
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: isMobile ? '8px' : '12px',
                                padding: isMobile ? '1rem' : '2rem',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                minHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 168px)'
                            }}
                        >
                            {children}
                        </div>
                    </Content>
                </Layout>
            </Layout>

            {/* 移动端抽屉样式 */}
            <style>{`
                .admin-mobile-drawer .ant-drawer-content-wrapper {
                    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3) !important;
                }
                .admin-mobile-drawer .ant-drawer-content {
                    background: rgba(0, 0, 0, 0.85) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                }
                .admin-mobile-drawer .ant-drawer-body {
                    background: transparent !important;
                }

                /* 移动端内容区域优化 */
                @media (max-width: 768px) {
                    .ant-layout-content {
                        padding: 12px !important;
                    }
                }
            `}</style>
        </div>
    )
}

export default AdminLayout
