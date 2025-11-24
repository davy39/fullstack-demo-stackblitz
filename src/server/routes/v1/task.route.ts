/**
 * Routeur de gestion des Tâches (Tasks).
 *
 * Ce module expose l'API RESTful pour la gestion du cycle de vie des tâches.
 *
 * Architecture :
 * - Validation : Centralisée via Zod (Shared Schemas).
 * - Erreurs : Utilisation native des Promesses Express 5 (async/await).
 * - Typage : Utilisation stricte des DTOs partagés.
 *
 * @module TaskRoutes
 */

import { Prisma } from '@prisma/client';
import { Router, Request, Response } from 'express';
import { successResponse, errorResponse } from '../../utils/response.js';
import * as taskService from '../../services/task.service.js';
import {
  validate,
  IdParamSchema,
  TaskSchema,
  UpdateTaskStatusSchema,
  CreateTaskDTO,
  UpdateTaskDTO,
  UpdateTaskStatusDTO,
} from '../../middleware/validate.js';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                                Routes (Lecture)                            */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/v1/task/list
 * Récupère la liste des tâches avec filtres optionnels.
 *
 * @query {string} [status] - Filtrer par statut.
 * @query {string} [priority] - Filtrer par priorité.
 * @query {number} [assigneeId] - Filtrer par membre.
 * @query {number} [projectId] - Filtrer par projet.
 */
router.get('/list', async (req: Request, res: Response) => {
  // Extraction et conversion des paramètres de requête
  const { status, priority, assigneeId, projectId } = req.query;
  const filters: any = {};

  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  // Conversion explicite car req.query renvoie des chaînes
  if (assigneeId) filters.assigneeId = Number(assigneeId);
  if (projectId) filters.projectId = Number(projectId);

  // Express 5 gère automatiquement les erreurs (ex: DB down)
  const tasks = await taskService.findAll(filters);
  res.status(200).json(successResponse(tasks, 'Tâches récupérées avec succès'));
});

/**
 * GET /api/v1/task/:id
 * Récupère les détails d'une tâche spécifique.
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
 * @body {CreateTaskDTO} - Données validées par TaskSchema.
 */
router.post('/', validate(TaskSchema), async (req: Request, res: Response) => {
  const taskData = req.body as CreateTaskDTO;

  try {
    const task = await taskService.create(taskData);
    res.status(201).json(successResponse(task, 'Tâche créée avec succès'));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('❌ Error creating task:', error);

      // Gestion spécifique : Contrainte de Clé Étrangère (P2003)
      // Arrive si on envoie un ID de projet ou de contact qui n'existe pas.
      if (error.code === 'P2003') {
        return res
          .status(400) // Bad Request
          .json(errorResponse("Le projet ou le contact assigné n'existe pas"));
      }
    }
    // Autres erreurs -> Express 5 (500 Internal Server Error)
    throw error;
  }
});

/**
 * PUT /api/v1/task/:id
 * Met à jour une tâche existante (Mise à jour partielle).
 *
 * @body {UpdateTaskDTO} - Champs partiels validés.
 */
router.put(
  '/:id',
  validate(IdParamSchema, 'params'),
  validate(TaskSchema.partial()), // Utilisation de .partial() sur le schéma importé
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updateData = req.body as UpdateTaskDTO;

    // Note : Le service gère le cas où l'ID n'existe pas et renvoie null
    // (grâce au try/catch P2025 interne au service)
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
 * Met à jour uniquement le statut d'une tâche.
 *
 * @body {UpdateTaskStatusDTO} - { status: "..." }
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
