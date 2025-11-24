/**
 * DÉFINITION DU SCHÉMA DE BASE DE DONNÉES (Drizzle ORM)
 *
 * Ce fichier agit comme la "Source de Vérité" unique pour l'ensemble de l'application.
 * Il remplace le fichier `schema.prisma`.
 *
 * Rôles de ce fichier :
 * 1. Définir la structure physique des tables SQLite (Colonnes, Types, Clés étrangères).
 * 2. Définir les relations logiques entre les tables pour les requêtes imbriquées (Relations).
 * 3. Servir de base pour la génération automatique des types TypeScript et des schémas Zod.
 *
 * @module DatabaseSchema
 */

import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

/* -------------------------------------------------------------------------- */
/*                            1. Constantes & Enums                           */
/* -------------------------------------------------------------------------- */
/**
 * Définition des valeurs possibles pour les énumérations.
 * SQLite ne gère pas les ENUMs natifs, on utilise donc des colonnes TEXT
 * avec une validation applicative (TypeScript/Zod).
 */
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

/* -------------------------------------------------------------------------- */
/*                            2. Définition des Tables                        */
/* -------------------------------------------------------------------------- */

/**
 * Table `Contact`
 * Représente une personne ou une entité dans le carnet d'adresses.
 */
export const contacts = sqliteTable('Contact', {
  // Clé primaire auto-incrémentée
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Champs textuels standards
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),

  // Email unique (contrainte gérée par SQLite)
  email: text('email').notNull().unique(),

  // Champs optionnels
  phone: text('phone'),
  company: text('company'),
  notes: text('notes'),

  // Timestamps :
  // On utilise `mode: 'timestamp'` pour que Drizzle convertisse automatiquement
  // le nombre (millisecondes) stocké en base vers un objet `Date` JS.
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`), // Défaut : date actuelle (en ms)

  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdate(() => new Date()), // Met à jour la date automatiquement lors d'un .update()
});

/**
 * Table `Project`
 * Représente un projet sur lequel travaillent des contacts.
 */
export const projects = sqliteTable('Project', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('active').notNull(),

  // Gestion des dates (Début / Fin)
  startDate: integer('startDate', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  endDate: integer('endDate', { mode: 'timestamp' }),

  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdate(() => new Date()),
});

/**
 * Table `Task`
 * Tâches assignées à des contacts et liées à des projets.
 */
export const tasks = sqliteTable('Task', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  title: text('title').notNull(),
  description: text('description'),

  // Utilisation des constantes définies plus haut pour le "typage" des colonnes texte
  status: text('status', { enum: TASK_STATUSES }).default('TODO').notNull(),
  priority: text('priority', { enum: PRIORITIES }).default('MEDIUM').notNull(),

  dueDate: integer('dueDate', { mode: 'timestamp' }),

  // Clés étrangères (Foreign Keys)
  // onDelete: 'set null' -> Si le contact est supprimé, la tâche reste mais assigneeId devient null
  assigneeId: integer('assigneeId').references(() => contacts.id, { onDelete: 'set null' }),

  // onDelete: 'cascade' -> Si le projet est supprimé, les tâches associées le sont aussi
  projectId: integer('projectId').references(() => projects.id, { onDelete: 'cascade' }),

  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdate(() => new Date()),
});

/**
 * Table `ProjectMember` (Table de jointure)
 * Gère la relation Many-to-Many entre Contacts et Projets.
 */
export const projectMembers = sqliteTable(
  'ProjectMember',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    role: text('role').default('member').notNull(),
    joinedAt: integer('joinedAt', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),

    // Relations FK
    contactId: integer('contactId')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    projectId: integer('projectId')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    // Contrainte d'unicité composite : Un contact ne peut être qu'une seule fois dans un projet
    unq: unique().on(t.contactId, t.projectId),
  })
);

/* -------------------------------------------------------------------------- */
/*                            3. Relations (Application Level)                */
/* -------------------------------------------------------------------------- */
/**
 * Ces définitions permettent à Drizzle de comprendre comment les tables sont liées.
 * C'est ce qui permet d'utiliser la syntaxe `db.query.contacts.findMany({ with: { tasks: true } })`.
 */

export const contactsRelations = relations(contacts, ({ many }) => ({
  tasks: many(tasks), // Un contact peut avoir plusieurs tâches
  memberships: many(projectMembers), // Un contact peut être membre de plusieurs projets
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignee: one(contacts, {
    fields: [tasks.assigneeId],
    references: [contacts.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks), // Un projet a plusieurs tâches
  members: many(projectMembers), // Un projet a plusieurs membres
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  contact: one(contacts, {
    fields: [projectMembers.contactId],
    references: [contacts.id],
  }),
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
}));
