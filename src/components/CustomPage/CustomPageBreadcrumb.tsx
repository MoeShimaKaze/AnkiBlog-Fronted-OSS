// src/components/CustomPage/CustomPageBreadcrumb.tsx
import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, FileTextOutlined } from '@ant-design/icons';
import { CustomPage } from '@/types/customPage';

interface CustomPageBreadcrumbProps {
    page?: CustomPage;
}

const CustomPageBreadcrumb: React.FC<CustomPageBreadcrumbProps> = ({ page }) => {
    const location = useLocation();

    const getBreadcrumbItems = () => {
        const items = [
            {
                title: (
                    <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                        <HomeOutlined /> 首页
                    </Link>
                )
            }
        ];

        if (location.pathname.startsWith('/pages')) {
            items.push({
                title: (
                    <Link to="/pages" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                        <FileTextOutlined /> 页面
                    </Link>
                )
            });

            if (page) {
                items.push({
                    title: (
                        <span style={{ color: 'white' }}>
                            {page.pageIcon && <span style={{ marginRight: '4px' }}>{page.pageIcon}</span>}
                            {page.title}
                        </span>
                    )
                });
            }
        }

        return items;
    };

    return (
        <Breadcrumb
            items={getBreadcrumbItems()}
            style={{
                margin: '16px 0',
                padding: '8px 16px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
            }}
        />
    );
};

export default CustomPageBreadcrumb;