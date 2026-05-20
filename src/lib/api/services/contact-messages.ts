import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type { ContactMessage, PaginatedResponse } from '@/types';

export const contactMessagesService = {
  async list(page = 1): Promise<PaginatedResponse<ContactMessage>> {
    const response = await apiClient.get<PaginatedResponse<ContactMessage>>(
      `${API_ENDPOINTS.CONTACT_MESSAGES.LIST}?page=${page}`
    );
    return response.data;
  },

  async getById(id: number | string): Promise<ContactMessage> {
    const response = await apiClient.get<{ data: ContactMessage }>(
      API_ENDPOINTS.CONTACT_MESSAGES.SHOW(id)
    );
    return response.data.data;
  },

  async markAsRead(id: number | string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.CONTACT_MESSAGES.MARK_READ(id));
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CONTACT_MESSAGES.DELETE(id));
  },
};

export default contactMessagesService;
