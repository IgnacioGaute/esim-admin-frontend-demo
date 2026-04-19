import { useState } from 'react';
import { Formik } from 'formik';
import { Box, Button, TextField, InputAdornment, IconButton, FormControlLabel, Checkbox, Typography, Link, FormHelperText } from '@mui/material';
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material'
import { ISignUpForm, SignUpSchema, TypeSignUpData } from '@/public/utils';


interface Props{
  onSubmit: (values: TypeSignUpData) => void;
}


export const FormRegister = ({
  onSubmit
}: Props) => {
  const [showPass, setShowPass] = useState(false);


  const submit = (data: ISignUpForm) => {
    const { name, email, password, type } = data;
    onSubmit({ name, email, password, type });
  }

  return (
    <Formik
      initialValues={{ 
        email: '', 
        password: '', 
        name: '', 
        type: 'SELLER',
        termsAndConditions: false,
        repeatPassword: '' 
      } as ISignUpForm}
      validationSchema={SignUpSchema}
      onSubmit={submit}
    >
      {({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
        <Box component='form' width={'100%'} onSubmit={handleSubmit}>
            <Box width={'100%'} mb={3}>
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
            </Box>
            <Box width={'100%'} mb={3}>
              <TextField 
                variant='outlined'
                value={values.email}
                onChange={handleChange('email')}
                label='Correo electrónico'
                size='small'
                fullWidth
                InputLabelProps={{ shrink: true }}
                type='email'
                error={errors.email !== undefined}
                helperText={errors.email}
              />
            </Box>
            <Box width={'100%'} mb={2}>
                <TextField 
                    variant='outlined'
                    value={values.password}
                    onChange={handleChange('password')}
                    label='Contraseña'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type={showPass ? 'text' : 'password'}
                    error={errors.password !== undefined}
                    helperText={errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPass(showPass ? false : true)}
                                onMouseDown={(event) => event.preventDefault()}
                                size='small'
                            >
                                {showPass ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                            </IconButton>
                        </InputAdornment>
                      )
                  }}
                />
            </Box>
            <Box width={'100%'} mb={2}>
              <TextField 
                variant='outlined'
                value={values.repeatPassword}
                onChange={handleChange('repeatPassword')}
                label='Repetir contraseña'
                size='small'
                fullWidth
                InputLabelProps={{ shrink: true }}
                type={'password'}
                error={errors.repeatPassword !== undefined}
                helperText={errors.repeatPassword}
              />
            </Box>
            <Box mb={3.5}>
              <FormControlLabel 
                control={<Checkbox 
                  size='small' 
                  value={values.termsAndConditions} 
                  onChange={(e) => setFieldValue('termsAndConditions', e.target.value == "false" ? true : false)} />}
                label={<Typography component='p' variant='body2' fontWeight='400' fontSize={13}>
                  Al suscribirse a eSIM Demo, acepta nuestras <Link fontWeight='500' >condiciones generales</Link> y nuestra <Link fontWeight='500' >política de privacidad</Link>.
                </Typography>}
                labelPlacement="end"
              />
              <FormHelperText sx={{marginTop: '10px'}} error>{errors.termsAndConditions}</FormHelperText>
            </Box>
            <Box textAlign={'center'} width={'55%'} margin='0 auto'>
              <Button 
                  variant='contained'
                  color='primary'
                  disableElevation
                  type='submit'
                  fullWidth
                  size='medium'
                  style={{padding: '9px 12px', borderRadius: 40}}
              >
                Crear Cuenta
              </Button>
            </Box>
        </Box>
      )}
  </Formik>
  )
}
