// src/components/Common/PageTitle.tsx
import React from 'react'
import { Typography, Breadcrumb } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { HomeOutlined, FileTextOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons'
import { usePageTitle } from '@/hooks/business/usePageTitle'

const { Title, Text } = Typography

interface BreadcrumbItem {
    title: string
    path?: string
    icon?: React.ReactNode
}

interface PageTitleProps {
    title?: string
    subtitle?: string
    breadcrumbs?: BreadcrumbItem[]
    extra?: React.ReactNode
    showBreadcrumb?: boolean
    customParams?: Record<string, string>
}

const PageTitle: React.FC<PageTitleProps> = ({
                                                 title,
                                                 subtitle,
                                                 breadcrumbs,
                                                 extra,
                                                 showBreadcrumb = true,
                                                 customParams
                                             }) => {
    const location = useLocation()

    // 使用页面标题Hook设置document.title
    usePageTitle(title, customParams)

    const getDefaultBreadcrumbs = (): BreadcrumbItem[] => {
        const items: BreadcrumbItem[] = [{ title: '首页', path: '/', icon: <HomeOutlined /> }]

        if (location.pathname.startsWith('/articles')) {
            items.push({ title: '文章', path: '/articles', icon: <FileTextOutlined /> })
            if (location.pathname !== '/articles') {
                items.push({ title: title || '文章详情' })
            }
        } else if (location.pathname.startsWith('/products')) {
            items.push({ title: '商品', path: '/products', icon: <ShoppingOutlined /> })
            if (location.pathname !== '/products') {
                items.push({ title: title || '商品详情' })
            }
        } else if (location.pathname.startsWith('/user')) {
            items.push({ title: '个人中心', path: '/user/dashboard', icon: <UserOutlined /> })
            if (location.pathname.includes('/profile')) {
                items.push({ title: '个人资料' })
            }
        } else if (location.pathname.startsWith('/admin')) {
            items.push({ title: '管理后台', path: '/admin/dashboard' })
        }

        return items
    }

    const finalBreadcrumbs = breadcrumbs || getDefaultBreadcrumbs()

    const breadcrumbItems = finalBreadcrumbs.map((item, index) => {
        const isLast = index === finalBreadcrumbs.length - 1

        return {
            key: item.path || item.title,
            title: item.path && !isLast ? (
                <Link to={item.path}>
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.title}
                </Link>
            ) : (
                <span>
          {item.icon && <span className="mr-1">{item.icon}</span>}
                    {item.title}
        </span>
            )
        }
    })

    return (
        <div className="page-title-wrapper">
            {showBreadcrumb && finalBreadcrumbs.length > 1 && (
                <Breadcrumb
                    items={breadcrumbItems}
                    className="mb-4"
                />
            )}

            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    {title && (
                        <Title level={1} className="mb-2">
                            {title}
                        </Title>
                    )}
                    {subtitle && (
                        <Text type="secondary" className="text-lg">
                            {subtitle}
                        </Text>
                    )}
                </div>

                {extra && (
                    <div className="ml-4">
                        {extra}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PageTitle