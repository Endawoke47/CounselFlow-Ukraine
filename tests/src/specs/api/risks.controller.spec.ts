import { expect, test } from '@playwright/test';
import { APIRiskClient, RiskRating, RiskStatus } from '../../clients/risk.client';
import { APIUserClient } from '../../clients/user.client';
import { APICategoryClient } from '../../clients/category.client';
import { APIProjectClient } from '../../clients/project.client';
import { APICompanyClient } from '../../clients/company.client';
import { setupTestEnvironment } from '../../utils/setupUtil';
import { randomWordGenerator } from '../../utils/random.generator';

test.describe.configure({ mode: 'serial' });

test.describe('RisksController', () => {
  let riskClient: APIRiskClient;
  let userClient: APIUserClient;
  let categoryClient: APICategoryClient;
  let projectClient: APIProjectClient;
  let companyClient: APICompanyClient;
  // Store created entities IDs for test data
  let userId: number;
  let categoryId: number;
  let projectId: number;
  let createdRiskId: number | null = null;

  test.beforeAll(async () => {
    const context = await setupTestEnvironment();
    riskClient = new APIRiskClient(context);
    userClient = new APIUserClient(context);
    categoryClient = new APICategoryClient(context);
    projectClient = new APIProjectClient(context);
    companyClient = new APICompanyClient(context);

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
    
    // 3. Find a project or create one if needed
    try {
      const projectResponse = await projectClient.find();
      const projects = await projectResponse.json();
      
      if (projects.data && projects.data.length > 0) {
        projectId = projects.data[0].id;
        console.log('Using existing project with ID:', projectId);
      } else {
        // Create a new project
        const projectName = `Project ${randomWordGenerator(7)}`;
        const matterNumber = `MTR-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
        
        // Find a company to use for the project
        const companyResponse = await companyClient.find();

        const companies = await companyResponse.json();
        let companyId;
        
        if (companies.data && companies.data.length > 0) {
          companyId = companies.data[0].id;
          console.log('Using company with ID:', companyId);
          
          const newProject = await projectClient.create({
            userId,
            name: projectName,
            matterNumber,
            description: "Test project for risk tests",
            identifierColor: "#4287f5",
            projectUserIds: [userId],
            ownerId: userId,
            leadPartnerId: userId,
            categoryIds: [categoryId],
            clientIds: [companyId],
            targets: [{
              id: companyId,
              sectors: [],
              categories: [categoryId]
            }]
          });
          
          expect(newProject.status()).toBe(201);
          const createdProject = await newProject.json();
          projectId = createdProject.id;
          console.log('Created new project with ID:', projectId);
        } else {
          throw new Error('No companies found and cannot create project without a company');
        }
      }
    } catch (error) {
      console.error('Error finding or creating project:', error);
      throw new Error('Failed to find or create a project, tests cannot proceed');
    }
  });

  test.afterAll(async () => {
    // Clean up the risk if it still exists (not cleaned up by the delete test)
    if (createdRiskId) {
      try {
        console.log(`Deleting risk with ID: ${createdRiskId}`);
        await riskClient.delete(createdRiskId);
      } catch (error) {
        console.error(`Error deleting risk: ${error}`);
      }
    }

    // Delete the category if it's not the only one (to avoid test failures elsewhere)
    if (categoryId) {
      try {
        // Check if there are multiple categories before deleting
        const categoriesResponse = await categoryClient.find();
        const categories = await categoriesResponse.json();
        
        if (Array.isArray(categories) && categories.length > 1) {
          console.log(`Deleting category with ID: ${categoryId}`);
          await categoryClient.delete(categoryId);
        } else {
          console.log(`Not deleting category ${categoryId} as it might be the only one left`);
        }
      } catch (error) {
        console.error(`Error during category cleanup: ${error}`);
      }
    }

    // Not deleting the project to avoid impacting other tests
  });

  test('should create a risk', async () => {
    const riskTitle = `Risk ${randomWordGenerator(7)}`;
    
    const riskData = {
      userId,
      projectId,
      title: riskTitle,
      description: "The target company has unclear ownership of key intellectual property assets, including patents and software code. Documentation is incomplete and there are potential third-party claims that could impact valuation.",
      riskStatus: RiskStatus.DRAFT,
      riskRating: RiskRating.HIGH,
      assignedToId: userId,
      categoryIds: [categoryId],
      recommendations: [
        {
          recommendation: "Warranty / Representation",
          details: "Include comprehensive IP ownership warranties with specific disclosure schedules listing all IP assets and their ownership status.",
          dueDateOptionId: 1
        },
        {
          recommendation: "Indemnity",
          details: "Secure specific indemnity for any third-party IP claims that may arise post-closing.",
          dueDateOptionId: 2
        },
        {
          recommendation: "Condition Precedent",
          details: "Require completion of an IP audit by external counsel before closing.",
          dueDateOptionId: 3
        },
        {
          recommendation: "Price Adjustment",
          details: "Consider an escrow mechanism for 10% of purchase price to cover potential IP litigation costs."
        }
      ],
      comments: [
        {
          commentText: "Initial review of IP documentation shows significant gaps in chain of title for the core technology platform."
        },
        {
          commentText: "Legal team should prioritize review of software licensing agreements with third-party vendors."
        }
      ]
    };
    
    const response = await riskClient.create(riskData);
    
    if (response.status() !== 201) {
      const errorBody = await response.json();
      console.error('Error creating risk:', errorBody);
    }
    
    expect(response.status()).toBe(201);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(typeof responseBody.id).toBe('number');
    expect(responseBody.id).toBeGreaterThan(0);
    expect(responseBody.title).toBe(riskTitle);
    expect(responseBody.riskStatus).toBe(RiskStatus.DRAFT);
    expect(responseBody.riskRating).toBe(RiskRating.HIGH);
    
    // Verify recommendations were created
    expect(responseBody).toHaveProperty('recommendations');
    expect(Array.isArray(responseBody.recommendations)).toBe(true);
    expect(responseBody.recommendations.length).toBe(4);
    
    // Verify comments were created
    expect(responseBody).toHaveProperty('comments');
    expect(Array.isArray(responseBody.comments)).toBe(true);
    expect(responseBody.comments.length).toBe(2);
    
    createdRiskId = responseBody.id;
  });

  test('should retrieve all risks', async () => {
    expect(createdRiskId).not.toBeNull();
    if (createdRiskId === null) return;
    
    const response = await riskClient.find({ projectId });
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
    
    // Verify our created risk is in the results
    expect(
      responseBody.data.some((risk: any) => risk.id === createdRiskId),
    ).toBe(true);
  });

  test('should retrieve a specific risk', async () => {
    expect(createdRiskId).not.toBeNull();
    if (createdRiskId === null) return;
    
    const response = await riskClient.findOne(createdRiskId);
    expect(response.status()).toBe(200);
    
    const risk = await response.json();
    expect(risk.id).toBe(createdRiskId);
    
    // Verify risk properties
    expect(risk).toHaveProperty('title');
    expect(risk).toHaveProperty('description');
    expect(risk).toHaveProperty('riskStatus');
    expect(risk).toHaveProperty('riskRating');
    
    // Verify risk relationships
    expect(risk).toHaveProperty('recommendations');
    expect(Array.isArray(risk.recommendations)).toBe(true);
    expect(risk.recommendations.length).toBeGreaterThan(0);
    
    expect(risk).toHaveProperty('comments');
    expect(Array.isArray(risk.comments)).toBe(true);
    expect(risk.comments.length).toBeGreaterThan(0);
    
    expect(risk).toHaveProperty('categories');
    expect(Array.isArray(risk.categories)).toBe(true);
    expect(risk.categories.length).toBeGreaterThan(0);
  });

  test('should update a risk', async () => {
    if (!createdRiskId) {
      console.log('No risk ID available for update test');
      return;
    }

    // Get the current risk to use its existing data
    const getResponse = await riskClient.findOne(createdRiskId);
    expect(getResponse.status()).toBe(200);

    const updatedTitle = 'Updated Risk Title';
    const updatedDescription = 'Updated risk description for testing';

    // Include all required fields in the update
    const updateData = {
      userId: userId,
      projectId: projectId,
      title: updatedTitle,
      description: updatedDescription,
      riskStatus: RiskStatus.PUBLISHED,
      riskRating: RiskRating.HIGH,
      assignedToId: userId
    };

    const response = await riskClient.update(createdRiskId, updateData);
    
    if (response.status() !== 200) {
      const errorData = await response.json();
      console.error('Error updating risk:', errorData);
    }
    
    expect(response.status()).toBe(200);
    
    const updatedRisk = await response.json();
    expect(updatedRisk.id).toBe(createdRiskId);
    expect(updatedRisk.title).toBe(updatedTitle);
    expect(updatedRisk.description).toBe(updatedDescription);
    expect(updatedRisk.riskStatus).toBe(RiskStatus.PUBLISHED);
    expect(updatedRisk.riskRating).toBe(RiskRating.HIGH);
  });

  test('should delete a risk', async () => {
    if (!createdRiskId) {
      console.log('No risk ID available for delete test');
      return;
    }

    // Delete the risk
    const deleteResponse = await riskClient.delete(createdRiskId);
    expect(deleteResponse.status()).toBe(204);

    // Try to fetch the deleted risk - should return 404
    const getResponse = await riskClient.findOne(createdRiskId);
    expect(getResponse.status()).toBe(404);

    // Set createdRiskId to null to prevent deletion attempt in afterAll
    createdRiskId = null;
  });
}); 