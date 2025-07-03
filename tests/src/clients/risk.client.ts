import { APIRequestContext } from '@playwright/test';

// Define risk status and rating enums based on backend values
export enum RiskStatus {
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  PUBLISHED = 'Published',
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
  CANCELED = 'Canceled'
}

export enum RiskRating {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export class APIRiskClient {
  private context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  async create(data: {
    userId: number;
    projectId: number;
    title: string;
    description: string;
    riskStatus: RiskStatus;
    riskRating: RiskRating;
    assignedToId: number;
    categoryIds: number[];
    recommendations?: Array<{
      recommendation: string;
      details: string;
      dueDateOptionId?: number;
    }>;
    comments?: Array<{
      commentText: string;
    }>;
  }) {
    return this.context.post('/risks', {
      data,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  async find(query: { page?: number; limit?: number; projectId?: number; withDeleted?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    if (query.page) searchParams.append('page', query.page.toString());
    if (query.limit) searchParams.append('limit', query.limit.toString());
    if (query.projectId) searchParams.append('projectId', query.projectId.toString());
    if (query.withDeleted !== undefined) searchParams.append('withDeleted', query.withDeleted.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/risks?${queryString}` : '/risks';
    
    return this.context.get(url);
  }

  async findOne(id: number, query: { withDeleted?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    if (query.withDeleted !== undefined) searchParams.append('withDeleted', query.withDeleted.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/risks/${id}?${queryString}` : `/risks/${id}`;
    
    return this.context.get(url);
  }

  async update(id: number, data: {
    title?: string;
    description?: string;
    riskStatus?: RiskStatus;
    riskRating?: RiskRating;
    assignedToId?: number;
    categoryIds?: number[];
    recommendations?: Array<{
      id?: number;
      recommendation: string;
      details: string;
      dueDateOptionId?: number;
    }>;
    comments?: Array<{
      id?: number;
      commentText: string;
    }>;
  }) {
    // Ensure id is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('ID must be a positive integer');
    }
    
    return this.context.patch(`/risks/${id}`, {
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
    
    return this.context.delete(`/risks/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
} 