import { expect, test } from '@playwright/test';
import { APIAccountClient } from '../../clients/account.client';
import { setupTestEnvironment } from '../../utils/setupUtil';

interface Account {
  id: number;
  organizationSize: string;
  isAdmin: boolean;
}

test.describe.configure({ mode: 'serial' });

test.describe('AccountsController', () => {
  let accountClient: APIAccountClient;
  let testAccount: Account;
  let testAccounts: Account[] = [];
  let deletedAccountId: number;

  test.beforeAll(async () => {
    const context = await setupTestEnvironment();
    accountClient = new APIAccountClient(context);

    // Create test accounts for pagination testing
    for (let i = 0; i < 15; i++) {
      const response = await accountClient.create({
        isAdmin: i % 2 === 0,
        organizationSize: '1-10',
      });
      const account = await response.json();
      testAccounts.push(account);
    }
  });

  test.afterAll(async () => {
    // Clean up all test accounts
    for (const account of testAccounts) {
      await accountClient.delete(account.id);
    }
    if (testAccount?.id) {
      await accountClient.delete(testAccount.id);
    }
  });

  test.describe('Account Creation', () => {
    test('should create a customer account with valid data', async () => {
      const response = await accountClient.create({
        isAdmin: false,
        organizationSize: '1-10',
      });
      const account = await response.json();
      testAccount = account;

      expect(response.status()).toBe(201);
      expect(account).toMatchObject({
        id: expect.any(Number),
        isAdmin: expect.any(Boolean),
        organizationSize: expect.any(String),
      });
    });
  });

  test.describe('Account Retrieval', () => {
    test('should return paginated accounts list with correct metadata', async () => {
      // Test first page
      const firstPageResponse = await accountClient.find({
        page: 1,
        limit: 10,
      });
      const firstPage = await firstPageResponse.json();

      expect(firstPageResponse.status()).toBe(200);
      expect(firstPage.data).toBeDefined();
      expect(firstPage.data.length).toBe(10);
      expect(firstPage.meta).toMatchObject({
        itemsPerPage: 10,
        totalItems: expect.any(Number),
        currentPage: 1,
        totalPages: expect.any(Number),
      });

      // Test second page
      const secondPageResponse = await accountClient.find({
        page: 2,
        limit: 10,
      });
      const secondPage = await secondPageResponse.json();

      expect(secondPageResponse.status()).toBe(200);
      expect(secondPage.data).toBeDefined();
      expect(secondPage.data.length).toBeGreaterThan(0);
      expect(secondPage.meta.currentPage).toBe(2);

      // Verify pages contain different items
      const firstPageIds = new Set(firstPage.data.map((a: Account) => a.id));
      const secondPageIds = new Set(secondPage.data.map((a: Account) => a.id));
      const intersection = [...firstPageIds].filter(id =>
        secondPageIds.has(id),
      );
      expect(intersection.length).toBe(0);
    });

    test('should return a specific account by id', async () => {
      const response = await accountClient.findOne(testAccount.id);
      const account = await response.json();

      expect(response.status()).toBe(200);
      expect(account).toMatchObject({
        id: testAccount.id,
        organizationSize: expect.any(String),
        isAdmin: expect.any(Boolean),
        companyAccounts: [],
      });
    });
  });

  test.describe('Account Updates', () => {
    test('should update account properties', async () => {
      const updates = {
        isAdmin: !testAccount.isAdmin,
        organizationSize: '11-20',
      };

      const response = await accountClient.update(testAccount.id, updates);
      const updatedAccount = await response.json();

      expect(response.status()).toBe(200);
      expect(updatedAccount).toMatchObject({
        ...updates,
        id: testAccount.id,
      });
    });
  });

  test.describe('Account Deletion and Restoration', () => {
    test('should soft delete an account and verify its removal', async () => {
      // Get initial state with relationships
      const beforeDeleteResponse = await accountClient.findOne(testAccount.id);
      const beforeDeleteAccount = await beforeDeleteResponse.json();
      expect(beforeDeleteResponse.status()).toBe(200);

      // Store initial relationships
      const initialCompanyAccounts = beforeDeleteAccount.companyAccounts;

      // Perform deletion
      const deleteResponse = await accountClient.delete(testAccount.id);
      expect(deleteResponse.status()).toBe(204);
      deletedAccountId = testAccount.id;

      // Verify account is not in the active accounts list
      const activeAccountsResponse = await accountClient.find({
        page: 1,
        limit: 10,
        withDeleted: false
      });
      const activeAccounts = await activeAccountsResponse.json();
      expect(
        activeAccounts.data.find((a: Account) => a.id === testAccount.id),
      ).toBeUndefined();

      // Verify direct access returns 404 after soft delete
      const deletedAccountResponse = await accountClient.findOne(testAccount.id);
      expect(deletedAccountResponse.status()).toBe(404);
    });

    test('should restore a soft-deleted account', async () => {
      // Get initial state
      const pageSize = 10;
      const initialResponse = await accountClient.find({
        page: 1,
        limit: pageSize,
      });
      const initialState = await initialResponse.json();
      const initialTotalItems = initialState.meta.totalItems;

      // Restore the account
      const restoreResponse = await accountClient.restore(deletedAccountId);
      expect(restoreResponse.status()).toBe(201);

      // Verify account is back in the list
      const afterRestoreResponse = await accountClient.find({
        page: 1,
        limit: pageSize,
      });
      const afterRestoreState = await afterRestoreResponse.json();

      expect(afterRestoreState.meta.totalItems).toBe(initialTotalItems + 1);
      const restoredAccount = afterRestoreState.data.find(
        (a: Account) => a.id === deletedAccountId,
      );
      expect(restoredAccount).toBeDefined();
      expect(restoredAccount).toMatchObject({
        id: deletedAccountId,
        organizationSize: expect.any(String),
        isAdmin: expect.any(Boolean),
      });

      // Verify direct access works
      const getRestoredResponse = await accountClient.findOne(deletedAccountId);
      expect(getRestoredResponse.status()).toBe(200);
      const restoredAccountDetails = await getRestoredResponse.json();
      expect(restoredAccountDetails).toMatchObject({
        id: deletedAccountId,
        organizationSize: expect.any(String),
        isAdmin: expect.any(Boolean),
      });
    });
  });
});
