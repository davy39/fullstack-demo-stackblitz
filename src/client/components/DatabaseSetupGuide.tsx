/**
 * Guide de dépannage Base de Données (Version PGLite).
 *
 * S'affiche si l'application n'arrive pas à contacter le serveur ou la base de données.
 * Explique le fonctionnement de PGLite (Postgres in WASM) et comment redémarrer.
 *
 * @module DatabaseSetupGuide
 */

import React from 'react';
import { Alert, Box, Typography, Paper, Button } from '@mui/material';
import {
  Storage as DatabaseIcon,
  Rocket as RocketIcon,
  MenuBook as DocIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface DatabaseSetupGuideProps {
  onRetry: () => void;
}

const DatabaseSetupGuide: React.FC<DatabaseSetupGuideProps> = ({ onRetry }) => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Alerte d'erreur */}
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DatabaseIcon />
          Connexion PGLite échouée
        </Typography>
        <Typography variant="body2">
          Le serveur ne répond pas ou la base de données n'a pas pu être initialisée.
        </Typography>
      </Alert>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <RocketIcon color="primary" />
          Architecture PGLite
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Ce projet n'utilise pas SQLite, mais <strong>PGLite</strong> : une version complète de
          PostgreSQL compilée en WebAssembly qui tourne directement dans Node.js.
        </Typography>

        <Box sx={{ my: 3, bgcolor: 'grey.50', p: 2, borderRadius: 1, border: '1px dashed #ccc' }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Comment ça marche ?
          </Typography>
          <Typography variant="body2" paragraph>
            1. PGLite ne nécessite <strong>aucun serveur externe</strong> (pas de Docker).
          </Typography>
          <Typography variant="body2" paragraph>
            2. Les données sont stockées localement dans le dossier : <code>./pgdata</code>
          </Typography>
          <Typography variant="body2">
            3. Le script <code>npm run dev</code> gère tout automatiquement (nettoyage, migration,
            seed).
          </Typography>
        </Box>

        {/* Actions de dépannage */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Solutions
        </Typography>

        <Typography variant="body2" paragraph>
          Si vous voyez cet écran, essayez de relancer le serveur complètement :
        </Typography>

        <Paper
          sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white', fontFamily: 'monospace', mb: 2 }}
        >
          npm run dev
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={onRetry} startIcon={<RefreshIcon />}>
            Réessayer la connexion
          </Button>

          <Button
            variant="outlined"
            href="https://pglite.dev/"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<DocIcon />}
          >
            Documentation PGLite
          </Button>
        </Box>
      </Paper>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>Note :</strong> En environnement WebContainer (StackBlitz/Codeflow), PGLite est la
          solution la plus stable car elle n'utilise pas de binaires natifs C++.
        </Typography>
      </Alert>
    </Box>
  );
};

export default DatabaseSetupGuide;
