/**
 * Common types and interfaces shared across the application
 */

export interface KeyValue {
  [s: string]: any;
}

export type WsMessage = {
  id: string;
  level: string;
  label: string;
  value: string;
  time: number;
};

export interface Action {
  type: string;
  action: string;
  deviceId?: string;
  entityId?: string;
}

export interface MQTTMessage {
  topic: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterOptions {
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
