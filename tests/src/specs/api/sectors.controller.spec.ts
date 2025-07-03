import { expect, test } from '@playwright/test';
import { APISectorClient } from '../../clients/sector.client';
import { randomWordGenerator } from '../../utils/random.generator';
import { setupTestEnvironment } from '../../utils/setupUtil';

test.describe.configure({ mode: 'serial' });

test.describe('SectorsController', () => {
  let sectorClient: APISectorClient;
  let sectorId: number;
  let sectorName: string;

  test.beforeAll(async () => {
    const context = await setupTestEnvironment();
    sectorClient = new APISectorClient(context);
  });

  test('POST /sectors should create a new sector', async () => {
    sectorName = `Test Sector ${randomWordGenerator(7)}`;
    const newSector = {
      name: sectorName,
    };

    const response = await sectorClient.create(newSector);
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody.name).toBe(newSector.name);
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('createdAt');
    expect(responseBody).toHaveProperty('updatedAt');
    
    sectorId = responseBody.id;
  });

  test('GET /sectors should return paginated sectors', async () => {
    // Sort by ID DESC to ensure our newly created sector is in the first page
    const response = await sectorClient.find({
      sortBy: [['id', 'DESC']],
      page: 1,
      limit: 10
    });
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('data');
    expect(Array.isArray(responseBody.data)).toBe(true);
    // Since we sort by ID DESC, our newly created sector should be in the first few results
    expect(responseBody.data.some((sector: any) => sector.id === sectorId)).toBe(true);
    
    // Verify pagination properties
    expect(responseBody).toHaveProperty('meta');
    expect(responseBody.meta).toHaveProperty('itemsPerPage');
    expect(responseBody.meta).toHaveProperty('totalItems');
    expect(responseBody.meta).toHaveProperty('currentPage');
    expect(responseBody.meta).toHaveProperty('totalPages');
  });

  test('GET /sectors/:id should return a specific sector', async () => {
    const response = await sectorClient.findOne(sectorId);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id).toBe(sectorId);
    expect(responseBody.name).toBe(sectorName);
  });

  test('PATCH /sectors/:id should update a sector', async () => {
    const updatedName = `Updated Sector ${randomWordGenerator(7)}`;
    const updateData = {
      name: updatedName,
    };

    const response = await sectorClient.update(sectorId, updateData);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.name).toBe(updateData.name);
    expect(responseBody.id).toBe(sectorId);
  });

  test('DELETE /sectors/:id should delete a sector', async () => {
    const response = await sectorClient.delete(sectorId);
    expect(response.status()).toBe(204);

    // Verify sector is deleted by trying to fetch it
    const getResponse = await sectorClient.findOne(sectorId);
    expect(getResponse.status()).toBe(404);
  });
});
