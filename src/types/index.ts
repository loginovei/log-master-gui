export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface Application {
  code: string;
  name: string;
}

export interface LogTemplate {
  id?: string;
  logCode: string;
  appCode: string;
  messages: Record<string, string>; // { "ru": "Пользователь {0} вошёл", "en": "User {0} logged in" }
}

export interface LogEntry {
  id: string;
  logCode: string;
  params: Record<string, unknown>;
  timestamp: string;
  service: string;
  level: LogLevel;
  stackTrace?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface LogSearchParams {
  appCode?: string;
  logCode?: string;
  service?: string;
  level?: LogLevel;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface TemplateSearchParams {
  appCode?: string;
  q?: string;
  lang?: string;
  page?: number;
  size?: number;
}

export interface AppStats {
  totalTemplates: number;
  totalEntries: number;
  entriesPerLevel: Partial<Record<LogLevel, number>>;
  entriesPerService: Record<string, number>;
  recentActivity: { date: string; count: number }[];
}
