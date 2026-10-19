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

// Définition du stockage des données
// Sous WebContainer (StackBlitz), l'écriture synchrone de PGLite sur le filesystem VFS './pgdata' se bloque.
// Si DATABASE_URL n'est pas fourni ou vaut './pgdata', on bascule sur PGlite in-memory (ou 'memory://')
const isStackBlitz = Boolean(process.env.STACKBLITZ || process.env.SHELL?.includes('webcontainer') || process.env.DATABASE_URL === 'memory://');
const dataDir = process.env.DATABASE_URL && process.env.DATABASE_URL !== './pgdata'
  ? process.env.DATABASE_URL
  : undefined; // undefined = in-memory par défaut pour PGlite

// Création du client PGlite
export const client = dataDir ? new PGlite(dataDir) : new PGlite();

export const seedDb = async () => {
  try {
    const existing = await db.select().from(schema.contacts).limit(1);
    if (existing.length === 0) {
      console.log('🌱 Base vide détectée : peuplement initial...');
      const contacts = await db.insert(schema.contacts).values([
        {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          phone: '06 01 02 03 04',
          company: 'Tech Corp',
          notes: "Développeur Lead avec 10 ans d'expérience en React.",
        },
        {
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@example.com',
          phone: '06 99 88 77 66',
          company: 'Design Studio',
          notes: 'Experte UI/UX spécialisée dans les interfaces mobiles.',
        },
        {
          firstName: 'Pierre',
          lastName: 'Durand',
          email: 'pierre.durand@example.com',
          phone: '06 12 34 56 78',
          company: 'Marketing Inc',
          notes: 'Chef de projet certifié Scrum Master.',
        },
        {
          firstName: 'Sophie',
          lastName: 'Dubois',
          email: 'sophie.dubois@example.com',
          phone: '06 11 22 33 44',
          company: 'Data Analytics Co',
          notes: 'Data scientist, experte en Machine Learning et Python.',
        },
      ]).returning();

      const projects = await db.insert(schema.projects).values([
        {
          name: 'Plateforme E-commerce',
          description: 'Refonte complète du site marchand avec React 19 et Node.js.',
          status: 'active',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-30'),
        },
        {
          name: 'Application Mobile',
          description: 'App native pour la gestion de tâches (iOS/Android).',
          status: 'active',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-08-15'),
        },
        {
          name: 'Dashboard Analytique',
          description: 'Tableau de bord BI temps réel pour la direction.',
          status: 'planning',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-09-30'),
        },
      ]).returning();

      await db.insert(schema.projectMembers).values([
        { contactId: contacts[0].id, projectId: projects[0].id, role: 'lead_dev' },
        { contactId: contacts[1].id, projectId: projects[0].id, role: 'designer' },
        { contactId: contacts[2].id, projectId: projects[0].id, role: 'chef_de_projet' },
        { contactId: contacts[1].id, projectId: projects[1].id, role: 'designer' },
        { contactId: contacts[0].id, projectId: projects[1].id, role: 'developer' },
        { contactId: contacts[3].id, projectId: projects[2].id, role: 'data_scientist' },
        { contactId: contacts[2].id, projectId: projects[2].id, role: 'chef_de_projet' },
      ]);

      await db.insert(schema.tasks).values([
        {
          title: 'Setup initial du projet',
          description: 'Initialiser le repository Git, configurer Vite et Express avec TypeScript.',
          status: 'DONE',
          priority: 'HIGH',
          assigneeId: contacts[0].id,
          projectId: projects[0].id,
          dueDate: new Date('2024-01-20'),
        },
        {
          title: 'Maquettes UI Mobile',
          description: 'Concevoir les wireframes et les parcours utilisateurs sur Figma.',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          assigneeId: contacts[1].id,
          projectId: projects[0].id,
          dueDate: new Date('2024-02-15'),
        },
        {
          title: 'Architecture API & Schéma BDD',
          description: 'Définir les modèles Drizzle ORM et les migrations PostgreSQL/PGLite.',
          status: 'DONE',
          priority: 'HIGH',
          assigneeId: contacts[0].id,
          projectId: projects[0].id,
          dueDate: new Date('2024-01-25'),
        },
      ]);
      console.log('✨ Base de données initialisée et peuplée avec succès !');
    }
  } catch (e) {
    console.warn('⚠️ Seeding ignoré ou déjà effectué:', e);
  }
};

// Initialisation automatique du schéma PGLite si les tables n'existent pas
export const initDb = async () => {
  try {
    await client.waitReady;
    console.log('📦 Client PGLite prêt dans', dataDir);
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
