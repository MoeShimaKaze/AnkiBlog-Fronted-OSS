// src/components/CustomPage/CustomPageSEO.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CustomPage } from '@/types/customPage';

interface CustomPageSEOProps {
    page: CustomPage;
    siteName?: string;
}

const CustomPageSEO: React.FC<CustomPageSEOProps> = ({ page, siteName = 'AnkiBlog' }) => {
    const canonicalUrl = `${window.location.origin}${page.fullPath}`;

    return (
        <Helmet>
            {/* 基础meta */}
            <title>{page.effectiveSeoTitle}</title>
            <meta name="description" content={page.effectiveSeoDescription} />
            {page.seoKeywords && <meta name="keywords" content={page.seoKeywords} />}

            {/* Open Graph */}
            <meta property="og:title" content={page.effectiveSeoTitle} />
            <meta property="og:description" content={page.effectiveSeoDescription} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:site_name" content={siteName} />
            {page.ogImage && <meta property="og:image" content={page.ogImage} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={page.effectiveSeoTitle} />
            <meta name="twitter:description" content={page.effectiveSeoDescription} />
            {page.ogImage && <meta name="twitter:image" content={page.ogImage} />}

            {/* 其他meta */}
            <meta name="author" content={siteName} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={canonicalUrl} />

            {/* 页面图标 */}
            {page.pageIcon && (
                <link
                    rel="icon"
                    href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${page.pageIcon}</text></svg>`}
                />
            )}

            {/* 结构化数据 */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": page.title,
                    "description": page.effectiveSeoDescription,
                    "url": canonicalUrl,
                    "dateModified": page.updatedAt,
                    "datePublished": page.publishedAt || page.createdAt,
                    "mainEntity": {
                        "@type": "Article",
                        "headline": page.title,
                        "description": page.effectiveSeoDescription,
                        "datePublished": page.publishedAt || page.createdAt,
                        "dateModified": page.updatedAt,
                        "author": {
                            "@type": "Organization",
                            "name": siteName
                        }
                    }
                })}
            </script>
        </Helmet>
    );
};

export default CustomPageSEO;