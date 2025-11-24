/**
 * Page de détail d'un Contact.
 *
 * Cette page récupère et affiche les informations détaillées d'un contact spécifique
 * en se basant sur son ID passé dans l'URL.
 *
 * ARCHITECTURE :
 * Le typage de l'état et de la réponse API repose entièrement sur le module `shared`.
 * Cela garantit que si le schéma de base de données change (ex: ajout d'un champ),
 * TypeScript signalera ici les éventuelles incohérences.
 *
 * @module ContactDetailPage
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Composants Material UI pour la mise en page
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

// --- IMPORT DU NOYAU PARTAGÉ ---
// On importe les types définis centralement.
// ApiResponse : Structure standardisée de toutes les réponses JSON de l'API.
// Contact : Interface TypeScript correspondant exactement à la table SQL 'contacts'.
import type { Contact, ApiResponse } from '../../shared/index';

const ContactDetail: React.FC = () => {
  // Récupération de l'ID depuis l'URL (ex: /contact/12)
  const { id } = useParams<{ id: string }>();

  // État local typé : peut être un Contact complet ou null (si non chargé/trouvé)
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Effectue l'appel API pour récupérer les données.
   * Déclenché au montage du composant ou si l'ID change.
   */
  useEffect(() => {
    const fetchContact = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // Appel GET typé. axios sait maintenant que 'data' contient une ApiResponse<Contact>.
        const response = await axios.get<ApiResponse<Contact>>(`/api/v1/contact/${id}`);

        if (response.data.success && response.data.data) {
          setContact(response.data.data);
        } else {
          toast.error('Contact introuvable dans la base de données.');
        }
      } catch (err) {
        console.error('Erreur technique:', err);
        toast.error('Impossible de charger les détails du contact.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  // Affichage de l'indicateur de chargement
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <AppLoading />
      </Container>
    );
  }

  // Gestion du cas où l'API ne renvoie pas de contact (404 ou ID invalide)
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

  /**
   * Configuration dynamique des champs à afficher.
   * Cette liste permet de générer le rendu de manière itérative et propre.
   * On filtre les champs optionnels (phone, company, notes) s'ils sont vides.
   */
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
      {/* Barre de navigation supérieure */}
      <Box mb={3}>
        <Button component={Link} to="/contacts" startIcon={<ArrowBackIcon />} color="inherit">
          Retour aux contacts
        </Button>
      </Box>

      {/* Carte principale */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {/* En-tête avec Avatar (Initiales) */}
          <Box display="flex" alignItems="center" mb={4}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 64,
                height: 64,
                fontSize: '1.5rem',
              }}
            >
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

          {/* Liste des informations */}
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
