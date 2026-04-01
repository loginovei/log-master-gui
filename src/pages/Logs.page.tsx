import { useState, useEffect, useRef, useMemo } from 'react';
import {
  AutoComplete,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  BugOutlined,
  CodeOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { searchTemplates, getTemplates } from '../api/templates';
import { searchLogs } from '../api/logs';
import { useAppContext } from '../context/AppContext';
import { useFetch } from '../hooks/useFetch';
import { useT } from '../i18n/useT';
import type { LogEntry, LogLevel, LogSearchParams, LogTemplate, Page } from '../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const levelColors: Record<LogLevel, string> = {
  TRACE: 'default', DEBUG: 'blue', INFO: 'success', WARN: 'warning', ERROR: 'error',
};

const levels: LogLevel[] = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];
const DEFAULT_COL_ORDER = ['time', 'level', 'service', 'logCode', 'message'];
const DATE_LOCALE: Record<string, string> = { ru: 'ru-RU', en: 'en-US', zh: 'zh-CN' };
const RECENT_SIZES = [10, 25, 50];

function renderMessage(template: LogTemplate, params: Record<string, unknown>, lang: string): string {
  const text = template.messages[lang] ?? Object.values(template.messages)[0] ?? '';
  return text.replace(/\{(\d+)\}/g, (_, i) => String(params[i] ?? `{${i}}`));
}

export function LogsPage() {
  const { selectedApp, selectedLang } = useAppContext();
  const t = useT();
  const dateLocale = DATE_LOCALE[selectedLang] ?? 'ru-RU';

  // ── Recent logs ────────────────────────────────────────────────────────────
  const [recentSize, setRecentSize] = useState(25);
  const [recentPage, setRecentPage] = useState(1);

  const { data: templatesPage } = useFetch(
    () => getTemplates({ appCode: selectedApp?.code, size: 500 }),
    [selectedApp?.code],
  );
  const templateMap = useMemo<Record<string, LogTemplate>>(
    () => Object.fromEntries((templatesPage?.content ?? []).map(t => [t.logCode, t])),
    [templatesPage],
  );

  const { data: recentLogs, loading: recentLoading, refetch: refetchRecent } = useFetch(
    () => searchLogs({ appCode: selectedApp?.code, page: recentPage - 1, size: recentSize }),
    [selectedApp?.code, recentSize, recentPage],
  );

  // ── Template search + filtered logs ───────────────────────────────────────
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
  const [colOrder, setColOrder] = useState<string[]>(DEFAULT_COL_ORDER);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragKey = useRef<string>('');

  function toggleExpand(id: string) {
    setExpandedKeys(keys => keys.includes(id) ? keys.filter(k => k !== id) : [...keys, id]);
  }

  // ── Recent logs columns ───────────────────────────────────────────────────
  const recentColumns: ColumnsType<LogEntry> = [
    {
      title: t.logs.colTime,
      dataIndex: 'timestamp',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString(dateLocale),
    },
    {
      title: t.logs.colLevel,
      dataIndex: 'level',
      width: 90,
      render: (v: LogLevel) => <Tag color={levelColors[v]}>{v}</Tag>,
    },
    {
      title: t.logs.colService,
      dataIndex: 'service',
      width: 160,
      render: (v: string) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      title: t.logs.colLogCode,
      dataIndex: 'logCode',
      width: 130,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: t.logs.colMessage,
      dataIndex: 'params',
      render: (params: Record<string, unknown>, record: LogEntry) => {
        const tpl = templateMap[record.logCode];
        return tpl ? renderMessage(tpl, params, selectedLang) : record.logCode;
      },
    },
    {
      key: 'actions',
      title: '',
      width: 72,
      render: (_, record: LogEntry) => (
        <Space size={4}>
          {Object.keys(record.params).length > 0 && (
            <Tooltip title={t.logs.params}>
              <Button size="small" icon={<CodeOutlined />} onClick={() => setParamsEntry(record)} />
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

  // ── Draggable search-result columns ───────────────────────────────────────
  function draggableHeader(key: string): ColumnType<LogEntry>['onHeaderCell'] {
    return () => ({
      draggable: true,
      style: { cursor: 'grab', userSelect: 'none' },
      onDragStart: () => { dragKey.current = key; },
      onDragOver: (e: React.DragEvent) => e.preventDefault(),
      onDrop: () => {
        if (dragKey.current === key) return;
        setColOrder(order => {
          const from = order.indexOf(dragKey.current);
          const to = order.indexOf(key);
          const next = [...order];
          next.splice(to, 0, next.splice(from, 1)[0]);
          return next;
        });
      },
    });
  }

  const colDefs: Record<string, ColumnType<LogEntry>> = {
    time: {
      key: 'time', title: t.logs.colTime, dataIndex: 'timestamp', width: 180,
      render: (v: string) => new Date(v).toLocaleString(dateLocale),
      sorter: true, onHeaderCell: draggableHeader('time'),
    },
    level: {
      key: 'level', title: t.logs.colLevel, dataIndex: 'level', width: 90,
      render: (v: LogLevel) => <Tag color={levelColors[v]}>{v}</Tag>,
      onHeaderCell: draggableHeader('level'),
    },
    service: {
      key: 'service', title: t.logs.colService, dataIndex: 'service', width: 160,
      onHeaderCell: draggableHeader('service'),
    },
    logCode: {
      key: 'logCode', title: t.logs.colLogCode, dataIndex: 'logCode', width: 160,
      onHeaderCell: draggableHeader('logCode'),
    },
    message: {
      key: 'message', title: t.logs.colMessage, dataIndex: 'params',
      render: (params: Record<string, unknown>) =>
        selectedTemplate ? renderMessage(selectedTemplate, params, selectedLang) : '—',
      onHeaderCell: draggableHeader('message'),
    },
  };

  const searchColumns: ColumnsType<LogEntry> = [
    ...colOrder.map(k => colDefs[k]),
    {
      key: 'actions', title: '', width: 72,
      render: (_, record) => (
        <Space size={4}>
          {Object.keys(record.params).length > 0 && (
            <Tooltip title={t.logs.params}>
              <Button size="small" icon={<CodeOutlined />} onClick={() => setParamsEntry(record)} />
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

  // ── Template autocomplete ─────────────────────────────────────────────────
  useEffect(() => {
    if (!templateQuery.trim()) { setTemplateOptions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchTemplates({ q: templateQuery, appCode: selectedApp?.code });
        setTemplateOptions(results.map(tmpl => ({
          value: tmpl.logCode,
          label: `${tmpl.logCode} — ${tmpl.messages[selectedLang] ?? Object.values(tmpl.messages)[0] ?? ''}`,
          template: tmpl,
        })));
      } catch { /* игнорируем */ }
    }, 300);
  }, [templateQuery, selectedLang, selectedApp?.code]);

  async function loadLogs(logCode: string, currentPage: number) {
    setLogsLoading(true);
    setSearched(true);
    try {
      const params: LogSearchParams = { appCode: selectedApp?.code, logCode, ...filters, page: currentPage - 1, size: 20 };
      setLogs(await searchLogs(params));
    } catch { setLogs(null); }
    finally { setLogsLoading(false); }
  }

  function handleSelectTemplate(value: string) {
    const opt = templateOptions.find(o => o.value === value);
    if (opt) { setSelectedTemplate(opt.template); setPage(1); loadLogs(value, 1); }
  }

  function handleApplyFilters() {
    if (!selectedTemplate) return;
    setPage(1);
    loadLogs(selectedTemplate.logCode, 1);
  }

  const expandable = {
    showExpandColumn: false,
    expandedRowKeys: expandedKeys,
    onExpand: (_: boolean, record: LogEntry) => toggleExpand(record.id),
    expandedRowRender: (record: LogEntry) => (
      <pre style={{
        margin: 0, padding: '12px 16px', background: '#1a1a1a', color: '#ff7875',
        borderRadius: 6, fontSize: 12, lineHeight: 1.6,
        whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace',
      }}>
        {record.stackTrace}
      </pre>
    ),
    rowExpandable: (record: LogEntry) => !!record.stackTrace,
  };

  return (
    <>
      <Title level={3} style={{ marginTop: 0 }}>{t.logs.title}</Title>

      {/* ── Search + Filters ── */}
      <Card
        title={t.logs.searchTitle}
        extra={
          <Button
            icon={<FilterOutlined />}
            onClick={handleApplyFilters}
            type="primary"
            ghost
            disabled={!selectedTemplate}
          >
            {t.logs.applyFilters}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Space.Compact style={{ width: '100%' }}>
          <AutoComplete
            style={{ width: '100%' }}
            placeholder={t.logs.step1Placeholder}
            value={templateQuery}
            onChange={setTemplateQuery}
            onSelect={handleSelectTemplate}
            options={templateOptions.map(o => ({ value: o.value, label: o.label }))}
            allowClear
          />
          <Button icon={<SearchOutlined />} type="primary" onClick={() => {
            if (templateOptions.length === 1) handleSelectTemplate(templateOptions[0].value);
          }}>
            {t.logs.search}
          </Button>
        </Space.Compact>

        {selectedTemplate && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Space wrap>
              <Text strong>{t.logs.selectedTemplate}</Text>
              <Tag color="blue">{selectedTemplate.logCode}</Tag>
              {Object.entries(selectedTemplate.messages).map(([lang, text]) => (
                <Tag key={lang}><Text type="secondary">[{lang}]</Text> {text}</Tag>
              ))}
            </Space>
          </>
        )}

        <Divider style={{ margin: '12px 0' }} />
        <Form layout="inline">
          <Row gutter={[12, 12]} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item label={t.logs.level} style={{ margin: 0 }}>
                <Select allowClear placeholder={t.logs.allLevels} style={{ width: '100%' }}
                  onChange={(v) => setFilters(f => ({ ...f, level: v }))}>
                  {levels.map(l => (
                    <Select.Option key={l} value={l}><Tag color={levelColors[l]}>{l}</Tag></Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t.logs.service} style={{ margin: 0 }}>
                <Select allowClear placeholder={t.logs.allServices} style={{ width: '100%' }}
                  onChange={(v) => setFilters(f => ({ ...f, service: v }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t.logs.period} style={{ margin: 0 }}>
                <RangePicker showTime style={{ width: '100%' }}
                  onChange={(_, [from, to]) => setFilters(f => ({ ...f, from, to }))} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* ── Search results ── */}
      {searched && (
        <Card style={{ marginBottom: 16 }}>
          <Table
            columns={searchColumns}
            dataSource={logs?.content ?? []}
            loading={logsLoading}
            rowKey="id"
            size="small"
            locale={{ emptyText: t.logs.noEntries }}
            expandable={expandable}
            pagination={{
              current: page,
              total: logs?.totalElements ?? 0,
              pageSize: 20,
              showTotal: (total) => `${t.logs.total}: ${total}`,
              onChange: (p) => { setPage(p); if (selectedTemplate) loadLogs(selectedTemplate.logCode, p); },
            }}
          />
        </Card>
      )}

      {/* ── Recent logs ── */}
      <Card
        title={
          <Space>
            {t.logs.recent}
            {selectedApp && <Tag color="geekblue">{selectedApp.name}</Tag>}
          </Space>
        }
        extra={
          <Space>
            <Pagination
              size="small"
              current={recentPage}
              total={recentLogs?.totalElements ?? 0}
              pageSize={recentSize}
              pageSizeOptions={RECENT_SIZES}
              showSizeChanger
              showTotal={(total) => `${t.logs.total}: ${total}`}
              onChange={(p, s) => { setRecentPage(p); if (s !== recentSize) { setRecentSize(s); setRecentPage(1); } }}
            />
            <Button icon={<ReloadOutlined />} onClick={refetchRecent} />
          </Space>
        }
      >
        <Table
          columns={recentColumns}
          dataSource={recentLogs?.content ?? []}
          loading={recentLoading}
          rowKey="id"
          size="small"
          locale={{ emptyText: t.logs.noEntries }}
          expandable={expandable}
          pagination={{
            current: recentPage,
            total: recentLogs?.totalElements ?? 0,
            pageSize: recentSize,
            showSizeChanger: false,
            showTotal: (total) => `${t.logs.total}: ${total}`,
            onChange: (p) => setRecentPage(p),
          }}
        />
      </Card>

      <Modal
        title={`${t.logs.params} — ${paramsEntry?.logCode}`}
        open={!!paramsEntry}
        onCancel={() => setParamsEntry(null)}
        footer={null}
        width={560}
      >
        <pre style={{
          margin: 0, padding: '12px 16px', background: '#f6f8fa',
          borderRadius: 6, fontSize: 13, lineHeight: 1.6,
          whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace',
        }}>
          {paramsEntry ? JSON.stringify(paramsEntry.params, null, 2) : ''}
        </pre>
      </Modal>
    </>
  );
}
