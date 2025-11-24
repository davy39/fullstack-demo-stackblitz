/**
 * Routeur de gestion des Contacts.
 *
 * Ce module expose l'API RESTful pour les opérations CRUD sur les contacts.
 *
 * Architecture & Bonnes Pratiques :
 * 1. Validation : Toutes les entrées sont validées via Zod (middleware `validate`).
 * 2. Gestion d'erreurs (Express 5) : Les blocs try/catch sont supprimés pour les erreurs génériques.
 *    Les exceptions remontent automatiquement au middleware global.
 * 3. Gestion spécifique : Seules les erreurs métier (ex: conflit d'email 409) sont interceptées manuellement.
 *
 * @module ContactRoutes
 */

import { Prisma } from '@prisma/client';
import { Router, Request, Response } from 'express';
import {
  validate,
  contactSchemas,
  IdParamSchema,
  CreateContactDTO,
  UpdateContactDTO,
} from '../../middleware/validate.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import contactService from '../../services/contact.service.js';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                                Lectures (GET)                              */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/v1/contact/list
 * Récupère la liste complète des contacts.
 */
router.get('/list', async (req: Request, res: Response) => {
  // Express 5 gère automatiquement les erreurs ici.
  // Si le service échoue (ex: DB down), le globalErrorHandler prendra le relais (500).
  const contacts = await contactService.findAll();
  res.status(200).json(successResponse(contacts, 'Liste des contacts récupérée'));
});

/**
 * GET /api/v1/contact/:id
 * Récupère un contact spécifique par son ID.
 *
 * @param {number} id - L'identifiant du contact (validé par Zod).
 */
router.get('/:id', validate(IdParamSchema, 'params'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const contact = await contactService.findById(id);

  if (!contact) {
    return res.status(404).json(errorResponse('Contact introuvable'));
  }

  res.status(200).json(successResponse(contact));
});

/* -------------------------------------------------------------------------- */
/*                                Écritures (POST, PUT, DELETE)               */
/* -------------------------------------------------------------------------- */

/**
 * POST /api/v1/contact
 * Crée un nouveau contact.
 *
 * @body {CreateContactDTO} - Données validées.
 */
router.post('/', validate(contactSchemas.create), async (req: Request, res: Response) => {
  const contactData = req.body as CreateContactDTO;

  try {
    const contact = await contactService.create(contactData);
    res.status(201).json(successResponse(contact, 'Contact créé avec succès'));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Interception spécifique : Conflit d'unicité (Email déjà pris)
      if (error.code === 'P2002') {
        return res.status(409).json(errorResponse('Cette adresse email est déjà utilisée'));
      }
    }
    // Pour toute autre erreur, on laisse Express 5 gérer (throw)
    throw error;
  }
});

/**
 * PUT /api/v1/contact/:id
 * Met à jour un contact existant.
 *
 * @param {number} id - ID du contact.
 * @body {UpdateContactDTO} - Données à mettre à jour.
 */
router.put(
  '/:id',
  validate(IdParamSchema, 'params'),
  validate(contactSchemas.update),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updateData = req.body as UpdateContactDTO;

    try {
      // Vérification d'existence (Bonne pratique UX pour renvoyer une 404 précise)
      const existing = await contactService.findById(id);
      if (!existing) {
        return res.status(404).json(errorResponse('Contact introuvable pour mise à jour'));
      }

      const updatedContact = await contactService.update(id, updateData);
      res.status(200).json(successResponse(updatedContact, 'Contact mis à jour'));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Gestion du conflit si le nouvel email appartient déjà à un autre contact
        if (error.code === 'P2002') {
          return res
            .status(409)
            .json(errorResponse('Cet email est déjà associé à un autre contact'));
        }
      }
      throw error;
    }
  }
);

/**
 * DELETE /api/v1/contact/:id
 * Supprime un contact.
 *
 * @param {number} id - ID du contact.
 */
router.delete('/:id', validate(IdParamSchema, 'params'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  // Vérification préalable pour éviter une suppression "silencieuse"
  // (Prisma throw une erreur P2025 si on supprime un id inexistant,
  // mais vérifier manuellement permet de contrôler le message 404)
  const contact = await contactService.findById(id);
  if (!contact) {
    return res.status(404).json(errorResponse('Contact introuvable'));
  }

  await contactService.delete(id);
  res.status(200).json(successResponse(null, 'Contact supprimé avec succès'));
});

export default router;
