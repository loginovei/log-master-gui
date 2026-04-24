import { logTemplatesApi } from './apiClient';
import client from './client';
import type { LogLevel, LogTemplate, Page, TemplateSearchParams } from '../types';

export async function getTemplates(params: TemplateSearchParams = {}): Promise<Page<LogTemplate>> {
  const { data } = await logTemplatesApi.findAll(params.appCode, params.page ?? 0, params.size ?? 100);
  return {
    content: data.content?.map(toTemplate) ?? [],
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
    number: data.number ?? 0,
    size: data.size ?? 100,
  };
}

export async function searchTemplates(params: TemplateSearchParams): Promise<LogTemplate[]> {
  const { data } = await client.get('/api/templates/search', {
    params: { appCode: params.appCode, q: params.q, lang: params.lang },
  });
  return (data as any[]).map(toTemplate);
}

export async function createTemplate(template: Omit<LogTemplate, 'id'>): Promise<LogTemplate> {
  const { data } = await logTemplatesApi.create({
    logCode: template.logCode,
    appCode: template.appCode,
    level: template.level as any,
    messages: template.messages,
  });
  return toTemplate(data);
}

export async function updateTemplate(logCode: string, template: Omit<LogTemplate, 'id'>): Promise<LogTemplate> {
  const { data } = await logTemplatesApi.update(logCode, {
    logCode: template.logCode,
    appCode: template.appCode,
    level: template.level as any,
    messages: template.messages,
  });
  return toTemplate(data);
}

export async function deleteTemplate(logCode: string): Promise<void> {
  await logTemplatesApi._delete(logCode);
}

function toTemplate(r: { id?: string; logCode?: string; appCode?: string; level?: string; messages?: Record<string, string> }): LogTemplate {
  return {
    id: r.id,
    logCode: r.logCode ?? '',
    appCode: r.appCode ?? '',
    level: (r.level as LogLevel) ?? 'INFO',
    messages: r.messages ?? {},
  };
}
