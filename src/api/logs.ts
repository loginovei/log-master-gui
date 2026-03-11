// Expected backend endpoints:
// GET /api/logs?appCode=X&logCode=Y&service=Z&level=W&from=...&to=...&page=0&size=20
// GET /api/logs/stats?appCode=X

import client from './client';
import type { AppStats, LogEntry, LogSearchParams, Page } from '../types';

export async function searchLogs(params: LogSearchParams): Promise<Page<LogEntry>> {
  const { data } = await client.get('/api/logs', { params });
  return data;
}

export async function getStats(appCode?: string): Promise<AppStats> {
  const { data } = await client.get('/api/logs/stats', { params: appCode ? { appCode } : {} });
  return data;
}
