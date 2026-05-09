import { logsApi } from './apiClient';
import client from './client';
import type { AppStats, LogEntry, LogLevel, LogSearchParams, Page } from '../types';

export async function searchLogs(params: LogSearchParams): Promise<Page<LogEntry>> {
  const { data } = await client.get('/api/logs', {
    params: {
      appCode: params.appCode ?? params.service,
      logCodes: params.logCodes,
      level: params.level,
      from: params.from,
      to: params.to,
      argsQuery: params.argsQuery || undefined,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
    paramsSerializer: { indexes: null },
  });
  return {
    content: data.content?.map(toEntry) ?? [],
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
    number: data.number ?? 0,
    size: data.size ?? 20,
  };
}

export async function getStats(appCode?: string): Promise<AppStats> {
  const { data } = await logsApi.getStats(appCode);
  return {
    totalTemplates: data.totalTemplates ?? 0,
    totalEntries: data.totalEntries ?? 0,
    entriesPerLevel: (data.entriesPerLevel ?? {}) as Partial<Record<LogLevel, number>>,
    entriesPerService: (data.entriesPerService ?? {}) as Record<string, number>,
    recentActivity: data.recentActivity?.map(a => ({ date: a.date ?? '', count: a.count ?? 0 })) ?? [],
  };
}

function toEntry(r: { id?: string; logCode?: string; params?: Record<string, object>; timestamp?: string; service?: string; level?: string; stackTrace?: string; additional?: Record<string, unknown> }): LogEntry {
  return {
    id: r.id ?? '',
    logCode: r.logCode ?? '',
    params: (r.params ?? {}) as Record<string, unknown>,
    timestamp: r.timestamp ?? '',
    service: r.service ?? '',
    level: (r.level ?? 'INFO') as LogLevel,
    stackTrace: r.stackTrace,
    additional: r.additional,
  };
}
