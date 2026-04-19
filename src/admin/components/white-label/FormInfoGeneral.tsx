
import { useState } from 'react';
import { Formik } from 'formik';
import { ChromePicker } from 'react-color';
import   Save  from '@mui/icons-material/Save';
import { Button, FormControlLabel, Grid, InputAdornment, Switch, TextField, Typography } from '@mui/material';
import { IDataFormInfoGeneral } from '@/admin/utils/interfaces/whitelabel-data.interface';
import { FormInfoGeneralWLShema } from '@/admin/utils/shemas/FormInfoGeneralWLShema';




interface Props{
    dataForm?: IDataFormInfoGeneral,
    onSubmit: (values: IDataFormInfoGeneral) => void;
}

export const FormInfoGeneral = ({
    dataForm,
    onSubmit
}: Props) => {
    const [dsplyClrPickerPrimary, setDsplyClrPickerPrimary] = useState(false);
    const [dsplyClrPickerSecondary, setDsplyClrPickerSecondary] = useState(false);

    const formInit: IDataFormInfoGeneral = dataForm || {
        name: '',
        primary_color: '',
        secondary_color: '',
        contact_url: '',
        is_login_enabled: false
    };

    const popover: React.CSSProperties = {
        position: 'absolute',
        zIndex: '2',
    }

    const cover: React.CSSProperties = {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
    }
    
    return (
        <Formik
            initialValues={formInit}
            validationSchema={FormInfoGeneralWLShema}
            onSubmit={onSubmit}
        >
            {({ handleChange, handleSubmit, setFieldValue,values, errors }) => (
                <Grid container spacing={2} component='form' width={'100%'} onSubmit={handleSubmit}>
                    <Grid item xs={12}>
                        <Typography mb={1} fontWeight='500'>Información General</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={4}>
                        <TextField 
                            variant='outlined'
                            value={values.primary_color}
                            label='Color Primario'
                            size='small'
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            type='text'
                            error={errors.primary_color !== undefined}
                            helperText={errors.primary_color}
                            onClick={() => setDsplyClrPickerPrimary(true)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                      <div style={{ width: '24px', height: '24px', borderRadius: '24px', backgroundColor: values.primary_color }}></div>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        { dsplyClrPickerPrimary ? 
                            <div style={popover}>
                                <div style={ cover } onClick={ () => setDsplyClrPickerPrimary(false) }/>
                                <ChromePicker
                                    color={values.primary_color}
                                    onChange={(color, e) => {
                                        setFieldValue('primary_color', color.hex)
                                    }}
                                />
                            </div> : null 
                        }
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField 
                            variant='outlined'
                            value={values.secondary_color}
                            label='Color Secondario'
                            size='small'
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            type='text'
                            error={errors.secondary_color !== undefined}
                            helperText={errors.secondary_color}
                            onClick={() => setDsplyClrPickerSecondary(true)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                      <div style={{ width: '24px', height: '24px', borderRadius: '24px', backgroundColor: values.secondary_color }}></div>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        { dsplyClrPickerSecondary ? 
                            <div style={popover}>
                                <div style={ cover } onClick={ () => setDsplyClrPickerSecondary(false) }/>
                                <ChromePicker
                                    color={values.secondary_color}
                                    onChange={(color, e) => {
                                        setFieldValue('secondary_color', color.hex)
                                    }}
                                />
                            </div> : null 
                        }
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField 
                            variant='outlined'
                            value={values.contact_url}
                            onChange={handleChange('contact_url')}
                            label='Url Contacto'
                            size='small'
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            type='text'
                            error={errors.contact_url !== undefined}
                            helperText={errors.contact_url}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControlLabel
                            control={
                                <Switch checked={values.is_login_enabled} onChange={handleChange('is_login_enabled')} name="is_login_enabled" />
                            }
                            label="Activar Login"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                            variant='contained'
                            color='info'
                            disableElevation
                            type='submit'
                            size='small'
                            startIcon={<Save />}
                        >
                            Guardar
                        </Button>
                    </Grid>
                </Grid>
            )}
        </Formik>
    )
}
