import { APIRequestContext } from '@playwright/test';

export class APIProjectClient {
  private context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  async create(data: {
    userId: number;
    name: string;
    matterNumber: string;
    description: string;
    identifierColor: string;
    imagePath?: string;
    projectUserIds: number[];
    ownerId: number;
    leadPartnerId: number;
    categoryIds: number[];
    clientIds: number[];
    targets: Array<{
      id: number;
      sectors: number[];
      categories: number[];
    }>;
  }) {
    return this.context.post('/projects', {
      data,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  async find(query: { page?: number; limit?: number; withDeleted?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    if (query.page) searchParams.append('page', query.page.toString());
    if (query.limit) searchParams.append('limit', query.limit.toString());
    if (query.withDeleted !== undefined) searchParams.append('withDeleted', query.withDeleted.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/projects?${queryString}` : '/projects';
    
    return this.context.get(url);
  }

  async findOne(id: number, query: { withDeleted?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    if (query.withDeleted !== undefined) searchParams.append('withDeleted', query.withDeleted.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/projects/${id}?${queryString}` : `/projects/${id}`;
    
    return this.context.get(url);
  }

  async update(id: number, data: {
    name?: string;
    matterNumber?: string;
    description?: string;
    identifierColor?: string;
    imagePath?: string;
    projectUserIds?: number[];
    ownerId?: number;
    leadPartnerId?: number;
    categoryIds?: number[];
    clientIds?: number[];
    targets?: Array<{
      id: number;
      sectors: number[];
      categories: number[];
    }>;
  }) {
    // Ensure id is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('ID must be a positive integer');
    }
    
    return this.context.patch(`/projects/${id}`, {
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
    
    return this.context.delete(`/projects/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
} 