/*
import { expect, test } from '@playwright/test';
import { APICategoryClient } from '../../clients/category.client';
import { APICompanyClient } from '../../clients/company.client';
import { APIProjectClient } from '../../clients/project.client';
import { APISectorClient } from '../../clients/sector.client';
import { APIUserClient } from '../../clients/user.client';
import { randomWordGenerator } from '../../utils/random.generator';
import { setupTestEnvironment } from '../../utils/setupUtil';
import * as process from 'node:process';
import 'dotenv/config';

test.describe.configure({ mode: 'serial' });

test.describe('UIProjectsController', () => {
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
      const projectResponse = await projectClient.find();
      const projects = await projectResponse.json();
      console.log(projects);
        // await projectClient.delete(createdProjectId);
        console.log('Deleted project with ID:', createdProjectId);
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

  test('createProject', async ({ page }) => {
    await page.goto('http://localhost:4000/login');
    await page.getByRole('textbox', { name: 'Email*' }).click();
    await page.getByRole('textbox', { name: 'Email*' }).fill(process.env.TEST_USER_EMAIL as string);
    await page.getByRole('textbox', { name: 'Email*' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password*' }).fill(process.env.TEST_USER_PASSWORD as string);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.goto('http://localhost:4000/dashboard');
    await page.getByRole('button', { name: 'Add Project' }).click();
    await page.locator('input[name="name"]').click();
    await page.locator('input[name="name"]').fill('Project1');
    await page.locator('input[name="alias"]').click();
    await page.locator('input[name="alias"]').fill('Alias1');
    await page.locator('input[name="matterNumber"]').click();
    await page.locator('input[name="matterNumber"]').fill('123456');
    await page.locator('.ql-editor').fill('Description');
    await page.getByRole('combobox').click();
    await page.getByRole('option').first().click();
    await page.getByText('Find/Add Categories').click();
    await page.getByText('Commercial & Trading').click();
    await page.getByText('Project Name*Project').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Find/Add Companies').click();
    await page.getByText('RemCompany').click();
    await page.getByText('Project Name*Project').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Find/Add Companies').click();
    await page.getByRole('listitem').filter({ hasText: 'RemCompany' }).click();
    await page.locator('div:nth-child(3) > .py-4').click();
    await page.getByRole('dialog').locator('div').filter({ hasText: 'Project Name*Project' }).nth(2).click();
    await page.locator('div').filter({ hasText: /^Find\/Add Sectors$/ }).nth(1).click();
    await page.getByText('Mortgages').click();
    await page.getByText('Sector B').click();
    await page.getByText('TARGETS1RemCompanyLocation:').click();
    await page.getByText('Find/Add Categories').click();
    await page.getByRole('listitem').filter({ hasText: 'Commercial & Trading' }).click();
    await page.getByText('Compliance & Licensing').click();
    await page.getByText('Project DetailsClientsTarget').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Project1').first()).toBeVisible();
  });
});














*/
