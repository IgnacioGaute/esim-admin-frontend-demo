import { Box, Button, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material';
import Save from '@mui/icons-material/Save';
import { Formik } from 'formik';
import { IFormCoupon, FormCouponShema } from '@/admin/utils';
import { LayerCardForm } from '../LayerCardForm';


interface Props{
  dataForm?: IFormCoupon,
  title?: string;
  onBack: () => void;
  onSubmit: (values: IFormCoupon) => void;
  loading?: boolean;
}

export const CouponFormEditAndNew = ({
  dataForm,
  title = 'Agregar cupón',
  loading = false,
  onBack,
  onSubmit
}: Props) => {

  const formInit: IFormCoupon = dataForm || {
    code: '',
    discount_percent: 0,
    count: 0,
    enabled: true
  }

  return (
    <LayerCardForm
      title={title}
      loading={loading}
      onBack={onBack}
    >
        <Formik
          initialValues={formInit}
          validationSchema={FormCouponShema}
          onSubmit={onSubmit}
        >
          {({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
            <Box component='form' width={'100%'} onSubmit={handleSubmit} pt={2.5}>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <Box width={'100%'} mb={3}>
                    <TextField 
                      variant='outlined'
                      value={values.code}
                      onChange={handleChange('code')}
                      label='Código'
                      size='small'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      type='text'
                      error={errors.code !== undefined}
                      helperText={errors.code}
                    />
                  </Box>
                  <Box width={'100%'}>
                    <TextField 
                      variant='outlined'
                      value={values.discount_percent}
                      onChange={handleChange('discount_percent')}
                      label='Porcentaje descuento'
                      size='small'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      type='number'
                      error={errors.discount_percent !== undefined}
                      helperText={errors.discount_percent}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box width={'100%'} mb={3}>
                    <TextField 
                      variant='outlined'
                      value={values.count}
                      onChange={handleChange('count')}
                      label='Cantidad'
                      size='small'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      type='number'
                      error={errors.count !== undefined}
                      helperText={errors.count}
                    />
                  </Box>
                  <FormControl>
                    <FormLabel id="demo-row-radio-buttons-group-label">Habilitado</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                    >
                      <FormControlLabel value="si" control={<Radio />} onChange={() => setFieldValue('enabled', true)}  checked={values.enabled === true} label="SI" />
                      <FormControlLabel value="no" control={<Radio />} onChange={() => setFieldValue('enabled', false)} checked={values.enabled === false} label="NO" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
              <Box display='flex' justifyContent='flex-end'>
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
