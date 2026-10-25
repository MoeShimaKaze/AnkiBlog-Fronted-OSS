// src/router/index.tsx
import React, { lazy } from 'react'
import TagManagement from "@/pages/admin/Content/TagManagement.tsx";
import ProductCategoryManagement from "@/pages/admin/Content/ProductCategoryManagement.tsx";
import FileManagement from "@/pages/admin/Content/FileManagement.tsx";
import ProductSnapshotList from '@/pages/admin/Snapshot/ProductSnapshotList';
import FriendLinksPage from '@/pages/public/Friend/FriendLinksPage';
import FriendLinkManagement from '@/pages/admin/Content/FriendLinkManagement';
import SocialLinkManagement from '@/pages/admin/Content/SocialLinkManagement';
import SocialMediaPage from "@/pages/public/Social/SocialMediaPage.tsx";
import AdminUserLikeManagement from "@/pages/admin/Content/AdminUserLikeManagement.tsx";
import UserLikeManagement from '@/pages/user/Management/UserLikeManagement';
import UserCommentManagement from '@/pages/user/Management/UserCommentManagement';
import UserProfileManagement from "@/pages/user/Profile/UserProfileManagement.tsx";

const CustomPageList = lazy(() => import('../pages/public/CustomPage/CustomPageList'))
const CustomPageViewer = lazy(() => import('../pages/public/CustomPage/CustomPageViewer'))
const CustomPageManagement = lazy(() => import('../pages/admin/Content/CustomPageManagement'))
const CustomPageEditor = lazy(() => import('../pages/admin/Editor/CustomPageEditor'))
const PublicTodoPage = lazy(() => import('../pages/public/Todo/PublicTodoPage'))
// 懒加载页面组件
const HomePage = lazy(() => import('../pages/public/Home/HomePage'))
const ArticleListPage = lazy(() => import('../pages/public/Article/ArticleListPage'))
const ArticleDetailPage = lazy(() => import('../pages/public/Article/ArticleDetailPage'))
const ProductListPage = lazy(() => import('../pages/public/Product/ProductListPage'))
const ProductDetailPage = lazy(() => import('../pages/public/Product/ProductDetailPage'))
const SearchResultPage = lazy(() => import('../pages/public/Search/SearchResultPage'))
const LoginPage = lazy(() => import('../pages/public/Auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/public/Auth/RegisterPage'))

// 用户页面
const UserDashboard = lazy(() => import('../pages/user/Dashboard/UserDashboard'))
const UserProfile = lazy(() => import('../pages/user/Profile/UserProfile'))

// 管理员页面
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard/AdminDashboard'))
const ArticleManagement = lazy(() => import('../pages/admin/Content/ArticleManagement'))
const CommentManagement = lazy(() => import('../pages/admin/Content/CommentManagement'))
const ProductManagement = lazy(() => import('../pages/admin/Content/ProductManagement'))
const UserManagement = lazy(() => import('../pages/admin/Users/UserManagement'))
const SiteSettings = lazy(() => import('../pages/admin/Settings/SiteSettings'))
const PageTitleManagement = lazy(() => import('../components/Admin/PageTitleManagement'))
const BackgroundManagement = lazy(() => import('../pages/admin/Content/BackgroundManagement'))
const SubscriptionManagement = lazy(() => import('../pages/admin/Content/SubscriptionManagement'))
const OutfitManagement = lazy(() => import('../pages/admin/Content/OutfitManagement'))
const WardrobeManagement = lazy(() => import('../pages/admin/Content/WardrobeManagement'))
const CosmeticManagement = lazy(() => import('../pages/admin/Content/CosmeticManagement'))
const MakeupManagement = lazy(() => import('../pages/admin/Content/MakeupManagement'))
const MakeupSettingsPage = lazy(() => import('../pages/admin/Settings/MakeupSettingsPage'))
const ArticleEditor = lazy(() => import('../pages/admin/Editor/ArticleEditor'))
const ProductEditor = lazy(() => import('../pages/admin/Editor/ProductEditor'))
const TodoManagement = lazy(() => import('../pages/admin/Content/TodoManagement'))
const DailyOutfitManagement = lazy(() => import('../pages/admin/Content/DailyOutfitManagement'))
const AccountingManagement = lazy(() => import('../pages/admin/Content/AccountingManagement'))

// 公开页面
const PublicDailyOutfitPage = lazy(() => import('../pages/public/DailyOutfit/index'))
const GoalProgressPage = lazy(() => import('../pages/public/Goals/GoalProgressPage'))
const OutfitListPage = lazy(() => import('../pages/public/Outfit/OutfitListPage'))
const MakeupListPage = lazy(() => import('../pages/public/Makeup/MakeupListPage'))

// 打卡管理页面
const GoalListPage = lazy(() => import('../pages/admin/CheckIn/GoalListPage'))
const GoalDetailPage = lazy(() => import('../pages/admin/CheckIn/GoalDetailPage'))
const GoalFormPage = lazy(() => import('../pages/admin/CheckIn/GoalFormPage'))
const CategoryManagePage = lazy(() => import('../pages/admin/CheckIn/CategoryManagePage'))

// 快照管理页面
const ArticleSnapshotList = lazy(() => import('@/pages/admin/Snapshot/ArticleSnapshotList'))

export interface RouteConfig {
    path: string
    element: React.ReactElement
    layout?: 'main' | 'admin' | 'simple'
}

export const publicRoutes: RouteConfig[] = [
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/articles',
        element: <ArticleListPage />,
    },
    {
        path: '/articles/:slug',
        element: <ArticleDetailPage />,
    },
    {
        path: '/products',
        element: <ProductListPage />,
    },
    {
        path: '/products/:slug',
        element: <ProductDetailPage />,
    },
    {
        path: '/search',
        element: <SearchResultPage />,
    },
    {
        path: '/auth/login',
        element: <LoginPage />,
        layout: 'simple',
    },
    {
        path: '/auth/register',
        element: <RegisterPage />,
        layout: 'simple',
    },
    {
        path: '/friends',
        element: <FriendLinksPage />,
    },
    {
        path: '/social-links',
        element: <SocialMediaPage />,
    },
    {
        path: '/pages',
        element: <CustomPageList />,
    },
    {
        path: '/pages/:slug',
        element: <CustomPageViewer />,
    },
    {
        path: '/todos',
        element: <PublicTodoPage />,
    },
    {
        path: '/daily-outfit',
        element: <PublicDailyOutfitPage />,
    },
    {
        path: '/outfits',
        element: <OutfitListPage />,
    },
    {
        path: '/makeups',
        element: <MakeupListPage />,
    },
    {
        path: '/goals',
        element: <GoalProgressPage />,
    },
]

export const userRoutes: RouteConfig[] = [
    {
        path: 'dashboard',
        element: <UserDashboard />,
    },
    {
        path: 'profile',
        element: <UserProfile />,
    },
    {
        path: 'interactions',
        element: <UserLikeManagement />,
    },
    {
        path: 'comments',
        element: <UserCommentManagement />,
    },
    {
        path: 'settings',
        element: <UserProfileManagement />,
    },
]

export const adminRoutes: RouteConfig[] = [
    {
        path: 'dashboard',
        element: <AdminDashboard />,
    },
    {
        path: 'articles',
        element: <ArticleManagement />,
    },
    {
        path: 'comments',
        element: <CommentManagement />,
    },
    {
        path: 'products',
        element: <ProductManagement />,
    },
    {
        path: 'tags',
        element: <TagManagement />,
    },
    {
        path: 'categories',
        element: <ProductCategoryManagement />,
    },
    {
        path: 'files',
        element: <FileManagement />,
    },
    {
        path: 'users',
        element: <UserManagement />,
    },
    // 快照管理路由
    {
        path: 'article-snapshots',
        element: <ArticleSnapshotList />,
    },
    {
        path: 'product-snapshots',
        element: <ProductSnapshotList />,
    },
    {
        path: 'settings/site',
        element: <SiteSettings />,
    },
    {
        path: 'settings/page-titles',
        element: <PageTitleManagement />,
    },
    {
        path: 'settings/backgrounds',
        element: <BackgroundManagement />,
    },
    {
        path: 'editor/new',
        element: <ArticleEditor />,
    },
    {
        path: 'editor/:id',
        element: <ArticleEditor />,
    },
    {
        path: 'products/new',
        element: <ProductEditor />,
    },
    {
        path: 'products/edit/:id',
        element: <ProductEditor />,
    },
    {
        path: 'friend-links',
        element: <FriendLinkManagement />,
    },
    {
        path: 'social-links',
        element: <SocialLinkManagement />,
    },
    {
        path: 'user-like',
        element: <AdminUserLikeManagement />,
    },
    {
        path: 'subscription',
        element: <SubscriptionManagement />,
    },
    {
        path: 'outfits',
        element: <OutfitManagement />,
    },
    {
        path: 'daily-outfit',
        element: <DailyOutfitManagement />,
    },
    {
        path: 'wardrobe',
        element: <WardrobeManagement />,
    },
    {
        path: 'cosmetics',
        element: <CosmeticManagement />,
    },
    {
        path: 'makeups',
        element: <MakeupManagement />,
    },
    {
        path: 'settings/makeup',
        element: <MakeupSettingsPage />,
    },
    {
        path: 'pages',
        element: <CustomPageManagement />,
    },
    {
        path: 'pages/new',
        element: <CustomPageEditor />,
    },
    {
        path: 'pages/edit/:id',
        element: <CustomPageEditor />,
    },
    {
        path: 'todos',
        element: <TodoManagement />,
    },
    // 记账管理路由
    {
        path: 'accounting',
        element: <AccountingManagement />,
    },
    // 打卡管理路由
    {
        path: 'check-in',
        element: <GoalListPage />,
    },
    {
        path: 'check-in/goals/new',
        element: <GoalFormPage />,
    },
    {
        path: 'check-in/goals/:id',
        element: <GoalDetailPage />,
    },
    {
        path: 'check-in/goals/:id/edit',
        element: <GoalFormPage />,
    },
    {
        path: 'check-in/categories',
        element: <CategoryManagePage />,
    },
]