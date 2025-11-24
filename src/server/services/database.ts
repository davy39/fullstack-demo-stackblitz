/**
 * Service d'initialisation du client Prisma (Base de données).
 *
 * ARCHITECTURE :
 * Ce module implémente le pattern "Singleton" via l'objet global `globalThis`.
 * C'est la méthode recommandée par l'équipe Prisma pour les environnements Node.js
 * avec rechargement à chaud (Hot Reloading) comme Vite ou Nodemon.
 *
 * POURQUOI ?
 * En développement, chaque modification de fichier relance le code. Sans cette vérification
 * globale, une nouvelle connexion serait créée à chaque fois, saturant rapidement
 * le pool de connexions ou verrouillant le fichier SQLite ("Database is locked").
 *
 * @module DatabaseService
 */

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

/**
 * Extension du type global de Node.js pour y inclure notre instance Prisma.
 * Cela évite les erreurs de compilation TypeScript lors de l'accès à `globalThis.prisma`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Fonction Factory pour configurer l'adaptateur SQLite et le client.
 * Centralise la logique de connexion.
 */
const prismaClientSingleton = () => {
  // Configuration de l'adaptateur 'better-sqlite3'
  // Il est plus performant que le driver par défaut pour SQLite
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  });

  // Initialisation du client Prisma avec l'adaptateur
  return new PrismaClient({
    adapter,
    // 'minimal' : Logs concis en cas d'erreur.
    // 'query' : Pourrait être ajouté en dev pour voir toutes les requêtes SQL.
    errorFormat: 'minimal',
  });
};

/**
 * Instance exportée du client Prisma.
 *
 * Logique de Singleton :
 * 1. Si une instance existe déjà dans `globalThis` (cas du Hot Reload), on la réutilise.
 * 2. Sinon, on en crée une nouvelle via la factory.
 */
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// En mode développement (hors production), on sauvegarde l'instance dans l'objet global.
// En production, ce n'est pas nécessaire car le processus ne redémarre pas à chaud.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
