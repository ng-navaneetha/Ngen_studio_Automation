/**
 * Test data for Insights tests
 * This file contains all the data needed for creating and testing workspaces
 */

// Basic workspace data
export const WORKSPACE_DATA = {
  INSIGHTS: {
    name: 'Insights Workspace',
    description: 'Testing Insights use case workspace',
    useCase: 'Insights'
  },
  QUERY: {
    name: 'Neon Query Database Workspace',
    description: 'Testing Query use case with database connection',
    useCase: 'Query'
  },
  PULSE: {
    name: 'Pulse Workspace',
    description: 'Testing Pulse use case workspace',
    useCase: 'Pulse'
  },
  SUMMARY: {
    name: 'Summary Workspace',
    description: 'Testing Summary use case workspace',
    useCase: 'Summary'
  },
  UPLOAD_TEST: {
    name: 'Upload Test Workspace',
    description: 'Testing file upload functionality',
    useCase: 'Insights'
  },
  SETTINGS_TEST: {
    name: 'Settings Test Workspace',
    description: 'Testing settings functionality',
    useCase: 'Insights',
    updatedName: 'Updated Settings Workspace'
  },
  DELETE_TEST: {
    name: 'Delete Test Workspace',
    description: 'Testing deletion functionality',
    useCase: 'Insights'
  },
  CANCEL_TEST: {
    name: 'Canceled Workspace',
    description: 'This workspace should not be created',
    useCase: 'Insights'
  }
};

// File upload data
export const FILES = {
  PDF: 'input.pdf',
  CSV: 'test_data/sample_data.csv',
  EXCEL: 'test_data/sample_data.xlsx',
  TEXT: 'test_data/sample_text.txt'
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Workplace name, description, department, use case, and access type are required.'
};

// Access types
export const ACCESS_TYPES = {
  PRIVATE: 'Private',
  PUBLIC: 'Public',
  SHARED: 'Shared'
};
