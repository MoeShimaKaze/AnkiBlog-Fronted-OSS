// src/components/Navigation/AdminHeader.tsx
import React from 'react'
import { Layout, Button, Space, Dropdown, Avatar } from 'antd'
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    UserOutlined,
    EyeOutlined,
    MenuOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/auth/useAuth'

const { Header } = Layout

interface AdminHeaderProps {
    collapsed: boolean
    onToggle: () => void
    isMobile?: boolean
    drawerVisible?: boolean
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    collapsed,
    onToggle,
    isMobile = false,
    drawerVisible = false
}) => {
    const { user, logout } = useAuth()

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link to="/user/profile">个人设置</Link>,
        },
        {
            key: 'view-site',
            icon: <EyeOutlined />,
            label: <Link to="/" target="_blank">查看网站</Link>,
        },
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

    // 获取菜单图标
    const getMenuIcon = () => {
        if (isMobile) {
            return drawerVisible ? <CloseOutlined /> : <MenuOutlined />
        }
        return collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
    }

    return (
        <>
            {/* 全局样式定义 - 用于修复后台下拉菜单样式 */}
            <style>{`
                .admin-glass-dropdown-menu .ant-dropdown-menu {
                    background: rgba(67, 90, 158, 0.6) !important;
                    backdrop-filter: blur(10px) !important;
                    -webkit-backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(180, 200, 255, 0.4) !important;
                    border-radius: 8px !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
                    padding: 8px !important;
                }

                .admin-glass-dropdown-menu .ant-dropdown-menu-item {
                    color: rgba(255, 255, 255, 0.9) !important;
                }

                .admin-glass-dropdown-menu .ant-dropdown-menu-item-icon {
                    color: rgba(255, 255, 255, 0.8) !important;
                }

                .admin-glass-dropdown-menu .ant-dropdown-menu-item:hover {
                    background-color: rgba(255, 255, 255, 0.15) !important;
                    border-radius: 4px;
                }

                .admin-glass-dropdown-menu .ant-dropdown-menu-item a,
                .admin-glass-dropdown-menu .ant-dropdown-menu-item span {
                    color: inherit !important;
                }

                .admin-glass-dropdown-menu .ant-dropdown-menu-divider {
                    background-color: rgba(180, 200, 255, 0.4) !important;
                    margin: 6px 0 !important;
                }

                /* 移动端Header优化 */
                @media (max-width: 768px) {
                    .admin-header-user-name {
                        display: none !important;
                    }
                }
            `}</style>

            <Header
                style={{
                    background: 'rgba(150, 170, 255, 0.3)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(180, 200, 255, 0.4)',
                    borderRadius: isMobile ? '8px' : '12px',
                    margin: isMobile ? '12px 12px 0 12px' : '16px 16px 0 16px',
                    padding: isMobile ? '0 12px' : '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(67, 90, 158, 0.2)',
                    height: isMobile ? '56px' : '64px'
                }}
            >
                <Button
                    type="text"
                    icon={getMenuIcon()}
                    onClick={onToggle}
                    style={{
                        fontSize: isMobile ? '20px' : '18px',
                        color: 'white',
                        width: isMobile ? '44px' : '40px',
                        height: isMobile ? '44px' : '40px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                />

                <Space size={isMobile ? 8 : 16}>
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" overlayClassName="admin-glass-dropdown-menu">
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar
                                src={user?.avatarUrl}
                                icon={<UserOutlined />}
                                size={isMobile ? 'default' : 'default'}
                                style={{
                                    border: '2px solid rgba(255, 255, 255, 0.5)'
                                }}
                            />
                            <span
                                className="admin-header-user-name"
                                style={{
                                    color: 'white',
                                    fontWeight: '500',
                                    textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                                }}
                            >
                                {user?.displayName}
                            </span>
                        </Space>
                    </Dropdown>
                </Space>
            </Header>
        </>
    )
}

export default AdminHeader
