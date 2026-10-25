// src/components/Common/Navbar.tsx
import React, { useState } from 'react'
import { Menu, Input, Avatar, Dropdown, Button, Space, Drawer } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import {
    HomeOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    UserOutlined,
    LoginOutlined,
    LogoutOutlined,
    HeartOutlined,
    QqOutlined,
    Html5Outlined,
    MenuOutlined,
    SettingOutlined,
    CheckSquareOutlined,
    ThunderboltOutlined,
    AimOutlined,
    SkinOutlined,
    SmileOutlined
} from '@ant-design/icons'
import { useAuth } from '@/hooks/auth/useAuth'
import ThemeToggle from './ThemeToggle'

const { Search } = Input

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const [drawerVisible, setDrawerVisible] = useState(false)

    const handleSearch = (value: string) => {
        if (value.trim()) {
            navigate(`/search?q=${encodeURIComponent(value.trim())}`)
        }
    }

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link to="/user/profile">个人资料</Link>,
        },
        {
            key: 'dashboard',
            icon: <UserOutlined />,
            label: <Link to="/user/dashboard">个人中心</Link>,
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: <Link to="/user/settings">账号设置</Link>,
        },
        ...(user?.role === 'ADMIN' ? [{
            key: 'admin',
            icon: <UserOutlined />,
            label: <Link to="/admin/dashboard">管理后台</Link>,
        }] : []),
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: logout,
        },
    ]

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined style={{ color: 'white' }} />,
            label: <Link to="/" style={{ color: 'white' }}>首页</Link>,
        },
        {
            key: '/articles',
            icon: <FileTextOutlined style={{ color: 'white' }} />,
            label: <Link to="/articles" style={{ color: 'white' }}>文章</Link>,
        },
        {
            key: '/products',
            icon: <ShoppingOutlined style={{ color: 'white' }} />,
            label: <Link to="/products" style={{ color: 'white' }}>衣橱</Link>,
        },
        {
            key: '/goals',
            icon: <AimOutlined style={{ color: 'white' }} />,
            label: <Link to="/goals" style={{ color: 'white' }}>打卡</Link>,
        },
        {
            key: '/daily-outfit',
            icon: <ThunderboltOutlined style={{ color: 'white' }} />,
            label: <Link to="/daily-outfit" style={{ color: 'white' }}>今天穿什么</Link>,
        },
        {
            key: '/outfits',
            icon: <SkinOutlined style={{ color: 'white' }} />,
            label: <Link to="/outfits" style={{ color: 'white' }}>穿搭记录</Link>,
        },
        {
            key: '/makeups',
            icon: <SmileOutlined style={{ color: 'white' }} />,
            label: <Link to="/makeups" style={{ color: 'white' }}>化妆记录</Link>,
        },
        {
            key: '/todos',
            icon: <CheckSquareOutlined style={{ color: 'white' }} />,
            label: <Link to="/todos" style={{ color: 'white' }}>待办</Link>,
        },
        {
            key: '/friends',
            icon: <HeartOutlined style={{ color: 'white' }} />,
            label: <Link to="/friends" style={{ color: 'white' }}>友链</Link>,
        },
        {
            key: '/social-links',
            icon: <QqOutlined style={{ color: 'white' }} />,
            label: <Link to="/social-links" style={{ color: 'white' }}>社媒</Link>,
        },
        {
            key: '/pages',
            icon: <Html5Outlined style={{ color: 'white' }} />,
            label: <Link to="/pages" style={{ color: 'white' }}>页面</Link>,
        },
    ]

    const mobileMenuItems = [
        ...menuItems.map(item => ({
            ...item,
            icon: React.cloneElement(item.icon as React.ReactElement, { style: { color: 'rgba(255, 255, 255, 0.8)' } }),
            label: React.cloneElement(item.label as React.ReactElement, {
                style: { color: 'rgba(255, 255, 255, 0.9)' },
                onClick: () => setDrawerVisible(false)
            })
        })),
        ...(isAuthenticated ? userMenuItems.filter(item => item.type !== 'divider').map(item => ({
            ...item,
            icon: React.cloneElement(item.icon as React.ReactElement, { style: { color: 'rgba(255, 255, 255, 0.8)' } }),
            label: typeof item.label === 'string' ? (
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }} onClick={() => {
                    if (item.onClick) {
                        item.onClick()
                    }
                    setDrawerVisible(false)
                }}>{item.label}</span>
            ) : (
                React.cloneElement(item.label as React.ReactElement, {
                    style: { color: 'rgba(255, 255, 255, 0.9)' },
                    onClick: () => setDrawerVisible(false)
                })
            )
        })) : [
            {
                key: 'login',
                icon: <LoginOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />,
                label: <Link to="/auth/login" style={{ color: 'rgba(255, 255, 255, 0.9)' }} onClick={() => setDrawerVisible(false)}>登录</Link>,
            },
            {
                key: 'register',
                icon: <UserOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />,
                label: <Link to="/auth/register" style={{ color: 'rgba(255, 255, 255, 0.9)' }} onClick={() => setDrawerVisible(false)}>注册</Link>,
            }
        ])
    ]

    return (
        <>
            {/* 全局样式定义 - 用于修复下拉菜单和导航溢出菜单样式 */}
            <style>{`
                /* 用户下拉菜单样式 */
                .glass-dropdown-menu .ant-dropdown-menu {
                    background: rgba(30, 30, 30, 0.85) !important;
                    backdrop-filter: blur(15px) !important;
                    -webkit-backdrop-filter: blur(15px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 12px !important;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
                    padding: 8px !important;
                }

                .glass-dropdown-menu .ant-dropdown-menu-item,
                .glass-dropdown-menu .ant-dropdown-menu-item-group-title {
                    color: rgba(255, 255, 255, 0.9) !important;
                }

                .glass-dropdown-menu .ant-dropdown-menu-item-icon {
                    color: rgba(255, 255, 255, 0.8) !important;
                }

                .glass-dropdown-menu .ant-dropdown-menu-item:hover {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    border-radius: 6px;
                }

                .glass-dropdown-menu .ant-dropdown-menu-item a,
                .glass-dropdown-menu .ant-dropdown-menu-item span {
                    color: inherit !important;
                }

                .glass-dropdown-menu .ant-dropdown-menu-divider {
                    background-color: rgba(255, 255, 255, 0.15) !important;
                    margin: 6px 0 !important;
                }

                /* 导航栏水平菜单溢出弹出层样式 */
                .ant-menu-submenu-popup {
                    background: transparent !important;
                }

                .ant-menu-submenu-popup > .ant-menu {
                    background: rgba(30, 30, 30, 0.9) !important;
                    backdrop-filter: blur(15px) !important;
                    -webkit-backdrop-filter: blur(15px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 12px !important;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
                    padding: 8px !important;
                }

                .ant-menu-submenu-popup .ant-menu-item {
                    color: rgba(255, 255, 255, 0.9) !important;
                    border-radius: 8px !important;
                    margin: 4px 0 !important;
                }

                .ant-menu-submenu-popup .ant-menu-item:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                }

                .ant-menu-submenu-popup .ant-menu-item-selected {
                    background: rgba(59, 130, 246, 0.3) !important;
                }

                .ant-menu-submenu-popup .ant-menu-item a {
                    color: rgba(255, 255, 255, 0.9) !important;
                }

                .ant-menu-submenu-popup .ant-menu-item-icon,
                .ant-menu-submenu-popup .anticon {
                    color: rgba(255, 255, 255, 0.8) !important;
                }

                /* 溢出指示器（...更多按钮）样式 */
                .ant-menu-overflow-item-rest {
                    color: white !important;
                }

                .ant-menu-overflow-item-rest .ant-menu-submenu-title {
                    color: white !important;
                }

                .ant-menu-overflow-item-rest:hover .ant-menu-submenu-title {
                    color: white !important;
                }

                /* 水平菜单项选中和悬停样式 - 去除白线 */
                .ant-menu-horizontal > .ant-menu-item::after,
                .ant-menu-horizontal > .ant-menu-submenu::after {
                    border-bottom: none !important;
                }

                .ant-menu-horizontal > .ant-menu-item-selected::after {
                    border-bottom: none !important;
                }

                /* 去除菜单底部边框线 */
                .ant-menu-horizontal {
                    border-bottom: none !important;
                }

                /* 移动端抽屉菜单暗色玻璃拟态样式 */
                .mobile-nav-drawer .ant-drawer-content {
                    background: rgba(20, 20, 20, 0.95) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                }

                .mobile-nav-drawer .ant-drawer-header {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                }

                .mobile-nav-drawer .ant-drawer-header-title {
                    color: white !important;
                }

                .mobile-nav-drawer .ant-drawer-close {
                    color: rgba(255, 255, 255, 0.7) !important;
                }

                .mobile-nav-drawer .ant-drawer-close:hover {
                    color: white !important;
                }

                .mobile-nav-drawer .ant-drawer-body {
                    background: transparent !important;
                }

                /* 移动端菜单项样式 */
                .mobile-nav-drawer .ant-menu {
                    background: transparent !important;
                    border: none !important;
                }

                .mobile-nav-drawer .ant-menu-item {
                    color: rgba(255, 255, 255, 0.85) !important;
                    border-radius: 8px !important;
                    margin: 4px 0 !important;
                }

                .mobile-nav-drawer .ant-menu-item:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                }

                .mobile-nav-drawer .ant-menu-item-selected {
                    background: rgba(59, 130, 246, 0.2) !important;
                    color: white !important;
                }

                .mobile-nav-drawer .ant-menu-item a {
                    color: inherit !important;
                }

                .mobile-nav-drawer .ant-menu-item-icon,
                .mobile-nav-drawer .anticon {
                    color: rgba(255, 255, 255, 0.7) !important;
                }

                /* 移动端搜索框样式 */
                .mobile-nav-drawer .ant-input-search .ant-input {
                    background: rgba(255, 255, 255, 0.08) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                }

                .mobile-nav-drawer .ant-input-search .ant-input::placeholder {
                    color: rgba(255, 255, 255, 0.4) !important;
                }

                .mobile-nav-drawer .ant-input-search .ant-input-search-button {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                }

                .mobile-nav-drawer .ant-input-search .ant-input-search-button .anticon {
                    color: rgba(255, 255, 255, 0.7) !important;
                }

                .mobile-nav-drawer .ant-input-clear-icon {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
            `}</style>

            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '64px'
                }}
            >
                {/* 左侧：Logo + 导航菜单 */}
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Link to="/" style={{ marginRight: '32px' }}>
                        <div
                            style={{
                                color: 'white',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            AnkiBlog
                        </div>
                    </Link>

                    {/* 桌面端菜单 */}
                    <div className="hidden lg:flex flex-1">
                        <Menu
                            mode="horizontal"
                            items={menuItems}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                flex: 1,
                                minWidth: 0
                            }}
                        />
                    </div>
                </div>

                {/* 右侧：搜索栏 + 主题切换 + 用户信息 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* 桌面端搜索 */}
                    <div className="hidden md:block">
                        <Search
                            placeholder="搜索文章和衣橱..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 250 }}
                        />
                    </div>

                    <ThemeToggle />

                    {/* 桌面端用户菜单 */}
                    <div className="hidden md:block">
                        {isAuthenticated ? (
                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" overlayClassName="glass-dropdown-menu">
                                <Space style={{ cursor: 'pointer' }}>
                                    <Avatar src={user?.avatarUrl} icon={<UserOutlined />} />
                                    <span style={{ color: 'white' }}>{user?.displayName}</span>
                                </Space>
                            </Dropdown>
                        ) : (
                            <Space>
                                <Link to="/auth/login">
                                    <Button
                                        icon={<LoginOutlined />}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                            color: 'white'
                                        }}
                                    >
                                        登录
                                    </Button>
                                </Link>
                                <Link to="/auth/register">
                                    <Button
                                        type="primary"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            borderColor: 'rgba(255, 255, 255, 0.3)'
                                        }}
                                    >
                                        注册
                                    </Button>
                                </Link>
                            </Space>
                        )}
                    </div>

                    {/* 移动端菜单按钮 */}
                    <Button
                        type="text"
                        icon={<MenuOutlined style={{ color: 'white' }} />}
                        onClick={() => setDrawerVisible(true)}
                        className="md:hidden"
                        style={{ padding: '4px 8px' }}
                    />
                </div>

                {/* 移动端菜单抽屉 */}
                <Drawer
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
                            <span>菜单</span>
                            {isAuthenticated && (
                                <Space>
                                    <Avatar src={user?.avatarUrl} icon={<UserOutlined />} size="small" />
                                    <span style={{ fontSize: '14px' }}>{user?.displayName}</span>
                                </Space>
                            )}
                        </div>
                    }
                    placement="right"
                    closable={true}
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    width={280}
                    className="md:hidden mobile-nav-drawer"
                    rootClassName="mobile-nav-drawer"
                    styles={{
                        body: {
                            padding: '16px'
                        },
                        header: {
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }
                    }}
                >
                    {/* 移动端搜索 */}
                    <div style={{ marginBottom: '16px' }}>
                        <Search
                            placeholder="搜索文章和衣橱..."
                            allowClear
                            onSearch={(value) => {
                                handleSearch(value)
                                setDrawerVisible(false)
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white'
                            }}
                        />
                    </div>

                    <Menu
                        mode="vertical"
                        items={mobileMenuItems}
                        style={{
                            background: 'transparent',
                            border: 'none'
                        }}
                    />
                </Drawer>
            </div>
        </>
    )
}

export default Navbar