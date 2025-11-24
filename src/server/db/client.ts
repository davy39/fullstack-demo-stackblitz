/**
 * Infrastructure Base de Données.
 *
 * Ce fichier est responsable uniquement de l'établissement de la connexion.
 * Il est importé par les services qui ont besoin d'interagir avec la DB.
 *
 * Chemin : src/server/db/client.ts
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql'; // <-- Changement ici
import { createClient } from '@libsql/client'; // <-- Changement ici
import * as schema from '../../shared/db-schema.js';

// Configuration de l'URL
// Si on est en local, on utilise un fichier. LibSQL utilise le préfixe "file:"
const url = process.env.DATABASE_URL || 'file:dev.db';

const client = createClient({ url });

export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development' 
});