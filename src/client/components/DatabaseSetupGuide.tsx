/**
 * Guide de configuration de la base de données (Version Simplifiée).
 *
 * Ce composant s'affiche en cas d'erreur de connexion au backend.
 * Il présente les 4 étapes essentielles pour initialiser l'environnement SQLite/Prisma
 * de manière concise.
 *
 * @module Components
 */

import React from 'react';

// Composants Material UI
import { Alert, Box, Typography, Paper, Button } from '@mui/material';

// Icônes
import {
  Storage as DatabaseIcon,
  Rocket as RocketIcon,
  CheckCircle as CheckIcon,
  MenuBook as DocIcon,
} from '@mui/icons-material';

/**
 * Définition des propriétés du composant.
 */
interface DatabaseSetupGuideProps {
  /** Fonction pour relancer la vérification de connexion (ping) */
  onRetry: () => void;
}

const DatabaseSetupGuide: React.FC<DatabaseSetupGuideProps> = ({ onRetry }) => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Alerte d'erreur initiale */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DatabaseIcon />
          Configuration requise
        </Typography>
        <Typography variant="body2">
          Impossible de se connecter à la base de données. Elle n'est probablement pas encore
          initialisée.
        </Typography>
      </Alert>

      {/* Carte principale des instructions */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <RocketIcon color="primary" />
          Installation Rapide
        </Typography>

        {/* Correction : Remplacement de 'paragraph' par sx={{ mb: 2 }} */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Ce projet utilise **SQLite** via Prisma. Suivez ces étapes dans votre terminal :
        </Typography>

        <Box sx={{ my: 3 }}>
          {/* Étape 1 */}
          <Typography variant="h6" gutterBottom>
            1. Créer le fichier d'environnement
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', fontFamily: 'monospace', mb: 2 }}>
            cp example.env .env
          </Paper>

          {/* Étape 2 */}
          <Typography variant="h6" gutterBottom>
            2. Vérifier la configuration
          </Typography>
          {/* Correction ici aussi */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ouvrez le fichier <code>.env</code> et assurez-vous que l'URL pointe vers le fichier
            local :
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', fontFamily: 'monospace', mb: 2 }}>
            DATABASE_URL="file:./dev.db"
          </Paper>

          {/* Étape 3 */}
          <Typography variant="h6" gutterBottom>
            3. Initialiser la base de données
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', fontFamily: 'monospace', mb: 2 }}>
            npm run db:setup
          </Paper>

          {/* Étape 4 */}
          <Typography variant="h6" gutterBottom>
            4. Ajouter des données de test (Optionnel)
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', fontFamily: 'monospace', mb: 2 }}>
            npm run db:seed
          </Paper>
        </Box>

        {/* Résumé des fonctionnalités */}
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <CheckIcon color="success" />
            Ce que vous obtiendrez
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            • Système de gestion de contacts complet
            <br />
            • Gestion de projets avec assignation d'équipe
            <br />
            • Suivi des tâches (statuts, priorités)
            <br />• Données d'exemple pour tester l'interface
          </Typography>
        </Box>

        {/* Boutons d'action */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={onRetry} startIcon={<DatabaseIcon />}>
            Vérifier la connexion
          </Button>

          <Button
            variant="outlined"
            href="https://www.prisma.io/docs/"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<DocIcon />}
          >
            Documentation Prisma
          </Button>
        </Box>
      </Paper>

      {/* Note de bas de page */}
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Besoin d'aide ?</strong> Consultez le fichier <code>README.md</code> pour plus de
          détails.
        </Typography>
      </Alert>
    </Box>
  );
};

export default DatabaseSetupGuide;
