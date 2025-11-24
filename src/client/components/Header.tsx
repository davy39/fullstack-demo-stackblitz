import React from 'react';
import { Toolbar, Box, AppBar, Button, Link, IconButton, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Brightness4, Brightness7 } from '@mui/icons-material'; // Icônes Lune/Soleil
import { useColorMode } from '../theme/ColorModeContext'; // Notre hook personnalisé

const Header = () => {
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  return (
    <div>
      <AppBar
        position="static"
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          mb: 4,
        }}
      >
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          {/* Logo & Titre */}
          <Link
            component={RouterLink} // Utilisation de RouterLink pour éviter le rechargement de page
            to="/"
            color="inherit"
            style={{ textDecoration: 'none' }}
            sx={{ flexGrow: 1, textAlign: 'left' }}
          >
            <Box display="flex" alignItems="center">
              <img height={40} src="/template-logo.png" alt="logo" />
              <Box ml={1} sx={{ display: { xs: 'none', sm: 'block' } }}>
                Démonstration Fullstack
              </Box>
            </Box>
          </Link>

          {/* Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button component={RouterLink} to="/contacts" color="inherit">
              Contacts
            </Button>
            <Button component={RouterLink} to="/tasks" color="inherit">
              Tâches
            </Button>
            <Button component={RouterLink} to="/projects" color="inherit">
              Projets
            </Button>

            {/* --- BOUTON DARK MODE --- */}
            <IconButton
              sx={{ ml: 1 }}
              onClick={toggleColorMode}
              color="inherit"
              title={
                theme.palette.mode === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'
              }
            >
              {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
