import React from 'react';

/**
 * Définition du contexte pour le mode de couleur.
 * Permet aux composants d'appeler toggleColorMode() n'importe où dans l'arbre React.
 */
export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  mode: 'light' as 'light' | 'dark',
});

/**
 * Hook personnalisé pour utiliser facilement le contexte.
 */
export const useColorMode = () => React.useContext(ColorModeContext);
