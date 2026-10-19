/**
 * Point d'entrée principal du serveur Express.
 *
 * Ce fichier configure l'application, les middlewares globaux,
 * le routage principal et délègue la gestion des erreurs à un middleware dédié.
 *
 * @module Server
 */

// Importation de la configuration d'environnement en tout premier
import 'dotenv/config';

import path from 'path';
import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';

// Imports locaux (Notez l'extension .js pour la compatibilité ESM)
import routes from './routes/v1/index.js';
import { securityMiddleware, requestLogger } from './middleware/security.js';
import { globalErrorHandler } from './middleware/error.js';
import { initDb, seedDb } from './db/client.js';

/**
 * Instance de l'application Express.
 */
const app = express();

/* -------------------------------------------------------------------------- */
/*                                 Middlewares                                */
/* -------------------------------------------------------------------------- */

// Application des middlewares de sécurité (Helmet, Rate Limiter)
app.use(securityMiddleware);

// Logging des requêtes HTTP (Horodatage, Méthode, URL)
app.use(requestLogger);

// Parsing du corps des requêtes en JSON
app.use(express.json());

// Configuration CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Servir les fichiers statiques du frontend (dossier dist généré par Vite)
// process.cwd() assure que le chemin est correct quel que soit le dossier de lancement
app.use(express.static(path.resolve(process.cwd(), 'dist')));

/* -------------------------------------------------------------------------- */
/*                                   Routes                                   */
/* -------------------------------------------------------------------------- */

/**
 * Montage des routes de l'API (Version 1).
 * Préfixe: /api/v1
 */
app.use('/api/v1/', routes);

/* -------------------------------------------------------------------------- */
/*                           Frontend & Redirections                          */
/* -------------------------------------------------------------------------- */

/**
 * Redirection de la racine vers le serveur de développement Frontend.
 * Utile principalement en mode développement si on accède au port du backend.
 *
 * @route GET /
 */
app.get('/', (req: Request, res: Response) => {
  // Redirection vers le port par défaut de Vite (3001)
  res.redirect('http://localhost:3001');
});

/**
 * Route "Catch-all" pour le support du routing côté client (SPA).
 * Renvoie le fichier index.html pour toutes les requêtes qui ne correspondent pas à l'API.
 * Cela permet à React Router de gérer l'URL via l'historique du navigateur.
 *
 * @route GET *
 */
app.get(/.*/, (req: Request, res: Response) => {
  res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
});

/* -------------------------------------------------------------------------- */
/*                             Gestion des Erreurs                            */
/* -------------------------------------------------------------------------- */

/**
 * Middleware global de gestion des erreurs.
 * Intercepte toutes les erreurs (validation, base de données, 404, etc.)
 * et renvoie une réponse JSON standardisée.
 */
app.use(globalErrorHandler);

/* -------------------------------------------------------------------------- */
/*                              Démarrage Serveur                             */
/* -------------------------------------------------------------------------- */

/**
 * Création du serveur HTTP natif.
 * Permet une évolution future vers des WebSockets (Socket.io) si nécessaire.
 */
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 3000;

httpServer.listen(Number(PORT), '0.0.0.0', async () => {
  await initDb();
  await seedDb();
  console.log(`
  🚀 Server is running!
  🔉 Listening on port ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});
