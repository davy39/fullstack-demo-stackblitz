import { defineConfig } from 'prisma/config';

export default defineConfig({
  // Indique où se trouve votre schéma
  schema: 'prisma/schema.prisma',
  // Configure la connexion pour les migrations
  datasource: {
    url: 'file:./dev.db',
  },
});
