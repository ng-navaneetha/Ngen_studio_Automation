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
  },
  INSIGHTSEnterpriseSearch: {
    name: 'Tesla’s Transforming ',
    description: 'Current ESG methodologies prioritize investment risk over real-world impact,    often misrepresenting companies’ environmental and social contributions. This     document critiques these flaws, advocating for a shift to measuring tangible positive outcomes,    like accurate use-phase emissions in automotive industries. It highlights Tesla’s    approach, emphasizing sustainable products, transparent data, and equitable workplaces.    By 2030, Tesla aims to sell 20 million EVs annually, significantly reducing CO2e emissions.    The report calls for stakeholder collaboration to redefine ESG as Impact, focusing    on lifecycle emissions, employee welfare, and ethical supply chains to drive meaningful    global change.',
    useCase: 'Insights'
  },
  QUERYEnterpriseSearch: {
    name: 'acme_chatbot',
    description: 'The acme_chatbot schema in PostgreSQL supports ACME’s pharmaceutical operations with nine tables. demand-forecast predicts product demand for inventory planning. material-packing-tracker manages component inventory. otif and kpi_invoice_to_order_calc track order fulfillment and delivery KPIs. manuf-delay and batch-and-packing-tracker monitor production delays and batch timelines. manufacturing-assesses equipment utilization. doh calculates inventory days-on-hand for stock management. process-area-details evaluates manufacturing efficiency. Together, these tables enable supply chain optimization, production planning, and performance analysis for ACME’s pharmaceutical manufacturing and distribution processes.',
    useCase: 'Query'
  }
};

// File upload data
export const FILES = {
  PDF: 'existing_projects_details-3-5 (1) 1.pdf',
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
