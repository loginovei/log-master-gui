import { applicationsApi } from './apiClient';
import type { Application } from '../types';

export async function getApplications(): Promise<Application[]> {
  const { data } = await applicationsApi.findAll1();
  return data.map(a => ({ code: a.code!, name: a.name! }));
}
