import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, Table, Button, Space, Tag, Modal, message, Tooltip,
    Input, Select, DatePicker, Row, Col, Statistic, Popconfirm, Upload,
    Typography, Divider
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined,
    DownloadOutlined, SearchOutlined, ReloadOutlined, FilterOutlined,
    DollarOutlined, ArrowUpOutlined, ArrowDownOutlined, SwapOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';

import {
    getAccountingRecords,
    deleteAccountingRecord,
    getAccountingCategories,
    getAccountingStats,
    importAccountingCsv,
    exportAccountingCsv,
    downloadImportTemplate,
    downloadFile,
} from '@/services/accountingService';
import {
    AccountingRecord,
    AccountingType,
    AccountingTypeInfo,
    AccountingFilterParams,
    AccountingImportResult,
} from '@/types/accounting';
import AccountingFormModal from '@/components/Accounting/AccountingFormModal';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const glassCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
};

const AccountingManagement: React.FC = () => {
    // 数据状态
    const [records, setRecords] = useState<AccountingRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [categories, setCategories] = useState<string[]>([]);

    // 分页状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    // 筛选状态
    const [keyword, setKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
    const [selectedType, setSelectedType] = useState<AccountingType | undefined>();
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    // 统计数据
    const [stats, setStats] = useState<{ totalIncome: number; totalExpense: number; balance: number } | null>(null);

    // 弹窗状态
    const [formVisible, setFormVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<AccountingRecord | null>(null);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [importResult, setImportResult] = useState<AccountingImportResult | null>(null);

    // 加载记账记录
    const loadRecords = useCallback(async () => {
        setLoading(true);
        try {
            const params: AccountingFilterParams = {
                page: currentPage - 1,
                size: pageSize,
                keyword: keyword || undefined,
                category: selectedCategory,
                type: selectedType,
            };

            if (dateRange) {
                params.startTime = dateRange[0].startOf('day').toISOString();
                params.endTime = dateRange[1].endOf('day').toISOString();
            }

            const response = await getAccountingRecords(params);
            if (response.success) {
                setRecords(response.data.content);
                setTotal(response.data.totalElements);
            }
        } catch (error) {
            message.error('加载记账记录失败');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, keyword, selectedCategory, selectedType, dateRange]);

    // 加载分类
    const loadCategories = async () => {
        try {
            const response = await getAccountingCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    // 加载统计数据
    const loadStats = async () => {
        const now = dayjs();
        const startTime = now.startOf('month').toISOString();
        const endTime = now.endOf('month').toISOString();

        try {
            const response = await getAccountingStats(startTime, endTime);
            if (response.success) {
                setStats({
                    totalIncome: response.data.totalIncome,
                    totalExpense: response.data.totalExpense,
                    balance: response.data.balance,
                });
            }
        } catch (error) {
            console.error('Failed to load stats', error);
        }
    };

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    useEffect(() => {
        loadCategories();
        loadStats();
    }, []);

    // 删除记录
    const handleDelete = async (id: string) => {
        try {
            const response = await deleteAccountingRecord(id);
            if (response.success) {
                message.success('删除成功');
                loadRecords();
                loadStats();
            }
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 新增记录
    const handleAdd = () => {
        setEditingRecord(null);
        setFormVisible(true);
    };

    // 编辑记录
    const handleEdit = (record: AccountingRecord) => {
        setEditingRecord(record);
        setFormVisible(true);
    };

    // 表单保存成功
    const handleFormSuccess = () => {
        setFormVisible(false);
        setEditingRecord(null);
        loadRecords();
        loadStats();
        loadCategories();
    };

    // 导出CSV
    const handleExport = async () => {
        try {
            const startTime = dateRange ? dateRange[0].toISOString() : undefined;
            const endTime = dateRange ? dateRange[1].toISOString() : undefined;
            const blob = await exportAccountingCsv(startTime, endTime);
            const filename = `accounting_export_${dayjs().format('YYYYMMDDHHmmss')}.csv`;
            downloadFile(blob, filename);
            message.success('导出成功');
        } catch (error) {
            message.error('导出失败');
        }
    };

    // 下载模板
    const handleDownloadTemplate = async () => {
        try {
            const blob = await downloadImportTemplate();
            downloadFile(blob, 'accounting_import_template.csv');
            message.success('模板下载成功');
        } catch (error) {
            message.error('下载模板失败');
        }
    };

    // 导入CSV
    const handleImport = async (file: RcFile) => {
        try {
            const response = await importAccountingCsv(file);
            if (response.success) {
                setImportResult(response.data);
                setImportModalVisible(true);
                loadRecords();
                loadStats();
                loadCategories();
            }
        } catch (error) {
            message.error('导入失败');
        }
        return false; // 阻止自动上传
    };

    // 重置筛选
    const handleReset = () => {
        setKeyword('');
        setSelectedCategory(undefined);
        setSelectedType(undefined);
        setDateRange(null);
        setCurrentPage(1);
    };

    // 表格列定义
    const columns: ColumnsType<AccountingRecord> = [
        {
            title: '时间',
            dataIndex: 'recordTime',
            width: 160,
            render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: '类型',
            dataIndex: 'type',
            width: 80,
            render: (type: AccountingType) => {
                const info = AccountingTypeInfo[type];
                const icon = type === 'INCOME' ? <ArrowUpOutlined /> :
                             type === 'EXPENSE' ? <ArrowDownOutlined /> : <SwapOutlined />;
                return <Tag color={info.color} icon={icon}>{info.label}</Tag>;
            },
        },
        {
            title: '分类',
            dataIndex: 'category',
            width: 120,
            render: (category: string, record) => (
                <span>
                    {category}
                    {record.subCategory && <Text type="secondary" style={{ fontSize: 12 }}> / {record.subCategory}</Text>}
                </span>
            ),
        },
        {
            title: '金额',
            dataIndex: 'amount',
            width: 120,
            align: 'right',
            render: (_amount: number, record) => (
                <span style={{ color: record.typeColor, fontWeight: 'bold' }}>
                    {record.type === 'EXPENSE' ? '-' : '+'}{record.formattedAmount}
                </span>
            ),
        },
        {
            title: '账户',
            key: 'accounts',
            width: 150,
            render: (_, record) => (
                <span>
                    {record.account1 || '-'}
                    {record.type === 'TRANSFER' && record.account2 && (
                        <Text type="secondary"> → {record.account2}</Text>
                    )}
                </span>
            ),
        },
        {
            title: '备注',
            dataIndex: 'remark',
            ellipsis: true,
            render: (remark: string) => remark || '-',
        },
        {
            title: '关联商品',
            dataIndex: 'linkedProduct',
            width: 150,
            render: (product) => product ? (
                <Tooltip title={product.name}>
                    <Tag color="blue">{product.name.substring(0, 10)}{product.name.length > 10 ? '...' : ''}</Tag>
                </Tooltip>
            ) : '-',
        },
        {
            title: '状态',
            key: 'status',
            width: 80,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    {record.isReimbursed && <Tag color="green" style={{ fontSize: 10 }}>已报销</Tag>}
                </Space>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="编辑">
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Popconfirm
                        title="确定删除此记录吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Tooltip title="删除">
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '0' }}>
            <Title level={4} style={{ color: 'white', marginBottom: 24 }}>
                <DollarOutlined style={{ marginRight: 8 }} />
                记账管理
            </Title>

            {/* 统计卡片 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card style={glassCardStyle} bodyStyle={{ padding: '16px 24px' }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.65)' }}>本月收入</span>}
                            value={stats?.totalIncome || 0}
                            precision={2}
                            valueStyle={{ color: '#52c41a' }}
                            prefix="¥"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={glassCardStyle} bodyStyle={{ padding: '16px 24px' }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.65)' }}>本月支出</span>}
                            value={stats?.totalExpense || 0}
                            precision={2}
                            valueStyle={{ color: '#ff4d4f' }}
                            prefix="¥"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={glassCardStyle} bodyStyle={{ padding: '16px 24px' }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.65)' }}>本月结余</span>}
                            value={stats?.balance || 0}
                            precision={2}
                            valueStyle={{ color: (stats?.balance || 0) >= 0 ? '#52c41a' : '#ff4d4f' }}
                            prefix="¥"
                        />
                    </Card>
                </Col>
            </Row>

            {/* 筛选栏 */}
            <Card style={{ ...glassCardStyle, marginBottom: 16 }} bodyStyle={{ padding: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col flex="200px">
                        <Input
                            placeholder="搜索备注/标签"
                            prefix={<SearchOutlined />}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col flex="140px">
                        <Select
                            placeholder="选择类型"
                            style={{ width: '100%' }}
                            value={selectedType}
                            onChange={setSelectedType}
                            allowClear
                        >
                            <Select.Option value="INCOME">收入</Select.Option>
                            <Select.Option value="EXPENSE">支出</Select.Option>
                            <Select.Option value="TRANSFER">转账</Select.Option>
                        </Select>
                    </Col>
                    <Col flex="140px">
                        <Select
                            placeholder="选择分类"
                            style={{ width: '100%' }}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            allowClear
                        >
                            {categories.map(cat => (
                                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col flex="280px">
                        <RangePicker
                            style={{ width: '100%' }}
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                        />
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<FilterOutlined />} onClick={() => { setCurrentPage(1); loadRecords(); }}>
                                筛选
                            </Button>
                            <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                重置
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* 操作栏 */}
            <Card style={{ ...glassCardStyle, marginBottom: 16 }} bodyStyle={{ padding: '12px 16px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                                新增记账
                            </Button>
                            <Upload
                                accept=".csv"
                                showUploadList={false}
                                beforeUpload={handleImport}
                            >
                                <Button icon={<UploadOutlined />}>导入CSV</Button>
                            </Upload>
                            <Button icon={<DownloadOutlined />} onClick={handleExport}>
                                导出CSV
                            </Button>
                            <Button onClick={handleDownloadTemplate}>
                                下载模板
                            </Button>
                        </Space>
                    </Col>
                    <Col>
                        <Text style={{ color: 'rgba(255,255,255,0.65)' }}>
                            共 {total} 条记录
                        </Text>
                    </Col>
                </Row>
            </Card>

            {/* 数据表格 */}
            <Card style={glassCardStyle} bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={records}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        },
                    }}
                    style={{ background: 'transparent' }}
                />
            </Card>

            {/* 新增/编辑表单弹窗 */}
            <AccountingFormModal
                visible={formVisible}
                record={editingRecord}
                onCancel={() => setFormVisible(false)}
                onSuccess={handleFormSuccess}
            />

            {/* 导入结果弹窗 */}
            <Modal
                title="导入结果"
                open={importModalVisible}
                onOk={() => setImportModalVisible(false)}
                onCancel={() => setImportModalVisible(false)}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setImportModalVisible(false)}>
                        确定
                    </Button>
                ]}
            >
                {importResult && (
                    <div>
                        <Row gutter={16}>
                            <Col span={8}><Statistic title="总计" value={importResult.totalCount} /></Col>
                            <Col span={8}><Statistic title="新增" value={importResult.insertedCount} valueStyle={{ color: '#52c41a' }} /></Col>
                            <Col span={8}><Statistic title="跳过" value={importResult.skippedCount} valueStyle={{ color: '#faad14' }} /></Col>
                        </Row>
                        {importResult.errorCount > 0 && (
                            <>
                                <Divider />
                                <Text type="danger">错误 ({importResult.errorCount}):</Text>
                                <ul style={{ maxHeight: 200, overflow: 'auto', marginTop: 8 }}>
                                    {importResult.errors.map((err, i) => (
                                        <li key={i} style={{ color: '#ff4d4f', fontSize: 12 }}>{err}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {importResult.warnings.length > 0 && (
                            <>
                                <Divider />
                                <Text type="warning">警告 ({importResult.warnings.length}):</Text>
                                <ul style={{ maxHeight: 150, overflow: 'auto', marginTop: 8 }}>
                                    {importResult.warnings.slice(0, 10).map((warn, i) => (
                                        <li key={i} style={{ color: '#faad14', fontSize: 12 }}>{warn}</li>
                                    ))}
                                    {importResult.warnings.length > 10 && (
                                        <li style={{ color: '#faad14', fontSize: 12 }}>...还有 {importResult.warnings.length - 10} 条警告</li>
                                    )}
                                </ul>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AccountingManagement;
