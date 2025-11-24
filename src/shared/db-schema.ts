/**
 * DÉFINITION DU SCHÉMA DE BASE DE DONNÉES (PostgreSQL / PGLite)
 *
 * Ce fichier définit la structure des tables pour PostgreSQL.
 * Nous utilisons PGLite (Postgres in WASM) pour une compatibilité totale
 * avec les environnements conteneurisés (StackBlitz, Codeflow).
 *
 * @module DatabaseSchema
 */

import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, unique } from 'drizzle-orm/pg-core';

/* -------------------------------------------------------------------------- */
/*                            1. Constantes & Enums                           */
/* -------------------------------------------------------------------------- */
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

/* -------------------------------------------------------------------------- */
/*                            2. Définition des Tables                        */
/* -------------------------------------------------------------------------- */

/**
 * Table `Contact`
 */
export const contacts = pgTable('contacts', {
  // 'serial' est l'équivalent Postgres de l'auto-incrément
  id: serial('id').primaryKey(),

  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),

  phone: text('phone'),
  company: text('company'),
  notes: text('notes'),

  // Timestamps natifs Postgres
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * Table `Project`
 */
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),

  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('active').notNull(),

  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * Table `Task`
 */
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),

  title: text('title').notNull(),
  description: text('description'),

  status: text('status', { enum: TASK_STATUSES }).default('TODO').notNull(),
  priority: text('priority', { enum: PRIORITIES }).default('MEDIUM').notNull(),

  dueDate: timestamp('due_date'),

  // Clés étrangères
  assigneeId: integer('assignee_id').references(() => contacts.id, { onDelete: 'set null' }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * Table `ProjectMember`
 */
export const projectMembers = pgTable(
  'project_members',
  {
    id: serial('id').primaryKey(),
    role: text('role').default('member').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),

    contactId: integer('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
  },
  (t) => [unique('project_members_unq').on(t.contactId, t.projectId)]
);

/* -------------------------------------------------------------------------- */
/*                            3. Relations                                    */
/* -------------------------------------------------------------------------- */
// Les relations Drizzle (Application level) restent identiques à la version SQLite
// car c'est une abstraction par-dessus le SQL.

export const contactsRelations = relations(contacts, ({ many }) => ({
  tasks: many(tasks),
  memberships: many(projectMembers),
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
  tasks: many(tasks),
  members: many(projectMembers),
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
