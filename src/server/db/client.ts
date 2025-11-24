/**
 * Infrastructure Base de Données (PGLite - PostgreSQL in WASM).
 *
 * Ce fichier initialise une instance PostgreSQL légère qui tourne
 * directement dans le processus Node.js (pas de serveur externe requis).
 *
 * @module DatabaseClient
 */
import 'dotenv/config';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../../shared/db-schema.js';

// Définition du dossier de stockage des données
// Contrairement à un fichier .db unique, PGLite utilise un dossier.
const dataDir = process.env.DATABASE_URL || './pgdata';

// Création du client
const client = new PGlite(dataDir);

// Initialisation de l'ORM
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});
