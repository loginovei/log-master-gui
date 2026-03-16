import { Card, Col, Row, Statistic, Table, Tag, Typography, Alert } from 'antd';
import {
  FileTextOutlined,
  AppstoreOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useFetch } from '../hooks/useFetch';
import { getStats, searchLogs } from '../api/logs';
import { useAppContext } from '../context/AppContext';
import type { LogEntry, LogLevel } from '../types';

const { Title } = Typography;

const levelColors: Record<LogLevel, string> = {
  TRACE: 'default',
  DEBUG:  'blue',
  INFO:   'success',
  WARN:   'warning',
  ERROR:  'error',
};

const recentColumns: ColumnsType<LogEntry> = [
  {
    title: 'Время',
    dataIndex: 'timestamp',
    width: 180,
    render: (v: string) => new Date(v).toLocaleString('ru'),
  },
  {
    title: 'Уровень',
    dataIndex: 'level',
    width: 90,
    render: (v: LogLevel) => <Tag color={levelColors[v]}>{v}</Tag>,
  },
  { title: 'Сервис',   dataIndex: 'service', width: 140 },
  { title: 'Код лога', dataIndex: 'logCode' },
];

export function DashboardPage() {
  const { selectedApp } = useAppContext();
  const appCode = selectedApp?.code;
  const { data: stats, loading: statsLoading, error: statsError } = useFetch(() => getStats(appCode), [appCode]);
  const { data: recent, loading: recentLoading } = useFetch(() =>
    searchLogs({ appCode, page: 0, size: 10, level: 'ERROR' }), [appCode]
  );

  return (
    <>
      <Title level={3} style={{ marginTop: 0 }}>
        Дашборд{selectedApp ? ` — ${selectedApp.name}` : ''}
      </Title>

      {statsError && (
        <Alert
          message="Не удалось загрузить статистику"
          description="Не удалось подключиться к серверу."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Шаблонов"
              value={stats?.totalTemplates ?? 0}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Записей логов"
              value={stats?.totalEntries ?? 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="WARN"
              value={stats?.entriesPerLevel?.WARN ?? 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="ERROR"
              value={stats?.entriesPerLevel?.ERROR ?? 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Последние ошибки">
        <Table
          columns={recentColumns}
          dataSource={recent?.content ?? []}
          loading={recentLoading}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: 'Ошибок не найдено' }}
        />
      </Card>
    </>
  );
}
