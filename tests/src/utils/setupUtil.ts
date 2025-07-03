import { APIRequestContext, request } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Function to generate random names
function generateRandomName(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(7)}`;
}

// Setup function with authentication
export async function setupTestEnvironment(): Promise<APIRequestContext> {
  // Debug: Print environment variables
  console.log('Environment variables loaded:', {
    API_BASE_URL: process.env.API_BASE_URL,
    TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
    TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD?.slice(0, 1) + '***'
  });

  if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables must be set');
  }

  const context = await request.newContext({
    baseURL: process.env.API_BASE_URL || 'http://localhost:5005',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    ignoreHTTPSErrors: true
  });

  // Login to get authentication token
  const loginData = {
    email: process.env.TEST_USER_EMAIL.trim(),
    password: process.env.TEST_USER_PASSWORD.trim()
  };

  console.log('Login payload:', {
    email: loginData.email,
    passwordLength: loginData.password.length,
    passwordChars: [...loginData.password].map(c => c.charCodeAt(0))
  });

  const loginResponse = await context.post('/auth/login', {
    data: loginData
  });

  if (!loginResponse.ok()) {
    const errorBody = await loginResponse.json().catch(() => ({}));
    console.log('Login request details:', {
      url: process.env.API_BASE_URL + '/auth/login',
      email: process.env.TEST_USER_EMAIL,
      status: loginResponse.status(),
      response: await loginResponse.text().catch(() => 'Unable to get response text')
    });
    throw new Error(`Failed to authenticate test user. Status: ${loginResponse.status()}. Body: ${JSON.stringify(errorBody)}`);
  }

  // Get the storage state which includes cookies
  const state = await context.storageState();

  // Create a new context with the auth cookies
  const authenticatedContext = await request.newContext({
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    ignoreHTTPSErrors: true,
    storageState: {
      cookies: state.cookies,
      origins: state.origins
    }
  });

  return authenticatedContext;
}
