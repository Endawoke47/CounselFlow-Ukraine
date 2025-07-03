import { expect, test } from '@playwright/test';
import { APICategoryClient } from '../../clients/category.client';
import { randomWordGenerator } from '../../utils/random.generator';
import { setupTestEnvironment } from '../../utils/setupUtil';

test.describe.configure({ mode: 'serial' });

test.describe('CategoriesController', () => {
  let categoryClient: APICategoryClient;
  let createdCategoryId: number;

  test.beforeAll(async () => {
    const context = await setupTestEnvironment();
    categoryClient = new APICategoryClient(context);
  });

  test('should create a category', async () => {
    const categoryName = `Category ${randomWordGenerator(7)}`;
    const response = await categoryClient.create({
      name: categoryName,
    });
    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(typeof responseBody.id).toBe('number');
    expect(Number.isInteger(responseBody.id)).toBe(true);
    expect(responseBody.id).toBeGreaterThan(0);
    expect(responseBody.name).toBe(categoryName);
    createdCategoryId = responseBody.id;
  });

  test('should retrieve all categories', async () => {
    const response = await categoryClient.find();
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    
    // Verify response structure
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBe(true);
    
    // Verify pagination metadata
    expect(responseBody).toHaveProperty('meta');
    expect(responseBody.meta).toHaveProperty('itemsPerPage');
    expect(responseBody.meta).toHaveProperty('totalItems');
    expect(responseBody.meta).toHaveProperty('currentPage');
    expect(responseBody.meta).toHaveProperty('totalPages');
    
    // Verify our created category is in the results
    expect(
      responseBody.data.some((category: any) => category.id === createdCategoryId),
    ).toBe(true);
  });

  test('should update a category', async () => {
    expect(typeof createdCategoryId).toBe('number');
    expect(Number.isInteger(createdCategoryId)).toBe(true);
    expect(createdCategoryId).toBeGreaterThan(0);
    
    const newName = `Updated Category ${randomWordGenerator(7)}`;
    const response = await categoryClient.update(createdCategoryId, {
      name: newName,
    });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.id).toBe(createdCategoryId);
    expect(responseBody.name).toBe(newName);
  });

  test('should delete a category', async () => {
    const response = await categoryClient.delete(createdCategoryId);
    expect(response.status()).toBe(204);
  });
});
