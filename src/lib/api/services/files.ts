import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { FileAttachment, PaginatedResponse } from '@/types';

type FileFilters = Record<string, string | number | boolean | undefined> & {
  country?: string;
  category?: string;
  search?: string;
  page?: number;
  per_page?: number;
};

function toCounter(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value);
  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }
  return 0;
}

function normalizeFileViews(file: FileAttachment): FileAttachment {
  const raw = file as FileAttachment & { view_count?: unknown; views?: unknown; download_count?: unknown };
  const views = Math.max(
    toCounter(raw.views_count),
    toCounter(raw.view_count),
    toCounter(raw.views)
  );
  const downloads = toCounter(raw.download_count);
  return {
    ...file,
    views_count: views,
    view_count: views,
    views,
    download_count: downloads,
  } as FileAttachment;
}

interface FileFormData {
  country: string;
  article_id: number;
  file_category: string;
  file: File;
}

export const filesService = {
  /**
   * Get files list with filters
   */
  async getAll(filters?: FileFilters): Promise<PaginatedResponse<FileAttachment>> {
    const response = await apiClient.get<PaginatedResponse<FileAttachment>>(
      API_ENDPOINTS.FILES.LIST,
      filters
    );
    const payload = response.data as unknown as PaginatedResponse<FileAttachment>;
    return {
      ...payload,
      data: Array.isArray(payload.data) ? payload.data.map(normalizeFileViews) : [],
    };
  },

  /**
   * Get single file by ID
   */
  async getById(id: number | string, country: string = '1'): Promise<FileAttachment> {
    const response = await apiClient.get<{ data: FileAttachment } | FileAttachment>(
      API_ENDPOINTS.FILES.SHOW(id),
      { country }
    );
    return normalizeFileViews(((response.data as any).data || response.data) as FileAttachment);
  },

  /**
   * Upload new file
   */
  async upload(data: FileFormData): Promise<FileAttachment> {
    const formData = new FormData();
    formData.append('country', data.country);
    formData.append('article_id', String(data.article_id));
    formData.append('file_category', data.file_category);
    formData.append('file', data.file);

    const response = await apiClient.upload<{ data: FileAttachment } | FileAttachment>(
      API_ENDPOINTS.FILES.STORE,
      formData
    );
    return normalizeFileViews(((response.data as any).data || response.data) as FileAttachment);
  },

  /**
   * Update file
   */
  async update(id: number | string, data: {
    country: string;
    article_id: number;
    file_category: string;
    file?: File;
  }): Promise<FileAttachment> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('country', data.country);
    formData.append('article_id', String(data.article_id));
    formData.append('file_category', data.file_category);
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await apiClient.upload<{ data: FileAttachment } | FileAttachment>(
      API_ENDPOINTS.FILES.UPDATE(id),
      formData
    );
    return normalizeFileViews(((response.data as any).data || response.data) as FileAttachment);
  },

  /**
   * Increment file view counter and return normalized counters.
   */
  async incrementView(id: number | string, country: string = '1'): Promise<FileAttachment> {
    const response = await apiClient.post<{ data: FileAttachment } | FileAttachment>(
      API_ENDPOINTS.FILES.INCREMENT_VIEW(id),
      { country }
    );
    return normalizeFileViews(((response.data as any).data || response.data) as FileAttachment);
  },

  /**
   * Delete file
   */
  async delete(id: number | string, country: string = '1'): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string } | { data: { message: string } }>(
      API_ENDPOINTS.FILES.DELETE(id),
      { country }
    );
    return 'data' in response.data ? response.data.data : response.data;
  },

  /**
   * Get file download URL
   */
  getDownloadUrl(id: number | string): string {
    return `${API_ENDPOINTS.FILES.DOWNLOAD(id)}`;
  },
};

export default filesService;
