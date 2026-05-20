import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export type BounceType = 'hard_bounce' | 'soft_bounce' | 'unknown';
export type BounceStatus = 'active' | 'hard_bounce' | 'soft_bounce' | 'invalid_email' | 'unsubscribed';

export interface BounceEvent {
  id: number;
  email: string;
  bounce_type: BounceType;
  smtp_status: string;
  diagnostic_code: string;
  message_id: string;
  created_at: string;
}

export interface BounceStatusCount {
  status: string;
  count: number;
}

export interface BounceTypeCount {
  bounce_type: string;
  count: number;
}

export interface BounceStats {
  user_statuses: BounceStatusCount[];
  events_by_type: BounceTypeCount[];
  total_events: number;
}

export interface BounceEventsResponse {
  data: BounceEvent[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

type EventsParams = {
  page?: number;
  per_page?: number;
  email?: string;
  bounce_type?: BounceType | '';
};

const unwrap = <T>(body: unknown): T => {
  if (body && typeof body === 'object' && 'data' in body) return (body as { data: T }).data;
  return body as T;
};

export const emailBounceService = {
  async listEvents(params: EventsParams = {}): Promise<BounceEventsResponse> {
    const response = await apiClient.get<unknown>(API_ENDPOINTS.SETTINGS.EMAIL_BOUNCE_EVENTS, params);
    return unwrap<BounceEventsResponse>(response.data);
  },

  async stats(): Promise<BounceStats> {
    const response = await apiClient.get<unknown>(API_ENDPOINTS.SETTINGS.EMAIL_BOUNCE_STATS);
    return unwrap<BounceStats>(response.data);
  },

  async markStatus(emails: string[], status: BounceStatus): Promise<{ updated: number }> {
    const response = await apiClient.post<unknown>(
      API_ENDPOINTS.SETTINGS.EMAIL_BOUNCE_MARK,
      { emails, status },
    );
    return unwrap<{ updated: number }>(response.data);
  },

  async resetStatus(emails: string[]): Promise<{ updated: number }> {
    const response = await apiClient.post<unknown>(
      API_ENDPOINTS.SETTINGS.EMAIL_BOUNCE_RESET,
      { emails },
    );
    return unwrap<{ updated: number }>(response.data);
  },

  async processNow(): Promise<void> {
    await apiClient.post<unknown>(API_ENDPOINTS.SETTINGS.EMAIL_BOUNCE_PROCESS_NOW, {});
  },
};

export default emailBounceService;
