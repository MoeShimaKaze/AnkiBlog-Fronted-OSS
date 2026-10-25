import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {BackTop, Result, Space, Spin} from 'antd';
import {EyeOutlined, FileTextOutlined, ShareAltOutlined} from '@ant-design/icons';
import {CustomPage} from '@/types/customPage.ts';
import * as customPageService from '@/services/customPageService.ts';
import Navbar from '@/components/Common/Navbar.tsx';
import CommentSection from '@/components/Comment/CommentSection.tsx';
import CustomPageSEO from '@/components/CustomPage/CustomPageSEO.tsx';
import CustomPageBreadcrumb from '@/components/CustomPage/CustomPageBreadcrumb.tsx';
import CustomPageToolbar from '@/components/CustomPage/CustomPageToolbar.tsx';
import {formatNumber} from '@/utils/format.ts';

const getCustomPageScopeClass = (pageId: string) => `custom-page-scope-${pageId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

const scopeCssSelector = (selector: string, scopeSelector: string) => {
    const trimmed = selector.trim();
    if (!trimmed || trimmed.startsWith(scopeSelector)) {
        return trimmed;
    }

    if (/^(html|body|:root)(\b|[.#:[\s>+~]|$)/i.test(trimmed)) {
        const withoutRoot = trimmed.replace(/^(html|body|:root)/i, '').trim();
        return withoutRoot ? `${scopeSelector}${withoutRoot}` : scopeSelector;
    }

    return `${scopeSelector} ${trimmed}`;
};

const scopeCustomCss = (css: string, scopeSelector: string) => {
    if (!css) return css;

    return css.replace(/(^|[{}])\s*([^@{}][^{}]*)\{/g, (_match: string, prefix: string, selectorText: string) => {
        const scopedSelectors = selectorText
            .split(',')
            .map((selector: string) => scopeCssSelector(selector, scopeSelector))
            .join(', ');

        return `${prefix} ${scopedSelectors} {`;
    });
};

const scopeInlineStyleTags = (html: string, scopeSelector: string) => {
    if (!html) return html;

    return html.replace(
        /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
        (_match, attributes, css) => `<style${attributes}>${scopeCustomCss(css, scopeSelector)}</style>`
    );
};

const CustomPageViewer: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [page, setPage] = useState<CustomPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const hasStandaloneLayout = useMemo(() => {
        if (!page) return false;

        const content = page.content || '';
        const hasStructuredHtml = /<(style|main|section|article|header|footer)\b/i.test(content);
        const hasLayoutHooks = /\s(class|id)=["'][^"']+["']/i.test(content);
        const usesCustomTemplate = Boolean(page.template && page.template !== 'default');

        return Boolean(page.customCss || page.customJs || page.hasCustomCode || usesCustomTemplate || hasStructuredHtml || hasLayoutHooks);
    }, [page]);

    const pageScopeClass = useMemo(() => {
        return page ? getCustomPageScopeClass(page.id) : '';
    }, [page]);

    const scopedContent = useMemo(() => {
        if (!page) return '';
        return scopeInlineStyleTags(page.content || '', `.${getCustomPageScopeClass(page.id)}`);
    }, [page]);

    useEffect(() => {
        if (slug) {
            fetchPage(slug);
        }
    }, [slug]);

    const fetchPage = async (pageSlug: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customPageService.getPageBySlug(pageSlug);
            if (response.success) {
                setPage(response.data);

                // 处理重定向页面
                if (response.data.pageType === 'REDIRECT' && response.data.redirectUrl) {
                    window.location.href = response.data.redirectUrl;
                    return;
                }

                // 动态加载自定义CSS和JS
                loadCustomStyles(response.data);
            }
        } catch (error: any) {
            console.error('获取页面详情失败:', error);
            setError(error.message || '页面不存在或已下架');
        } finally {
            setLoading(false);
        }
    };

    const loadCustomStyles = (pageData: CustomPage) => {
        // 加载自定义CSS
        if (pageData.customCss) {
            const styleId = `custom-page-css-${pageData.id}`;
            let styleElement = document.getElementById(styleId) as HTMLStyleElement;

            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                styleElement.type = 'text/css';
                document.head.appendChild(styleElement);
            }

            styleElement.textContent = scopeCustomCss(pageData.customCss, `.${getCustomPageScopeClass(pageData.id)}`);
        }

        // 加载自定义JavaScript（需要安全检查）
        if (pageData.customJs && !pageData.needsSecurityReview) {
            const scriptId = `custom-page-js-${pageData.id}`;
            let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;

            if (!scriptElement) {
                scriptElement = document.createElement('script');
                scriptElement.id = scriptId;
                scriptElement.type = 'text/javascript';
                document.body.appendChild(scriptElement);
            }

            try {
                // 使用安全的方式执行JavaScript
                scriptElement.textContent = sanitizeJavaScript(pageData.customJs);
            } catch (error) {
                console.warn('Custom JavaScript execution failed:', error);
            }
        }
    };

    const sanitizeJavaScript = (js: string): string => {
        // 基础的JavaScript安全过滤
        const dangerousPatterns = [
            /eval\s*\(/gi,
            /document\.write/gi,
            /innerHTML\s*=/gi,
            /outerHTML\s*=/gi,
            /javascript:/gi,
            /vbscript:/gi
        ];

        let safeJs = js;
        dangerousPatterns.forEach(pattern => {
            safeJs = safeJs.replace(pattern, '/* BLOCKED */');
        });

        return safeJs;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
                 style={{ backgroundImage: "url('/background_placeholder.png')" }}>
                <div className="fixed inset-0 bg-purple-600/40 backdrop-blur-sm z-0" />
                <div className="relative z-10">
                    <Navbar />
                </div>
                <div className="relative z-10 flex justify-center items-center min-h-[60vh]">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
                 style={{ backgroundImage: "url('/background_placeholder.png')" }}>
                <div className="fixed inset-0 bg-purple-600/40 backdrop-blur-sm z-0" />
                <div className="relative z-10">
                    <Navbar />
                </div>
                <div className="relative z-10 flex justify-center items-center min-h-[60vh] p-8">
                    <div className="glass-effect p-8 rounded-2xl">
                        <Result
                            status="404"
                            title={<span className="text-white/95 drop-shadow-lg">页面不存在</span>}
                            subTitle={<span className="text-white/75">{error}</span>}
                            extra={
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-none text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
                                >
                                    返回首页
                                </button>
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (!page) {
        return null;
    }

    return (
        <>
            {/* 使用 CustomPageSEO 组件管理SEO */}
            <CustomPageSEO page={page} />

            <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
                 style={{ backgroundImage: "url('/background_placeholder.png')" }}>
                <div className="fixed inset-0 bg-purple-600/40 backdrop-blur-sm z-0" />

                <div className="relative z-10">
                    <Navbar />
                </div>

                <div className="relative z-10 pb-16 pt-8">
                    {/* 面包屑导航 */}
                    <div className="flex justify-center mb-4">
                        <div className="w-full max-w-[900px] px-4">
                            <CustomPageBreadcrumb page={page} />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-full max-w-[900px] px-4">
                            {/* 页面头部信息 */}
                            <div className="glass-effect p-8 rounded-2xl mb-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            {page.pageIcon && (
                                                <span className="text-3xl leading-none">{page.pageIcon}</span>
                                            )}
                                            <h1 className="m-0 text-white/95 text-4xl font-bold leading-tight drop-shadow-lg">
                                                {page.title}
                                            </h1>
                                        </div>

                                        {page.subtitle && (
                                            <p className="m-0 mb-5 text-white/85 text-lg leading-relaxed">
                                                {page.subtitle}
                                            </p>
                                        )}

                                        <Space className="custom-page-title-meta" size={18} wrap>
                                            <span><EyeOutlined /> {formatNumber(page.viewCount)} 次浏览</span>
                                            <span><ShareAltOutlined /> {formatNumber(page.shareCount)} 次分享</span>
                                            <span><FileTextOutlined /> 版本 {page.contentVersion}</span>
                                        </Space>
                                    </div>

                                    <CustomPageToolbar page={page} compact />
                                </div>
                            </div>

                            {/* 页面内容 */}
                            <div className={hasStandaloneLayout ? 'custom-page-standalone-content' : 'glass-effect p-10 rounded-2xl mb-6'}>
                                <div
                                    className={`custom-page-content text-white font-medium leading-relaxed ${pageScopeClass} ${hasStandaloneLayout ? 'custom-page-content--standalone' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: scopedContent }}
                                />
                            </div>

                            {/* 评论区域 */}
                            {page.commentsEnabled && (
                                <div className="glass-effect p-8 rounded-2xl">
                                    <CommentSection articleId={page.id} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <BackTop />
            </div>
        </>
    );
};

export default CustomPageViewer;
