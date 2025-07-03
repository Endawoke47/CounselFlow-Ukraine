import { APIRequestContext } from '@playwright/test';

export class APICategoryClient {
  private context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  async create(data: { name: string }) {
    return this.context.post('/categories', {
      data,
    });
  }

  async find() {
    return this.context.get('/categories');
  }

  async update(id: number, data: { name?: string }) {
    // Ensure id is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('ID must be a positive integer');
    }
    
    return this.context.patch(`/categories/${id}`, {
      data,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  async delete(id: number) {
    // Ensure id is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('ID must be a positive integer');
    }
    
    return this.context.delete(`/categories/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
