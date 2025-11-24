import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ColorModeContext } from './ColorModeContext';
import { getDesignTokens } from './theme';

/**
 * Wrapper global qui gère le Thème et le Dark Mode.
 */
export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. État local pour le mode (par défaut 'dark' ou détection système)
  // Optionnel : Vous pourriez lire le localStorage ici pour persister le choix
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  // 2. Fonction de basculement mémorisée
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode]
  );

  // 3. Création du thème MUI mémorisé
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline est CRUCIAL : il applique la couleur de background au <body> */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
