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

// Initialisation automatique du schéma PGLite si les tables n'existent pas
export const initDb = async () => {
  try {
    await client.waitReady;
    await client.exec(`
      CREATE TABLE IF NOT EXISTS "contacts" (
        "id" serial PRIMARY KEY NOT NULL,
        "first_name" text NOT NULL,
        "last_name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text,
        "company" text,
        "notes" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "contacts_email_unique" UNIQUE("email")
      );

      CREATE TABLE IF NOT EXISTS "projects" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "status" text DEFAULT 'active' NOT NULL,
        "start_date" timestamp DEFAULT now() NOT NULL,
        "end_date" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "project_members" (
        "id" serial PRIMARY KEY NOT NULL,
        "role" text DEFAULT 'member' NOT NULL,
        "joined_at" timestamp DEFAULT now() NOT NULL,
        "contact_id" integer NOT NULL REFERENCES "contacts"("id") ON DELETE cascade,
        "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
        CONSTRAINT "project_members_unq" UNIQUE("contact_id","project_id")
      );

      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "status" text DEFAULT 'TODO' NOT NULL,
        "priority" text DEFAULT 'MEDIUM' NOT NULL,
        "due_date" timestamp,
        "assignee_id" integer REFERENCES "contacts"("id") ON DELETE set null,
        "project_id" integer REFERENCES "projects"("id") ON DELETE cascade,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
  } catch (err) {
    console.error('Erreur initialisation BDD PGLite:', err);
  }
};

// Initialisation de l'ORM
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});
