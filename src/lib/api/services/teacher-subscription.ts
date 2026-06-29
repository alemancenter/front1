import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export type TeacherAcademicClass = { id: number; grade_name: string; grade_level: number };
export type TeacherAcademicSubject = { id: number; subject_name: string; grade_level: number };
export type TeacherAcademicSemester = { id: number; semester_name: string; grade_level?: number; class_id?: number; school_class_id?: number };

function unwrapAcademicList<T = any>(response: any, nestedKey?: string): T[] {
  const body = response?.data ?? response;
  const data = body?.data ?? body;

  if (Array.isArray(data)) return data as T[];
  if (nestedKey && Array.isArray(data?.[nestedKey])) return data[nestedKey] as T[];
  if (Array.isArray(data?.items)) return data.items as T[];
  if (Array.isArray(data?.results)) return data.results as T[];
  if (Array.isArray(body?.data?.data)) return body.data.data as T[];

  return [];
}



export type TeacherUserMini = { id: number; name: string; email: string };

export type TeacherPlan = {
  id: number;
  code: string;
  name: string;
  description: string;
  price_jod: number;
  currency: string;
  duration_days: number;
  device_limit: number;
  download_limit: number;
  ai_generation_limit: number;
  export_limit: number;
  features_json?: string;
  permissions_json?: string;
  limits_json?: string;
  sort_order?: number;
};

export type TeacherSubscription = {
  id: number;
  status: string;
  starts_at: string;
  ends_at: string;
  price_jod: number;
  device_limit: number;
  download_limit: number;
  ai_generation_limit: number;
  export_limit: number;
  plan?: TeacherPlan;
  user?: TeacherUserMini;
};

export type TeacherOrder = {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  amount_jod: number;
  currency: string;
  payment_method: string;
  payer_name: string;
  phone: string;
  payment_reference: string;
  payment_proof_url: string;
  admin_note?: string;
  created_at: string;
  reviewed_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  plan?: TeacherPlan;
};

export type TeacherDevice = {
  id: number;
  label: string;
  user_agent: string;
  is_active: boolean;
  last_seen_at?: string;
  created_at: string;
  user?: TeacherUserMini;
};

export type TeacherPlanDesign = {
  code: string;
  name: string;
  price_jod: number;
  currency: string;
  duration_days: number;
  features: string[];
  permissions: string[];
  admin_permissions?: string[];
  limits: {
    devices: number;
    premium_downloads: number;
    ai_generations: number;
    exports: number;
  };
};

export type TeacherAccess = {
  has_active: boolean;
  permissions: string[];
  allowed: Record<string, boolean>;
  limits: Record<string, number>;
  usage: {
    downloads: number;
    ai_generations: number;
  };
  subscription?: TeacherSubscription;
};

export type TeacherSummary = {
  plan: TeacherPlan;
  subscription?: TeacherSubscription;
  orders: TeacherOrder[];
  devices?: TeacherDevice[];
  usage: {
    downloads: number;
    ai_generations: number;
  };
  has_active: boolean;
  can_create_order: boolean;
  plan_design: TeacherPlanDesign;
  access: TeacherAccess;
};

export type TeacherWorkspaceSummary = {
  subject: string;
  subscription?: TeacherSubscription;
  usage: Record<string, number>;
  limits: Record<string, number>;
  stats: Record<string, number>;
  quick_links: {
    title: string;
    description: string;
    href: string;
    category: string;
  }[];
};

export type TeacherPremiumFile = {
  id: number;
  file_name: string;
  file_type: string;
  file_category: string;
  file_size: number;
  mime_type: string;
  premium_category: string;
  premium_subject: string;
  is_premium: boolean;
  premium_audience?: string;
  premium_requires_subscription?: boolean;
  download_count: number;
  created_at: string;
  article_title?: string;
  subject_name?: string;
  semester_name?: string;
};

export type TeacherPremiumDownloadLog = {
  id: number;
  user_id: number;
  subscription_id: number;
  premium_file_id?: number;
  country: string;
  file_title: string;
  original_filename: string;
  subject_name: string;
  category: string;
  file_size: number;
  mime_type: string;
  download_code: string;
  ip_hash: string;
  user_agent_hash: string;
  created_at: string;
  user?: TeacherUserMini;
};

export type TeacherFinancialReport = {
  total_revenue_jod: number;
  current_month_revenue_jod: number;
  approved_orders: number;
  pending_orders: number;
  rejected_orders: number;
  active_subscriptions: number;
  expired_subscriptions: number;
};

export type TeacherMetricItem = {
  label: string;
  value: number;
  extra?: string;
};

export type TeacherUsageAnalytics = {
  total_downloads: number;
  total_ai_generations: number;
  total_premium_files: number;
  total_teachers: number;
  active_devices: number;
  top_subjects: TeacherMetricItem[];
  top_categories: TeacherMetricItem[];
  top_downloaded_files: TeacherMetricItem[];
  most_active_teachers: TeacherMetricItem[];
};

export type TeacherAdminDetail = {
  user?: TeacherUserMini;
  profile?: TeacherProfile;
  subscription?: TeacherSubscription;
  devices: TeacherDevice[];
  downloads: TeacherPremiumDownloadLog[];
  ai_generations: TeacherAIGenerationLog[];
  orders: TeacherOrder[];
  audit_logs: TeacherAuditLog[];
};

export type TeacherOrderDetail = {
  order: TeacherOrder;
  profile?: TeacherProfile;
  has_proof: boolean;
  proof_url?: string;
  proof_filename?: string;
};

export type TeacherAIGeneratePayload = {
  tool_type: string;
  title: string;
  prompt?: string;
  grade?: string;
  subject?: string; // ignored by backend; subject is locked to teacher subscription
  semester?: string;
};

export type TeacherAIGenerateResult = {
  id: number;
  tool_type: string;
  title: string;
  output: string;
  model: string;
  created_at: string;
};

export type TeacherNotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  url?: string;
  read_at?: string | null;
  created_at: string;
};

export type TeacherPaymentSetting = {
  id: number;
  provider: string;
  display_name: string;
  instructions: string;
  is_active: boolean;
};

export type TeacherAIGenerationLog = {
  id: number;
  user_id: number;
  subscription_id: number;
  tool_type: string;
  title: string;
  model: string;
  created_at: string;
  user?: TeacherUserMini;
};

export type TeacherLibraryItem = {
  id: number;
  item_type: string;
  item_id?: number;
  title: string;
  source_type: string;
  category: string;
  country: string;
  created_at: string;
};

export type TeacherAdminDashboard = {
  stats: Record<string, number>;
  plan: TeacherPlanDesign;
  recent_orders: TeacherOrder[];
};

export type TeacherProfile = {
  id: number;
  user_id: number;
  subject: string;
  school: string;
  phone: string;
  city: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

export type TeacherAdminSubscription = TeacherSubscription & {
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

export const TEACHER_PREMIUM_CATEGORY_GROUPS = {
  all: '',
  exams: 'exam',
  exam: 'exam',
  answer_key: 'answer_key',
  plans: 'plan',
  plan: 'plan',
  content_analysis: 'content_analysis',
  worksheets: 'worksheet',
  worksheet: 'worksheet',
  remedial_plan: 'remedial_plan',
  question_bank: 'question_bank',
  final_review: 'final_review',
} as const;

export type TeacherPremiumCategoryKey = keyof typeof TEACHER_PREMIUM_CATEGORY_GROUPS;

export type TeacherAuditLog = {
  id: number;
  actor_id?: number;
  user_id?: number;
  entity_type: string;
  entity_id: number;
  action: string;
  note: string;
  ip_hash: string;
  created_at: string;
  actor?: TeacherUserMini;
  user?: TeacherUserMini;
};

export type TeacherPremiumFileDetail = {
  file: TeacherPremiumVaultFile;
  downloads: TeacherPremiumDownloadLog[];
  audit_logs: TeacherAuditLog[];
};

export type TeacherPremiumVaultFile = {
  id: number;
  title: string;
  description: string;
  country: string;
  grade_level?: number;
  grade_name: string;
  subject_id?: number;
  subject_name: string;
  semester_id?: number;
  semester_name: string;
  category: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  is_active: boolean;
  download_count: number;
  created_at: string;
};

export type TeacherPremiumFileAdminPayload = {
  country?: string;
  is_premium: boolean;
  premium_audience?: string;
  premium_category?: string;
  premium_subject?: string;
  premium_requires_subscription?: boolean;
};

export type CreateTeacherOrderPayload = {
  subject?: string;
  school?: string;
  city?: string;
  phone?: string;
  payment_method: string;
  payer_name?: string;
  payment_reference?: string;
  payment_proof_url?: string;
};

function unwrap<T>(responseData: any): T {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data as T;
  }
  return responseData as T;
}

export const teacherSubscriptionService = {
  async getDesign(): Promise<TeacherPlanDesign> {
    const response = await apiClient.get<any>('/teacher-subscription/design', undefined, {
      cache: 'no-store',
      retries: 1,
    });
    return unwrap<TeacherPlanDesign>(response.data);
  },

  async getPlan(): Promise<TeacherPlan> {
    const response = await apiClient.get<any>('/teacher-subscription/plan', undefined, {
      cache: 'no-store',
      retries: 1,
    });
    return unwrap<TeacherPlan>(response.data);
  },

  async me(): Promise<TeacherSummary> {
    const response = await apiClient.get<any>('/teacher-subscription/me', undefined, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherSummary>(response.data);
  },

  async access(): Promise<TeacherAccess> {
    const response = await apiClient.get<any>('/teacher-subscription/access', undefined, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherAccess>(response.data);
  },

  async workspace(): Promise<TeacherWorkspaceSummary> {
    const response = await apiClient.get<any>('/teacher-subscription/workspace', undefined, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherWorkspaceSummary>(response.data);
  },

  async files(params: { category?: string; q?: string; page?: number; country?: string } = {}): Promise<any> {
    const response = await apiClient.get<any>('/teacher-subscription/files', params, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async library(page = 1): Promise<any> {
    const response = await apiClient.get<any>('/teacher-subscription/library', { page }, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async saveLibraryItem(payload: Partial<TeacherLibraryItem>): Promise<TeacherLibraryItem> {
    const response = await apiClient.post<any>('/teacher-subscription/library', payload, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherLibraryItem>(response.data);
  },

  async downloads(page = 1): Promise<any> {
    const response = await apiClient.get<any>('/teacher-subscription/downloads', { page }, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async aiGenerations(page = 1): Promise<any> {
    const response = await apiClient.get<any>('/teacher-subscription/ai-generations', { page }, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async createOrder(payload: CreateTeacherOrderPayload): Promise<TeacherOrder> {
    const response = await apiClient.post<any>('/teacher-subscription/orders', payload, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherOrder>(response.data);
  },

  async listDevices(): Promise<TeacherDevice[]> {
    const response = await apiClient.get<any>('/teacher-subscription/devices', undefined, {
      cache: 'no-store',
    });
    return unwrap<TeacherDevice[]>(response.data);
  },

  async deactivateDevice(id: number | string): Promise<void> {
    await apiClient.delete(`/teacher-subscription/devices/${id}`);
  },

  async adminAcademicClasses(country_id = '1'): Promise<TeacherAcademicClass[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.SCHOOL_CLASSES.LIST, {
      country_id,
      per_page: 500,
    }, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrapAcademicList<TeacherAcademicClass>(response);
  },

  async adminAcademicSubjectsByClass(classId: number | string, country_id = '1'): Promise<TeacherAcademicSubject[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.FILTER.SUBJECTS_BY_CLASS(classId), {
      country_id,
    }, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrapAcademicList<TeacherAcademicSubject>(response);
  },

  async adminAcademicSemestersBySubject(subjectId: number | string, country_id = '1', gradeLevel?: number | string): Promise<TeacherAcademicSemester[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.FILTER.SEMESTERS_BY_SUBJECT(subjectId), {
      country_id,
    }, {
      cache: 'no-store',
      retries: 0,
    });

    let semesters = unwrapAcademicList<TeacherAcademicSemester>(response, 'semesters');

    if (semesters.length === 0 && gradeLevel) {
      const fallback = await apiClient.get<any>(API_ENDPOINTS.SEMESTERS.LIST, {
        country_id,
        per_page: 500,
      }, {
        cache: 'no-store',
        retries: 0,
      });

      const allSemesters = unwrapAcademicList<TeacherAcademicSemester>(fallback);
      const grade = Number(gradeLevel);
      semesters = allSemesters.filter((semester) => {
        const semesterGrade = Number(semester.grade_level ?? semester.class_id ?? semester.school_class_id ?? 0);
        return semesterGrade === grade;
      });
    }

    return semesters;
  },

  async downloadPremiumFile(id: number | string, country = 'jo'): Promise<void> {
    const { blob, filename } = await apiClient.downloadBlob(
      `/teacher-subscription/premium-files/${id}/download`,
      { country },
      { cache: 'no-store', retries: 0 }
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'teacher-premium-file';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getPremiumDownloadUrl(id: number | string, country = 'jo'): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082/api';
    return `${baseUrl}/teacher-subscription/premium-files/${id}/download?country=${country}`;
  },

  async paymentSettings(): Promise<TeacherPaymentSetting[]> {
    const response = await apiClient.get<any>('/teacher-subscription/payment-settings', {}, { cache: 'no-store', retries: 0 });
    return unwrap<TeacherPaymentSetting[]>(response.data) || [];
  },

  async createOrderWithProof(formData: FormData): Promise<TeacherOrder> {
    const response = await apiClient.post<any>('/teacher-subscription/orders/with-proof', formData, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherOrder>(response.data);
  },

  async generateAI(payload: TeacherAIGeneratePayload): Promise<TeacherAIGenerateResult> {
    const response = await apiClient.post<any>('/teacher-subscription/ai/generate', payload, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherAIGenerateResult>(response.data);
  },

  async exportAI(id: number | string, format: 'word' | 'pdf' = 'word'): Promise<void> {
    const { blob, filename } = await apiClient.downloadBlob(`/teacher-subscription/ai-generations/${id}/export`, { format }, {
      cache: 'no-store',
      retries: 0,
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `teacher-ai-${id}.${format === 'pdf' ? 'html' : 'doc'}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async teacherNotifications(params: { page?: number; per_page?: number } = {}): Promise<any> {
    const response = await apiClient.get<any>('/teacher-subscription/notifications', params, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async adminFinancialReport(): Promise<TeacherFinancialReport> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/reports/finance', {}, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherFinancialReport>(response.data);
  },

  async adminUsageAnalytics(): Promise<TeacherUsageAnalytics> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/reports/analytics', {}, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherUsageAnalytics>(response.data);
  },

  async adminTeacherDetail(userId: number | string): Promise<TeacherAdminDetail> {
    const response = await apiClient.get<any>(`/dashboard/teacher-subscriptions/teachers/${userId}/detail`, {}, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherAdminDetail>(response.data);
  },

  async adminDeactivateTeacherDevice(deviceId: number | string, payload: { user_id?: number; note?: string } = {}): Promise<any> {
    const response = await apiClient.post<any>(`/dashboard/teacher-subscriptions/devices/${deviceId}/deactivate`, payload, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async adminGetPremiumVaultFileDetail(id: number | string, country = 'jo'): Promise<TeacherPremiumFileDetail> {
    const response = await apiClient.get<any>(`/dashboard/teacher-subscriptions/premium-files/${id}/detail`, { country }, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherPremiumFileDetail>(response.data);
  },

  async adminArchivePremiumVaultFile(id: number | string, reason = '', country = 'jo'): Promise<TeacherPremiumVaultFile> {
    const response = await apiClient.post<any>(`/dashboard/teacher-subscriptions/premium-files/${id}/archive`, { reason, country }, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherPremiumVaultFile>(response.data);
  },

  async adminRenewSubscription(id: number | string, payload: { ends_at?: string; extra_days?: number; admin_note?: string }): Promise<TeacherSubscription> {
    const response = await apiClient.post<any>(`/dashboard/teacher-subscriptions/subscriptions/${id}/renew`, payload, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherSubscription>(response.data);
  },

  async adminRunExpiryMaintenance(): Promise<Record<string, number>> {
    const response = await apiClient.post<any>('/dashboard/teacher-subscriptions/maintenance/expire', {}, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<Record<string, number>>(response.data);
  },

  async adminListAuditLogs(params: { entity_type?: string; entity_id?: number; page?: number } = {}): Promise<any> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/audit-logs', params, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async adminUploadPremiumVaultFile(formData: FormData): Promise<TeacherPremiumVaultFile> {
    const response = await apiClient.post<any>('/dashboard/teacher-subscriptions/premium-files/upload', formData, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherPremiumVaultFile>(response.data);
  },

  async adminListPremiumFiles(params: { country?: string; q?: string; active?: string; category?: string; subject?: string; page?: number } = {}): Promise<any> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/premium-files', params, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async adminUpdatePremiumVaultFile(id: number | string, payload: Partial<TeacherPremiumVaultFile> & { country?: string; is_active?: boolean }): Promise<TeacherPremiumVaultFile> {
    const response = await apiClient.post<any>(`/dashboard/teacher-subscriptions/premium-files/${id}`, payload, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherPremiumVaultFile>(response.data);
  },

  async adminUpdatePremiumFile(id: number | string, payload: TeacherPremiumFileAdminPayload): Promise<TeacherPremiumFile> {
    const response = await apiClient.post<any>(`/dashboard/teacher-subscriptions/premium-files/${id}`, payload, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherPremiumFile>(response.data);
  },

  async adminDisablePremiumFile(id: number | string, country = 'jo'): Promise<TeacherPremiumFile> {
    const response = await apiClient.post<any>(`/dashboard/teacher-subscriptions/premium-files/${id}/disable`, { country }, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherPremiumFile>(response.data);
  },

  async adminDashboard(): Promise<TeacherAdminDashboard> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/dashboard', undefined, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherAdminDashboard>(response.data);
  },

  async adminListSubscriptions(params: { status?: string; q?: string; page?: number } = {}): Promise<any> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/subscriptions', params, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async adminListTeachers(params: { q?: string; page?: number } = {}): Promise<any> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/teachers', params, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async adminListDevices(params: { user_id?: number; active?: string; page?: number } = {}): Promise<any> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/devices', params, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async adminListDownloads(params: { user_id?: number; page?: number } = {}): Promise<any> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/downloads', params, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async adminListAIGenerations(params: { user_id?: number; page?: number } = {}): Promise<any> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/ai-generations', params, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async adminGetOrderDetail(id: number | string): Promise<TeacherOrderDetail> {
    const response = await apiClient.get<any>(`/dashboard/teacher-subscriptions/orders/${id}`, {}, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherOrderDetail>(response.data);
  },

  async adminListOrders(status = 'pending', page = 1): Promise<any> {
    const response = await apiClient.get<any>('/dashboard/teacher-subscriptions/orders', {
      status,
      page,
    }, {
      cache: 'no-store',
      retries: 0,
    });
    return response.data;
  },

  async adminCancelSubscription(id: number | string, admin_note = ''): Promise<TeacherSubscription> {
    const response = await apiClient.post<any>(`/dashboard/teacher-subscriptions/subscriptions/${id}/cancel`, {
      admin_note,
    }, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherSubscription>(response.data);
  },

  async adminRemoveTeacherMembership(userId: number | string, admin_note = ''): Promise<void> {
    await apiClient.post(`/dashboard/teacher-subscriptions/teachers/${userId}/remove-membership`, {
      admin_note,
    }, {
      cache: 'no-store',
      retries: 0,
    });
  },

  async adminApproveOrder(id: number | string, admin_note = ''): Promise<TeacherSubscription> {
    const response = await apiClient.post<any>(`/dashboard/teacher-subscriptions/orders/${id}/approve`, {
      admin_note,
    }, {
      cache: 'no-store',
      retries: 0,
    });
    return unwrap<TeacherSubscription>(response.data);
  },

  async adminRejectOrder(id: number | string, admin_note = ''): Promise<void> {
    await apiClient.post(`/dashboard/teacher-subscriptions/orders/${id}/reject`, {
      admin_note,
    }, {
      cache: 'no-store',
      retries: 0,
    });
  },
};

export default teacherSubscriptionService;
