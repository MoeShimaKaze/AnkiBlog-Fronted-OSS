// src/components/Upload/AvatarUploader.tsx
import React, { useState } from 'react';
import { Upload, Avatar, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import { ensureImageUploadAllowed } from '@/utils/image';
import ImageCropper from '@/components/UI/ImageCropper';
import { useAvatarUpload } from '@/hooks/api/useAvatarUpload';

interface AvatarUploaderProps {
    value?: string;
    onChange?: (avatarUrl: string) => void;
    size?: number;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
                                                           value,
                                                           onChange,
                                                           size = 120,
                                                       }) => {
    const { uploading, uploadAvatar } = useAvatarUpload();
    const [cropperInfo, setCropperInfo] = useState({ visible: false, src: '' });

    const handleCropConfirm = async (croppedFile: File) => {
        setCropperInfo({ visible: false, src: '' });

        try {
            const userInfo = await uploadAvatar(croppedFile);
            onChange?.(userInfo.avatarUrl || '');
            message.success('头像更新成功');
        } catch (error: any) {
            message.error(error.message || '头像上传失败');
        }
    };

    const uploadProps: UploadProps = {
        name: 'avatar',
        listType: 'picture-card',
        showUploadList: false,
        beforeUpload: async (file) => {
            try {
                const allowed = await ensureImageUploadAllowed(file);
                if (!allowed) {
                    return false;
                }
            } catch (error: any) {
                message.error(error.message);
                return false;
            }

            // 总是先裁剪
            const reader = new FileReader();
            reader.onload = (e) => setCropperInfo({
                visible: true,
                src: e.target?.result as string
            });
            reader.readAsDataURL(file);
            return false;
        },
    };

    const uploadButton = (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {uploading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8, fontSize: 12 }}>
                {uploading ? '上传中...' : '上传头像'}
            </div>
        </div>
    );

    return (
        <>
            <Upload {...uploadProps}>
                {value ? (
                    <Avatar
                        src={value}
                        size={size}
                        style={{ cursor: 'pointer' }}
                    />
                ) : (
                    <div
                        style={{
                            width: size,
                            height: size,
                            border: '1px dashed #d9d9d9',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        {uploadButton}
                    </div>
                )}
            </Upload>

            <ImageCropper
                src={cropperInfo.src}
                visible={cropperInfo.visible}
                onConfirm={handleCropConfirm}
                onCancel={() => setCropperInfo({ visible: false, src: '' })}
                aspectRatio={1} // 头像强制1:1
            />
        </>
    );
};

export default AvatarUploader;
