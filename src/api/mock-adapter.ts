import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { AppStats, Application, LogEntry, LogTemplate, Page } from '../types';

// ── Мок-данные ────────────────────────────────────────────────────────────────

const APPLICATIONS: Application[] = [
  { code: 'auth-service',  name: 'Сервис аутентификации' },
  { code: 'user-service',  name: 'Сервис пользователей' },
  { code: 'order-service', name: 'Сервис заказов' },
  { code: 'api-gateway',   name: 'API Шлюз' },
];

const TEMPLATES: LogTemplate[] = [
  { id: '1', appCode: 'auth-service',  logCode: 'AUTH_001', messages: { ru: 'Пользователь {0} успешно вошёл в систему',        en: 'User {0} logged in successfully' } },
  { id: '2', appCode: 'auth-service',  logCode: 'AUTH_002', messages: { ru: 'Неудачная попытка входа для пользователя {0}',     en: 'Failed login attempt for user {0}' } },
  { id: '3', appCode: 'auth-service',  logCode: 'AUTH_003', messages: { ru: 'Пользователь {0} вышел из системы',                en: 'User {0} logged out' } },
  { id: '4', appCode: 'user-service',  logCode: 'USER_001', messages: { ru: 'Создан новый пользователь: {0}',                   en: 'New user created: {0}' } },
  { id: '5', appCode: 'user-service',  logCode: 'USER_002', messages: { ru: 'Профиль пользователя {0} обновлён',                en: 'User profile {0} updated' } },
  { id: '6', appCode: 'order-service', logCode: 'ORD_001',  messages: { ru: 'Заказ {0} создан пользователем {1}',               en: 'Order {0} created by user {1}' } },
  { id: '7', appCode: 'order-service', logCode: 'ORD_002',  messages: { ru: 'Ошибка обработки заказа {0}: {1}',                 en: 'Order {0} processing error: {1}' } },
  { id: '8', appCode: 'api-gateway',   logCode: 'GW_001',   messages: { ru: 'Запрос {0} {1} завершён со статусом {2} за {3} мс', en: 'Request {0} {1} completed with status {2} in {3} ms' } },
  { id: '9', appCode: 'api-gateway',   logCode: 'GW_002',   messages: { ru: 'Превышен лимит запросов для {0}',                  en: 'Rate limit exceeded for {0}' } },
];

const ENTRIES: LogEntry[] = [
  { id: 'e1',  logCode: 'AUTH_001', params: { '0': 'alice' },                                      timestamp: '2026-05-10T08:00:01Z', service: 'auth-service',  level: 'INFO'  },
  { id: 'e2',  logCode: 'AUTH_002', params: { '0': 'bob' },                                        timestamp: '2026-05-10T08:01:14Z', service: 'auth-service',  level: 'WARN'  },
  { id: 'e3',  logCode: 'AUTH_001', params: { '0': 'carol' },                                      timestamp: '2026-05-10T08:02:05Z', service: 'auth-service',  level: 'INFO'  },
  { id: 'e4',  logCode: 'AUTH_003', params: { '0': 'dave' },                                       timestamp: '2026-05-10T08:15:30Z', service: 'auth-service',  level: 'INFO'  },
  { id: 'e5',  logCode: 'USER_001', params: { '0': 'eve' },                                        timestamp: '2026-05-10T08:03:20Z', service: 'user-service',  level: 'INFO'  },
  { id: 'e6',  logCode: 'USER_002', params: { '0': 'alice' },                                      timestamp: '2026-05-10T08:10:00Z', service: 'user-service',  level: 'INFO'  },
  { id: 'e7',  logCode: 'ORD_001',  params: { '0': '#1042', '1': 'alice' },                        timestamp: '2026-05-10T08:05:00Z', service: 'order-service', level: 'INFO'  },
  { id: 'e8',  logCode: 'ORD_002',  params: { '0': '#1043', '1': 'duplicate key value' },          timestamp: '2026-05-10T08:06:45Z', service: 'order-service', level: 'ERROR' },
  { id: 'e9',  logCode: 'ORD_002',  params: { '0': '#1044', '1': 'connection timeout' },           timestamp: '2026-05-10T08:20:00Z', service: 'order-service', level: 'ERROR' },
  { id: 'e10', logCode: 'GW_001',   params: { '0': 'GET',  '1': '/api/users',  '2': '200', '3': '45' },   timestamp: '2026-05-10T08:02:00Z', service: 'api-gateway',   level: 'INFO'  },
  { id: 'e11', logCode: 'GW_001',   params: { '0': 'POST', '1': '/api/orders', '2': '500', '3': '1200' }, timestamp: '2026-05-10T08:06:55Z', service: 'api-gateway',   level: 'ERROR' },
  { id: 'e12', logCode: 'GW_002',   params: { '0': '192.168.1.10' },                               timestamp: '2026-05-10T08:30:00Z', service: 'api-gateway',   level: 'WARN'  },
  { id: 'e13', logCode: 'AUTH_002', params: { '0': 'frank' },                                      timestamp: '2026-05-10T09:00:00Z', service: 'auth-service',  level: 'WARN'  },
  { id: 'e14', logCode: 'USER_001', params: { '0': 'grace' },                                      timestamp: '2026-05-10T09:05:00Z', service: 'user-service',  level: 'INFO'  },
  { id: 'e15', logCode: 'GW_001',   params: { '0': 'GET',  '1': '/api/orders', '2': '200', '3': '120' },  timestamp: '2026-05-10T09:10:00Z', service: 'api-gateway',   level: 'INFO'  },
];

function buildStats(entries: LogEntry[], templates: LogTemplate[]): AppStats {
  const entriesPerLevel: Partial<Record<string, number>> = {};
  const entriesPerService: Record<string, number> = {};
  entries.forEach(e => {
    entriesPerLevel[e.level] = (entriesPerLevel[e.level] ?? 0) + 1;
    entriesPerService[e.service] = (entriesPerService[e.service] ?? 0) + 1;
  });
  const recentActivity = ['2026-05-06', '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-10'].map(
    (date, i) => ({ date, count: 80 + i * 25 + Math.floor(Math.random() * 30) })
  );
  return {
    totalTemplates: templates.length,
    totalEntries: entries.length,
    entriesPerLevel,
    entriesPerService,
    recentActivity,
  };
}

// ── Хелперы ───────────────────────────────────────────────────────────────────

function paginate<T>(items: T[], params: Record<string, string>): Page<T> {
  const size = parseInt(params.size ?? '20');
  const number = parseInt(params.page ?? '0');
  const content = items.slice(number * size, number * size + size);
  return { content, totalElements: items.length, totalPages: Math.ceil(items.length / size), number, size };
}

function ok<T>(data: T, config: InternalAxiosRequestConfig): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers: {}, config };
}

function getParams(config: InternalAxiosRequestConfig): Record<string, string> {
  return Object.fromEntries(Object.entries(config.params ?? {}).map(([k, v]) => [k, String(v)]));
}

// ── Адаптер ───────────────────────────────────────────────────────────────────

export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await new Promise(r => setTimeout(r, 250));

  const url    = config.url ?? '';
  const method = (config.method ?? 'get').toLowerCase();
  const params = getParams(config);
  const appCode = params.appCode;

  // GET /api/applications
  if (url === '/api/applications' && method === 'get') {
    return ok(APPLICATIONS, config);
  }

  // GET /api/templates/search
  if (url === '/api/templates/search' && method === 'get') {
    const q = (params.q ?? '').toLowerCase();
    let results = appCode ? TEMPLATES.filter(t => t.appCode === appCode) : TEMPLATES;
    if (q) results = results.filter(t =>
      t.logCode.toLowerCase().includes(q) ||
      Object.values(t.messages).some(m => m.toLowerCase().includes(q))
    );
    return ok(results, config);
  }

  // GET /api/templates
  if (url === '/api/templates' && method === 'get') {
    const filtered = appCode ? TEMPLATES.filter(t => t.appCode === appCode) : TEMPLATES;
    return ok(paginate(filtered, params), config);
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
    const idx = TEMPLATES.findIndex(t => t.logCode === logCode);
    if (idx !== -1) TEMPLATES[idx] = { ...TEMPLATES[idx], ...JSON.parse(config.data) };
    return ok(TEMPLATES[idx] ?? null, config);
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
    const entries  = appCode ? ENTRIES.filter(e => e.service === appCode) : ENTRIES;
    const templates = appCode ? TEMPLATES.filter(t => t.appCode === appCode) : TEMPLATES;
    return ok(buildStats(entries, templates), config);
  }

  // GET /api/logs
  if (url === '/api/logs' && method === 'get') {
    let entries = appCode ? ENTRIES.filter(e => e.service === appCode) : [...ENTRIES];
    if (params.logCode) entries = entries.filter(e => e.logCode === params.logCode);
    if (params.service) entries = entries.filter(e => e.service === params.service);
    if (params.level)   entries = entries.filter(e => e.level   === params.level);
    return ok(paginate(entries, params), config);
  }

  throw { response: { status: 404, data: { message: `Mock: no handler for ${method.toUpperCase()} ${url}` } } };
}
