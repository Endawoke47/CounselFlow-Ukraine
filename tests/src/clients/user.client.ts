import { APIRequestContext } from '@playwright/test';

export class APIUserClient {
  private context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  async create(userData: Record<string, any>) {
    const response = await this.context.post('/users/', {
      data: userData,
    });
    return response;
  }

  async find(params: { sortBy?: [string, string][]; page?: number; limit?: number } = {}) {
    const searchParams = new URLSearchParams();
    
    if (params.sortBy) {
      params.sortBy.forEach(([field, order]) => {
        searchParams.append('sortBy', `${field}:${order}`);
      });
    }
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const queryString = searchParams.toString();
    const finalUrl = `/users/${queryString ? '?' + queryString : ''}`;
    
    return this.context.get(finalUrl);
  }

  async getMe() {
    return this.context.get('/users/me');
  }

  async getCompanyUsers(companyId: number, params: { sortBy?: [string, string][]; page?: number; limit?: number } = {}) {
    const searchParams = new URLSearchParams();
    
    if (params.sortBy) {
      params.sortBy.forEach(([field, order]) => {
        searchParams.append('sortBy', `${field}:${order}`);
      });
    }
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const queryString = searchParams.toString();
    const finalUrl = `/users/company/${companyId}${queryString ? '?' + queryString : ''}`;
    
    return this.context.get(finalUrl);
  }

  async getAccountUsers(accountId: number, params: { sortBy?: [string, string][]; page?: number; limit?: number } = {}) {
    const searchParams = new URLSearchParams();
    
    if (params.sortBy) {
      params.sortBy.forEach(([field, order]) => {
        searchParams.append('sortBy', `${field}:${order}`);
      });
    }
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const queryString = searchParams.toString();
    const finalUrl = `/users/account/${accountId}${queryString ? '?' + queryString : ''}`;
    
    return this.context.get(finalUrl);
  }

  async update(id: number, userData: Record<string, any>) {
    const response = await this.context.patch(`/users/${id}`, {
      data: userData,
    });
    return response;
  }

  async delete(id: number) {
    const response = await this.context.delete(`/users/${id}`);
    return response;
  }

  async findOne(id: number) {
    const response = await this.context.get(`/users/${id}`);
    return response;
  }
}
