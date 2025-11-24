/**
 * Page 404 (Page Non Trouvée).
 *
 * Ce composant est rendu lorsqu'aucune route définie dans `src/client/index.tsx`
 * ne correspond à l'URL demandée par l'utilisateur.
 *
 * UX : Il propose un visuel clair et un moyen rapide de revenir à l'accueil.
 *
 * @module NotFoundPage
 */

import React from 'react';
import { Link } from 'react-router-dom';

// Composants Material UI
import { Container, Card, CardContent, Typography, Box, Button } from '@mui/material';

// Icônes
import { SentimentVeryDissatisfied as SadIcon, Home as HomeIcon } from '@mui/icons-material';

import AppHeroIcon from '../components/AppHeroIcon';

const NotFound: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card elevation={3} sx={{ borderRadius: 4 }}>
        <CardContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="50vh"
            textAlign="center"
            gap={3} // Espacement vertical entre les éléments
          >
            {/* Logo de l'application */}
            <AppHeroIcon />

            {/* Icône d'erreur visuelle */}
            <SadIcon color="action" sx={{ fontSize: 100, opacity: 0.5 }} />

            {/* Titre 404 */}
            <Box>
              <Typography variant="h2" component="h1" fontWeight="bold" color="text.primary">
                404
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Page introuvable
              </Typography>
            </Box>

            {/* Message explicatif */}
            <Typography variant="body1" color="text.secondary" maxWidth="sm">
              Oups ! La page que vous recherchez semble avoir été déplacée, supprimée ou n'a jamais
              existé.
            </Typography>

            {/* Bouton d'action (Call to Action) */}
            <Button
              component={Link}
              to="/"
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              sx={{ mt: 2, px: 4, borderRadius: 2 }}
            >
              Retour à l'accueil
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default NotFound;
