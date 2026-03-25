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
import { useT } from '../i18n/useT';
import type { LogEntry, LogLevel } from '../types';

const { Title } = Typography;

const levelColors: Record<LogLevel, string> = {
  TRACE: 'default',
  DEBUG:  'blue',
  INFO:   'success',
  WARN:   'warning',
  ERROR:  'error',
};

const DATE_LOCALE: Record<string, string> = { ru: 'ru-RU', en: 'en-US', zh: 'zh-CN' };

export function DashboardPage() {
  const { selectedApp, selectedLang } = useAppContext();
  const t = useT();
  const appCode = selectedApp?.code;
  const { data: stats, loading: statsLoading, error: statsError } = useFetch(() => getStats(appCode), [appCode]);
  const { data: recent, loading: recentLoading } = useFetch(() =>
    searchLogs({ appCode, page: 0, size: 10, level: 'ERROR' }), [appCode]
  );

  const dateLocale = DATE_LOCALE[selectedLang] ?? 'ru-RU';

  const recentColumns: ColumnsType<LogEntry> = [
    {
      title: t.dashboard.colTime,
      dataIndex: 'timestamp',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString(dateLocale),
    },
    {
      title: t.dashboard.colLevel,
      dataIndex: 'level',
      width: 90,
      render: (v: LogLevel) => <Tag color={levelColors[v]}>{v}</Tag>,
    },
    { title: t.dashboard.colService,  dataIndex: 'service',  width: 140 },
    { title: t.dashboard.colLogCode,  dataIndex: 'logCode' },
  ];

  return (
    <>
      <Title level={3} style={{ marginTop: 0 }}>
        {t.dashboard.title}{selectedApp ? ` — ${selectedApp.name}` : ''}
      </Title>

      {statsError && (
        <Alert
          message={t.dashboard.loadError}
          description={t.dashboard.loadErrorDesc}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t.dashboard.templates}
              value={stats?.totalTemplates ?? 0}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t.dashboard.logEntries}
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

      <Card title={t.dashboard.recentErrors}>
        <Table
          columns={recentColumns}
          dataSource={recent?.content ?? []}
          loading={recentLoading}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: t.dashboard.noErrors }}
        />
      </Card>
    </>
  );
}
