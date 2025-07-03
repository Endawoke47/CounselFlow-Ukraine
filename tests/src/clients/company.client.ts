 import { APIRequestContext, APIResponse } from '@playwright/test';
import { CreateCompanyDto } from '../../../1pd-be/src/modules/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '../../../1pd-be/src/modules/companies/dto/update-company.dto';

export class APICompanyClient {
  private context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<APIResponse> {
    return this.context.post('/companies', {
      data: createCompanyDto,
    });
  }

  async find(params?: {
    sortBy?: [string, string][];
    page?: number;
    limit?: number;
  }): Promise<APIResponse> {
    const searchParams = new URLSearchParams();
    
    console.log('Received params:', params);
    
    if (params?.sortBy) {
      params.sortBy.forEach(([field, order]) => {
        const sortParam = `${field}:${order}`;
        console.log('Adding sort parameter:', sortParam);
        searchParams.append('sortBy', sortParam);
      });
    }
    if (params?.page) {
      console.log('Adding page parameter:', params.page);
      searchParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      console.log('Adding limit parameter:', params.limit);
      searchParams.append('limit', params.limit.toString());
    }

    const queryString = searchParams.toString();
    const finalUrl = `/companies${queryString ? '?' + queryString : ''}`;
    console.log('Final request URL:', finalUrl);
    
    return this.context.get(finalUrl);
  }

  async findByAccountId(accountId: number): Promise<APIResponse> {
    return this.context.get(`/companies/accounts/${accountId}/companies`);
  }

  async findOne(id: number): Promise<APIResponse> {
    return this.context.get(`/companies/${id}`);
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<APIResponse> {
    return this.context.patch(`/companies/${id}`, {
      data: updateCompanyDto,
    });
  }

  async delete(id: number): Promise<APIResponse> {
    return this.context.delete(`/companies/${id}`);
  }
}
