/**
 * Guide de configuration de la base de données (Version détaillée).
 *
 * Ce composant s'affiche lorsque l'application n'arrive pas à se connecter à la base de données.
 * Il fournit des instructions étape par étape pour initialiser l'environnement de développement
 * (création du fichier .env, migration, seed).
 *
 * Note : Adapté pour SQLite et Prisma.
 *
 * @module Components
 */

import React from 'react';

// Composants Material UI
import {
  Alert,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Divider,
} from '@mui/material';

// Icônes
import {
  Storage as DatabaseIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Code as CodeIcon,
  MenuBook as BookIcon,
} from '@mui/icons-material';

/**
 * Définition des props du composant.
 */
interface DatabaseSetupGuideProps {
  /** Fonction de rappel pour tenter une reconnexion sans recharger la page */
  onRetry: () => void;
}

/**
 * Structure d'une étape du guide.
 */
interface SetupStep {
  title: string;
  command: string;
  description: string;
  example?: string;
}

const DatabaseSetupGuide: React.FC<DatabaseSetupGuideProps> = ({ onRetry }) => {
  // Configuration des étapes (Traduites et adaptées SQLite)
  const steps: SetupStep[] = [
    {
      title: "1. Configurer l'environnement",
      command: 'cp example.env .env',
      description: "Créez votre fichier de configuration à partir de l'exemple.",
    },
    {
      title: "2. Vérifier l'URL de la base de données",
      command: 'Ouvrir le fichier .env',
      description: "Assurez-vous que l'URL pointe vers le fichier SQLite local.",
      example: 'DATABASE_URL="file:./dev.db"',
    },
    {
      title: '3. Initialiser la base de données',
      command: 'npm run db:setup',
      description: 'Exécute les migrations Prisma et génère le client.',
    },
    {
      title: '4. Peupler avec des données (Seed)',
      command: 'npm run db:seed',
      description: "Ajoute des contacts, projets et tâches pour tester l'application.",
    },
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Alerte Principale */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DatabaseIcon />
          Configuration requise
        </Typography>
        <Typography variant="body2">
          Il semble que votre base de données ne soit pas encore prête. Suivez les étapes ci-dessous
          pour démarrer.
        </Typography>
      </Alert>

      {/* Carte des étapes */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <PlayIcon color="primary" />
          Guide de Démarrage Rapide
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Ce modèle utilise **SQLite** avec Prisma ORM. Voici comment l'initialiser :
        </Typography>

        <List>
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                <ListItemIcon>
                  <Chip label={index + 1} size="small" color="primary" sx={{ mt: 0.5 }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="h6" component="div" gutterBottom>
                      {step.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {step.description}
                      </Typography>

                      {/* Bloc de code pour la commande */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: 'grey.50',
                          fontFamily: 'monospace',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <CodeIcon fontSize="small" color="action" />
                        <Typography variant="body2" component="code" fontWeight="bold">
                          {step.command}
                        </Typography>
                      </Paper>

                      {/* Exemple optionnel (pour le .env) */}
                      {step.example && (
                        <Box mt={1}>
                          <Typography variant="caption" color="text.secondary">
                            Exemple attendu :
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1,
                              bgcolor: 'grey.100',
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              borderStyle: 'dashed',
                            }}
                          >
                            {step.example}
                          </Paper>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < steps.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Carte des fonctionnalités */}
      <Paper elevation={1} sx={{ p: 3, bgcolor: 'primary.50' }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CheckIcon color="success" />
          Une fois configuré, vous aurez accès à :
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Gestion complète des Contacts" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Gestion de Projets avec assignation d'équipe" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Suivi des Tâches avec Workflow (Kanban)" />
          </ListItem>
        </List>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={onRetry} startIcon={<DatabaseIcon />}>
            Vérifier la connexion
          </Button>

          <Button
            variant="outlined"
            href="https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<BookIcon />}
          >
            Documentation Prisma
          </Button>
        </Box>
      </Paper>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Besoin d'aide ?</strong> Consultez le fichier <code>README.md</code> à la racine
          du projet.
        </Typography>
      </Alert>
    </Box>
  );
};

export default DatabaseSetupGuide;
