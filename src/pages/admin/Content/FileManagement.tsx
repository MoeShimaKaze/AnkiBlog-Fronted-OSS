// src/pages/admin/Files/FileManagement.tsx - 适配 VerificationModal 版本
import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Space, message, Tooltip, Card, Select, Upload, Empty, Image, Tag, Progress
} from 'antd';
import {
    UploadOutlined, DeleteOutlined,
    CloudServerOutlined, FileImageOutlined, CopyOutlined, ReloadOutlined, WifiOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import * as adminFileService from '@/services/adminFileService';
import type { Bucket, MinioFile } from '@/services/adminFileService';
import { format } from 'date-fns';
import { usePageTitle } from "@/hooks/business/usePageTitle.ts";
import VerificationModal from '@/components/Common/VerificationModal';

const { Dragger } = Upload;

// 简化的网络工具（内联版本）
const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            message.success('网络连接已恢复');
        };

        const handleOffline = () => {
            setIsOnline(false);
            message.warning('网络连接已断开');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};

// 修改后的 testNetworkConnection 函数 (使用 adminFileService)
const testNetworkConnection = async (): Promise<{
    isConnected: boolean;
    latency?: number;
    error?: string;
}> => {
    const startTime = Date.now();
    try {
        // 使用我们封装好的、包含认证逻辑的 service 函数
        const response = await adminFileService.listBuckets();
        const latency = Date.now() - startTime;

        // 如果 service 调用成功且后端返回 success: true
        if (response.success) {
            return {
                isConnected: true,
                latency,
            };
        }
        // 如果后端返回 success: false
        return {
            isConnected: false,
            latency,
            error: response.message || 'API返回业务错误',
        };

    } catch (error: any) {
        // 如果请求被 axios 拦截器捕获到错误 (如网络问题、401、500等)
        const latency = Date.now() - startTime;
        return {
            isConnected: false,
            latency,
            error: error.message || '请求发生未知异常',
        };
    }
};

const FileManagement: React.FC = () => {
    usePageTitle('文件管理', {
        siteName: 'AnkiBlog',
        siteTagline: 'Ankiの歇脚处'
    })

    const [buckets, setBuckets] = useState<Bucket[]>([]);
    const [currentBucket, setCurrentBucket] = useState<string>('');
    const [files, setFiles] = useState<MinioFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadingFileName, setUploadingFileName] = useState<string>('');
    const [uploadSpeed, setUploadSpeed] = useState<string>('');

    // 删除确认模态框状态
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<MinioFile | null>(null);

    // 使用网络状态hook
    const networkStatus = useNetworkStatus();

    // 判断是否为图片文件
    const isImageFile = (filename: string): boolean => {
        return /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(filename);
    };

    // 加载存储桶列表
    const loadBuckets = useCallback(async () => {
        try {
            console.log('[加载存储桶] 开始获取存储桶列表...');
            const res = await adminFileService.listBuckets();
            if (res.success) {
                console.log('[加载存储桶] 成功获取存储桶:', res.data);
                setBuckets(res.data);
                if (res.data.length > 0 && !currentBucket) {
                    setCurrentBucket(res.data[0].name);
                }
            } else {
                console.error('[加载存储桶] 失败:', res.message);
                message.error('获取存储桶列表失败: ' + res.message);
            }
        } catch (error) {
            console.error('[加载存储桶] 异常:', error);
            message.error('获取存储桶列表异常');
        }
    }, [currentBucket]);

    // 加载文件列表
    const loadFiles = useCallback(async () => {
        if (!currentBucket) {
            console.log('[加载文件] 未选择存储桶，跳过加载');
            return;
        }

        console.log('[加载文件] 开始加载存储桶文件:', currentBucket);
        setLoading(true);

        try {
            const res = await adminFileService.listFiles(currentBucket);
            if (res.success) {
                console.log(`[加载文件] 成功获取 ${res.data.length} 个文件`);

                // 为文件生成正确的URL和删除标识
                const filesWithUrls: MinioFile[] = await Promise.all(res.data.map(async file => {
                    let fileUrl: string | null = null;
                    let deleteUrl: string | null = null;

                    if (!file.isDir) {
                        // 生成删除用的URL（包含存储桶和对象信息）
                        deleteUrl = `${currentBucket}/${file.objectName}`;

                        // 如果是图片文件，尝试获取预览URL
                        if (isImageFile(file.objectName)) {
                            try {
                                const urlRes = await adminFileService.getFileUrl(currentBucket, file.objectName);
                                if (urlRes.success) {
                                    fileUrl = urlRes.data;
                                } else {
                                    console.warn(`[预览URL] 获取失败: ${file.objectName}`, urlRes.message);
                                }
                            } catch (e) {
                                console.error(`[预览URL] 异常: ${file.objectName}`, e);
                            }
                        }

                        // 如果没有获取到预览URL，使用API路径（仅用于预览，不用于删除）
                        if (!fileUrl) {
                            fileUrl = `/api/admin/files/url?bucketName=${currentBucket}&objectName=${encodeURIComponent(file.objectName)}`;
                        }
                    }

                    return {
                        ...file,
                        url: fileUrl,
                        deleteUrl: deleteUrl
                    } as MinioFile;
                }));

                setFiles(filesWithUrls);
            } else {
                console.error('[加载文件] 失败:', res.message);
                message.error('获取文件列表失败: ' + res.message);
            }
        } catch (error) {
            console.error('[加载文件] 异常:', error);
            message.error('获取文件列表异常');
        } finally {
            setLoading(false);
        }
    }, [currentBucket]);

    // 初始化
    useEffect(() => {
        loadBuckets();
    }, [loadBuckets]);

    useEffect(() => {
        if (currentBucket) {
            loadFiles();
        }
    }, [currentBucket, loadFiles]);

    // 显示删除确认模态框
    const showDeleteConfirm = (record: MinioFile) => {
        const urlToDelete = record.deleteUrl || record.url;

        if (!urlToDelete) {
            message.error("无法获取文件删除信息");
            return;
        }

        setFileToDelete(record);
        setDeleteModalVisible(true);
    };

    // 处理删除文件
    const handleDeleteFile = async () => {
        if (!fileToDelete) return;

        const urlToDelete = fileToDelete.deleteUrl || fileToDelete.url;
        if (!urlToDelete) {
            message.error("无法获取文件删除信息");
            return;
        }

        setDeleteLoading(true);
        try {
            console.log('[删除文件] 开始删除:', {
                fileName: fileToDelete.objectName,
                bucket: currentBucket,
                deleteUrl: urlToDelete
            });

            await adminFileService.deleteFileByUrl(urlToDelete);
            message.success('文件删除成功');
            console.log('[删除文件] 删除成功，刷新列表');
            await loadFiles();

            // 关闭模态框
            setDeleteModalVisible(false);
            setFileToDelete(null);
        } catch (error) {
            console.error('[删除文件] 删除失败:', error);
            message.error('删除文件失败');
        } finally {
            setDeleteLoading(false);
        }
    };

    // 取消删除
    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
        setFileToDelete(null);
    };

    // 复制文件链接
    const handleCopyUrl = async (record: MinioFile) => {
        try {
            let urlToCopy: string | null = record.url ?? null;

            // 如果当前URL是API路径，尝试获取真实的MinIO URL
            if (urlToCopy && urlToCopy.startsWith('/api/admin/files/url?')) {
                console.log('[复制链接] 获取真实URL:', record.objectName);
                const urlRes = await adminFileService.getFileUrl(currentBucket, record.objectName);
                if (urlRes.success) {
                    urlToCopy = urlRes.data;
                } else {
                    console.warn('[复制链接] 获取真实URL失败，使用原URL');
                }
            }

            // 如果还是没有URL，尝试获取临时访问URL
            if (!urlToCopy && !record.isDir) {
                console.log('[复制链接] 获取临时访问URL:', record.objectName);
                const urlRes = await adminFileService.getFileUrl(currentBucket, record.objectName);
                if (urlRes.success) {
                    urlToCopy = urlRes.data;
                } else {
                    message.error('无法获取文件访问链接');
                    return;
                }
            }

            if (urlToCopy) {
                await navigator.clipboard.writeText(urlToCopy);
                message.success('文件链接已复制到剪贴板');
                console.log('[复制链接] 成功复制:', urlToCopy);
            } else {
                message.error('无法获取文件链接');
            }
        } catch (error) {
            console.error('[复制链接] 失败:', error);
            message.error('复制链接失败');
        }
    };

    // 自定义上传处理 - 支持真实上传进度和超时处理
    const handleCustomRequest = async (options: UploadRequestOption) => {
        const { file, onSuccess, onError, onProgress } = options;

        if (!currentBucket) {
            message.error('请先选择一个存储桶');
            onError?.(new Error('未选择存储桶'));
            return;
        }

        try {
            const fileInstance = file as File;
            const fileSizeMB = (fileInstance.size / 1024 / 1024).toFixed(2);

            console.log(`[文件上传] 开始上传文件到存储桶 "${currentBucket}":`, {
                fileName: fileInstance.name,
                fileSize: `${fileSizeMB}MB`,
                fileType: fileInstance.type
            });

            setUploading(true);
            setUploadProgress(0);
            setUploadingFileName(fileInstance.name);
            setUploadSpeed('');

            // 根据文件大小预估上传时间并显示提示
            const estimatedTime = Math.ceil(fileInstance.size / (1024 * 1024) * 10); // 假设1MB需要10秒
            if (estimatedTime > 60) {
                message.info(`文件较大 (${fileSizeMB}MB)，预计需要 ${Math.ceil(estimatedTime / 60)} 分钟，请耐心等待...`);
            } else if (estimatedTime > 30) {
                message.info(`文件较大 (${fileSizeMB}MB)，预计需要 ${estimatedTime} 秒，请耐心等待...`);
            }

            let startTime = Date.now();
            let lastLoaded = 0;
            let lastTime = startTime;

            // 创建进度更新函数
            const updateProgress = (progressInfo: { loaded: number; total: number; percent: number }) => {
                const { percent, loaded, total } = progressInfo;
                const currentTime = Date.now();

                setUploadProgress(percent);

                // 计算上传速度
                if (currentTime - lastTime > 1000) { // 每1秒计算一次速度
                    const timeDiff = (currentTime - lastTime) / 1000; // 秒
                    const loadedDiff = loaded - lastLoaded; // 字节
                    const speed = loadedDiff / timeDiff; // 字节/秒

                    let speedText: string;
                    if (speed > 1024 * 1024) {
                        speedText = `${(speed / 1024 / 1024).toFixed(1)} MB/s`;
                    } else if (speed > 1024) {
                        speedText = `${(speed / 1024).toFixed(1)} KB/s`;
                    } else {
                        speedText = `${speed.toFixed(0)} B/s`;
                    }

                    // 计算剩余时间
                    const remaining = total - loaded;
                    const eta = remaining / speed; // 秒
                    let etaText: string;
                    if (eta > 60) {
                        etaText = ` • 剩余 ${Math.ceil(eta / 60)} 分钟`;
                    } else {
                        etaText = ` • 剩余 ${Math.ceil(eta)} 秒`;
                    }

                    setUploadSpeed(speedText + etaText);
                    lastTime = currentTime;
                    lastLoaded = loaded;
                }

                // 通知 antd Upload 组件进度变化
                onProgress?.({
                    percent,
                    loaded,
                    total
                });

                console.log(`[上传进度] ${fileInstance.name}: ${percent}% (${(loaded / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB)`);
            };

            try {
                // 调用支持进度回调的上传服务
                const res = await adminFileService.uploadFileToBucket(
                    currentBucket,
                    fileInstance,
                    updateProgress  // 传递进度回调
                );

                if (res.success) {
                    // 确保进度显示为100%
                    updateProgress({
                        loaded: fileInstance.size,
                        total: fileInstance.size,
                        percent: 100
                    });

                    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
                    console.log(`[文件上传] 上传成功: ${res.data} (耗时: ${totalTime}秒)`);

                    // 延迟一点时间让用户看到100%进度
                    setTimeout(() => {
                        onSuccess?.(res);
                        message.success(`${fileInstance.name} 上传成功 (耗时: ${totalTime}秒)`);

                        // 延迟刷新列表，确保文件已经写入
                        setTimeout(async () => {
                            await loadFiles();
                        }, 500);
                    }, 300);

                } else {
                    console.error('[文件上传] 上传失败:', res.message);
                    const err = new Error(res.message || '上传失败');
                    onError?.(err);
                    message.error(res.message || `${fileInstance.name} 上传失败`);
                }
            } catch (uploadError: any) {
                console.error('[文件上传] 上传异常:', uploadError);

                // 特殊处理超时错误
                if (uploadError.code === 'ECONNABORTED' || uploadError.message?.includes('timeout')) {
                    message.error(`${fileInstance.name} 上传超时，请检查网络连接或尝试上传较小的文件`);
                } else {
                    message.error(`${fileInstance.name} 上传失败: ${uploadError.message || '未知错误'}`);
                }

                onError?.(uploadError);
            }

        } catch (error: any) {
            console.error('[文件上传] 处理异常:', error);
            onError?.(error);
            message.error(`${(file as File).name} 上传处理失败: ${error.message || '未知错误'}`);
        } finally {
            // 延迟重置状态，让用户看到完整的上传过程
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
                setUploadingFileName('');
                setUploadSpeed('');
            }, 1500);
        }
    };

    // 刷新文件列表
    const handleRefresh = () => {
        console.log('[刷新] 手动刷新文件列表');
        loadFiles();
    };

    // 切换存储桶
    const handleBucketChange = (value: string) => {
        console.log('[存储桶切换] 切换到:', value);
        setCurrentBucket(value);
    };

    // 表格列定义
    const columns: ColumnsType<MinioFile> = [
        {
            title: '文件信息',
            dataIndex: 'objectName',
            width: '40%',
            render: (text, record) => (
                <Space>
                    {record.url && isImageFile(record.objectName) ? (
                        <Image
                            width={50}
                            height={50}
                            src={record.url}
                            preview={{ src: record.url }}
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+2YmzHBgAKBAQYB7RsI4EJ2BFwKEYYBQA="
                        />
                    ) : (
                        <div style={{
                            width: 50,
                            height: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f5',
                            borderRadius: 4
                        }}>
                            <FileImageOutlined style={{ fontSize: 24, color: '#999' }} />
                        </div>
                    )}
                    <div>
                        <div style={{
                            wordBreak: 'break-all',
                            maxWidth: 300,
                            fontSize: 14,
                            fontWeight: 500
                        }}>
                            {text}
                        </div>
                        {record.isDir && <Tag color="blue">文件夹</Tag>}
                        {isImageFile(record.objectName) && <Tag color="green">图片</Tag>}
                    </div>
                </Space>
            ),
        },
        {
            title: '文件大小',
            dataIndex: 'size',
            align: 'right',
            width: '15%',
            render: (size) => {
                if (size === 0) return '-';
                if (size > 1024 * 1024) {
                    return `${(size / 1024 / 1024).toFixed(2)} MB`;
                } else {
                    return `${(size / 1024).toFixed(2)} KB`;
                }
            },
        },
        {
            title: '最后修改时间',
            dataIndex: 'lastModified',
            align: 'center',
            width: '25%',
            render: (date) => {
                try {
                    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
                } catch {
                    return date;
                }
            },
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            width: '20%',
            render: (_, record) => (
                <Space>
                    <Tooltip title="复制访问链接">
                        <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyUrl(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="删除文件">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => showDeleteConfirm(record)}
                            size="small"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // 毛玻璃效果样式
    const glassDropdownStyle: React.CSSProperties = {
        background: 'rgba(50, 50, 50, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            {/* 页面标题和操作区 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <h1 style={{
                    color: 'white',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    margin: 0
                }}>
                    文件管理
                </h1>
                <Space size="middle">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                    >
                        刷新
                    </Button>
                    <Tooltip title={networkStatus ? '网络连接正常' : '网络连接异常'}>
                        <Button
                            icon={<WifiOutlined />}
                            type={networkStatus ? 'default' : 'primary'}
                            danger={!networkStatus}
                            onClick={async () => {
                                const result = await testNetworkConnection();
                                if (result.isConnected) {
                                    message.success(`网络连接正常 (延迟: ${result.latency}ms)`);
                                } else {
                                    message.error(`网络连接失败: ${result.error}`);
                                }
                            }}
                        >
                            {networkStatus ? '网络正常' : '网络异常'}
                        </Button>
                    </Tooltip>
                    <Select
                        value={currentBucket}
                        style={{ width: 220 }}
                        onChange={handleBucketChange}
                        suffixIcon={<CloudServerOutlined />}
                        loading={!buckets.length}
                        placeholder="请选择存储桶"
                        dropdownStyle={glassDropdownStyle}
                    >
                        {buckets.map((bucket) => (
                            <Select.Option
                                key={bucket.name}
                                value={bucket.name}
                                style={{
                                    background: 'transparent',
                                    color: 'rgba(255,255,255,0.85)'
                                }}
                            >
                                <Space>
                                    <CloudServerOutlined />
                                    {bucket.name}
                                </Space>
                            </Select.Option>
                        ))}
                    </Select>
                </Space>
            </div>

            {/* 文件上传区域 */}
            <Card
                className="glass-effect border-0 shadow-xl"
                title={
                    <Space>
                        <UploadOutlined />
                        上传文件到存储桶: <Tag color="blue">{currentBucket || '未选择'}</Tag>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                <Dragger
                    name="file"
                    multiple
                    disabled={!currentBucket || uploading}
                    showUploadList={false}
                    customRequest={handleCustomRequest}
                    accept="image/*,application/*,text/*"
                >
                    <p className="ant-upload-drag-icon">
                        <UploadOutlined style={{ fontSize: 48 }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: 16, marginBottom: 8 }}>
                        点击或拖拽文件到此区域上传
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#666', fontSize: 14 }}>
                        {currentBucket
                            ? `文件将被上传到存储桶【${currentBucket}】`
                            : '请先选择一个存储桶'
                        }
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                        ⚡ 由于服务器在海外，大文件上传可能需要较长时间，请耐心等待
                        <br />
                        💡 建议上传文件大小 &lt; 50MB，网络不稳定时请尝试多次
                    </p>
                    {uploading && uploadProgress >= 0 && (
                        <div style={{ marginTop: 16, maxWidth: 500, margin: '16px auto 0' }}>
                            <div style={{ marginBottom: 8, textAlign: 'center', color: '#666', fontSize: 14 }}>
                                正在上传: <strong>{uploadingFileName}</strong>
                                {uploadSpeed && (
                                    <span style={{ marginLeft: 8, color: '#1890ff' }}>
                                        {uploadSpeed}
                                    </span>
                                )}
                            </div>
                            <Progress
                                percent={uploadProgress}
                                status={uploadProgress === 100 ? 'success' : 'active'}
                                showInfo
                                strokeColor={{
                                    '0%': '#108ee9',
                                    '100%': '#87d068',
                                }}
                                format={(percent) => {
                                    if (percent === 100) {
                                        return '上传完成 ✅';
                                    }
                                    return `${percent}%`;
                                }}
                            />
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#999' }}>
                                    上传可能需要较长时间，请不要关闭页面
                                </div>
                            )}
                        </div>
                    )}
                </Dragger>
            </Card>

            {/* 文件列表 */}
            <Card
                className="glass-effect border-0 shadow-xl"
                title={
                    <Space>
                        <FileImageOutlined />
                        文件列表
                        {currentBucket && (
                            <Tag color="processing">
                                {files.length} 个文件
                            </Tag>
                        )}
                    </Space>
                }
                bodyStyle={{ padding: 0 }}
            >
                <Table
                    columns={columns}
                    dataSource={files}
                    loading={loading}
                    rowKey="objectName"
                    pagination={{
                        pageSize: 10,
                        showTotal: (total, range) =>
                            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                        showQuickJumper: true,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100']
                    }}
                    style={{ background: 'transparent' }}
                    locale={{
                        emptyText: (
                            <Empty
                                description={
                                    currentBucket
                                        ? `存储桶 "${currentBucket}" 中没有文件`
                                        : "请先选择一个存储桶"
                                }
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* 删除确认模态框 */}
            <VerificationModal
                visible={deleteModalVisible}
                onCancel={handleCancelDelete}
                onSubmit={handleDeleteFile}
                isSubmitting={deleteLoading}
                title="确认删除文件"
                requireVerification={false}
                okText="确认删除"
                cancelText="取消"
                danger={true}
                content={
                    fileToDelete && (
                        <div>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 12px 0' }}>
                                <strong>文件名：</strong>{fileToDelete.objectName}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 16px 0' }}>
                                <strong>存储桶：</strong>{currentBucket}
                            </p>
                            <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>
                                ⚠️ 文件将从存储桶中永久删除，此操作不可撤销。
                            </p>
                        </div>
                    )
                }
            />
        </div>
    );
};

export default FileManagement;