import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface EmailVerificationUser {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
  email_verified_at?: string | null;
  email_status: string;
  reminder_count: number;
  last_reminder_sent_at?: string | null;
  last_checked_at?: string | null;
  last_error?: string | null;
  recommended_action: string;
}

export interface EmailVerificationStats {
  unverified: number;
  pending: number;
  reminder_1: number;
  reminder_2: number;
  reminder_3: number;
  exhausted: number;
  invalid: number;
  bounced: number;
  send_failed: number;
  ready_for_reminder: number;
}

export interface EmailVerificationListResponse {
  data: EmailVerificationUser[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SendReminderResult {
  sent: number;
  skipped: number;
  failed: number;
  invalid: number;
  processed_ids: number[];
  errors: string[];
}

type ListParams = {
  search?: string;
  email_status?: string;
  only?: string;
  page?: number;
  per_page?: number;
};

const unwrap = <T>(body: any): T => {
  if (body?.data) return body.data as T;
  return body as T;
};

export const emailVerificationService = {
  async list(params: ListParams): Promise<EmailVerificationListResponse> {
    const response = await apiClient.get<any>(API_ENDPOINTS.SETTINGS.EMAIL_VERIFICATION_USERS, params);
    return unwrap<EmailVerificationListResponse>(response.data);
  },

  async stats(): Promise<EmailVerificationStats> {
    const response = await apiClient.get<any>(API_ENDPOINTS.SETTINGS.EMAIL_VERIFICATION_STATS);
    return unwrap<EmailVerificationStats>(response.data);
  },

  async sendReminders(payload: { user_ids?: number[]; limit?: number; force?: boolean }): Promise<SendReminderResult> {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.SETTINGS.EMAIL_VERIFICATION_SEND_REMINDERS,
      payload,
      { timeout: 120000 }
    );
    return unwrap<SendReminderResult>(response.data);
  },

  async markInvalid(ids: number[], reason?: string): Promise<{ updated: number }> {
    const response = await apiClient.post<any>(API_ENDPOINTS.SETTINGS.EMAIL_VERIFICATION_MARK_INVALID, { ids, reason });
    return unwrap<{ updated: number }>(response.data);
  },

  async clearStatus(ids: number[]): Promise<{ updated: number }> {
    const response = await apiClient.post<any>(API_ENDPOINTS.SETTINGS.EMAIL_VERIFICATION_CLEAR_STATUS, { ids });
    return unwrap<{ updated: number }>(response.data);
  },

  async deleteUsers(ids: number[]): Promise<{ deleted: number }> {
    const response = await apiClient.post<any>(API_ENDPOINTS.SETTINGS.EMAIL_VERIFICATION_DELETE_USERS, { ids });
    return unwrap<{ deleted: number }>(response.data);
  },

  async deleteFiltered(params: Pick<ListParams, 'search' | 'email_status' | 'only'>): Promise<{ deleted: number }> {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.SETTINGS.EMAIL_VERIFICATION_DELETE_FILTERED,
      {
        ...params,
        confirm: 'DELETE_UNVERIFIED',
      },
      { timeout: 120000 }
    );
    return unwrap<{ deleted: number }>(response.data);
  },
};

export default emailVerificationService;
