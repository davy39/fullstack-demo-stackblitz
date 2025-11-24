import { ThemeOptions } from '@mui/material/styles';

/**
 * Génère la configuration du thème en fonction du mode (Light/Dark).
 *
 * @param mode - 'light' ou 'dark'
 */
export const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // --- PALETTE LIGHT ---
          primary: {
            main: '#aac7ff',
            light: '#dde5ff',
            dark: '#7b9cff',
          },
          secondary: {
            main: '#bec6dc',
            light: '#eef1f8',
            dark: '#929ab3',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
        }
      : {
          // --- PALETTE DARK ---
          primary: {
            main: '#90caf9', // Bleu plus clair pour le contraste sur fond noir
            light: '#e3f2fd',
            dark: '#42a5f5',
          },
          secondary: {
            main: '#b0bec5',
            light: '#cfd8dc',
            dark: '#78909c',
          },
          background: {
            default: '#121212', // Fond très sombre standard Material
            paper: '#1e1e1e', // Cartes légèrement plus claires
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        }),
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h6: { fontWeight: 500 },
    subtitle1: { fontSize: '1rem' },
    subtitle2: { fontSize: '0.875rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Adaptation de la couleur de la barre en fonction du mode
          backgroundColor: mode === 'light' ? '#aac7ff' : '#333333',
          color: mode === 'light' ? '#000' : '#fff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { transition: '0.3s' },
      },
    },
  },
});
