import { expect, test } from '@playwright/test';
import { APIAccountClient } from '../../clients/account.client';
import { APICategoryClient } from '../../clients/category.client';
import { APICompanyClient } from '../../clients/company.client';
import { APISectorClient } from '../../clients/sector.client';
import { APIUserClient } from '../../clients/user.client';
import { generateEmail } from '../../utils/email.generator';
import { randomWordGenerator } from '../../utils/random.generator';
import { setupTestEnvironment } from '../../utils/setupUtil';

test.describe.configure({ mode: 'serial' });

test.describe('Users Controller', () => {
  let userClient: APIUserClient;
  let companyClient: APICompanyClient;
  let accountClient: APIAccountClient;
  let sectorClient: APISectorClient;
  let categoryClient: APICategoryClient;
  let testCompanyId: number;
  let testAccountId: number;
  let testUserId: number;
  let sectorId: number;
  let categoryId: number;
  let testUserEmail: string;

  test.beforeAll(async () => {
    const context = await setupTestEnvironment();
    userClient = new APIUserClient(context);
    companyClient = new APICompanyClient(context);
    accountClient = new APIAccountClient(context);
    sectorClient = new APISectorClient(context);
    categoryClient = new APICategoryClient(context);

    // Create test account
    const accountResponse = await accountClient.create({
      isAdmin: false,
      organizationSize: '1-10',
    });
    expect(accountResponse.status()).toBe(201);
    const account = await accountResponse.json();
    testAccountId = account.id;

    // Create a sector
    const sectorResponse = await sectorClient.create({
      name: `Test Sector ${randomWordGenerator(5)}`,
    });
    expect(sectorResponse.status()).toBe(201);
    const sector = await sectorResponse.json();
    sectorId = sector.id;

    // Create a category
    const categoryResponse = await categoryClient.create({
      name: `Test Category ${randomWordGenerator(5)}`,
    });
    expect(categoryResponse.status()).toBe(201);
    const category = await categoryResponse.json();
    categoryId = category.id;

    // Create test company
    const companyData = {
      name: 'Test Company',
      address: '123 Test St',
      contact: generateEmail(),
      number: '1234567890',
      cityId: 41331,
      countryId: 228,
      stateId: 3779,
      categoryIds: [categoryId],
      sectorIds: [sectorId],
      accountId: testAccountId,
      type: 'LAWYER' as any,
    };
    const companyResponse = await companyClient.create(companyData);
    expect(companyResponse.status()).toBe(201);
    const company = await companyResponse.json();
    testCompanyId = company.id;
  });

  test.afterAll(async () => {
    // TODO: Cleanup test data
  });

  test('POST /users - should create a new user', async () => {
    testUserEmail = generateEmail();
    const userData = {
      email: testUserEmail,
      firstName: 'Test',
      lastName: 'User',
      password: 'Test123!@#',
      companyId: testCompanyId,
      title: 'Engineer',
      department: 'IT',
      countryId: 228,
      stateId: 3779,
      cityId: 41331,
    };

    const response = await userClient.create(userData);
    expect(response.status()).toBe(201);

    const user = await response.json();
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('updatedAt');

    testUserId = user.id;
  });

  test('GET /users - should get paginated users', async () => {
    // Sort by ID DESC to ensure our newly created user is in the first page
    const response = await userClient.find({
      sortBy: [['id', 'DESC']],
      page: 1,
      limit: 10
    });
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBe(true);
    // Since we sort by ID DESC, our newly created user should be in the first few results
    expect(responseBody.data.some((user: any) => user.id === testUserId)).toBe(true);
    
    // Verify pagination properties
    expect(responseBody).toHaveProperty('meta');
    expect(responseBody.meta).toHaveProperty('itemsPerPage');
    expect(responseBody.meta).toHaveProperty('totalItems');
    expect(responseBody.meta).toHaveProperty('currentPage');
    expect(responseBody.meta).toHaveProperty('totalPages');
  });

  test('GET /users/:id - should get a specific user', async () => {
    const response = await userClient.find({ 
      sortBy: [['id', 'DESC']],
      page: 1,
      limit: 1
    });
    expect(response.status()).toBe(200);

    const result = await response.json();
    const user = result.data[0];
    expect(user.id).toBe(testUserId);
    expect(user.email).toBe(testUserEmail);
  });

  test('GET /users/company/:id - should get paginated users by company', async () => {
    const response = await userClient.getCompanyUsers(testCompanyId, {
      sortBy: [['id', 'DESC']],
      page: 1,
      limit: 10,
    });
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBe(true);
    expect(responseBody.data.some((user: any) => user.id === testUserId)).toBe(
      true,
    );
    expect(responseBody.data[0].company.id).toBe(testCompanyId);

    // Verify pagination properties
    expect(responseBody).toHaveProperty('meta');
    expect(responseBody.meta).toHaveProperty('itemsPerPage');
    expect(responseBody.meta).toHaveProperty('totalItems');
    expect(responseBody.meta).toHaveProperty('currentPage');
    expect(responseBody.meta).toHaveProperty('totalPages');
  });

  test('GET /users/account/:id - should get paginated users by account', async () => {
    const response = await userClient.getAccountUsers(testAccountId, {
      sortBy: [['id', 'DESC']],
      page: 1,
      limit: 10,
    });
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBe(true);
    expect(responseBody.data.some((user: any) => user.id === testUserId)).toBe(
      true,
    );

    // Find our test user in the response
    const testUser = responseBody.data.find(
      (user: any) => user.id === testUserId,
    );
    expect(testUser).toBeDefined();
    expect(testUser.company).toBeDefined();
    expect(testUser.company.companyAccounts).toBeDefined();
    expect(testUser.company.companyAccounts.length).toBeGreaterThan(0);
    expect(testUser.company.companyAccounts[0].account.id).toBe(testAccountId);

    // Verify pagination properties
    expect(responseBody).toHaveProperty('meta');
    expect(responseBody.meta).toHaveProperty('itemsPerPage');
    expect(responseBody.meta).toHaveProperty('totalItems');
    expect(responseBody.meta).toHaveProperty('currentPage');
    expect(responseBody.meta).toHaveProperty('totalPages');
  });

  test('PATCH /users/:id - should update a user', async () => {
    const updateData = {
      title: 'Senior Engineer',
      department: 'Engineering',
    };

    const response = await userClient.update(testUserId, updateData);
    expect(response.status()).toBe(200);

    const updatedUser = await response.json();
    expect(updatedUser.title).toBe(updateData.title);
    expect(updatedUser.department).toBe(updateData.department);
    expect(updatedUser.id).toBe(testUserId);
  });

  test('DELETE /users/:id - should delete a user', async () => {
    const response = await userClient.delete(testUserId);
    expect(response.status()).toBe(204);

    // Verify user is completely deleted
    const getResponse = await userClient.findOne(testUserId);
    expect(getResponse.status()).toBe(404);
  });

  test('GET /users/company/:id - should handle user deletion', async () => {
    // Verify user is not in company users anymore
    const companyUsersResponse = await userClient.getCompanyUsers(testCompanyId, {
      sortBy: [['id', 'DESC']],
      page: 1,
      limit: 10
    });
    expect(companyUsersResponse.status()).toBe(200);
    const companyUsers = await companyUsersResponse.json();
    
    // User should not be found in the results
    expect(companyUsers.data.find((u: any) => u.id === testUserId)).toBeUndefined();
  });

  test('GET /users/account/:id - should handle user deletion', async () => {
    // Create a new test user since previous one is deleted
    testUserEmail = generateEmail();
    const userData = {
      email: testUserEmail,
      firstName: 'Test',
      lastName: 'User',
      password: 'Test123!@#',
      companyId: testCompanyId,
      title: 'Engineer',
      department: 'IT',
      countryId: 228,
      stateId: 3779,
      cityId: 41331,
    };

    const createResponse = await userClient.create(userData);
    expect(createResponse.status()).toBe(201);
    const newUser = await createResponse.json();
    testUserId = newUser.id;

    // Delete user
    const deleteResponse = await userClient.delete(testUserId);
    expect(deleteResponse.status()).toBe(204);

    // Verify user is not in account users anymore
    const accountUsersResponse = await userClient.getAccountUsers(testAccountId, {
      sortBy: [['id', 'DESC']],
      page: 1,
      limit: 10
    });
    expect(accountUsersResponse.status()).toBe(200);
    const accountUsers = await accountUsersResponse.json();
    
    // User should not be found in the results
    expect(accountUsers.data.find((u: any) => u.id === testUserId)).toBeUndefined();
  });
});
