/**
 * Page de création d'un nouveau contact.
 *
 * VALIDATION PARTAGÉE :
 * Ce formulaire utilise Formik pour la gestion d'état et Zod pour la validation.
 * Au lieu de redéfinir les règles de validation ici, nous importons le schéma
 * `CreateContactSchema` depuis le dossier `shared`.
 *
 * Note sur MUI Grid v2 :
 * La prop `item` est obsolète. Nous utilisons `Grid2` avec la prop `size`
 * pour définir la largeur des colonnes.
 *
 * @module NewContactPage
 */

import React from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Formik, Field, ErrorMessage, FormikHelpers } from 'formik';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Icônes
import { AccountCircle, Email, Person, PersonAdd, SaveAlt } from '@mui/icons-material';

// --- IMPORT DU NOYAU PARTAGÉ ---
import {
  type CreateContactDTO,
  type ApiResponse,
  type Contact,
  CreateContactSchema, // Le schéma Zod partagé
} from '../../shared/index';

/**
 * Fonction utilitaire pour adapter Zod à Formik.
 * Formik attend une fonction `validate` qui retourne un objet d'erreurs plat.
 * Zod retourne un résultat structuré qu'il faut convertir.
 */
const validateWithZod = (values: CreateContactDTO) => {
  const result = CreateContactSchema.safeParse(values);

  if (!result.success) {
    // Transformation des erreurs Zod en format simple { champ: "message" }
    // flatten().fieldErrors retourne { field: ["Error 1", "Error 2"] }
    const fieldErrors = result.error.flatten().fieldErrors;
    const formikErrors: Record<string, string> = {};

    Object.entries(fieldErrors).forEach(([key, messages]) => {
      if (messages && messages.length > 0) {
        formikErrors[key] = messages[0];
      }
    });

    return formikErrors;
  }

  return {}; // Aucune erreur
};

const NewContact: React.FC = () => {
  const navigate = useNavigate();

  // Valeurs initiales strictement typées selon le DTO partagé
  const initialValues: CreateContactDTO = {
    firstName: '',
    lastName: '',
    email: '',
    // Les champs optionnels ne sont pas obligatoires ici, Zod gérera leur absence
  };

  /**
   * Soumission du formulaire.
   */
  const handleContactSubmit = async (
    values: CreateContactDTO,
    { setSubmitting, setErrors }: FormikHelpers<CreateContactDTO>
  ) => {
    try {
      // Envoi des données au backend
      const response = await axios.post<ApiResponse<Contact>>('/api/v1/contact', values);

      if (response.data.success) {
        toast.success('Contact créé avec succès !');
        navigate('/contacts');
      }
    } catch (err: unknown) {
      console.error('Erreur création contact:', err);

      if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data as ApiResponse;

        // Gestion spécifique des erreurs de validation serveur (ex: unicité email)
        // Si le serveur renvoie une 409 Conflict, on l'affiche sur le champ email
        if (err.response.status === 409) {
          setErrors({ email: apiError.message });
        } else {
          toast.error(apiError.message || 'Erreur lors de la création');
        }
      } else {
        toast.error('Une erreur inattendue est survenue');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Composant helper pour afficher les erreurs de champ
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
            // Validation via le schéma Zod partagé
            validate={validateWithZod}
            onSubmit={handleContactSubmit}
          >
            {({ handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit}>
                {/* Grid Container */}
                <Grid container spacing={3}>
                  {/* Champ Prénom : size={{ xs: 12, sm: 6 }} remplace xs={12} sm={6} */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field
                      name="firstName"
                      as={TextField}
                      label="Prénom"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                    <FormError name="firstName" />
                  </Grid>

                  {/* Champ Nom */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field
                      name="lastName"
                      as={TextField}
                      label="Nom"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <AccountCircle sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                    <FormError name="lastName" />
                  </Grid>

                  {/* Champ Email (Pleine largeur) */}
                  <Grid size={{ xs: 12 }}>
                    <Field
                      name="email"
                      as={TextField}
                      label="Adresse Email"
                      fullWidth
                      variant="outlined"
                      type="email"
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                    <FormError name="email" />
                  </Grid>

                  {/* Bouton d'action */}
                  <Grid size={{ xs: 12 }}>
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
