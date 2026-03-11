// Expected backend endpoints:
// GET    /api/templates?appCode=X&page=0&size=20
// GET    /api/templates/search?appCode=X&q=text
// POST   /api/templates
// PUT    /api/templates/{logCode}
// DELETE /api/templates/{logCode}

import client from './client';
import type { LogTemplate, Page, TemplateSearchParams } from '../types';

export async function getTemplates(params: TemplateSearchParams = {}): Promise<Page<LogTemplate>> {
  const { data } = await client.get('/api/templates', { params: { page: 0, size: 100, ...params } });
  return data;
}

export async function searchTemplates(params: TemplateSearchParams): Promise<LogTemplate[]> {
  const { data } = await client.get('/api/templates/search', { params });
  return data;
}

export async function createTemplate(template: Omit<LogTemplate, 'id'>): Promise<LogTemplate> {
  const { data } = await client.post('/api/templates', template);
  return data;
}

export async function updateTemplate(logCode: string, template: Omit<LogTemplate, 'id'>): Promise<LogTemplate> {
  const { data } = await client.put(`/api/templates/${logCode}`, template);
  return data;
}

export async function deleteTemplate(logCode: string): Promise<void> {
  await client.delete(`/api/templates/${logCode}`);
}
