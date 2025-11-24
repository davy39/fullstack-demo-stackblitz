/**
 * Routeur principal de l'API (Version 1).
 *
 * Rôle :
 * 1. "Hub" de routage : Agrège les sous-modules (Contacts, Tâches, Projets).
 * 2. Point d'entrée : Définit les préfixes d'URL (/contact, /task, etc.).
 * 3. Health Check : Fournit un endpoint de diagnostic pour l'infrastructure.
 *
 * Architecture :
 * Ce fichier ne gère PAS les erreurs. Il laisse les exceptions remonter (bubble up)
 * vers le middleware global défini dans `src/server/index.ts`. Cela garantit
 * que toutes les erreurs de l'application ont exactement le même format JSON.
 *
 * @module ApiRouterV1
 */

import { Router, Request, Response } from 'express';

// Importation des sous-routeurs fonctionnels
// Note : L'extension .js est requise pour la compatibilité ESM / TypeScript NodeNext
import contactRoutes from './contact.route.js';
import taskRoutes from './task.route.js';
import projectRoutes from './project.route.js';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                          Montage des Sous-Routeurs                         */
/* -------------------------------------------------------------------------- */

/**
 * Routes liées aux Contacts.
 * Endpoint : /api/v1/contact
 */
router.use('/contact', contactRoutes);

/**
 * Routes liées aux Tâches.
 * Endpoint : /api/v1/task
 */
router.use('/task', taskRoutes);

/**
 * Routes liées aux Projets.
 * Endpoint : /api/v1/project
 */
router.use('/project', projectRoutes);

/* -------------------------------------------------------------------------- */
/*                          Routes Utilitaires                                */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/v1/health
 * Endpoint de vérification de l'état du service (Health Check).
 *
 * Ce endpoint doit être ultra-léger (pas de requête BDD lourde).
 * Il est appelé fréquemment par les Load Balancers ou Kubernetes.
 *
 * @returns {string} "Ok" avec status 200.
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).send('Ok');
});

export default router;
