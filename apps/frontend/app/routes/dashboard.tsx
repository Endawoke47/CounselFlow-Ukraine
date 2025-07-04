import { createRoute } from '@tanstack/react-router';

import { Route as rootRoute } from './__root';

import { DashboardPage } from '@/pages/Dashboard/DashboardPage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});
