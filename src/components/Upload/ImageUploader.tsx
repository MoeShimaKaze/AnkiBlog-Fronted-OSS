// src/components/Upload/ImageUploader.tsx
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Button, message, Upload} from 'antd';
import {DeleteOutlined, DragOutlined, EyeOutlined, PlusOutlined} from '@ant-design/icons';
import {DragDropContext, Draggable} from 'react-beautiful-dnd';
import {StrictModeDroppable} from '@/components/basic/StrictModeDroppable';
import {ensureImageUploadAllowed} from '@/utils/image';
import ImageViewer from '@/components/UI/ImageViewer';
import ImageCropper from '@/components/UI/ImageCropper';

export interface FileWithPreview extends File {
    uid: string;
    preview?: string;
    cropped?: boolean;
}

interface ImageUploaderProps {
    value?: string[];
    onChange?: (files: FileWithPreview[], urls: string[]) => void;
    maxCount?: number;
    multiple?: boolean;
    disabled?: boolean;
    enableCrop?: boolean;
    cropAspectRatio?: number;
    showPreview?: boolean;
    enableDragSort?: boolean;
    uploadMode?: 'immediate' | 'delayed';
}

interface DisplayItem {
    type: 'url' | 'file';
    id: string;
    url?: string;
    file?: FileWithPreview;
    preview: string;
    name: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
                                                         value = [],
                                                         onChange,
                                                         maxCount = 1,
                                                         multiple = false,
                                                         disabled = false,
                                                         enableCrop = false,
                                                         cropAspectRatio = 1,
                                                         showPreview = true,
                                                         enableDragSort = true,
                                                         uploadMode = 'delayed'
                                                     }) => {
    const [localFiles, setLocalFiles] = useState<FileWithPreview[]>([]);
    const [existingUrls, setExistingUrls] = useState<string[]>(value);
    const [previewInfo, setPreviewInfo] = useState({ visible: false, image: '', title: '' });
    const [cropperInfo, setCropperInfo] = useState<{ visible: boolean; src: string; file: File | null }>({ visible: false, src: '', file: null });

    // 添加批量处理状态
    const [batchProcessing, setBatchProcessing] = useState(false);
    const [pendingBatchFiles, setPendingBatchFiles] = useState<File[]>([]);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

    useEffect(() => {
        if (JSON.stringify(value) !== JSON.stringify(existingUrls)) {
            setExistingUrls(value);
        }
    }, [value, existingUrls]);

    const displayItems = useMemo<DisplayItem[]>(() => {
        const items: DisplayItem[] = [];
        existingUrls.forEach((url, index) => {
            items.push({
                type: 'url',
                id: `url-${index}`,
                url,
                preview: url,
                name: url.substring(url.lastIndexOf('/') + 1) || `image-${index}`
            });
        });
        localFiles.forEach(file => {
            items.push({
                type: 'file',
                id: file.uid,
                file,
                preview: file.preview || '',
                name: file.name
            });
        });
        return items;
    }, [existingUrls, localFiles]);

    const triggerChange = useCallback((newFiles: FileWithPreview[], newUrls: string[]) => {
        onChange?.(newFiles, newUrls);
    }, [onChange]);

    const handleDragEnd = useCallback((result: any) => {
        if (!result.destination || disabled) return;
        if (result.source.index === result.destination.index) return;
        const newItems = Array.from(displayItems);
        const [moved] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, moved);

        const newUrls: string[] = [];
        const newFiles: FileWithPreview[] = [];
        newItems.forEach(item => {
            if (item.type === 'url' && item.url) newUrls.push(item.url);
            if (item.type === 'file' && item.file) newFiles.push(item.file);
        });

        setExistingUrls(newUrls);
        setLocalFiles(newFiles);
        triggerChange(newFiles, newUrls);
    }, [displayItems, disabled, triggerChange]);

    const handleRemove = useCallback((item: DisplayItem) => {
        if (item.type === 'url' && item.url) {
            const newUrls = existingUrls.filter(u => u !== item.url);
            setExistingUrls(newUrls);
            triggerChange(localFiles, newUrls);
        }
        if (item.type === 'file') {
            const newFiles = localFiles.filter(f => f.uid !== item.id);
            setLocalFiles(newFiles);
            triggerChange(newFiles, existingUrls);
        }
    }, [existingUrls, localFiles, triggerChange]);

    const handlePreview = useCallback((item: DisplayItem) => {
        setPreviewInfo({ visible: true, image: item.preview, title: item.name });
    }, []);

    const handleCropConfirm = useCallback((croppedFile: File) => {
        setCropperInfo({ visible: false, src: '', file: null });
        const reader = new FileReader();
        reader.onload = e => {
            const dataUrl = e.target?.result as string;
            const fileWithPreview: FileWithPreview = Object.assign(croppedFile, {
                uid: `cropped-${Date.now()}`,
                cropped: true,
                preview: dataUrl
            });
            const newFiles = [...localFiles, fileWithPreview];
            setLocalFiles(newFiles);
            triggerChange(newFiles, existingUrls);
            message.success('图片裁剪完成');
        };
        reader.readAsDataURL(croppedFile);
    }, [localFiles, existingUrls, triggerChange]);

    // 处理单个文件的函数
    const processSingleFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = e => {
            const dataUrl = e.target?.result as string;
            const fileWithPreview: FileWithPreview = Object.assign(file, {
                uid: `file-${Date.now()}-${Math.random()}`,
                preview: dataUrl
            });
            setLocalFiles(prev => [...prev, fileWithPreview]);
            triggerChange([...localFiles, fileWithPreview], existingUrls);
        };
        reader.readAsDataURL(file);
    }, [localFiles, existingUrls, triggerChange]);

    // 批量处理文件
    const processBatchFiles = useCallback((files: File[]) => {
        if (files.length === 0) return;

        setBatchProcessing(true);
        setCurrentBatchIndex(0);

        const processedFiles: FileWithPreview[] = [];
        let processedCount = 0;

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = e => {
                const dataUrl = e.target?.result as string;
                processedFiles[index] = Object.assign(file, {
                    uid: `batch-${Date.now()}-${index}`,
                    preview: dataUrl
                }); // 保持原始顺序
                processedCount++;

                setCurrentBatchIndex(processedCount);

                if (processedCount === files.length) {
                    // 所有文件处理完成，按顺序添加
                    const newFiles = [...localFiles, ...processedFiles];
                    setLocalFiles(newFiles);
                    triggerChange(newFiles, existingUrls);
                    setBatchProcessing(false);
                    setPendingBatchFiles([]);
                    setCurrentBatchIndex(0);
                    message.success(`成功添加 ${files.length} 张图片`);
                }
            };
            reader.readAsDataURL(file);
        });
    }, [localFiles, existingUrls, triggerChange]);

    const beforeUpload = useCallback(async (file: File, fileList: File[]) => {
        try {
            const allowed = await ensureImageUploadAllowed(file);
            if (!allowed) {
                return false;
            }
        } catch (err: any) {
            message.error(err.message);
            return false;
        }

        // 检查是否会超出最大数量限制
        if (displayItems.length + fileList.length > maxCount) {
            message.error(`最多只能上传 ${maxCount} 张图片，当前已有 ${displayItems.length} 张`);
            return false;
        }

        // 如果启用裁剪且只有一个文件，使用裁剪模式
        if (enableCrop && fileList.length === 1) {
            const reader = new FileReader();
            reader.onload = e => setCropperInfo({ visible: true, src: e.target?.result as string, file });
            reader.readAsDataURL(file);
            return false;
        }

        // 如果是多个文件或单个文件但不启用裁剪
        if (fileList.length > 1) {
            // 批量处理模式
            if (fileList.indexOf(file) === 0) {
                // 只在处理第一个文件时启动批量处理
                processBatchFiles(fileList);
            }
        } else {
            // 单个文件处理
            processSingleFile(file);
        }

        return false;
    }, [displayItems.length, maxCount, enableCrop, processBatchFiles, processSingleFile]);

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <StrictModeDroppable droppableId="image-uploader" direction="horizontal">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ display: 'flex', flexWrap: 'wrap' }}
                        >
                            {displayItems.map((item, idx) => (
                                <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={idx}
                                    isDragDisabled={!enableDragSort || disabled}
                                >
                                    {(providedDraggable, snapshot) => (
                                        <div
                                            ref={providedDraggable.innerRef}
                                            {...providedDraggable.draggableProps}
                                            {...providedDraggable.dragHandleProps}
                                            style={{
                                                ...providedDraggable.draggableProps.style,
                                                position: 'relative', width: 104, height: 104,
                                                border: idx === 0 && multiple ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                                borderRadius: 6, overflow: 'hidden',
                                                cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                                background: '#fafafa', marginRight: 8, marginBottom: 8
                                            }}
                                        >
                                            {enableDragSort && !disabled && (
                                                <div style={{ position: 'absolute', top: 4, left: 4 }}><DragOutlined /></div>
                                            )}
                                            {idx === 0 && multiple && (
                                                <div style={{ position: 'absolute', top: 4, right: 4, background: '#1890ff', color: '#fff', padding: '2px 4px', borderRadius: 4, fontSize: 10 }}>封面</div>
                                            )}
                                            <img
                                                src={item.preview}
                                                alt={item.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <div style={{ position: 'absolute', bottom: 4, right: 4, display: 'flex', gap: 4 }}>
                                                {showPreview && <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => handlePreview(item)} />}
                                                {!disabled && <Button type="text" icon={<DeleteOutlined />} size="small" onClick={() => handleRemove(item)} />}
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </StrictModeDroppable>
            </DragDropContext>

            {uploadMode === 'delayed' && displayItems.length < maxCount && (
                <Upload
                    beforeUpload={beforeUpload}
                    showUploadList={false}
                    disabled={disabled || batchProcessing}
                    multiple={multiple && !enableCrop} // 启用裁剪时不支持多选
                >
                    <Button
                        icon={<PlusOutlined />}
                        disabled={disabled || batchProcessing}
                        loading={batchProcessing}
                    >
                        {batchProcessing ? `处理中 (${currentBatchIndex}/${pendingBatchFiles.length})` : '上传'}
                    </Button>
                </Upload>
            )}

            {displayItems.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>已选择 {displayItems.length}/{maxCount} 张图片</span>
                    <span style={{ marginLeft: 8 }}>（{localFiles.length} 张待上传）</span>
                </div>
            )}

            <ImageViewer
                src={previewInfo.image}
                visible={previewInfo.visible}
                onClose={() => setPreviewInfo({ visible: false, image: '', title: '' })}
                title={previewInfo.title}
            />

            {enableCrop && (
                <ImageCropper
                    src={cropperInfo.src}
                    visible={cropperInfo.visible}
                    onCancel={() => setCropperInfo({ visible: false, src: '', file: null })}
                    onConfirm={handleCropConfirm}
                    aspectRatio={cropAspectRatio}
                />
            )}
        </>
    );
};

export default ImageUploader;
