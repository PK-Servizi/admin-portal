/**
 * Admin API Integration Test Helper
 * Use this to verify all admin APIs are properly integrated
 */

import { store } from '@/store';
import {
  // Admin API
  adminApi,
  useGetDashboardStatsQuery,
  // useGetPendingCountQuery,
  useGetAllRequestsQuery,
  useAssignToOperatorMutation,
} from '@/services/api/admin.api';
import {
  // Reports API
  reportsApi,
  
  // Users Admin API
  usersAdminApi,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  
  // Roles API
  rolesApi,
  useGetAllRolesQuery,
  useCreateRoleMutation,
  
  // CMS Admin API
  cmsAdminApi,
  useGetAllContentQuery,
  usePublishContentMutation,
  
  // Courses Admin API
  coursesAdminApi,
  useGetAllCoursesQuery,
  useCreateCourseMutation,
  
  // Documents Admin API
  documentsAdminApi,
  useGetPendingDocumentsQuery,
  useApproveDocumentMutation,
  
  // Payments Admin API
  paymentsAdminApi,
  useGetAllPaymentsQuery,
  useProcessRefundMutation,
} from '@/services/api';

import {
  // Admin Slice
  setCurrentView,
  setRequestView,
  toggleRequestSelection,
  selectSelectedRequestIds,
  selectCurrentView,
} from '@/store/slices';

/**
 * Test Suite: Verify all admin APIs are properly registered
 */
export function testAdminAPIIntegration() {
  console.group('🧪 Admin API Integration Tests');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: [] as Array<{ name: string; status: 'PASS' | 'FAIL'; message?: string }>
  };
  
  // Test 1: Redux store includes admin slice
  try {
    const state = store.getState();
    if ('admin' in state) {
      results.passed++;
      results.tests.push({ name: 'Admin Slice in Store', status: 'PASS' });
    } else {
      throw new Error('Admin slice not found in store');
    }
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Admin Slice in Store', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 2: Admin API endpoints are registered
  try {
    const endpoints = [
      'getDashboardStats',
      'getPendingCount',
      'getAllRequests',
      'assignToOperator',
      'updateRequestStatus',
    ];
    
    endpoints.forEach(endpoint => {
      if (!(endpoint in adminApi.endpoints)) {
        throw new Error(`Missing endpoint: ${endpoint}`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Admin API Endpoints', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Admin API Endpoints', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 3: Reports API endpoints
  try {
    const endpoints = [
      'getReportsDashboard',
      'getServiceRequestMetrics',
      'getSubscriptionMetrics',
      'getRevenueReports',
    ];
    
    endpoints.forEach(endpoint => {
      if (!(endpoint in reportsApi.endpoints)) {
        throw new Error(`Missing endpoint: ${endpoint}`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Reports API Endpoints', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Reports API Endpoints', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 4: Users Admin API endpoints
  try {
    const endpoints = [
      'getAllUsers',
      'getUserById',
      'updateUser',
      'activateUser',
      'deactivateUser',
    ];
    
    endpoints.forEach(endpoint => {
      if (!(endpoint in usersAdminApi.endpoints)) {
        throw new Error(`Missing endpoint: ${endpoint}`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Users Admin API Endpoints', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Users Admin API Endpoints', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 5: Roles API endpoints
  try {
    const endpoints = [
      'getAllRoles',
      'createRole',
      'updateRole',
      'getAllPermissions',
      'assignPermissionsToRole',
    ];
    
    endpoints.forEach(endpoint => {
      if (!(endpoint in rolesApi.endpoints)) {
        throw new Error(`Missing endpoint: ${endpoint}`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Roles API Endpoints', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Roles API Endpoints', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 6: CMS Admin API endpoints
  try {
    const endpoints = [
      'getAllContent',
      'createContent',
      'updateContent',
      'publishContent',
      'createPage',
    ];
    
    endpoints.forEach(endpoint => {
      if (!(endpoint in cmsAdminApi.endpoints)) {
        throw new Error(`Missing endpoint: ${endpoint}`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'CMS Admin API Endpoints', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'CMS Admin API Endpoints', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 7: Courses Admin API endpoints
  try {
    const endpoints = [
      'getAllCourses',
      'createCourse',
      'updateCourse',
      'deleteCourse',
      'publishCourse',
    ];
    
    endpoints.forEach(endpoint => {
      if (!(endpoint in coursesAdminApi.endpoints)) {
        throw new Error(`Missing endpoint: ${endpoint}`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Courses Admin API Endpoints', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Courses Admin API Endpoints', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 8: Documents Admin API endpoints
  try {
    const endpoints = [
      'getPendingDocuments',
      'getRequestDocuments',
      'approveDocument',
      'rejectDocument',
    ];
    
    endpoints.forEach(endpoint => {
      if (!(endpoint in documentsAdminApi.endpoints)) {
        throw new Error(`Missing endpoint: ${endpoint}`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Documents Admin API Endpoints', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Documents Admin API Endpoints', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 9: Payments Admin API endpoints
  try {
    const endpoints = [
      'getAllPayments',
      'processRefund',
    ];
    
    endpoints.forEach(endpoint => {
      if (!(endpoint in paymentsAdminApi.endpoints)) {
        throw new Error(`Missing endpoint: ${endpoint}`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Payments Admin API Endpoints', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Payments Admin API Endpoints', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 10: Hooks are exported
  try {
    const hooks = [
      useGetDashboardStatsQuery,
      useGetAllRequestsQuery,
      useGetAllUsersQuery,
      useGetAllRolesQuery,
      useGetAllContentQuery,
      useGetAllCoursesQuery,
      useGetPendingDocumentsQuery,
      useGetAllPaymentsQuery,
    ];
    
    hooks.forEach(hook => {
      if (typeof hook !== 'function') {
        throw new Error(`Hook is not a function`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Query Hooks Exported', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Query Hooks Exported', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 11: Mutation hooks are exported
  try {
    const hooks = [
      useAssignToOperatorMutation,
      useUpdateUserMutation,
      useCreateRoleMutation,
      usePublishContentMutation,
      useCreateCourseMutation,
      useApproveDocumentMutation,
      useProcessRefundMutation,
    ];
    
    hooks.forEach(hook => {
      if (typeof hook !== 'function') {
        throw new Error(`Hook is not a function`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Mutation Hooks Exported', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Mutation Hooks Exported', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 12: Admin slice actions
  try {
    const actions = [
      setCurrentView,
      setRequestView,
      toggleRequestSelection,
    ];
    
    actions.forEach(action => {
      if (typeof action !== 'function') {
        throw new Error(`Action is not a function`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Admin Slice Actions', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Admin Slice Actions', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Test 13: Admin slice selectors
  try {
    const selectors = [
      selectSelectedRequestIds,
      selectCurrentView,
    ];
    
    selectors.forEach(selector => {
      if (typeof selector !== 'function') {
        throw new Error(`Selector is not a function`);
      }
    });
    
    results.passed++;
    results.tests.push({ name: 'Admin Slice Selectors', status: 'PASS' });
  } catch (error) {
    results.failed++;
    results.tests.push({ 
      name: 'Admin Slice Selectors', 
      status: 'FAIL', 
      message: (error as Error).message 
    });
  }
  
  // Print results
  console.table(results.tests);
  console.log(`\n✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.tests.length}`);
  console.log(`🎯 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
  
  console.groupEnd();
  
  return results;
}

/**
 * Run this in the browser console to verify integration
 */
if (typeof window !== 'undefined') {
  (window as any).testAdminAPI = testAdminAPIIntegration;
  console.log('💡 Run window.testAdminAPI() to test the integration');
}

export default testAdminAPIIntegration;
