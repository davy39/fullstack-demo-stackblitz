/**
 * Infrastructure Base de Données.
 *
 * Ce fichier est responsable uniquement de l'établissement de la connexion.
 * Il est importé par les services qui ont besoin d'interagir avec la DB.
 *
 * Chemin : src/server/db/client.ts
 */
import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../shared/db-schema.js';

interface GlobalDrizzle {
  conn: Database.Database | undefined;
}

const globalForDb = globalThis as unknown as GlobalDrizzle;

const createConnection = () => {
  const url = process.env.DATABASE_URL?.replace('file:', '') || 'dev.db';
  return new Database(url, { fileMustExist: false });
};

const sqlite = globalForDb.conn ?? createConnection();

export const db = drizzle(sqlite, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = sqlite;
}
