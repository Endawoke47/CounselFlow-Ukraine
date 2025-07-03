import { expect, test } from '@playwright/test';
import { APICategoryClient } from '../../clients/category.client';
import { APICompanyClient } from '../../clients/company.client';
import { APIProjectClient } from '../../clients/project.client';
import { APISectorClient } from '../../clients/sector.client';
import { APIUserClient } from '../../clients/user.client';
import { randomWordGenerator } from '../../utils/random.generator';
import { setupTestEnvironment } from '../../utils/setupUtil';

// Define company account types locally based on backend enum
enum CompanyAccountType {
  ADMIN = 'ADMIN',
  LAWYER = 'LAWYER',
  LAWYER_CUSTOMER = 'LAWYER_CUSTOMER',
  LAWYER_OUTSOURCE = 'LAWYER_OUTSOURCE',
}

test.describe.configure({ mode: 'serial' });

test.describe('ProjectsController', () => {
  let projectClient: APIProjectClient;
  let userClient: APIUserClient;
  let categoryClient: APICategoryClient;
  let companyClient: APICompanyClient;
  let sectorClient: APISectorClient;
  
  // Store created entities IDs for test data
  let userId: number;
  let categoryId: number;
  let companyId: number;
  let sectorId: number;
  let createdProjectId: number | null = null;

  test.beforeAll(async () => {
    const context = await setupTestEnvironment();
    projectClient = new APIProjectClient(context);
    userClient = new APIUserClient(context);
    categoryClient = new APICategoryClient(context);
    companyClient = new APICompanyClient(context);
    sectorClient = new APISectorClient(context);

    // 1. Get the current user
    const userResponse = await userClient.getMe();
    expect(userResponse.status()).toBe(200);
    const user = await userResponse.json();
    userId = user.id;
    console.log('Got user ID:', userId);
    
    // 2. Create or find a category
    let categoryResponse;
    try {
      const categoryName = `Category ${randomWordGenerator(7)}`;
      categoryResponse = await categoryClient.create({
        name: categoryName,
      });
      expect(categoryResponse.status()).toBe(201);
      const category = await categoryResponse.json();
      categoryId = category.id;
      console.log('Created new category with ID:', categoryId);
    } catch (error) {
      // If creating fails, try to find an existing category
      const response = await categoryClient.find();
      const responseBody = await response.json();
      if (responseBody.data && responseBody.data.length > 0) {
        categoryId = responseBody.data[0].id;
        console.log('Using existing category with ID:', categoryId);
      } else {
        throw new Error('Could not create or find a category');
      }
    }
    
    // 3. Create or find a sector
    let sectorResponse;
    try {
      const sectorName = `Sector ${randomWordGenerator(7)}`;
      sectorResponse = await sectorClient.create({
        name: sectorName,
      });
      expect(sectorResponse.status()).toBe(201);
      const sector = await sectorResponse.json();
      sectorId = sector.id;
      console.log('Created new sector with ID:', sectorId);
    } catch (error) {
      // If creating fails, try to find an existing sector
      const response = await sectorClient.find();
      const responseBody = await response.json();
      if (responseBody.data && responseBody.data.length > 0) {
        sectorId = responseBody.data[0].id;
        console.log('Using existing sector with ID:', sectorId);
      } else {
        throw new Error('Could not create or find a sector');
      }
    }
    
    // 4. Find an existing company
    try {
      const companyResponse = await companyClient.find();
      const companies = await companyResponse.json();
      
      if (companies.data && companies.data.length > 0) {
        companyId = companies.data[0].id;
        console.log('Using existing company with ID:', companyId);
      } else {
        throw new Error('No existing companies found');
      }
    } catch (error) {
      console.error('Error finding company:', error);
      throw new Error('Failed to find a company, tests cannot proceed');
    }
  });

  test.afterAll(async () => {
    // Clean up created test data
    try {
      if (createdProjectId !== null) {
        await projectClient.delete(createdProjectId);
        console.log('Deleted project with ID:', createdProjectId);
      }
    } catch (error: any) {
      console.log('Error deleting project, may already be deleted:', error.message);
    }
    
    // Clean up category only if we created a new one
    try {
      const categoryResponse = await categoryClient.find();
      const categories = await categoryResponse.json();
      // Only delete our category if it's not the only one in the system
      if (categories.data && categories.data.length > 1) {
        await categoryClient.delete(categoryId);
        console.log('Deleted category with ID:', categoryId);
      } else {
        console.log('Skipping category deletion as it may be needed by the system');
      }
    } catch (error: any) {
      console.log('Error deleting category:', error.message);
    }
    
    // Clean up sector only if we created a new one
    try {
      const sectorResponse = await sectorClient.find();
      const sectors = await sectorResponse.json();
      // Only delete our sector if it's not the only one in the system
      if (sectors.data && sectors.data.length > 1) {
        await sectorClient.delete(sectorId);
        console.log('Deleted sector with ID:', sectorId);
      } else {
        console.log('Skipping sector deletion as it may be needed by the system');
      }
    } catch (error: any) {
      console.log('Error deleting sector:', error.message);
    }
  });

  test('should create a project', async () => {
    const projectName = `Project ${randomWordGenerator(7)}`;
    const matterNumber = `MTR-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
    
    const projectData = {
      userId,
      name: projectName,
      matterNumber,
      description: "Comprehensive due diligence for the acquisition of Acme Corp, focusing on legal, financial, and operational aspects.",
      identifierColor: "#4287f5",
      projectUserIds: [userId],
      ownerId: userId,
      leadPartnerId: userId,
      categoryIds: [categoryId],
      clientIds: [companyId],
      targets: [
        {
          id: companyId,
          sectors: [sectorId],
          categories: [categoryId]
        }
      ]
    };
    
    const response = await projectClient.create(projectData);
    
    if (response.status() !== 201) {
      const errorBody = await response.json();
      console.error('Error creating project:', errorBody);
    }
    
    expect(response.status()).toBe(201);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(typeof responseBody.id).toBe('number');
    expect(Number.isInteger(responseBody.id)).toBe(true);
    expect(responseBody.id).toBeGreaterThan(0);
    expect(responseBody.name).toBe(projectName);
    expect(responseBody.matterNumber).toBe(matterNumber);
    
    createdProjectId = responseBody.id;
  });

  test('should retrieve all projects', async () => {
    expect(createdProjectId).not.toBeNull();
    if (createdProjectId === null) return;
    
    const response = await projectClient.find();
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
    
    // Verify our created project is in the results
    expect(
      responseBody.data.some((project: any) => project.id === createdProjectId),
    ).toBe(true);
  });

  test('should retrieve a specific project', async () => {
    expect(createdProjectId).not.toBeNull();
    if (createdProjectId === null) return;
    
    const response = await projectClient.findOne(createdProjectId);
    expect(response.status()).toBe(200);
    
    const project = await response.json();
    expect(project.id).toBe(createdProjectId);
    
    // Verify project relationships
    expect(project).toHaveProperty('projectTargets');
    expect(Array.isArray(project.projectTargets)).toBe(true);
    expect(project.projectTargets.length).toBeGreaterThan(0);
    
    expect(project).toHaveProperty('categories');
    expect(Array.isArray(project.categories)).toBe(true);
    expect(project.categories.length).toBeGreaterThan(0);
    
    expect(project).toHaveProperty('clients');
    expect(Array.isArray(project.clients)).toBe(true);
    expect(project.clients.length).toBeGreaterThan(0);
    
    // Verify target categories and sectors
    expect(project).toHaveProperty('targetCategories');
    expect(Array.isArray(project.targetCategories)).toBe(true);
    expect(project.targetCategories.length).toBeGreaterThan(0);
    
    expect(project).toHaveProperty('targetSectors');
    expect(Array.isArray(project.targetSectors)).toBe(true);
    expect(project.targetSectors.length).toBeGreaterThan(0);
  });

  test('should update a project', async () => {
    expect(createdProjectId).not.toBeNull();
    if (createdProjectId === null) return;
    
    const newName = `Updated Project ${randomWordGenerator(7)}`;
    const newDescription = "Updated project description";
    
    const response = await projectClient.update(createdProjectId, {
      name: newName,
      description: newDescription
    });
    
    expect(response.status()).toBe(200);
    
    const updatedProject = await response.json();
    expect(updatedProject.id).toBe(createdProjectId);
    expect(updatedProject.name).toBe(newName);
    expect(updatedProject.description).toBe(newDescription);
  });

  test('should delete a project', async () => {
    expect(createdProjectId).not.toBeNull();
    if (createdProjectId === null) return;
    
    const response = await projectClient.delete(createdProjectId);
    expect(response.status()).toBe(204);
    
    // Verify project no longer exists or is soft deleted
    const getResponse = await projectClient.findOne(createdProjectId);
    expect(getResponse.status()).toBe(404);
    
    // Mark as deleted so afterAll doesn't try to delete again
    createdProjectId = null;
  });
}); 