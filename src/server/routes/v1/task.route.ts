/**
 * Routeur de gestion des Tâches.
 *
 * Ce module expose l'API RESTful pour la création, la lecture, la mise à jour
 * et la suppression des tâches (CRUD).
 *
 * FONCTIONNALITÉS :
 * - Filtrage avancé via paramètres d'URL (Query Params).
 * - Gestion native des erreurs de base de données (SQLite) pour l'intégrité référentielle.
 * - Validation stricte des données entrantes via les schémas Zod partagés.
 *
 * @module TaskRoutes
 */

import { Router, Request, Response } from 'express';
import { successResponse, errorResponse } from '../../utils/response.js';
import * as taskService from '../../services/task.service.js';
import {
  validate,
  IdParamSchema,
  taskSchemas,
  UpdateTaskStatusSchema,
  CreateTaskDTO,
  UpdateTaskDTO,
  UpdateTaskStatusDTO,
} from '../../middleware/validate.js';

const router = Router();

/**
 * Interface locale pour typer les erreurs renvoyées par le driver SQLite (Better-SQLite3).
 * Permet d'accéder proprement à la propriété `.code`.
 */
interface SqliteError extends Error {
  code: string;
}

/* -------------------------------------------------------------------------- */
/*                                Routes (Lecture)                            */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/v1/task/list
 * Récupère la liste des tâches.
 * Accepte des filtres optionnels via les paramètres d'URL.
 *
 * @query status - Filtrer par statut (TODO, DONE...)
 * @query priority - Filtrer par priorité (HIGH, LOW...)
 * @query assigneeId - Filtrer par ID du membre assigné
 * @query projectId - Filtrer par ID du projet
 */
router.get('/list', async (req: Request, res: Response) => {
  const { status, priority, assigneeId, projectId } = req.query;

  // Construction d'un objet filtre strictement typé pour satisfaire TypeScript.
  // Express renvoie req.query comme des chaînes de caractères ou undefined.
  // Nous devons convertir les IDs en nombres.
  const filters: {
    status?: string;
    priority?: string;
    assigneeId?: number;
    projectId?: number;
  } = {};

  if (status) filters.status = String(status);
  if (priority) filters.priority = String(priority);
  // Conversion explicite en nombre pour les IDs
  if (assigneeId) filters.assigneeId = Number(assigneeId);
  if (projectId) filters.projectId = Number(projectId);

  // Appel au service avec l'objet typé (plus besoin de 'as any')
  const tasks = await taskService.findAll(filters);

  res.status(200).json(successResponse(tasks, 'Tâches récupérées avec succès'));
});

/**
 * GET /api/v1/task/:id
 * Récupère une tâche unique par son ID.
 */
router.get('/:id', validate(IdParamSchema, 'params'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const task = await taskService.findById(id);

  if (!task) {
    return res.status(404).json(errorResponse('Tâche introuvable'));
  }

  res.status(200).json(successResponse(task));
});

/* -------------------------------------------------------------------------- */
/*                                Routes (Écriture)                           */
/* -------------------------------------------------------------------------- */

/**
 * POST /api/v1/task
 * Crée une nouvelle tâche.
 *
 * Gestion d'erreur : Intercepte les violations de clé étrangère (FOREIGNKEY)
 * si le client tente d'assigner la tâche à un projet ou un contact inexistant.
 */
router.post('/', validate(taskSchemas.create), async (req: Request, res: Response) => {
  const taskData = req.body as CreateTaskDTO;

  try {
    const task = await taskService.create(taskData);
    res.status(201).json(successResponse(task, 'Tâche créée avec succès'));
  } catch (error) {
    const err = error as SqliteError;

    // Code erreur SQLite 787 : SQLITE_CONSTRAINT_FOREIGNKEY
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res
        .status(400) // Bad Request
        .json(errorResponse("Le projet ou le contact assigné n'existe pas"));
    }

    // Propagation des autres erreurs (500 Internal Server Error)
    throw error;
  }
});

/**
 * PUT /api/v1/task/:id
 * Met à jour les informations générales d'une tâche.
 */
router.put(
  '/:id',
  validate(IdParamSchema, 'params'),
  validate(taskSchemas.update),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updateData = req.body as UpdateTaskDTO;

    // Le service renvoie undefined si l'ID n'existe pas
    const task = await taskService.update(id, updateData);

    if (!task) {
      return res.status(404).json(errorResponse('Tâche introuvable'));
    }

    res.status(200).json(successResponse(task, 'Tâche mise à jour avec succès'));
  }
);

/**
 * DELETE /api/v1/task/:id
 * Supprime une tâche.
 */
router.delete('/:id', validate(IdParamSchema, 'params'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const deleted = await taskService.remove(id);

  if (!deleted) {
    return res.status(404).json(errorResponse('Tâche introuvable'));
  }

  res.status(200).json(successResponse(null, 'Tâche supprimée avec succès'));
});

/* -------------------------------------------------------------------------- */
/*                          Routes Spécifiques (Workflow)                     */
/* -------------------------------------------------------------------------- */

/**
 * PATCH /api/v1/task/:id/status
 * Route spécialisée pour le changement rapide de statut (ex: Drag & Drop Kanban).
 * Accepte uniquement le champ { status }.
 */
router.patch(
  '/:id/status',
  validate(IdParamSchema, 'params'),
  validate(UpdateTaskStatusSchema),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body as UpdateTaskStatusDTO;

    const task = await taskService.updateStatus(id, status);

    if (!task) {
      return res.status(404).json(errorResponse('Tâche introuvable'));
    }

    res.status(200).json(successResponse(task, 'Statut mis à jour'));
  }
);

export default router;
