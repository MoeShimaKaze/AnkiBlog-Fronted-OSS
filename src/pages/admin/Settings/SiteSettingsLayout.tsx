// src/components/admin/Settings/SiteSettingsLayout.tsx - 兼容增强版VerificationModal
import React, { useState, useCallback } from 'react';
import { Tabs, Typography, Button, Spin, Alert, Form } from 'antd';
import {
    SaveOutlined,
    SettingOutlined,
    GlobalOutlined,
    UserOutlined,
    CommentOutlined,
    BellOutlined,
    EyeOutlined,
    CodeOutlined,
    SkinOutlined,
    DingdingOutlined
} from '@ant-design/icons';

import { useVerificationCode } from '@/hooks/common/useVerificationCode.ts';
import { UseSiteSettingsPageReturn } from '@/hooks/api/useSiteSettingsPage.ts';
import VerificationModal from '../../../components/Common/VerificationModal.tsx';
import TemplateManagerCard from './TemplateManagerCard';
import BasicSettingsCard from './BasicSettingsCard';
import OwnerInfoCard from './OwnerInfoCard';
import CommentSettingsCard from './CommentSettingsCard';
import SubscriptionSettingsCard from './SubscriptionSettingsCard';
import DisplaySettingsCard from './DisplaySettingsCard';
import AdvancedSettingsCard from './AdvancedSettingsCard';
import ProfileCreator from './ProfileCreator';
import WardrobeSettingsCard from './WardrobeSettingsCard';
import NotificationSettingsCard from './NotificationSettingsCard';

const { Title } = Typography;
const { TabPane } = Tabs;

interface SiteSettingsLayoutProps {
    service: UseSiteSettingsPageReturn;
}

const SiteSettingsLayout: React.FC<SiteSettingsLayoutProps> = ({ service }) => {
    const [form] = Form.useForm();
    const [verificationModalVisible, setVerificationModalVisible] = useState(false);
    const [profileCreatorVisible, setProfileCreatorVisible] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<any>(null);
    const [modalTitle, setModalTitle] = useState('管理员安全确认');

    const verificationHook = useVerificationCode();

    const {
        profile,
        templates,
        loading,
        isSubmitting,
        error,
        templatesLoading,
        submitProfileUpdate,
        activateTemplate,
        deleteTemplate,
        duplicateTemplate,
        createTemplate
    } = service;

    // 当数据加载完成后，设置表单初始值
    React.useEffect(() => {
        if (profile && form && !loading) {
            form.setFieldsValue(profile);
        }
    }, [profile, form, loading]);

    const handleFormFinish = useCallback((values: any) => {
        setPendingFormData(values);
        setModalTitle('更新站点配置');
        setVerificationModalVisible(true);
    }, []);

    // 创建新模板的包装函数
    const handleCreateTemplate = useCallback(() => {
        setProfileCreatorVisible(true);
    }, []);

    // 处理 ProfileCreator 提交
    const handleProfileCreatorSubmit = useCallback(async (templateData: any) => {
        await createTemplate(templateData);
        setProfileCreatorVisible(false);
    }, [createTemplate]);

    // 更新函数签名以匹配增强版VerificationModal
    const handleVerificationSubmit = useCallback(async (verificationCode?: string) => {
        if (!pendingFormData || !verificationCode) return;

        await verificationHook.submitWithCode(
            verificationCode,
            submitProfileUpdate,
            pendingFormData
        );

        setVerificationModalVisible(false);
        setPendingFormData(null);
        verificationHook.resetState();
    }, [pendingFormData, submitProfileUpdate, verificationHook]);

    const handleVerificationCancel = useCallback(() => {
        setVerificationModalVisible(false);
        setPendingFormData(null);
        verificationHook.resetState();
    }, [verificationHook]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="正在加载站点配置..." />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="加载错误"
                description={error}
                type="error"
                showIcon
                className="m-6"
            />
        );
    }

    const renderFormContent = (children: React.ReactNode) => (
        <Form form={form} layout="vertical" onFinish={handleFormFinish}>
            {children}
            <div className="text-center mt-8">
                <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={isSubmitting}
                    htmlType="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-none rounded-lg px-8 py-2 h-auto"
                >
                    保存设置
                </Button>
            </div>
        </Form>
    );

    return (
        <div className="p-6">
            <Title level={2} className="text-center mb-8 text-white">
                站点设置管理
            </Title>

            <Tabs defaultActiveKey="templates" className="site-settings-tabs">
                <TabPane
                    tab={
                        <span>
                            <SettingOutlined />
                            模板管理
                        </span>
                    }
                    key="templates"
                >
                    <TemplateManagerCard
                        templates={templates}
                        loading={templatesLoading}
                        onActivate={activateTemplate}
                        onDelete={deleteTemplate}
                        onDuplicate={duplicateTemplate}
                        onCreate={handleCreateTemplate}
                    />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <GlobalOutlined />
                            基本设置
                        </span>
                    }
                    key="basic"
                >
                    {renderFormContent(
                        <BasicSettingsCard form={form} />
                    )}
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <UserOutlined />
                            站长信息
                        </span>
                    }
                    key="owner"
                >
                    {renderFormContent(
                        <OwnerInfoCard form={form} />
                    )}
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <CommentOutlined />
                            评论设置
                        </span>
                    }
                    key="comments"
                >
                    {renderFormContent(
                        <CommentSettingsCard form={form} />
                    )}
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <BellOutlined />
                            订阅设置
                        </span>
                    }
                    key="subscriptions"
                >
                    {renderFormContent(
                        <SubscriptionSettingsCard form={form} />
                    )}
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <EyeOutlined />
                            显示设置
                        </span>
                    }
                    key="display"
                >
                    {renderFormContent(
                        <DisplaySettingsCard form={form} />
                    )}
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <SkinOutlined />
                            衣橱设置
                        </span>
                    }
                    key="wardrobe"
                >
                    {renderFormContent(
                        <WardrobeSettingsCard form={form} />
                    )}
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <DingdingOutlined />
                            通知推送
                        </span>
                    }
                    key="notification"
                >
                    <NotificationSettingsCard />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <CodeOutlined />
                            高级设置
                        </span>
                    }
                    key="advanced"
                >
                    {renderFormContent(
                        <AdvancedSettingsCard form={form} />
                    )}
                </TabPane>
            </Tabs>

            <VerificationModal
                visible={verificationModalVisible}
                onCancel={handleVerificationCancel}
                onSubmit={handleVerificationSubmit}
                isSubmitting={isSubmitting}
                title={modalTitle}
                requireVerification={true}
                verificationHook={verificationHook}
            />

            <ProfileCreator
                visible={profileCreatorVisible}
                onCancel={() => setProfileCreatorVisible(false)}
                onSubmit={handleProfileCreatorSubmit}
                isSubmitting={isSubmitting}
                verificationHook={verificationHook}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                    .site-settings-tabs .ant-tabs-nav {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border-radius: 12px;
                        padding: 8px;
                        margin-bottom: 24px;
                    }
                    .site-settings-tabs .ant-tabs-tab {
                        color: rgba(255, 255, 255, 0.7) !important;
                        border: none !important;
                        border-radius: 8px !important;
                        margin: 0 4px !important;
                    }
                    .site-settings-tabs .ant-tabs-tab:hover {
                        color: white !important;
                        background: rgba(255, 255, 255, 0.1) !important;
                    }
                    .site-settings-tabs .ant-tabs-tab-active {
                        color: white !important;
                        background: rgba(59, 130, 246, 0.5) !important;
                    }
                    .site-settings-tabs .ant-tabs-content-holder {
                        background: transparent;
                    }
                    .site-settings-tabs .ant-tabs-ink-bar {
                        display: none;
                    }
                `
            }} />
        </div>
    );
};

export default SiteSettingsLayout;