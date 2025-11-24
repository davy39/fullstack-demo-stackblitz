/**
 * Configuration du thème global de l'application (Material UI).
 *
 * Ce fichier agit comme la "source de vérité" pour le design system.
 * Il personnalise le comportement par défaut de Material UI pour correspondre
 * à l'identité visuelle spécifique du projet.
 *
 * Documentation : https://mui.com/material-ui/customization/theming/
 *
 * @module AppTheme
 */

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  /* -------------------------------------------------------------------------- */
  /*                                   Palette                                  */
  /* -------------------------------------------------------------------------- */
  /**
   * Définition des couleurs sémantiques.
   * MUI utilise ces couleurs pour générer automatiquement les états (hover, active, etc.)
   * et le contraste du texte.
   */
  palette: {
    // Couleur principale (Boutons d'action, liens actifs, headers)
    // Ici : Un bleu pastel doux
    primary: {
      main: '#aac7ff',
      light: '#dde5ff', // Teinte plus claire (ex: arrière-plan de sélection)
      dark: '#7b9cff', // Teinte plus sombre (ex: survol de souris)
    },
    // Couleur secondaire (Boutons flottants, éléments de mise en valeur)
    // Ici : Un gris-bleu neutre
    secondary: {
      main: '#bec6dc',
      light: '#eef1f8',
      dark: '#929ab3',
    },
    // Couleurs de fond de l'interface
    background: {
      default: '#f5f5f5', // Fond global de la page (gris très clair)
      paper: '#ffffff', // Fond des cartes et éléments surélevés (blanc pur)
    },
    // Couleurs du texte (Opacité standard Material Design)
    text: {
      primary: 'rgba(0, 0, 0, 0.87)', // Noir adouci pour le texte principal
      secondary: 'rgba(0, 0, 0, 0.6)', // Gris pour les sous-titres et labels
    },
  },

  /* -------------------------------------------------------------------------- */
  /*                                Typographie                                 */
  /* -------------------------------------------------------------------------- */
  /**
   * Configuration des polices et des styles de texte.
   * Utilise la pile de polices système standard ("Roboto", "Helvetica", etc.).
   */
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",

    // Personnalisation des variantes spécifiques
    h6: {
      fontWeight: 500, // Titres de section un peu plus gras
    },
    subtitle1: {
      fontSize: '1rem',
    },
    subtitle2: {
      fontSize: '0.875rem', // Sous-titres plus petits (ex: métadonnées)
    },
  },

  /* -------------------------------------------------------------------------- */
  /*                                Transitions                                 */
  /* -------------------------------------------------------------------------- */
  /**
   * Durées personnalisées pour les animations.
   * Permet d'avoir une interface plus "rapide" ou plus "fluide".
   */
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300, // Durée standard pour la plupart des effets (300ms)
    },
  },

  /* -------------------------------------------------------------------------- */
  /*                           Surcharges Composants                            */
  /* -------------------------------------------------------------------------- */
  /**
   * Modification du style par défaut des composants MUI.
   * Ces règles s'appliquent à TOUS les composants de l'application.
   */
  components: {
    // Personnalisation de tous les boutons <Button>
    MuiButton: {
      styleOverrides: {
        root: {
          // Par défaut, MUI met le texte des boutons en MAJUSCULES (style Android).
          // On désactive cela pour un look plus moderne/web.
          textTransform: 'none',
        },
      },
    },
    // Personnalisation de la barre de navigation supérieure <AppBar>
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#aac7ff', // Force la couleur primaire
          color: '#000', // Texte en noir pour le contraste sur le bleu clair
        },
      },
    },
    // Personnalisation des cartes <Card>
    MuiCard: {
      styleOverrides: {
        root: {
          // Ajout d'une transition fluide pour les effets de survol (hover)
          transition: '0.3s',
        },
      },
    },
  },
});

export default theme;
