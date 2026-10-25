// src/components/CustomPage/CustomPageStats.tsx
import React from 'react';
import { Card, Statistic, Row, Col, Progress } from 'antd';
import { EyeOutlined, ShareAltOutlined, StarOutlined, FileTextOutlined } from '@ant-design/icons';
import { CustomPage } from '@/types/customPage';
import { formatNumber } from '@/utils/format';

interface CustomPageStatsProps {
    page: CustomPage;
    className?: string;
}

const CustomPageStats: React.FC<CustomPageStatsProps> = ({ page, className }) => {
    const popularityPercentage = Math.min((page.popularityScore / 1000) * 100, 100);

    return (
        <Card className={`glass-effect ${className}`}>
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Statistic
                        title="浏览量"
                        value={page.viewCount}
                        formatter={(value) => formatNumber(Number(value))}
                        prefix={<EyeOutlined className="text-blue-500" />}
                        valueStyle={{ color: 'white' }}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="分享次数"
                        value={page.shareCount}
                        formatter={(value) => formatNumber(Number(value))}
                        prefix={<ShareAltOutlined className="text-green-500" />}
                        valueStyle={{ color: 'white' }}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="内容版本"
                        value={page.contentVersion}
                        prefix={<FileTextOutlined className="text-orange-500" />}
                        valueStyle={{ color: 'white' }}
                    />
                </Col>
                <Col span={6}>
                    <div>
                        <div className="text-white/75 text-sm mb-2">
                            <StarOutlined className="text-amber-400 mr-1" />
                            热度指数
                        </div>
                        <Progress
                            percent={popularityPercentage}
                            strokeColor={{
                                from: '#108ee9',
                                to: '#87d068',
                            }}
                            showInfo={false}
                            size="small"
                        />
                        <div className="text-white text-lg font-bold mt-1">
                            {Math.round(page.popularityScore)}
                        </div>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default CustomPageStats;