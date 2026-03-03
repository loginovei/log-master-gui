// Expected backend endpoints:
// GET    /api/templates?page=0&size=20
// GET    /api/templates/search?q=text
// POST   /api/templates
// PUT    /api/templates/{logCode}
// DELETE /api/templates/{logCode}

import client from './client';
import type { LogTemplate, Page } from '../types';

export async function getTemplates(page = 0, size = 20): Promise<Page<LogTemplate>> {
  const { data } = await client.get('/api/templates', { params: { page, size } });
  return data;
}

export async function searchTemplates(query: string): Promise<LogTemplate[]> {
  const { data } = await client.get('/api/templates/search', { params: { q: query } });
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
