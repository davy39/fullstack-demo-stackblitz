import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/shared/db-schema.ts',
  out: './drizzle',

  // Configuration spécifique PostgreSQL / PGLite
  dialect: 'postgresql',
  driver: 'pglite',

  dbCredentials: {
    // PGLite stocke les données dans un dossier.
    // Ici, on utilise le dossier './pgdata' à la racine.
    url: process.env.DATABASE_URL || './pgdata',
  },

  verbose: true,
  strict: false,
});
