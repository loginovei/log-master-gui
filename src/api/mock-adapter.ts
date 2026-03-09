import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { DashboardStats, LogEntry, LogTemplate, Page } from '../types';

// ── Мок-данные ────────────────────────────────────────────────────────────────

const TEMPLATES: LogTemplate[] = [
  {
    id: '1',
    logCode: 'AUTH_001',
    messages: { ru: 'Пользователь {0} успешно вошёл в систему', en: 'User {0} logged in successfully' },
  },
  {
    id: '2',
    logCode: 'AUTH_002',
    messages: { ru: 'Неудачная попытка входа для пользователя {0}', en: 'Failed login attempt for user {0}' },
  },
  {
    id: '3',
    logCode: 'DB_001',
    messages: { ru: 'Подключение к базе данных {0} установлено', en: 'Connection to database {0} established' },
  },
  {
    id: '4',
    logCode: 'DB_002',
    messages: { ru: 'Ошибка выполнения запроса: {0}', en: 'Query execution error: {0}' },
  },
  {
    id: '5',
    logCode: 'HTTP_001',
    messages: { ru: 'Запрос {0} {1} завершён со статусом {2} за {3} мс', en: 'Request {0} {1} completed with status {2} in {3} ms' },
  },
  {
    id: '6',
    logCode: 'CACHE_001',
    messages: { ru: 'Кэш для ключа {0} сброшен', en: 'Cache for key {0} invalidated' },
  },
];

const ENTRIES: LogEntry[] = [
  { id: 'e1',  logCode: 'AUTH_001', params: { '0': 'alice' },                       timestamp: '2026-05-10T10:00:01Z', service: 'auth-service',    level: 'INFO'  },
  { id: 'e2',  logCode: 'AUTH_002', params: { '0': 'bob' },                         timestamp: '2026-05-10T10:01:14Z', service: 'auth-service',    level: 'WARN'  },
  { id: 'e3',  logCode: 'DB_001',   params: { '0': 'postgres://main' },              timestamp: '2026-05-10T10:01:30Z', service: 'user-service',    level: 'INFO'  },
  { id: 'e4',  logCode: 'HTTP_001', params: { '0': 'GET', '1': '/api/users', '2': '200', '3': '45' }, timestamp: '2026-05-10T10:02:00Z', service: 'api-gateway',     level: 'INFO'  },
  { id: 'e5',  logCode: 'DB_002',   params: { '0': 'duplicate key value' },          timestamp: '2026-05-10T10:02:45Z', service: 'order-service',   level: 'ERROR' },
  { id: 'e6',  logCode: 'AUTH_001', params: { '0': 'carol' },                       timestamp: '2026-05-10T10:03:10Z', service: 'auth-service',    level: 'INFO'  },
  { id: 'e7',  logCode: 'HTTP_001', params: { '0': 'POST', '1': '/api/orders', '2': '500', '3': '1200' }, timestamp: '2026-05-10T10:03:55Z', service: 'api-gateway', level: 'ERROR' },
  { id: 'e8',  logCode: 'CACHE_001',params: { '0': 'user:42' },                     timestamp: '2026-05-10T10:04:20Z', service: 'user-service',    level: 'DEBUG' },
  { id: 'e9',  logCode: 'DB_002',   params: { '0': 'connection timeout' },           timestamp: '2026-05-10T10:04:58Z', service: 'order-service',   level: 'ERROR' },
  { id: 'e10', logCode: 'AUTH_002', params: { '0': 'dave' },                        timestamp: '2026-05-10T10:05:30Z', service: 'auth-service',    level: 'WARN'  },
];

const STATS: DashboardStats = {
  totalTemplates: TEMPLATES.length,
  totalEntries: 1284,
  entriesPerLevel: { TRACE: 12, DEBUG: 210, INFO: 890, WARN: 130, ERROR: 42 },
};

// ── Хелперы ───────────────────────────────────────────────────────────────────

function page<T>(items: T[], params: Record<string, string>): Page<T> {
  const size = parseInt(params.size ?? '20');
  const number = parseInt(params.page ?? '0');
  const start = number * size;
  const content = items.slice(start, start + size);
  return { content, totalElements: items.length, totalPages: Math.ceil(items.length / size), number, size };
}

function ok<T>(data: T, config: InternalAxiosRequestConfig): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers: {}, config };
}

function parseParams(config: InternalAxiosRequestConfig): Record<string, string> {
  const p = config.params ?? {};
  return Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)]));
}

// ── Адаптер ───────────────────────────────────────────────────────────────────

export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await new Promise(r => setTimeout(r, 250)); // имитация задержки сети

  const url = config.url ?? '';
  const method = (config.method ?? 'get').toLowerCase();
  const params = parseParams(config);

  // GET /api/templates/search?q=
  if (url === '/api/templates/search' && method === 'get') {
    const q = (params.q ?? '').toLowerCase();
    const results = q
      ? TEMPLATES.filter(t =>
          t.logCode.toLowerCase().includes(q) ||
          Object.values(t.messages).some(m => m.toLowerCase().includes(q))
        )
      : TEMPLATES;
    return ok(results, config);
  }

  // GET /api/templates
  if (url === '/api/templates' && method === 'get') {
    return ok(page(TEMPLATES, params), config);
  }

  // POST /api/templates
  if (url === '/api/templates' && method === 'post') {
    const body = JSON.parse(config.data);
    const created = { ...body, id: String(Date.now()) };
    TEMPLATES.push(created);
    return ok(created, config);
  }

  // PUT /api/templates/:logCode
  if (url.startsWith('/api/templates/') && method === 'put') {
    const logCode = url.split('/').pop()!;
    const body = JSON.parse(config.data);
    const idx = TEMPLATES.findIndex(t => t.logCode === logCode);
    if (idx !== -1) TEMPLATES[idx] = { ...TEMPLATES[idx], ...body };
    return ok(TEMPLATES[idx], config);
  }

  // DELETE /api/templates/:logCode
  if (url.startsWith('/api/templates/') && method === 'delete') {
    const logCode = url.split('/').pop()!;
    const idx = TEMPLATES.findIndex(t => t.logCode === logCode);
    if (idx !== -1) TEMPLATES.splice(idx, 1);
    return ok(null, config);
  }

  // GET /api/logs/stats
  if (url === '/api/logs/stats' && method === 'get') {
    return ok(STATS, config);
  }

  // GET /api/logs
  if (url === '/api/logs' && method === 'get') {
    let entries = [...ENTRIES];
    if (params.logCode) entries = entries.filter(e => e.logCode === params.logCode);
    if (params.service) entries = entries.filter(e => e.service === params.service);
    if (params.level)   entries = entries.filter(e => e.level   === params.level);
    return ok(page(entries, params), config);
  }

  throw { response: { status: 404, data: { message: `Mock: no handler for ${method.toUpperCase()} ${url}` } } };
}
