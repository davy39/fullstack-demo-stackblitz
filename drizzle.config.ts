/**
 * Configuration de Drizzle Kit.
 *
 * Ce fichier est utilisé par l'outil en ligne de commande (CLI) `drizzle-kit`
 * pour gérer les migrations et l'introspection de la base de données.
 *
 * Contrairement à Prisma qui utilise un fichier `schema.prisma` propriétaire,
 * Drizzle utilise directement vos fichiers TypeScript comme source de vérité.
 *
 * @module DrizzleConfig
 */

import 'dotenv/config'; // Charge les variables d'environnement (.env)
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  /* -------------------------------------------------------------------------- */
  /*                            Source de Vérité                                */
  /* -------------------------------------------------------------------------- */
  /**
   * Chemin vers le fichier (ou le dossier) contenant la définition du schéma.
   * C'est ici que nous pointons vers notre module partagé "Shared Kernel".
   * Drizzle va lire ce fichier pour comprendre la structure des tables.
   */
  schema: './src/shared/db-schema.ts',

  /* -------------------------------------------------------------------------- */
  /*                            Sortie des Migrations                           */
  /* -------------------------------------------------------------------------- */
  /**
   * Dossier où seront générés les fichiers SQL de migration (.sql)
   * et les instantanés du schéma (meta).
   */
  out: './drizzle',

  /* -------------------------------------------------------------------------- */
  /*                            Configuration SGBD                              */
  /* -------------------------------------------------------------------------- */
  /**
   * Le dialecte SQL utilisé.
   * Ici 'sqlite' car nous utilisons un fichier local .db.
   * Autres options : 'postgresql', 'mysql'.
   */
  dialect: 'sqlite',

  /**
   * Identifiants et paramètres de connexion.
   * Pour SQLite, c'est simplement le chemin vers le fichier de base de données.
   */
  dbCredentials: {
    // On récupère l'URL depuis le .env (ex: file:./dev.db)
    // On nettoie le préfixe 'file:' si nécessaire car Drizzle attend souvent un chemin absolu ou relatif direct
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },

  /* -------------------------------------------------------------------------- */
  /*                            Options Avancées                                */
  /* -------------------------------------------------------------------------- */
  /**
   * Si true, demande une confirmation avant d'exécuter des opérations destructrices
   * (comme la suppression de colonnes contenant des données).
   */
  verbose: true,

  /**
   * Préfixe optionnel pour éviter les conflits de noms si plusieurs projets
   * partagent la même base de données (rare en SQLite).
   */
  // tablesFilter: ["project_*"],

  /**
   * Active le mode strict pour une sécurité accrue lors des changements de schéma.
   */
  strict: true,
});
