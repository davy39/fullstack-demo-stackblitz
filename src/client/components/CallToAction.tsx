/**
 * Composant "Appel à l'action" (Call To Action).
 *
 * Ce composant est utilisé pour afficher des messages importants, des états vides (Empty States)
 * ou des écrans d'accueil. Il centre le contenu et propose une action principale via un bouton.
 *
 * @module Components
 */

import React from 'react';
import { Link } from 'react-router-dom';

// Composants Material UI
import { Card, CardContent, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid';

// Icône par défaut
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

/**
 * Définition des propriétés du composant.
 */
interface CallToActionProps {
  /**
   * Grande icône illustrative affichée en haut (Hero).
   * Attend une référence de composant (ex: ContactIcon).
   */
  heroIcon?: React.ElementType;

  /**
   * Icône affichée à l'intérieur du bouton d'action.
   * Par défaut : AddCircleOutlineIcon.
   */
  icon?: React.ElementType;

  /** Titre principal du message */
  title: string;

  /** Texte explicatif ou sous-titre */
  subtitle: string;

  /** URL de redirection lors du clic sur le bouton (optionnel) */
  url?: string;

  /** Libellé du bouton (requis si une URL est fournie) */
  buttonName?: string;
}

/**
 * Affiche une carte centrée avec une mise en page flexible.
 */
const CallToAction: React.FC<CallToActionProps> = ({
  heroIcon: HeroIcon, // Renommage pour usage en JSX (<HeroIcon />)
  icon: Icon = AddCircleOutlineIcon,
  title,
  subtitle,
  url,
  buttonName,
}) => {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh', // Occupe une grande partie de la hauteur visible
        bgcolor: 'background.paper',
        boxShadow: 3,
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: 6,
          bgcolor: 'background.default',
        },
      }}
    >
      <CardContent>
        {/* Conteneur de grille pour aligner verticalement les éléments */}
        <Grid container direction="column" alignItems="center" spacing={3}>
          {/* 1. Zone de l'icône principale (Hero) */}
          {HeroIcon && (
            <Grid>
              <HeroIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
            </Grid>
          )}

          {/* 2. Titre principal */}
          <Grid>
            <Typography variant="h4" component="div" align="center" fontWeight="medium">
              {title}
            </Typography>
          </Grid>

          {/* 3. Description */}
          <Grid>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ maxWidth: 500 }}
            >
              {subtitle}
            </Typography>
          </Grid>

          {/* 4. Bouton d'action (Affiché uniquement si une URL est fournie) */}
          {url && buttonName && (
            <Grid>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to={url}
                startIcon={<Icon />}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 'bold',
                }}
              >
                {buttonName}
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CallToAction;
