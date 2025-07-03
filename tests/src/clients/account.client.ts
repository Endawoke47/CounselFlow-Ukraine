import { APIRequestContext } from '@playwright/test';

export class APIAccountClient {
  private context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  async create(createDto: { isAdmin: boolean; organizationSize: string }) {
    return this.context.post('/accounts', {
      data: createDto,
    });
  }

  async find(query: { page?: number; limit?: number; withDeleted?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    if (query.page) searchParams.append('page', query.page.toString());
    if (query.limit) searchParams.append('limit', query.limit.toString());
    if (query.withDeleted !== undefined) searchParams.append('withDeleted', query.withDeleted.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/accounts?${queryString}` : '/accounts';
    
    return this.context.get(url);
  }

  async findOne(id: number, query: { withDeleted?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    if (query.withDeleted !== undefined) searchParams.append('withDeleted', query.withDeleted.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/accounts/${id}?${queryString}` : `/accounts/${id}`;
    
    return this.context.get(url);
  }

  async update(
    id: number,
    updateDto: { isAdmin: boolean; organizationSize: string },
  ) {
    return this.context.patch(`/accounts/${id}`, {
      data: updateDto,
    });
  }

  async delete(id: number) {
    return this.context.delete(`/accounts/${id}`);
  }

  async restore(id: number) {
    return this.context.post(`/accounts/${id}/restore`);
  }
}
