import { expect, test } from '@playwright/test';
import { APIAccountClient } from '../../clients/account.client';
import { APICategoryClient } from '../../clients/category.client';
import { APICompanyClient } from '../../clients/company.client';
import { APISectorClient } from '../../clients/sector.client';
import { generateEmail } from '../../utils/email.generator';
import { randomWordGenerator } from '../../utils/random.generator';
import { setupTestEnvironment } from '../../utils/setupUtil';

test.describe.configure({ mode: 'serial' });

test.describe('CompaniesController', () => {
  let companyClient: APICompanyClient;
  let accountClient: APIAccountClient;
  let sectorClient: APISectorClient;
  let categoryClient: APICategoryClient;

  let accountId: number;
  let sectorId: number;
  let categoryId: number;
  let companyId: number;
  let companyName: string;

  test.beforeAll(async () => {
    const context = await setupTestEnvironment();
    accountClient = new APIAccountClient(context);
    sectorClient = new APISectorClient(context);
    categoryClient = new APICategoryClient(context);
    companyClient = new APICompanyClient(context);

    // Create an account
    const accountResponse = await accountClient.create({
      isAdmin: false,
      organizationSize: '1-10',
    });
    const account = await accountResponse.json();
    accountId = account.id;

    // Create a sector
    const sectorResponse = await sectorClient.create({
      name: `Test Sector ${randomWordGenerator(7)}`,
    });
    const sector = await sectorResponse.json();
    sectorId = sector.id;

    // Create a category
    const categoryResponse = await categoryClient.create({
      name: `Test Category ${randomWordGenerator(7)}`,
    });
    const category = await categoryResponse.json();
    categoryId = category.id;
  });

  test('POST /companies should create a new company', async () => {
    companyName = `Test Company ${randomWordGenerator(7)}`;
    const newCompany = {
      name: companyName,
      address: '123 Test St',
      contact: generateEmail(),
      number: '1234567890',
      cityId: 1,
      stateId: 1,
      countryId: 1,
      categoryIds: [categoryId],
      sectorIds: [sectorId],
      accountId,
      type: 'LAWYER' as any,
    };

    const response = await companyClient.create(newCompany);
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody.name).toBe(newCompany.name);
    expect(responseBody.address).toBe(newCompany.address);
    expect(responseBody.contact).toBe(newCompany.contact);
    expect(responseBody.number).toBe(newCompany.number);
    
    // Check relations exist
    expect(responseBody).toHaveProperty('city');
    expect(responseBody).toHaveProperty('country');
    expect(responseBody).toHaveProperty('state');
    
    // Verify relations are objects with IDs
    expect(typeof responseBody.city?.id).toBe('number');
    expect(typeof responseBody.country?.id).toBe('number');
    expect(typeof responseBody.state?.id).toBe('number');
    
    companyId = responseBody.id;
  });

  test('GET /companies should return paginated companies', async () => {
    // Sort by ID DESC to ensure our newly created company is in the first page
    const response = await companyClient.find({
      sortBy: [['id', 'DESC']],
      page: 1,
      limit: 10
    });
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBe(true);
    // Since we sort by ID DESC, our newly created company should be in the first few results
    expect(responseBody.data.some((company: any) => company.id === companyId)).toBe(true);
    
    // Verify pagination properties
    expect(responseBody).toHaveProperty('meta');
    expect(responseBody.meta).toHaveProperty('itemsPerPage');
    expect(responseBody.meta).toHaveProperty('totalItems');
    expect(responseBody.meta).toHaveProperty('currentPage');
    expect(responseBody.meta).toHaveProperty('totalPages');
  });

  test('GET /companies/:id should return a specific company', async () => {
    const response = await companyClient.findOne(companyId);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id).toBe(companyId);
    expect(responseBody.name).toBe(companyName);
    expect(responseBody).toHaveProperty('categories');
    expect(responseBody).toHaveProperty('sectors');
  });

  test('PATCH /companies/:id should update a company', async () => {
    const updatedName = `Updated Company ${randomWordGenerator(7)}`;
    const updateData = {
      name: updatedName,
      address: '456 Updated St'
    };

    const response = await companyClient.update(companyId, updateData);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.name).toBe(updateData.name);
    expect(responseBody.address).toBe(updateData.address);
    // Verify other fields remain unchanged
    expect(responseBody.id).toBe(companyId);
  });

  test('DELETE /companies/:id should delete a company', async () => {
    const response = await companyClient.delete(companyId);
    expect(response.status()).toBe(204);

    // Verify company is deleted by trying to fetch it
    const getResponse = await companyClient.findOne(companyId);
    expect(getResponse.status()).toBe(404);
  });
});
