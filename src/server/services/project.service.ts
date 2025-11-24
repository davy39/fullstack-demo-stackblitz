/**
 * Service de gestion des Projets (Drizzle ORM).
 *
 * Ce module centralise les interactions avec la base de données pour l'entité Projet.
 * Il utilise principalement l'API "Relational Query" de Drizzle pour récupérer
 * les graphiques d'objets complexes (Projet + Tâches + Membres + Contacts) en une seule requête.
 *
 * @module ProjectService
 */

import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { projects, projectMembers } from '../../shared/db-schema.js';

// Types partagés
import type { Project, ProjectWithDetails, ProjectMember } from '../../shared/types.js';
import type { AddMemberDTO, CreateProjectDTO, UpdateProjectDTO } from '../../shared/validators.js';

/* -------------------------------------------------------------------------- */
/*                                Interfaces                                  */
/* -------------------------------------------------------------------------- */

interface ProjectStats {
  totalTasks: number;
  totalMembers: number;
  tasksByStatus: Record<string, number>;
}

/* -------------------------------------------------------------------------- */
/*                                Opérations CRUD                             */
/* -------------------------------------------------------------------------- */

/**
 * Récupère la liste des projets avec filtrage et relations incluses.
 *
 * Note sur l'implémentation :
 * Drizzle récupère les relations (tâches, membres) sous forme de tableaux.
 * Nous calculons les propriétés agrégées `_count` en post-traitement JavaScript
 * pour correspondre à l'interface `ProjectWithDetails` attendue par le Frontend.
 *
 * @param {object} filters - Filtres optionnels (ex: { status: 'active' }).
 * @returns {Promise<ProjectWithDetails[]>} Liste des projets enrichis.
 */
export const findAll = async (filters: { status?: string } = {}): Promise<ProjectWithDetails[]> => {
  // Construction de la clause WHERE dynamique
  const whereClause = filters.status ? eq(projects.status, filters.status) : undefined;

  const results = await db.query.projects.findMany({
    where: whereClause,
    orderBy: [desc(projects.createdAt)],
    with: {
      // Récupération optimisée des tâches (seulement les champs nécessaires)
      tasks: {
        columns: {
          id: true,
          title: true,
          status: true,
          priority: true,
        },
      },
      // Récupération des membres et de leurs contacts associés
      members: {
        with: {
          contact: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Transformation pour ajouter les compteurs (_count)
  return results.map((project) => ({
    ...project,
    _count: {
      tasks: project.tasks.length,
      members: project.members.length,
    },
  }));
};

/**
 * Recherche un projet par son ID avec toutes ses données détaillées.
 *
 * @param {number} id - L'identifiant du projet.
 * @returns {Promise<any | undefined>} Le projet complet ou undefined.
 */
export const findById = async (id: number) => {
  return db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      members: {
        with: {
          contact: true, // Récupère toutes les infos du contact
        },
        orderBy: (members, { asc }) => [asc(members.joinedAt)],
      },
      tasks: {
        with: {
          assignee: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        // Tri des tâches : Priorité décroissante, puis date d'échéance croissante
        orderBy: (t, { asc, desc }) => [desc(t.priority), asc(t.dueDate)],
      },
    },
  });
};

/**
 * Crée un nouveau projet.
 *
 * @param {CreateProjectDTO} data - Données du projet.
 * @returns {Promise<Project>} Le projet créé.
 */
export const create = async (data: CreateProjectDTO): Promise<Project> => {
  const result = await db.insert(projects).values(data).returning();
  return result[0];
};

/**
 * Met à jour un projet existant.
 *
 * @param {number} id - ID du projet.
 * @param {UpdateProjectDTO} data - Données partielles à mettre à jour.
 * @returns {Promise<Project | undefined>} Le projet mis à jour ou undefined.
 */
export const update = async (id: number, data: UpdateProjectDTO): Promise<Project | undefined> => {
  const result = await db.update(projects).set(data).where(eq(projects.id, id)).returning();

  return result[0];
};

/**
 * Supprime un projet.
 *
 * Grâce à la configuration `onDelete: 'cascade'` définie dans le schéma Drizzle,
 * la suppression d'un projet entraîne automatiquement la suppression
 * de ses tâches et de ses liens membres dans la base de données.
 *
 * @param {number} id - ID du projet.
 * @returns {Promise<boolean>} true si supprimé, false si introuvable.
 */
export const remove = async (id: number): Promise<boolean> => {
  const result = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });

  return result.length > 0;
};

/* -------------------------------------------------------------------------- */
/*                        Gestion des Membres                                 */
/* -------------------------------------------------------------------------- */

/**
 * Ajoute un membre à un projet.
 *
 * @param {number} projectId - ID du projet.
 * @param {AddMemberDTO} memberData - Données (contactId, role).
 * @returns {Promise<ProjectMember>} L'entrée créée.
 */
export const addMember = async (
  projectId: number,
  memberData: AddMemberDTO
): Promise<ProjectMember> => {
  const result = await db
    .insert(projectMembers)
    .values({
      projectId,
      contactId: memberData.contactId,
      role: memberData.role || 'member',
    })
    .returning();

  return result[0];
};

/**
 * Récupère tous les membres d'un projet.
 *
 * @param {number} projectId - ID du projet.
 */
export const getMembers = async (projectId: number) => {
  return db.query.projectMembers.findMany({
    where: eq(projectMembers.projectId, projectId),
    with: {
      contact: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
        },
      },
    },
    orderBy: [desc(projectMembers.joinedAt)],
  });
};

/**
 * Retire un membre d'un projet.
 *
 * @param {number} projectId - ID du projet.
 * @param {number} contactId - ID du contact à retirer.
 * @returns {Promise<boolean>} true si retiré.
 */
export const removeMember = async (projectId: number, contactId: number): Promise<boolean> => {
  const result = await db
    .delete(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.contactId, contactId)))
    .returning();

  return result.length > 0;
};

/* -------------------------------------------------------------------------- */
/*                        Statistiques                                        */
/* -------------------------------------------------------------------------- */

/**
 * Calcule les statistiques d'un projet.
 * Récupère les données brutes et effectue l'agrégation en mémoire (Map/Reduce).
 *
 * @param {number} projectId - ID du projet.
 * @returns {Promise<ProjectStats | null>} Statistiques.
 */
export const getProjectStats = async (projectId: number): Promise<ProjectStats | null> => {
  // 1. Vérifier si le projet existe et récupérer ses compteurs de base
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      tasks: { columns: { status: true } },
      members: { columns: { id: true } }, // On récupère juste les IDs pour compter
    },
  });

  if (!project) return null;

  // 2. Calcul de la répartition des statuts
  const tasksByStatus = project.tasks.reduce(
    (acc, task) => {
      const statusKey = task.status as string;
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalTasks: project.tasks.length,
    totalMembers: project.members.length,
    tasksByStatus,
  };
};
