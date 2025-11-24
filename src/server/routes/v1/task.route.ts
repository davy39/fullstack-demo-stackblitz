/**
 * Routeur de gestion des Tâches.
 *
 * API RESTful pour la gestion complète des tâches.
 *
 * FEATURES :
 * - Filtrage multi-critères via Query Params.
 * - Sécurisation de l'intégrité référentielle via la gestion des erreurs Postgres (23503).
 * - Workflow dédié pour le changement de statut (PATCH).
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

interface PgError extends Error {
  code: string;
  detail?: string;
}

/* -------------------------------------------------------------------------- */
/*                                Routes (Lecture)                            */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/v1/task/list
 * Récupère la liste des tâches avec filtres optionnels.
 */
router.get('/list', async (req: Request, res: Response) => {
  const { status, priority, assigneeId, projectId } = req.query;

  // Construction d'un objet de filtre typé
  const filters: {
    status?: string;
    priority?: string;
    assigneeId?: number;
    projectId?: number;
  } = {};

  if (status) filters.status = String(status);
  if (priority) filters.priority = String(priority);
  // Conversion explicite des IDs (reçus en string)
  if (assigneeId) filters.assigneeId = Number(assigneeId);
  if (projectId) filters.projectId = Number(projectId);

  const tasks = await taskService.findAll(filters);
  res.status(200).json(successResponse(tasks, 'Tâches récupérées avec succès'));
});

/**
 * GET /api/v1/task/:id
 * Récupère une tâche par son ID.
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
 */
router.post('/', validate(taskSchemas.create), async (req: Request, res: Response) => {
  const taskData = req.body as CreateTaskDTO;

  try {
    const task = await taskService.create(taskData);
    res.status(201).json(successResponse(task, 'Tâche créée avec succès'));
  } catch (error) {
    const err = error as PgError;

    // Code Postgres 23503 : foreign_key_violation
    // Cela arrive si assigneeId ou projectId ne correspond à aucun enregistrement existant.
    if (err.code === '23503') {
      return res
        .status(400) // Bad Request
        .json(errorResponse("Le projet ou le contact assigné n'existe pas"));
    }

    throw error;
  }
});

/**
 * PUT /api/v1/task/:id
 * Met à jour une tâche existante.
 */
router.put(
  '/:id',
  validate(IdParamSchema, 'params'),
  validate(taskSchemas.update),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updateData = req.body as UpdateTaskDTO;

    try {
      const task = await taskService.update(id, updateData);

      if (!task) {
        return res.status(404).json(errorResponse('Tâche introuvable'));
      }

      res.status(200).json(successResponse(task, 'Tâche mise à jour avec succès'));
    } catch (error) {
      const err = error as PgError;

      // Vérification aussi lors de l'update (ex: changement d'assignation invalide)
      if (err.code === '23503') {
        return res.status(400).json(errorResponse("Le projet ou le contact assigné n'existe pas"));
      }
      throw error;
    }
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
 * Route dédiée au changement de statut (Kanban).
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
