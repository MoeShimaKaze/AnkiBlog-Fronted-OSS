// WardrobeSettingsCard.tsx - 衣橱功能设置卡片
import React, { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Row, Col, Switch, TreeSelect } from 'antd';
import * as adminCategoryService from '@/services/adminProductCategoryService';
import type { AdminCategoryListItem } from '@/services/adminProductCategoryService';

interface WardrobeSettingsCardProps {
    form: any;
}

const WardrobeSettingsCard: React.FC<WardrobeSettingsCardProps> = ({ }) => {
    const [categories, setCategories] = useState<AdminCategoryListItem[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // 加载分类数据
    useEffect(() => {
        const loadCategories = async () => {
            setCategoriesLoading(true);
            try {
                const res = await adminCategoryService.getCategoryTree();
                if (res.success) {
                    setCategories(res.data);
                }
            } catch (error) {
                console.error('加载分类数据失败:', error);
            } finally {
                setCategoriesLoading(false);
            }
        };
        loadCategories();
    }, []);

    // 转换分类数据为 TreeSelect 格式
    const transformCategoryData = (data: AdminCategoryListItem[]): any[] => {
        return data.map(item => ({
            title: item.name,
            value: item.id,
            key: item.id,
            children: item.children ? transformCategoryData(item.children) : undefined
        }));
    };

    return (
        <Row gutter={[24, 24]} justify="center">
            <Col xs={24} lg={16}>
                <Card
                    title="衣橱功能配置"
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
                >
                    <Form.Item
                        label={<span className="text-white">默认筛选分类</span>}
                        name="wardrobeCategoryIds"
                        help={<span className="text-white/60">衣橱页面默认显示的商品分类，留空则显示所有分类</span>}
                    >
                        <TreeSelect
                            treeData={transformCategoryData(categories)}
                            placeholder="选择默认筛选的分类（可多选）"
                            treeDefaultExpandAll
                            multiple
                            allowClear
                            treeCheckable
                            showCheckedStrategy={TreeSelect.SHOW_PARENT}
                            loading={categoriesLoading}
                            className="w-full"
                            dropdownStyle={{
                                maxHeight: 400,
                                overflow: 'auto',
                                background: 'rgba(35, 35, 45, 0.95)',
                            }}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">只显示已购商品</span>}
                        name="wardrobeOnlyPurchased"
                        valuePropName="checked"
                        help={<span className="text-white/60">开启后衣橱页面默认只显示已购买的商品</span>}
                    >
                        <Switch
                            checkedChildren="是"
                            unCheckedChildren="否"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="text-white">闲置天数阈值</span>}
                        name="wardrobeIdleDays"
                        help={<span className="text-white/60">超过此天数未穿搭的商品将被标记为闲置</span>}
                    >
                        <InputNumber
                            min={1}
                            max={365}
                            placeholder="默认30天"
                            addonAfter="天"
                            className="w-full bg-white/15 border-white/30 text-white"
                        />
                    </Form.Item>
                </Card>
            </Col>
        </Row>
    );
};

export default WardrobeSettingsCard;
