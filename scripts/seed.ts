/**
 * Script de peuplement (Seeding) - Version PGLite.
 */
import 'dotenv/config';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../src/shared/db-schema.js';

// Connexion dédiée au script
const dataDir = process.env.DATABASE_URL && process.env.DATABASE_URL !== './pgdata' && process.env.DATABASE_URL !== 'memory://'
  ? process.env.DATABASE_URL
  : undefined;
const client = dataDir ? new PGlite(dataDir) : new PGlite();
const db = drizzle(client, { schema });

async function main() {
  console.log('🌱 Démarrage du peuplement complet...');
  await client.waitReady;

  // Création des tables si nécessaire directement sur le client de seed
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

  // 1. Nettoyage (Ordre inverse des dépendances)
  console.log('🧹 Nettoyage des tables existantes...');
  await db.delete(schema.tasks);
  await db.delete(schema.projectMembers);
  await db.delete(schema.projects);
  await db.delete(schema.contacts);

  /* -------------------------------------------------------------------------- */
  /*                            1. Création des Contacts                        */
  /* -------------------------------------------------------------------------- */
  console.log('👤 Création des 4 contacts...');

  const contacts = await db
    .insert(schema.contacts)
    .values([
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
    ])
    .returning();

  // Mapping pour faciliter l'usage : contacts[0] = Jean, contacts[1] = Marie, etc.

  /* -------------------------------------------------------------------------- */
  /*                            2. Création des Projets                         */
  /* -------------------------------------------------------------------------- */
  console.log('Zb Création des 3 projets...');

  const projects = await db
    .insert(schema.projects)
    .values([
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
    ])
    .returning();

  /* -------------------------------------------------------------------------- */
  /*                        3. Assignation des Membres                          */
  /* -------------------------------------------------------------------------- */
  console.log('🤝 Assignation des membres...');

  // Note : contacts[0] est Jean, [1] Marie, [2] Pierre, [3] Sophie
  //        projects[0] E-com, [1] Mobile, [2] Data

  await db.insert(schema.projectMembers).values([
    // Équipe E-commerce
    { contactId: contacts[0].id, projectId: projects[0].id, role: 'lead_dev' },
    { contactId: contacts[1].id, projectId: projects[0].id, role: 'designer' },
    { contactId: contacts[2].id, projectId: projects[0].id, role: 'chef_de_projet' },

    // Équipe Mobile
    { contactId: contacts[0].id, projectId: projects[1].id, role: 'developpeur' },
    { contactId: contacts[1].id, projectId: projects[1].id, role: 'lead_designer' },

    // Équipe Data
    { contactId: contacts[3].id, projectId: projects[2].id, role: 'data_scientist' },
    { contactId: contacts[2].id, projectId: projects[2].id, role: 'chef_de_projet' },
  ]);

  /* -------------------------------------------------------------------------- */
  /*                            4. Création des Tâches                          */
  /* -------------------------------------------------------------------------- */
  console.log('✅ Création des 7 tâches...');

  await db.insert(schema.tasks).values([
    // --- Tâches E-commerce ---
    {
      title: 'Initialiser le dépôt Git',
      description: 'Configurer le projet React avec TypeScript, ESLint et Prettier.',
      status: 'DONE',
      priority: 'HIGH',
      assigneeId: contacts[0].id, // Jean
      projectId: projects[0].id,
      dueDate: new Date('2024-01-20'),
    },
    {
      title: 'Maquettes de la page de connexion',
      description: "Créer les wireframes pour le flux d'authentification.",
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: contacts[1].id, // Marie
      projectId: projects[0].id,
      dueDate: new Date('2024-02-15'),
    },
    {
      title: 'Développer le catalogue produits',
      description: 'Implémenter la liste des produits avec filtres et recherche.',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeId: contacts[0].id, // Jean
      projectId: projects[0].id,
      dueDate: new Date('2024-03-01'),
    },

    // --- Tâches Mobile ---
    {
      title: 'Navigation principale',
      description: 'Mettre en place la TabBar et le routing mobile.',
      status: 'REVIEW',
      priority: 'HIGH',
      assigneeId: contacts[1].id, // Marie
      projectId: projects[1].id,
      dueDate: new Date('2024-02-20'),
    },
    {
      title: 'Formulaire de création de tâche',
      description: 'Créer les écrans de saisie avec validation Zod.',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeId: contacts[0].id, // Jean
      projectId: projects[1].id,
      dueDate: new Date('2024-03-10'),
    },

    // --- Tâches Data ---
    {
      title: 'Benchmark des librairies de graphiques',
      description: 'Comparer Recharts, D3.js et Chart.js pour le dashboard.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      assigneeId: contacts[3].id, // Sophie
      projectId: projects[2].id,
      dueDate: new Date('2024-03-15'),
    },
    {
      title: 'Pipeline ETL',
      description: "Configurer l'ingestion des données depuis l'API de production.",
      status: 'TODO',
      priority: 'HIGH',
      assigneeId: contacts[3].id, // Sophie
      projectId: projects[2].id,
      dueDate: new Date('2024-04-01'),
    },
  ]);

  console.log('✨ Base de données peuplée avec succès !');
  console.log(`👉 ${contacts.length} contacts créés`);
  console.log(`👉 ${projects.length} projets créés`);
  console.log(`👉 7 tâches créées`);
  await client.close();
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
