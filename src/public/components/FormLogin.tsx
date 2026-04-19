import { useState } from 'react';
import { Formik } from 'formik';
import { Box, Button, TextField, Link, InputAdornment, IconButton } from '@mui/material';
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material'
import { ISignInForm, SignInSchema } from '../utils';
import { useNavigate } from "react-router-dom"

interface Props{
    onSubmit: (values: ISignInForm) => void;
}

export const FormLogin = ({
    onSubmit
}: Props) => {
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate()

    return (
        <Formik
            initialValues={{ email: '', password: '' } as ISignInForm}
            validationSchema={SignInSchema}
            onSubmit={onSubmit}
        >
            {({ handleChange, handleSubmit, values, errors }) => (
                <Box component='form' width={'100%'} onSubmit={handleSubmit}>
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
                    <Box mb={4} display='flex' justifyContent='flex-end' width='100%'>
                        <Link
                            component="button"
                            type='button'
                            variant="body2"
                            onClick={() => navigate("/forgot-password")}
                        >
                            ¿Ha olvidado su contraseña?
                        </Link>
                    </Box>
                    <Box textAlign={'center'} width={'60%'} margin='0 auto'>
                        <Button 
                            variant='contained'
                            color='primary'
                            disableElevation
                            type='submit'
                            fullWidth
                            size='medium'
                            style={{padding: '9px 12px', borderRadius: 40}}
                        >
                            Iniciar Sesión
                        </Button>
                    </Box>
                </Box>
            )}
        </Formik>
    )
}
