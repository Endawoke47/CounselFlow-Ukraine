import { APIRequestContext, APIResponse } from '@playwright/test';

export class APISectorClient {
  private context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  async create(data: { name: string }): Promise<APIResponse> {
    return this.context.post('/sectors', { data });
  }

  async find(params?: {
    sortBy?: [string, string][];
    page?: number;
    limit?: number;
  }): Promise<APIResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.sortBy) {
      params.sortBy.forEach(([field, order]) => {
        searchParams.append('sortBy', `${field}:${order}`);
      });
    }
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const queryString = searchParams.toString();
    const finalUrl = `/sectors${queryString ? '?' + queryString : ''}`;
    
    return this.context.get(finalUrl);
  }

  async findOne(id: number): Promise<APIResponse> {
    return this.context.get(`/sectors/${id}`);
  }

  async update(id: number, data: { name?: string }): Promise<APIResponse> {
    return this.context.patch(`/sectors/${id}`, { data });
  }

  async delete(id: number): Promise<APIResponse> {
    return this.context.delete(`/sectors/${id}`);
  }
}
