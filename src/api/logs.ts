// Expected backend endpoints:
// GET /api/logs?logCode=X&service=Y&level=Z&from=...&to=...&page=0&size=20
// GET /api/logs/stats

import client from './client';
import type { LogEntry, LogSearchParams, Page, DashboardStats } from '../types';

export async function searchLogs(params: LogSearchParams): Promise<Page<LogEntry>> {
  const { data } = await client.get('/api/logs', { params });
  return data;
}

export async function getStats(): Promise<DashboardStats> {
  const { data } = await client.get('/api/logs/stats');
  return data;
}
