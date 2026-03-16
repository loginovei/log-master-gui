import { Card, Col, Progress, Row, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useFetch } from '../hooks/useFetch';
import { getStats } from '../api/logs';
import { useAppContext } from '../context/AppContext';
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
  const { data: stats, loading } = useFetch(() => getStats(selectedApp?.code), [selectedApp?.code]);

  const total = stats?.totalEntries ?? 0;

  const serviceColumns: ColumnsType<{ service: string; count: number; pct: number }> = [
    { title: 'Сервис',   dataIndex: 'service', render: (v) => <Tag>{v}</Tag> },
    { title: 'Записей',  dataIndex: 'count', align: 'right', width: 100 },
    {
      title: 'Доля',
      dataIndex: 'pct',
      width: 200,
      render: (pct) => <Progress percent={pct} size="small" strokeColor="#1677ff" />,
    },
  ];

  const activityColumns: ColumnsType<{ date: string; count: number }> = [
    { title: 'Дата',     dataIndex: 'date' },
    { title: 'Записей',  dataIndex: 'count', align: 'right' },
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
        Статистика{selectedApp ? ` — ${selectedApp.name}` : ' — все приложения'}
      </Title>

      {/* Сводка */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic title="Шаблонов" value={stats?.totalTemplates ?? 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic title="Записей логов" value={total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Ошибок (ERROR)"
              value={stats?.entriesPerLevel?.ERROR ?? 0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Предупреждений (WARN)"
              value={stats?.entriesPerLevel?.WARN ?? 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Распределение по уровням */}
        <Col span={12}>
          <Card title="Распределение по уровням" loading={loading}>
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

        {/* Активность по дням */}
        <Col span={12}>
          <Card title="Активность за последние 5 дней" loading={loading}>
            <Table
              columns={activityColumns}
              dataSource={stats?.recentActivity ?? []}
              rowKey="date"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>

        {/* Топ сервисов */}
        {!selectedApp && (
          <Col span={24}>
            <Card title="Записей по сервисам" loading={loading}>
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
