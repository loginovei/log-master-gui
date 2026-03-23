import { Configuration } from './generated/configuration';
import { ApplicationsApi } from './generated/apis/applications-api';
import { LogTemplatesApi } from './generated/apis/log-templates-api';
import { LogsApi } from './generated/apis/logs-api';

const config = new Configuration({
  basePath: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/log-master',
});

export const applicationsApi = new ApplicationsApi(config);
export const logTemplatesApi = new LogTemplatesApi(config);
export const logsApi = new LogsApi(config);
