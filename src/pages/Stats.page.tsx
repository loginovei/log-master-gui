import { Card, Col, Progress, Row, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useFetch } from '../hooks/useFetch';
import { getStats } from '../api/logs';
import { useAppContext } from '../context/AppContext';
import { useT } from '../i18n/useT';
import type { LogLevel } from '../types';

const { Title, Text } = Typography;

const LEVEL_COLORS: Record<LogLevel, string> = {
  TRACE: '#d9d9d9',
  DEBUG: '#1677ff',
  INFO:  '#52c41a',
  WARN:  '#faad14',
  ERROR: '#ff4d4f',
};

const LEVEL_ORDER: LogLevel[] = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

export function StatsPage() {
  const { selectedApp } = useAppContext();
  const t = useT();
  const { data: stats, loading } = useFetch(() => getStats(selectedApp?.code), [selectedApp?.code]);

  const total = stats?.totalEntries ?? 0;

  const serviceColumns: ColumnsType<{ service: string; count: number; pct: number }> = [
    { title: t.stats.colService, dataIndex: 'service', render: (v) => <Tag>{v}</Tag> },
    { title: t.stats.colCount,   dataIndex: 'count', align: 'right', width: 100 },
    {
      title: t.stats.colShare,
      dataIndex: 'pct',
      width: 200,
      render: (pct) => <Progress percent={pct} size="small" strokeColor="#1677ff" />,
    },
  ];

  const activityColumns: ColumnsType<{ date: string; count: number }> = [
    { title: t.stats.colDate,   dataIndex: 'date' },
    { title: t.stats.colCount,  dataIndex: 'count', align: 'right' },
    {
      title: '',
      dataIndex: 'count',
      render: (v) => {
        const max = Math.max(...(stats?.recentActivity.map(r => r.count) ?? [1]));
        return <Progress percent={Math.round((v / max) * 100)} size="small" showInfo={false} />;
      },
    },
  ];

  const serviceRows = Object.entries(stats?.entriesPerService ?? {})
    .map(([service, count]) => ({ service, count, pct: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <Title level={3} style={{ marginTop: 0 }}>
        {t.stats.title}{selectedApp ? ` — ${selectedApp.name}` : ` — ${t.stats.allApps}`}
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic title={t.stats.templates} value={stats?.totalTemplates ?? 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic title={t.stats.logEntries} value={total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title={t.stats.errors}
              value={stats?.entriesPerLevel?.ERROR ?? 0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title={t.stats.warnings}
              value={stats?.entriesPerLevel?.WARN ?? 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title={t.stats.levelDist} loading={loading}>
            {LEVEL_ORDER.map(level => {
              const count = stats?.entriesPerLevel?.[level] ?? 0;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={level} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Tag color={LEVEL_COLORS[level]} style={{ minWidth: 56, textAlign: 'center' }}>{level}</Tag>
                    <Text type="secondary">{count} ({pct}%)</Text>
                  </div>
                  <Progress
                    percent={pct}
                    showInfo={false}
                    strokeColor={LEVEL_COLORS[level]}
                    trailColor="#f0f0f0"
                  />
                </div>
              );
            })}
          </Card>
        </Col>

        <Col span={12}>
          <Card title={t.stats.recentActivity} loading={loading}>
            <Table
              columns={activityColumns}
              dataSource={stats?.recentActivity ?? []}
              rowKey="date"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>

        {!selectedApp && (
          <Col span={24}>
            <Card title={t.stats.byService} loading={loading}>
              <Table
                columns={serviceColumns}
                dataSource={serviceRows}
                rowKey="service"
                size="small"
                pagination={false}
              />
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
}
