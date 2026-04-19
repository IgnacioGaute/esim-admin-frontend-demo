import { Formik } from 'formik';
import { Box, Button, Grid, TextField } from '@mui/material';
import { Save } from '@mui/icons-material';
import { FormChoicePoolShema, IFormChoicePool } from '@/admin/utils';
import { LayerCardForm } from '../LayerCardForm';

interface Props{
    dataForm?: IFormChoicePool,
    title?: string;
    onBack: () => void;
    onSubmit: (values: IFormChoicePool) => void;
    loading?: boolean;
}

export const FormChoicePool = ({
    dataForm,
    title = 'Agregar nuevo pool',
    onBack,
    onSubmit,
    loading = false
}: Props) => {
    const formInit: IFormChoicePool = dataForm || {
      idPool: '',
      name: '',
      provider: '',
      imsiFrom: '',
      imsiTo: ''
    }

  return (
    <LayerCardForm
      title={title}
      loading={loading}
      onBack={onBack}
    >
    <Formik
      initialValues={formInit}
      validationSchema={FormChoicePoolShema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleSubmit, values, errors }) => (
        <Box component='form' width={'100%'} onSubmit={handleSubmit} pt={2.5}>
          <Grid container spacing={2} width={'100%'}>
              <Grid item xs={12} md={6}>
                  <TextField 
                      variant='outlined'
                      value={values.name}
                      onChange={handleChange('name')}
                      label='Nombre'
                      size='small'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      type='text'
                      error={errors.name !== undefined}
                      helperText={errors.name}
                  />
              </Grid>
              <Grid item xs={12} md={6}>
                  <TextField 
                    variant='outlined'
                    value={values.provider}
                    onChange={handleChange('provider')}
                    label='Proveedor'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type='text'
                    error={errors.provider !== undefined}
                    helperText={errors.provider}
                  />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                    variant='outlined'
                    value={values.imsiFrom}
                    onChange={handleChange('imsiFrom')}
                    label='Imsi Desde'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type='text'
                    error={errors.imsiFrom !== undefined}
                    helperText={errors.imsiFrom}
                  />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                    variant='outlined'
                    value={values.imsiTo}
                    onChange={handleChange('imsiTo')}
                    label='Imsi Hasta'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type='text'
                    error={errors.imsiTo !== undefined}
                    helperText={errors.imsiTo}
                  />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField 
                    variant='outlined'
                    value={values.idPool}
                    onChange={handleChange('idPool')}
                    label='Id Pool'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type='text'
                    error={errors.idPool !== undefined}
                    helperText={errors.idPool}
                  />
              </Grid>
              <Grid item xs={12} md={12} display='flex' justifyContent='flex-end'>
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
              </Grid>
          </Grid>
        </Box>
      )}
    </Formik>
  </LayerCardForm>
  )
}
