export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogTemplate {
  id?: string;
  logCode: string;
  messages: Record<string, string>; // { "ru": "Пользователь {0} вошёл", "en": "User {0} logged in" }
}

export interface LogEntry {
  id: string;
  logCode: string;
  params: Record<string, unknown>;
  timestamp: string;
  service: string;
  level: LogLevel;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface LogSearchParams {
  logCode?: string;
  service?: string;
  level?: LogLevel;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface DashboardStats {
  totalTemplates: number;
  totalEntries: number;
  entriesPerLevel: Partial<Record<LogLevel, number>>;
}
