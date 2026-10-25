// src/pages/admin/Settings/SiteSettings.tsx
import React from 'react';
import { usePageTitle } from "@/hooks/business/usePageTitle";
import { useSiteSettingsPage } from '@/hooks/api/useSiteSettingsPage.ts';
import SiteSettingsLayout from '@/pages/admin/Settings/SiteSettingsLayout.tsx';

const SiteSettings: React.FC = () => {
    usePageTitle('站点设置', {
        siteName: 'AnkiBlog',
        siteTagline: 'Anki の歇脚处'
    });

    const service = useSiteSettingsPage();

    return <SiteSettingsLayout service={service} />;
};

export default SiteSettings;