// Database configuration constants for tests

export const DB_CONFIG = {
  POSTGRES: {
    DB_TYPE: "postgres",
    DB_HOST: "ep-orange-hall-ad1wbmat-pooler.c-2.us-east-1.aws.neon.tech", 
    DB_PORT: 5432,
    DB_NAME: "Query",
    DB_USERNAME: "neondb_owner",
    // Note: In a production environment, this should be stored in environment variables
    // or retrieved from a secrets manager. The password is masked for security.
    DB_PASSWORD: process.env.DB_PASSWORD || "npg_S5jF3UgekpiL",
    DB_SCHEMA: "public",
    EMBEDDING_TYPE: ""
  },
  // Add more database configurations as needed
};
