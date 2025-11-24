/**
 * DÉFINITIONS DES TYPES TYPESCRIPT (Inférence Drizzle)
 *
 * Ce fichier expose les interfaces TypeScript utilisées par le Frontend et le Backend.
 *
 * TRANSITION PRISMA -> DRIZZLE :
 * Au lieu d'importer depuis `@prisma/client`, nous utilisons les utilitaires
 * `InferSelectModel` et `InferInsertModel` de Drizzle pour déduire les types
 * directement depuis la définition du schéma (`schema.ts`).
 *
 * @module SharedTypes
 */

import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import * as schema from './db-schema.js'; // Extension .js obligatoire (NodeNext)

/* -------------------------------------------------------------------------- */
/*                        1. Modèles de Base (Entités)                        */
/* -------------------------------------------------------------------------- */
/**
 * Ces types représentent la structure brute des tables en base de données.
 * Ils correspondent à ce que `SELECT * FROM table` renverrait.
 */

/**
 * Type `Contact`
 * Utilisé pour l'affichage des détails d'un contact.
 */
export type Contact = InferSelectModel<typeof schema.contacts>;

/**
 * Type `Project`
 * Structure de base d'un projet.
 */
export type Project = InferSelectModel<typeof schema.projects>;

/**
 * Type `Task`
 * Structure de base d'une tâche.
 */
export type Task = InferSelectModel<typeof schema.tasks>;

/**
 * Type `ProjectMember`
 * Représente le lien entre un contact et un projet (avec rôle et date d'ajout).
 */
export type ProjectMember = InferSelectModel<typeof schema.projectMembers>;

/* -------------------------------------------------------------------------- */
/*                        2. Types Composés (Relations)                       */
/* -------------------------------------------------------------------------- */
/**
 * Drizzle ne génère pas automatiquement les types avec relations imbriquées
 * (contrairement aux `include` de Prisma).
 * Nous devons définir ces structures pour correspondre à ce que les contrôleurs
 * renvoient au Frontend (DTOs de lecture).
 */

/**
 * Type composite pour la page "Projets".
 * Inclut les statistiques (_count), un aperçu des tâches et les membres.
 */
export interface ProjectWithDetails extends Project {
  // On sélectionne uniquement les champs nécessaires pour l'affichage "Card"
  tasks: Pick<Task, 'id' | 'status' | 'priority'>[];

  // Les membres avec les détails du contact associé
  members: (ProjectMember & {
    contact: Pick<Contact, 'id' | 'firstName' | 'lastName' | 'email'>;
  })[];

  // Agrégations manuelles (calculées dans le service)
  _count: {
    tasks: number;
    members: number;
  };
}

/**
 * Type composite pour la page "Tâches".
 * Inclut le projet parent et la personne assignée.
 */
export interface TaskWithDetails extends Task {
  // Relation optionnelle (peut être null)
  project?: Pick<Project, 'id' | 'name' | 'status'> | null;

  // Relation optionnelle (peut être null)
  assignee?: Pick<Contact, 'id' | 'firstName' | 'lastName' | 'email'> | null;
}

/**
 * Type composite pour la page "Détail Contact".
 * Peut être étendu si besoin pour inclure l'historique des tâches du contact.
 */
export interface ContactWithRelations extends Contact {
  tasks?: Task[];
  projects?: ProjectMember[];
}

/* -------------------------------------------------------------------------- */
/*                        3. Types d'Insertion (Interne)                      */
/* -------------------------------------------------------------------------- */
/**
 * Ces types sont utilisés principalement par les services pour typer les arguments
 * des fonctions `create` ou `insert`.
 * Note : Les schémas Zod (CreateContactDTO) sont souvent préférés pour l'API,
 * mais ces types sont utiles pour la manipulation directe en DB.
 */

export type NewContact = InferInsertModel<typeof schema.contacts>;
export type NewTask = InferInsertModel<typeof schema.tasks>;
export type NewProject = InferInsertModel<typeof schema.projects>;
export type NewProjectMember = InferInsertModel<typeof schema.projectMembers>;
