import React from 'react'
import { Formik } from 'formik';
import { Save } from '@mui/icons-material';
import { Box, Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { FormNotificationPushShema, IFormNotificationPush } from '@/admin/utils';
import { LayerCardForm } from '../../LayerCardForm';





interface Props{
  dataForm?: IFormNotificationPush,
  title?: string;
  onBack: () => void;
  onSubmit: (values: IFormNotificationPush) => void;
  loading?: boolean;
}


export const NotificationPushForm = ({
  dataForm,
  title = 'Crear Notificación',
  loading = false,
  onBack,
  onSubmit
}: Props) => {

  const formInit: IFormNotificationPush = dataForm || {
    title: '',
    channel: '',
    description: ''
  }
  
  return (
    <LayerCardForm
      title={title}
      loading={loading}
      onBack={onBack}
    >
      <Formik
          initialValues={formInit}
          validationSchema={FormNotificationPushShema}
          onSubmit={onSubmit}
        >
          {({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
            <Box component='form' width={'100%'} onSubmit={handleSubmit} pt={2.5}>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={5}>
                  <TextField 
                    variant='outlined'
                    value={values.title}
                    onChange={handleChange('title')}
                    label='Titulo'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type='text'
                    error={errors.title !== undefined}
                    helperText={errors.title}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl  variant='outlined' fullWidth error={errors.channel !== undefined}>
                    <InputLabel id="simple-select-channel-label">Canales</InputLabel>
                    <Select
                      labelId="simple-select-channel-label"
                      id="simple-select-channel"
                      value={values.channel}
                      label="Canales"
                      onChange={(e) => setFieldValue('channel', e.target.value)}
                    >
                      {
                        ['ALL', 'ANDROID', 'IOS'].map((type, idx) => (
                          <MenuItem value={type} key={idx}>
                            { type }
                          </MenuItem>
                        ))
                      }
                    </Select>
                    { errors.channel && <FormHelperText>{errors.channel}</FormHelperText> }
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    variant='outlined'
                    value={values.description}
                    onChange={handleChange('description')}
                    label='Descripción'
                    placeholder='Escriba una descripción'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type='text'
                    error={errors.description !== undefined}
                    helperText={errors.description}
                    multiline
                    rows={3}
                    maxRows={4}
                  />
                </Grid>
              </Grid>
              <Box display='flex' justifyContent='flex-start'>
                <Button 
                  variant='contained'
                  color='info'
                  disableElevation
                  type='submit'
                  size='medium'
                  style={{padding: '9px 12px'}}
                  startIcon={<Save />}
                >
                  Guardar
                </Button>
              </Box>
            </Box>
          )}
        </Formik>
    </LayerCardForm>
  )
}
