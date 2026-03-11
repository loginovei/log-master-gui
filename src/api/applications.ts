// GET /api/applications

import client from './client';
import type { Application } from '../types';

export async function getApplications(): Promise<Application[]> {
  const { data } = await client.get('/api/applications');
  return data;
}
