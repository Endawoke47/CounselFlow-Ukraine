import { APIRequestContext } from '@playwright/test';

export class APIAdminClient {
  private context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  async createAdminAccount() {
    return this.context.post('/admin/create-admin-account');
  }

  async createLawyerAccount(data: any) {
    return this.context.post('/admin/create-lawyer-account', { data });
  }
}
