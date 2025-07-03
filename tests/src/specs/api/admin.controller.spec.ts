import { expect, test } from '@playwright/test';
import { APIAdminClient } from '../../clients/admin.client';
import { randomWordGenerator } from '../../utils/random.generator';
import { setupTestEnvironment } from '../../utils/setupUtil';

test.describe.configure({ mode: 'serial' });
test.describe('AdminController', () => {
  let adminClient: APIAdminClient;

  test.beforeAll(async () => {
    const context = await setupTestEnvironment();
    adminClient = new APIAdminClient(context);
  });

  /**
   * Admin user account email is unique per database instance.
   * This test verifies the creation of this unique admin account.
   * If an admin account already exists, we expect a 400 response with an appropriate message.
   */
  test('POST /create-admin-account should create an admin account or return appropriate error if it exists', async () => {
    const response = await adminClient.createAdminAccount();
    const status = response.status();
    
    // If status is 201, a new admin was created successfully
    if (status === 201) {
      const responseBody = await response.json();
      expect(responseBody).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          email: expect.any(String),
        }),
      );
    } 
    // If status is 400, admin account likely already exists
    else if (status === 400) {
      const errorBody = await response.json();
      expect(errorBody).toHaveProperty('message');
    } 
    // Any other status is unexpected and should fail
    else {
      expect([201, 400]).toContain(status);
    }
  });

  test('POST /admin/create-lawyer-account should create a lawyer account', async () => {
    const payload = {
      companyName: '1st Lawyer Company',
      email: `lawyer-${randomWordGenerator(10)}@1stlayertcompany.com`,
      password: 's0m3Str0ngP@ssw0rd',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+380671234567',
      companyAddress: '1st Khreschatyk street',
      companyContact: 'John Doe',
      middleName: 'John Doe',
      title: 'John Doe',
      department: 'John Doe',
      bestWayToContact: 'call me',
    };
    const response = await adminClient.createLawyerAccount(payload);
    const responseBody = await response.json();

    expect(response.status()).toBe(201);
    expect(responseBody).toMatchObject({
      email: payload.email,
      firstName: 'John',
      lastName: 'Doe',
      title: 'John Doe',
      phone: '+380671234567',
      company: {
        id: expect.any(Number),
        contact: 'John Doe',
        name: '1st Lawyer Company',
        address: '1st Khreschatyk street',
      },
      department: 'John Doe',
      middleName: 'John Doe',
      bestWayToContact: 'call me',
      city: expect.objectContaining({
        id: 25507,
        name: 'Nairobi',
      }),
      state: expect.objectContaining({
        id: 2007,
        name: 'Nairobi',
      }),
      country: expect.objectContaining({
        id: 113,
        name: 'Kenya',
        shortname: 'KE',
      }),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      uuid: expect.any(String),
      id: expect.any(Number),
      deletedAt: null,
    });
  });
});
