import { useState, useEffect, useRef } from 'react';
import {
  AutoComplete,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Divider,
  Tooltip,
} from 'antd';
import { SearchOutlined, FilterOutlined, BugOutlined, CodeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { searchTemplates } from '../api/templates';
import { searchLogs } from '../api/logs';
import { useAppContext } from '../context/AppContext';
import type { LogEntry, LogLevel, LogSearchParams, LogTemplate, Page } from '../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const levelColors: Record<LogLevel, string> = {
  TRACE: 'default',
  DEBUG: 'blue',
  INFO: 'success',
  WARN: 'warning',
  ERROR: 'error',
};

const levels: LogLevel[] = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];

export function LogsPage() {
  const { selectedApp } = useAppContext();
  const [templateQuery, setTemplateQuery] = useState('');
  const [templateOptions, setTemplateOptions] = useState<{ value: string; label: string; template: LogTemplate }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LogTemplate | null>(null);
  const [filters, setFilters] = useState<{ service?: string; level?: LogLevel; from?: string; to?: string }>({});
  const [logs, setLogs] = useState<Page<LogEntry> | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searched, setSearched] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [paramsEntry, setParamsEntry] = useState<LogEntry | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toggleExpand(id: string) {
    setExpandedKeys(keys =>
      keys.includes(id) ? keys.filter(k => k !== id) : [...keys, id]
    );
  }

  const logColumns: ColumnsType<LogEntry> = [
    {
      title: 'Время',
      dataIndex: 'timestamp',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString('ru'),
      sorter: true,
    },
    {
      title: 'Уровень',
      dataIndex: 'level',
      width: 90,
      render: (v: LogLevel) => <Tag color={levelColors[v]}>{v}</Tag>,
    },
    { title: 'Сервис',   dataIndex: 'service',  width: 160 },
    { title: 'Код лога', dataIndex: 'logCode',  width: 180 },
    {
      title: '',
      key: 'actions',
      width: 72,
      render: (_, record) => (
        <Space size={4}>
          {Object.keys(record.params).length > 0 && (
            <Tooltip title="Параметры">
              <Button
                size="small"
                icon={<CodeOutlined />}
                onClick={() => setParamsEntry(record)}
              />
            </Tooltip>
          )}
          {record.stackTrace && (
            <Tooltip title="Stack trace">
              <Button
                size="small"
                danger={expandedKeys.includes(record.id)}
                icon={<BugOutlined />}
                onClick={() => toggleExpand(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Debounced template search
  useEffect(() => {
    if (!templateQuery.trim()) {
      setTemplateOptions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchTemplates({ q: templateQuery, appCode: selectedApp?.code });
        setTemplateOptions(
          results.map(t => ({
            value: t.logCode,
            label: `${t.logCode} — ${t.messages['ru'] ?? Object.values(t.messages)[0] ?? ''}`,
            template: t,
          }))
        );
      } catch { /* игнорируем ошибку подсказок */ }
    }, 300);
  }, [templateQuery]);

  async function loadLogs(logCode: string, currentPage: number) {
    setLogsLoading(true);
    setSearched(true);
    try {
      const params: LogSearchParams = {
        appCode: selectedApp?.code,
        logCode,
        ...filters,
        page: currentPage - 1,
        size: 20,
      };
      setLogs(await searchLogs(params));
    } catch {
      setLogs(null);
    } finally {
      setLogsLoading(false);
    }
  }

  function handleSelectTemplate(value: string) {
    const opt = templateOptions.find(o => o.value === value);
    if (opt) {
      setSelectedTemplate(opt.template);
      setPage(1);
      loadLogs(value, 1);
    }
  }

  function handleApplyFilters() {
    if (!selectedTemplate) return;
    setPage(1);
    loadLogs(selectedTemplate.logCode, 1);
  }

  return (
    <>
      <Title level={3} style={{ marginTop: 0 }}>Поиск логов</Title>

      {/* Этап 1 — поиск шаблона */}
      <Card title="Шаг 1 — Найдите шаблон лога" style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%' }}>
          <AutoComplete
            style={{ width: '100%' }}
            placeholder="Введите текст лога или код (например: AUTH_001 или «пользователь вошёл»)"
            value={templateQuery}
            onChange={setTemplateQuery}
            onSelect={handleSelectTemplate}
            options={templateOptions.map(o => ({ value: o.value, label: o.label }))}
            allowClear
          />
          <Button icon={<SearchOutlined />} type="primary" onClick={() => {
            if (templateOptions.length === 1) handleSelectTemplate(templateOptions[0].value);
          }}>
            Найти
          </Button>
        </Space.Compact>

        {selectedTemplate && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Space wrap>
              <Text strong>Выбран шаблон:</Text>
              <Tag color="blue">{selectedTemplate.logCode}</Tag>
              {Object.entries(selectedTemplate.messages).map(([lang, text]) => (
                <Tag key={lang}><Text type="secondary">[{lang}]</Text> {text}</Tag>
              ))}
            </Space>
          </>
        )}
      </Card>

      {/* Этап 2 — фильтры и записи */}
      {selectedTemplate && (
        <Card
          title="Шаг 2 — Фильтрация записей"
          extra={
            <Button icon={<FilterOutlined />} onClick={handleApplyFilters} type="primary" ghost>
              Применить фильтры
            </Button>
          }
          style={{ marginBottom: 16 }}
        >
          <Form layout="inline">
            <Row gutter={[12, 12]} style={{ width: '100%' }}>
              <Col span={6}>
                <Form.Item label="Уровень" style={{ margin: 0 }}>
                  <Select
                    allowClear
                    placeholder="Все уровни"
                    style={{ width: '100%' }}
                    onChange={(v) => setFilters(f => ({ ...f, level: v }))}
                  >
                    {levels.map(l => (
                      <Select.Option key={l} value={l}>
                        <Tag color={levelColors[l]}>{l}</Tag>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Сервис" style={{ margin: 0 }}>
                  <Select
                    allowClear
                    placeholder="Все сервисы"
                    style={{ width: '100%' }}
                    onChange={(v) => setFilters(f => ({ ...f, service: v }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Период" style={{ margin: 0 }}>
                  <RangePicker
                    showTime
                    style={{ width: '100%' }}
                    onChange={(_, [from, to]) => setFilters(f => ({ ...f, from, to }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {searched && (
        <Card>
          <Table
            columns={logColumns}
            dataSource={logs?.content ?? []}
            loading={logsLoading}
            rowKey="id"
            size="small"
            locale={{ emptyText: 'Записи не найдены' }}
            expandable={{
              showExpandColumn: false,
              expandedRowKeys: expandedKeys,
              onExpand: (_, record) => toggleExpand(record.id),
              expandedRowRender: (record) => (
                <pre style={{
                  margin: 0,
                  padding: '12px 16px',
                  background: '#1a1a1a',
                  color: '#ff7875',
                  borderRadius: 6,
                  fontSize: 12,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                }}>
                  {record.stackTrace}
                </pre>
              ),
              rowExpandable: (record) => !!record.stackTrace,
            }}
            pagination={{
              current: page,
              total: logs?.totalElements ?? 0,
              pageSize: 20,
              showTotal: (total) => `Всего: ${total}`,
              onChange: (p) => {
                setPage(p);
                if (selectedTemplate) loadLogs(selectedTemplate.logCode, p);
              },
            }}
          />
        </Card>
      )}

      <Modal
        title={`Параметры — ${paramsEntry?.logCode}`}
        open={!!paramsEntry}
        onCancel={() => setParamsEntry(null)}
        footer={null}
        width={560}
      >
        <pre style={{
          margin: 0,
          padding: '12px 16px',
          background: '#f6f8fa',
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          fontFamily: 'monospace',
        }}>
          {paramsEntry ? JSON.stringify(paramsEntry.params, null, 2) : ''}
        </pre>
      </Modal>
    </>
  );
}
