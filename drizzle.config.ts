import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/shared/db-schema.ts',
  out: './drizzle',

  // Configuration spécifique PostgreSQL / PGLite
  dialect: 'postgresql',
  driver: 'pglite',

  dbCredentials: {
    // PGLite in-memory pour WebContainer/StackBlitz
    url: process.env.DATABASE_URL || 'memory://',
  },

  verbose: true,
  strict: false,
});
