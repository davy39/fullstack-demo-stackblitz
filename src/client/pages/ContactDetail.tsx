/**
 * Page de détail d'un Contact.
 *
 * Affiche les informations complètes d'un contact spécifique.
 * Récupère l'ID depuis l'URL, interroge l'API, et affiche les données
 * en utilisant les types partagés pour garantir la cohérence.
 *
 * @module ContactDetailPage
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Composants Material UI
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Typography,
} from '@mui/material';

// Icônes
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AccountCircle as AccountCircleIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Notes as NotesIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

// Composants internes
import AppLoading from '../components/AppLoading';

// --- IMPORT DES TYPES PARTAGÉS ---
import type { Contact, ApiResponse } from '../../shared/index';

const ContactDetail: React.FC = () => {
  // Typage du paramètre d'URL (id est une string par défaut dans React Router)
  const { id } = useParams<{ id: string }>();

  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchContact = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        // Appel API typé avec ApiResponse<Contact>
        // Cela garantit que response.data.data est bien un objet Contact unique
        const response = await axios.get<ApiResponse<Contact>>(`/api/v1/contact/${id}`);

        if (response.data.success && response.data.data) {
          setContact(response.data.data);
        } else {
          toast.error('Contact introuvable');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du contact:', err);
        toast.error('Impossible de charger les détails du contact');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  // Gestion de l'état de chargement
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <AppLoading />
      </Container>
    );
  }

  // Gestion du cas où le contact n'est pas trouvé (ex: ID invalide)
  if (!contact) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Contact introuvable
        </Typography>
        <Button component={Link} to="/contacts" variant="outlined">
          Retour à la liste
        </Button>
      </Container>
    );
  }

  // Configuration des champs à afficher
  // Cette approche par tableau rend le rendu JSX plus propre et maintenable
  const details = [
    {
      label: 'Prénom',
      value: contact.firstName,
      icon: <PersonIcon sx={{ color: 'action.active' }} />,
    },
    {
      label: 'Nom',
      value: contact.lastName,
      icon: <AccountCircleIcon sx={{ color: 'action.active' }} />,
    },
    {
      label: 'Email',
      value: contact.email,
      icon: <EmailIcon sx={{ color: 'action.active' }} />,
    },
    // Affichage conditionnel des champs optionnels s'ils existent dans la BDD
    ...(contact.phone
      ? [
          {
            label: 'Téléphone',
            value: contact.phone,
            icon: <PhoneIcon sx={{ color: 'action.active' }} />,
          },
        ]
      : []),
    ...(contact.company
      ? [
          {
            label: 'Entreprise',
            value: contact.company,
            icon: <BusinessIcon sx={{ color: 'action.active' }} />,
          },
        ]
      : []),
    ...(contact.notes
      ? [
          {
            label: 'Notes',
            value: contact.notes,
            icon: <NotesIcon sx={{ color: 'action.active' }} />,
          },
        ]
      : []),
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Bouton de retour */}
      <Box mb={3}>
        <Button component={Link} to="/contacts" startIcon={<ArrowBackIcon />} color="inherit">
          Retour aux contacts
        </Button>
      </Box>

      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {/* En-tête de la carte */}
          <Box display="flex" alignItems="center" mb={4}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 64,
                height: 64,
                fontSize: '1.5rem',
              }}
            >
              {/* Initiales du contact */}
              {contact.firstName[0]}
              {contact.lastName[0]}
            </Avatar>
            <Box ml={2}>
              <Typography variant="h4" component="h1" fontWeight="medium">
                {contact.firstName} {contact.lastName}
              </Typography>
              {contact.company && (
                <Typography variant="subtitle1" color="text.secondary">
                  {contact.company}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Liste des détails */}
          {details.map((field, index) => (
            <Box key={field.label} sx={{ mb: index !== details.length - 1 ? 3 : 0 }}>
              <Box display="flex" alignItems="center" mb={0.5}>
                {field.icon}
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ ml: 1, fontWeight: 600 }}
                >
                  {field.label}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', ml: 4 }}>
                {field.value}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ContactDetail;
