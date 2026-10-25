// src/components/Navigation/AdminSidebar.tsx
import React from 'react'
import { Layout, Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import {
    DashboardOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    UserOutlined,
    SettingOutlined,
    UploadOutlined,
    BgColorsOutlined,
    HistoryOutlined,
    HeartOutlined, LikeOutlined,
    BookOutlined,
    CommentOutlined,
    TagOutlined,
    Html5Outlined,
    TaobaoOutlined,
    AppstoreOutlined,
    ChromeOutlined,
    WeiboOutlined,
    TwitterOutlined,
    BarsOutlined,
    SkinOutlined,
    CalendarOutlined,
    ExperimentOutlined,
    HighlightOutlined,
    CheckSquareOutlined,
    FlagOutlined,
    ThunderboltOutlined,
    DollarOutlined,
} from '@ant-design/icons'

const { Sider } = Layout

interface AdminSidebarProps {
    collapsed: boolean
    isMobile?: boolean
    onMenuClick?: () => void
}

// 侧边栏样式
const sidebarStyles = `
    /* 主菜单容器的透明化处理 */
    .glass-sidebar-menu {
        background: transparent !important;
        border: none !important;
    }

    /* 所有菜单项的基础样式 - 创建统一的透明效果 */
    .glass-sidebar-menu .ant-menu-item,
    .glass-sidebar-menu .ant-menu-submenu,
    .glass-sidebar-menu .ant-menu-submenu-title {
        background: transparent !important;
        color: rgba(255, 255, 255, 0.9) !important;
        border-radius: 8px !important;
        margin: 4px 8px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border: 1px solid transparent !important;
    }

    /* 悬停效果 - 提供清晰的交互反馈 */
    .glass-sidebar-menu .ant-menu-item:hover,
    .glass-sidebar-menu .ant-menu-submenu-title:hover {
        background: rgba(255, 255, 255, 0.12) !important;
        color: rgba(255, 255, 255, 1) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
        transform: translateX(4px) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
    }

    /* 选中状态 - 使用蓝色主题突出当前页面 */
    .glass-sidebar-menu .ant-menu-item-selected {
        background: rgba(59, 130, 246, 0.25) !important;
        color: rgba(255, 255, 255, 1) !important;
        border-color: rgba(59, 130, 246, 0.4) !important;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
    }

    .glass-sidebar-menu .ant-menu-item-selected:hover {
        background: rgba(59, 130, 246, 0.35) !important;
        transform: translateX(6px) !important;
    }

    /* 展开的子菜单标题样式 */
    .glass-sidebar-menu .ant-menu-submenu-open > .ant-menu-submenu-title {
        background: rgba(255, 255, 255, 0.08) !important;
        color: rgba(255, 255, 255, 1) !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
    }

    /* 子菜单容器的透明化 */
    .glass-sidebar-menu .ant-menu-sub {
        background: transparent !important;
        padding: 4px 0 !important;
    }

    /* 子菜单项的特殊样式 - 创建层级缩进效果 */
    .glass-sidebar-menu .ant-menu-sub .ant-menu-item {
        margin-left: 12px !important;
        margin-right: 12px !important;
        padding-left: 48px !important;
        background: transparent !important;
        border-radius: 6px !important;
        border: 1px solid transparent !important;
    }

    .glass-sidebar-menu .ant-menu-sub .ant-menu-item:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
        transform: translateX(8px) !important;
    }

    .glass-sidebar-menu .ant-menu-sub .ant-menu-item-selected {
        background: rgba(59, 130, 246, 0.2) !important;
        border-color: rgba(59, 130, 246, 0.3) !important;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2) !important;
    }

    /* 图标颜色统一管理 */
    .glass-sidebar-menu .ant-menu-item-icon,
    .glass-sidebar-menu .ant-menu-submenu-title .ant-menu-item-icon {
        color: rgba(255, 255, 255, 0.8) !important;
        transition: color 0.3s ease !important;
    }

    .glass-sidebar-menu .ant-menu-item:hover .ant-menu-item-icon,
    .glass-sidebar-menu .ant-menu-submenu-title:hover .ant-menu-item-icon,
    .glass-sidebar-menu .ant-menu-item-selected .ant-menu-item-icon {
        color: rgba(255, 255, 255, 1) !important;
    }

    /* 展开箭头的样式优化 */
    .glass-sidebar-menu .ant-menu-submenu-arrow {
        color: rgba(255, 255, 255, 0.7) !important;
        transition: all 0.3s ease !important;
    }

    .glass-sidebar-menu .ant-menu-submenu-title:hover .ant-menu-submenu-arrow {
        color: rgba(255, 255, 255, 1) !important;
        transform: scale(1.1) !important;
    }

    /* 折叠状态下的特殊处理 */
    .glass-sidebar-menu.ant-menu-inline-collapsed .ant-menu-item {
        padding: 0 calc(50% - 8px) !important;
    }

    .glass-sidebar-menu.ant-menu-inline-collapsed .ant-menu-item-icon {
        font-size: 16px !important;
    }

    /* 链接样式重置 - 确保继承颜色 */
    .glass-sidebar-menu a {
        color: inherit !important;
        text-decoration: none !important;
    }

    .glass-sidebar-menu a:hover,
    .glass-sidebar-menu a:focus,
    .glass-sidebar-menu a:active {
        color: inherit !important;
    }

    /* 移动端菜单优化 */
    @media (max-width: 768px) {
        .glass-sidebar-menu .ant-menu-item,
        .glass-sidebar-menu .ant-menu-submenu-title {
            min-height: 44px !important;
            line-height: 44px !important;
        }

        .glass-sidebar-menu .ant-menu-sub .ant-menu-item {
            padding-left: 40px !important;
        }
    }
`

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, isMobile = false, onMenuClick }) => {
    const location = useLocation()

    // 菜单项配置 - 使用更清晰的结构来管理导航
    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/admin/dashboard" style={{ color: 'inherit' }}>仪表板</Link>,
        },
        {
            key: 'content',
            icon: <FileTextOutlined />,
            label: '内容管理',
            children: [
                {
                    key: '/admin/articles',
                    icon: <BookOutlined />,
                    label: <Link to="/admin/articles" style={{ color: 'inherit' }}>文章管理</Link>,
                },
                {
                    key: '/admin/article-snapshots',
                    icon: <HistoryOutlined />,
                    label: <Link to="/admin/article-snapshots" style={{ color: 'inherit' }}>文章快照</Link>,
                },
                {
                    key: '/admin/todos',
                    icon: <CheckSquareOutlined />,
                    label: <Link to="/admin/todos" style={{ color: 'inherit' }}>待办管理</Link>,
                },
                {
                    key: '/admin/comments',
                    icon: <CommentOutlined />,
                    label: <Link to="/admin/comments" style={{ color: 'inherit' }}>评论管理</Link>,
                },
                {
                    key: '/admin/tags',
                    icon: <TagOutlined />,
                    label: <Link to="/admin/tags" style={{ color: 'inherit' }}>标签管理</Link>,
                },
                {
                    key: '/admin/pages',
                    icon: <Html5Outlined />,
                    label: <Link to="/admin/pages" style={{ color: 'inherit' }}>自定义页面管理</Link>,
                },
            ],
        },
        {
            key: 'product',
            icon: <ShoppingOutlined />,
            label: '商品管理',
            children: [
                {
                    key: '/admin/products',
                    icon: <TaobaoOutlined />,
                    label: <Link to="/admin/products" style={{ color: 'inherit' }}>商品管理</Link>,
                },
                {
                    key: '/admin/product-snapshots',
                    icon: <HistoryOutlined />,
                    label: <Link to="/admin/product-snapshots" style={{ color: 'inherit' }}>商品快照</Link>,
                },
                {
                    key: '/admin/categories',
                    icon: <AppstoreOutlined />,
                    label: <Link to="/admin/categories" style={{ color: 'inherit' }}>分类管理</Link>,
                },
            ],
        },
        {
            key: 'wardrobe',
            icon: <SkinOutlined />,
            label: '衣橱管理',
            children: [
                {
                    key: '/admin/daily-outfit',
                    icon: <ThunderboltOutlined />,
                    label: <Link to="/admin/daily-outfit" style={{ color: 'inherit' }}>今天穿什么</Link>,
                },
                {
                    key: '/admin/outfits',
                    icon: <CalendarOutlined />,
                    label: <Link to="/admin/outfits" style={{ color: 'inherit' }}>穿搭管理</Link>,
                },
                {
                    key: '/admin/wardrobe',
                    icon: <SkinOutlined />,
                    label: <Link to="/admin/wardrobe" style={{ color: 'inherit' }}>我的衣橱</Link>,
                },
            ],
        },
        {
            key: 'cosmetics',
            icon: <ExperimentOutlined />,
            label: '化妆台',
            children: [
                {
                    key: '/admin/makeups',
                    icon: <HighlightOutlined />,
                    label: <Link to="/admin/makeups" style={{ color: 'inherit' }}>化妆记录</Link>,
                },
                {
                    key: '/admin/cosmetics',
                    icon: <ExperimentOutlined />,
                    label: <Link to="/admin/cosmetics" style={{ color: 'inherit' }}>我的化妆品</Link>,
                },
            ],
        },
        {
            key: 'check-in',
            icon: <FlagOutlined />,
            label: '打卡管理',
            children: [
                {
                    key: '/admin/check-in',
                    icon: <CalendarOutlined />,
                    label: <Link to="/admin/check-in" style={{ color: 'inherit' }}>目标列表</Link>,
                },
                {
                    key: '/admin/check-in/categories',
                    icon: <AppstoreOutlined />,
                    label: <Link to="/admin/check-in/categories" style={{ color: 'inherit' }}>分类管理</Link>,
                },
            ],
        },
        {
            key: '/admin/accounting',
            icon: <DollarOutlined />,
            label: <Link to="/admin/accounting" style={{ color: 'inherit' }}>记账管理</Link>,
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: <Link to="/admin/users" style={{ color: 'inherit' }}>用户管理</Link>,
        },
        {
            key: '/admin/user-like',
            icon: <HeartOutlined />,
            label: <Link to="/admin/user-like" style={{ color: 'inherit' }}>收藏管理</Link>,
        },
        {
            key: '/admin/subscription',
            icon: <LikeOutlined />,
            label: <Link to="/admin/subscription" style={{ color: 'inherit' }}>订阅管理</Link>,
        },
        {
            key: '/admin/files',
            icon: <UploadOutlined />,
            label: <Link to="/admin/files" style={{ color: 'inherit' }}>文件管理</Link>,
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '系统设置',
            children: [
                {
                    key: '/admin/settings/site',
                    icon: <ChromeOutlined />,
                    label: <Link to="/admin/settings/site" style={{ color: 'inherit' }}>站点设置</Link>,
                },
                {
                    key: '/admin/social-links',
                    icon: <WeiboOutlined />,
                    label: <Link to="/admin/social-links" style={{ color: 'inherit' }}>社交媒体</Link>,
                },
                {
                    key: '/admin/friend-links',
                    icon: <TwitterOutlined />,
                    label: <Link to="/admin/friend-links" style={{ color: 'inherit' }}>友链管理</Link>,
                },
                {
                    key: '/admin/settings/page-titles',
                    icon: <BarsOutlined />,
                    label: <Link to="/admin/settings/page-titles" style={{ color: 'inherit' }}>页面标题</Link>,
                },
                {
                    key: '/admin/settings/backgrounds',
                    icon: <BgColorsOutlined />,
                    label: <Link to="/admin/settings/backgrounds" style={{ color: 'inherit' }}>背景设置</Link>,
                },
                {
                    key: '/admin/settings/makeup',
                    icon: <ExperimentOutlined />,
                    label: <Link to="/admin/settings/makeup" style={{ color: 'inherit' }}>化妆品设置</Link>,
                },
                {
                    key: '/admin/settings/profile',
                    icon: <UserOutlined />,
                    label: <Link to="/user/profile" style={{ color: 'inherit' }}>个人资料</Link>,
                },
            ],
        },
    ]

    // 处理菜单项点击
    const handleMenuSelect = () => {
        if (onMenuClick) {
            onMenuClick()
        }
    }

    // 移动端渲染内容（不包含Sider外壳）
    const renderMobileContent = () => (
        <div
            style={{
                height: '100vh',
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* 侧边栏标题区域 */}
            <div
                style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                    margin: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <h2
                    style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        margin: 0,
                        textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                    }}
                >
                    管理后台
                </h2>
            </div>

            {/* 菜单容器 */}
            <div
                style={{
                    padding: '0 8px',
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
            >
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    className="glass-sidebar-menu"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '14px',
                    }}
                    onSelect={handleMenuSelect}
                />
            </div>
        </div>
    )

    // 移动端直接返回内容，不包含Sider
    if (isMobile) {
        return (
            <>
                <style>{sidebarStyles}</style>
                {renderMobileContent()}
            </>
        )
    }

    return (
        <>
            <style>{sidebarStyles}</style>

            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={256}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                    background: 'rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                }}
            >
                {/* 侧边栏标题区域 */}
                <div
                    style={{
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                        margin: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s ease',
                    }}
                >
                    <h2
                        style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: collapsed ? '14px' : '18px',
                            margin: 0,
                            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                            transition: 'font-size 0.3s ease',
                            letterSpacing: collapsed ? '1px' : '0.5px',
                        }}
                    >
                        {collapsed ? 'Admin' : '管理后台'}
                    </h2>
                </div>

                {/* 菜单容器 */}
                <div
                    style={{
                        padding: '0 16px',
                        height: 'calc(100vh - 96px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        className="glass-sidebar-menu"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '14px',
                        }}
                        inlineCollapsed={collapsed}
                        onSelect={handleMenuSelect}
                    />
                </div>
            </Sider>
        </>
    )
}

export default AdminSidebar
