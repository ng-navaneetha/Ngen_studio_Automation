// @ts-check

export const LOGIN_CREDENTIALS = {
  VALID_HOST: {
    email: 'nita@gmail.com',
    password: 'Ngenux@123'
  },
  INVALID_EMAIL: {
    email: 'invalid@gmail.com',
    password: 'Ngenux@123'
  },
  INVALID_PASSWORD: {
    email: 'nita@gmail.com',
    password: 'wrongpassword'
  },
  EMPTY_FIELDS: {
    email: '',
    password: ''
  }
};

export const ERROR_MESSAGES = {
  REQUIRED_EMAIL: 'Email is required',
  REQUIRED_PASSWORD: 'Password is required',
  INVALID_LOGIN: 'Invalid email or password',
  FILE_REQUIRED: 'At least one file is required',
  TWO_FILES_REQUIRED: 'Exactly 2 files are required',
  FILE_SIZE_LIMIT: 'File size exceeds 10MB limit',
  UNSUPPORTED_FORMAT: 'Unsupported file format. Please upload image files only.'
};
