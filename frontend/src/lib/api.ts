import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const aiApi = {
  getFrameworks: async () => {
    const response = await apiClient.get('/ai/frameworks');
    return response.data;
  },
  chat: async (query: string, frameworkId: string, context: string = '') => {
    const response = await apiClient.post('/ai/chat', {
      query,
      framework_id: frameworkId,
      context,
    });
    return response.data;
  },
  generateSection: async (sectionName: string, frameworkId: string, data: string) => {
    const response = await apiClient.post('/ai/generate-section', {
      section_name: sectionName,
      framework_id: frameworkId,
      data,
    });
    return response.data;
  },
  rewrite: async (content: string, instruction: string) => {
    const response = await apiClient.post('/ai/rewrite', {
      content,
      instruction,
    });
    return response.data;
  },
  uploadDocument: async (file: File, frameworkId: string = 'GRI') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('framework_id', frameworkId);
    const response = await apiClient.post('/ai/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const analyticsApi = {
  getReadiness: async (frameworkId: string = 'GRI') => {
    const response = await apiClient.get('/analytics/readiness', {
      params: { framework_id: frameworkId },
    });
    return response.data;
  },
  getStats: async () => {
    const response = await apiClient.get('/analytics/stats');
    return response.data;
  },
};

export const healthApi = {
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};
