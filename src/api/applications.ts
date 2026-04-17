import { applicationsApi } from './apiClient';
import type { Application } from '../types';

export async function getApplications(): Promise<Application[]> {
  const { data } = await applicationsApi.findAll1();
  return data.map(a => ({ code: a.code!, name: a.name! }));
}

export async function createApplication(code: string, name: string): Promise<Application> {
  const { data } = await applicationsApi.create1({ code, name });
  return { code: data.code!, name: data.name! };
}

export async function deleteApplication(code: string): Promise<void> {
  await applicationsApi.delete1(code);
}
