// Centralized test data and constants for Quality Check tests
import path from 'path';

// Resolve paths relative to the workspace root's test_data folder
const td = (...parts) => path.resolve(process.cwd(), 'test_data/QC/', ...parts);

export const files = {
  image1: td('image1.jpg'),
  image2: td('image2.jpg'),
  image3: td('image3.jpg'),
  largeImage: td('large-image.png'),
  document: td('document.pdf'),
  similar1: td('similar1.jpg'),
  similar2: td('similar2.jpg'),
  different1: td('different1.jpg'),
  different2: td('different2.jpg'),
};

export const messages = {
  exactlyTwoFiles: 'Exactly 2 files are required',
  unsupportedFormat: 'Unsupported file format',
  fileSizeExceeded: 'File size exceeds 10MB limit',
};

export const thresholds = {
  similarityHigh: 80,
  similarityLow: 50,
};

export const routes = {
  qualityCheckPath: '/project/quality-check',
};

export const selectors = {
  comparisonResults: '//h2[normalize-space()="Validation Results"]',
};
