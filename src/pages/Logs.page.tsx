import { useState, useEffect, useRef, useMemo } from 'react';
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  theme as antTheme,
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

const PERIOD_OPTIONS = [
  { value: '1h',  ms: 60 * 60 * 1000 },
  { value: '1d',  ms: 24 * 60 * 60 * 1000 },
  { value: '3d',  ms: 3 * 24 * 60 * 60 * 1000 },
  { value: '7d',  ms: 7 * 24 * 60 * 60 * 1000 },
] as const;

type PeriodValue = typeof PERIOD_OPTIONS[number]['value'];

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
  const { apps, selectedApp, selectedLang } = useAppContext();
  const { token } = antTheme.useToken();
  const t = useT();
  const dateLocale = DATE_LOCALE[selectedLang] ?? 'ru-RU';

  // ── Recent logs ────────────────────────────────────────────────────────────
  const [recentSize, setRecentSize] = useState(25);
  const [recentPage, setRecentPage] = useState(1);

  useEffect(() => { setRecentPage(1); }, [selectedApp?.code]);
  useEffect(() => { setRecentPage(1); }, [recentSize]);

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
  const [filters, setFilters] = useState<{ service?: string; level?: LogLevel; period?: PeriodValue }>({});
  const [logs, setLogs] = useState<Page<LogEntry> | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searched, setSearched] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [detailEntry, setDetailEntry] = useState<LogEntry | null>(null);
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
        return tpl
          ? renderMessage(tpl, params, selectedLang)
          : <Text type="secondary" italic>{t.logs.templateNotFound} {record.logCode}</Text>;
      },
    },
    {
      key: 'actions',
      title: '',
      width: 72,
      render: (_, record: LogEntry) => (
        <Space size={4}>
          {(Object.keys(record.params).length > 0 || !!record.additional) && (
            <Tooltip title={t.logs.params}>
              <Button size="small" icon={<CodeOutlined />} onClick={() => setDetailEntry(record)} />
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
      render: (params: Record<string, unknown>, record: LogEntry) => {
        if (selectedTemplate) return renderMessage(selectedTemplate, params, selectedLang);
        const tpl = templateMap[record.logCode];
        return tpl
          ? renderMessage(tpl, params, selectedLang)
          : <Text type="secondary" italic>{t.logs.templateNotFound} {record.logCode}</Text>;
      },
      onHeaderCell: draggableHeader('message'),
    },
  };

  const searchColumns: ColumnsType<LogEntry> = [
    ...colOrder.map(k => colDefs[k]),
    {
      key: 'actions', title: '', width: 72,
      render: (_, record) => (
        <Space size={4}>
          {(Object.keys(record.params).length > 0 || !!record.additional) && (
            <Tooltip title={t.logs.params}>
              <Button size="small" icon={<CodeOutlined />} onClick={() => setDetailEntry(record)} />
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
        const results = await searchTemplates({ q: templateQuery, appCode: selectedApp?.code, lang: selectedLang });
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
      const periodMs = filters.period ? PERIOD_OPTIONS.find(p => p.value === filters.period)?.ms : undefined;
      const now = Date.now();
      const params: LogSearchParams = {
        appCode: selectedApp?.code,
        logCode,
        service: filters.service,
        level: filters.level,
        from: periodMs ? new Date(now - periodMs).toISOString() : undefined,
        to: periodMs ? new Date(now).toISOString() : undefined,
        page: currentPage - 1,
        size: 20,
      };
      setLogs(await searchLogs(params));
    } catch { setLogs(null); }
    finally { setLogsLoading(false); }
  }

  function handleSelectTemplate(value: string) {
    const opt = templateOptions.find(o => o.value === value);
    if (opt) { setSelectedTemplate(opt.template); setPage(1); }
  }

  function handleSearch() {
    if (selectedTemplate) {
      setPage(1);
      loadLogs(selectedTemplate.logCode, 1);
    } else if (templateQuery.trim()) {
      setPage(1);
      loadLogs(templateQuery.trim(), 1);
    }
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
            value={templateQuery}
            onChange={setTemplateQuery}
            onSelect={handleSelectTemplate}
            options={templateOptions.map(o => ({ value: o.value, label: o.label }))}
            notFoundContent={templateQuery.trim() ? t.templates.noTemplates : null}
            allowClear
          >
            <Input
              placeholder={t.logs.step1Placeholder}
              onPressEnter={handleSearch}
            />
          </AutoComplete>
          <Button icon={<SearchOutlined />} type="primary" onClick={handleSearch}>
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
                <Select
                  allowClear
                  placeholder={t.logs.allServices}
                  style={{ width: '100%' }}
                  disabled={!!selectedApp}
                  options={apps.map(a => ({ value: a.code, label: a.name }))}
                  onChange={(v) => setFilters(f => ({ ...f, service: v }))}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t.logs.period} style={{ margin: 0 }}>
                <Select
                  allowClear
                  placeholder={t.logs.allPeriods}
                  style={{ width: '100%' }}
                  onChange={(v) => setFilters(f => ({ ...f, period: v }))}
                  options={[
                    { value: '1h', label: t.logs.period1h },
                    { value: '1d', label: t.logs.period1d },
                    { value: '3d', label: t.logs.period3d },
                    { value: '7d', label: t.logs.period7d },
                  ]}
                />
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
        title={detailEntry?.logCode}
        open={!!detailEntry}
        onCancel={() => setDetailEntry(null)}
        footer={null}
        width={600}
      >
        <Tabs
          defaultActiveKey={
            detailEntry && Object.keys(detailEntry.params).length > 0 ? 'params' : 'additional'
          }
          items={[
            ...(detailEntry && Object.keys(detailEntry.params).length > 0 ? [{
              key: 'params',
              label: t.logs.params,
              children: (
                <pre style={{
                  margin: 0, padding: '12px 16px', background: token.colorFillQuaternary,
                  borderRadius: 6, fontSize: 13, lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace',
                }}>
                  {JSON.stringify(detailEntry.params, null, 2)}
                </pre>
              ),
            }] : []),
            ...(detailEntry?.additional ? [{
              key: 'additional',
              label: t.logs.context,
              children: (
                <pre style={{
                  margin: 0, padding: '12px 16px', background: token.colorFillQuaternary,
                  borderRadius: 6, fontSize: 13, lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace',
                }}>
                  {detailEntry.additional}
                </pre>
              ),
            }] : []),
          ]}
        />
      </Modal>
    </>
  );
}
