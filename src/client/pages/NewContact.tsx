/**
 * Page de création d'un nouveau contact.
 *
 * Utilise la bibliothèque Formik pour la gestion d'état du formulaire
 * et Yup pour la validation côté client (en miroir de Zod côté serveur).
 *
 * @module NewContactPage
 */

import React from 'react';
import {
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import { Formik, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

// Icônes
import { AccountCircle, Email, Person, PersonAdd, SaveAlt } from '@mui/icons-material';

// Types partagés
import type { CreateContactDTO, ApiResponse, Contact } from '../../shared/index';

// Schéma de validation client (Yup)
// Il doit être cohérent avec le schéma Zod du backend
const ContactSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'Trop court').required('Le prénom est requis'),
  lastName: Yup.string().min(2, 'Trop court').required('Le nom est requis'),
  email: Yup.string().email("Format d'email invalide").required("L'email est requis"),
});

const NewContact: React.FC = () => {
  // Valeurs initiales du formulaire typées selon le DTO
  const initialValues: CreateContactDTO = {
    firstName: '',
    lastName: '',
    email: '',
    // phone, company, notes sont optionnels dans le DTO, on peut les omettre ici
  };

  /**
   * Gestionnaire de soumission du formulaire.
   *
   * @param values - Les données du formulaire (automatiquement typées CreateContactDTO)
   * @param actions - Helpers Formik (pour reset le form ou arrêter le loading)
   */
  const handleContactSubmit = async (
    values: CreateContactDTO,
    { resetForm, setSubmitting }: FormikHelpers<CreateContactDTO>
  ) => {
    try {
      // Envoi de la requête POST sur la route racine (REST standard)
      const response = await axios.post<ApiResponse<Contact>>('/api/v1/contact', values);

      if (response.data.success) {
        toast.success('Contact créé avec succès !');
        resetForm();
        // Optionnel : Rediriger vers la liste ou le détail après création
        // navigate("/contacts");
      }
    } catch (err: unknown) {
      console.error('Erreur création contact:', err);

      // Gestion fine des erreurs (ex: email déjà pris)
      if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data as ApiResponse;
        toast.error(apiError.message || 'Erreur lors de la création');
      } else {
        toast.error('Une erreur inattendue est survenue');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Composant utilitaire pour afficher les erreurs de validation.
   * Remplace l'ancien style 'makeStyles'.
   */
  const FormError = ({ name }: { name: string }) => (
    <ErrorMessage name={name}>
      {(msg) => (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5, display: 'block' }}>
          {msg}
        </Typography>
      )}
    </ErrorMessage>
  );

  return (
    <Container maxWidth="md" component="main" sx={{ py: 4 }}>
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {/* En-tête */}
          <Box display="flex" alignItems="center" mb={4}>
            <PersonAdd sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="medium">
              Nouveau Contact
            </Typography>
          </Box>

          <Formik
            initialValues={initialValues}
            validationSchema={ContactSchema}
            onSubmit={handleContactSubmit}
          >
            {({ handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Champ Prénom */}
                  <Grid item xs={12} sm={6}>
                    <Field
                      name="firstName"
                      as={TextField}
                      label="Prénom"
                      required
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                    <FormError name="firstName" />
                  </Grid>

                  {/* Champ Nom */}
                  <Grid item xs={12} sm={6}>
                    <Field
                      name="lastName"
                      as={TextField}
                      label="Nom"
                      required
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <AccountCircle sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                    <FormError name="lastName" />
                  </Grid>

                  {/* Champ Email */}
                  <Grid item xs={12}>
                    <Field
                      name="email"
                      as={TextField}
                      label="Adresse Email"
                      required
                      fullWidth
                      variant="outlined"
                      type="email"
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                    <FormError name="email" />
                  </Grid>

                  {/* Bouton de Soumission */}
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      size="large"
                      disabled={isSubmitting}
                      startIcon={<SaveAlt />}
                      sx={{
                        mt: 2,
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                      }}
                    >
                      {isSubmitting ? 'Création...' : 'Créer le contact'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Container>
  );
};

export default NewContact;
