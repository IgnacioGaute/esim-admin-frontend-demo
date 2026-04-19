import { Formik } from 'formik';
import   Save  from '@mui/icons-material/Save';
import { Button, Grid, TextField, Typography } from '@mui/material';
import { UploadFileAndPreview, AlertCollapse } from '@/shared/components'
import { IDataFormInfoHome } from '@/admin/utils/interfaces/whitelabel-data.interface';
import { FormInfoHomeWLShema } from '@/admin/utils/shemas/FormInfoHomeWLShema';
import { useState } from 'react';


interface Props{
    dataForm?: IDataFormInfoHome;
    onSubmit: (values: IDataFormInfoHome) => void;
    background_image_url?:   string;
    onSavedImg:        (file: File) => void;
}

export const FormInfoHome = ({
    dataForm,
    onSubmit,
    background_image_url,
    onSavedImg
}: Props) => {
    const [err, setErr] = useState(false);
    const [backgroundFile, setBackgroundFile] = useState<File | undefined>();

    const formInit: IDataFormInfoHome = dataForm || {
        main_description: '',
        main_get_esim: '',
        main_heading: '',
    };

    const onSaveImageBackground = () => {
        if( backgroundFile ){
            onSavedImg(backgroundFile)
            return
        }
    
        setErr(true);
    }

    return (
        <Grid container spacing={2}>
            <Formik
                initialValues={formInit}
                validationSchema={FormInfoHomeWLShema}
                onSubmit={onSubmit}
            >
                {({ handleChange, handleSubmit, values, errors }) => (
                    <Grid item xs={12} md={6} component='form' onSubmit={handleSubmit}>
                        <Grid item xs={12} mb={3}>
                            <Typography mb={1} fontWeight='500'>Información del Home</Typography>
                        </Grid>
                        <Grid item xs={12} mb={3}>
                            <TextField 
                                variant='outlined'
                                value={values.main_heading}
                                onChange={handleChange('main_heading')}
                                label='Título principal'
                                size='small'
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                type='text'
                                error={errors.main_heading !== undefined}
                                helperText={errors.main_heading}
                            />
                        </Grid>
                        <Grid item xs={12} mb={3}>
                            <TextField 
                                variant='outlined'
                                value={values.main_description}
                                onChange={handleChange('main_description')}
                                label='Descripción principal'
                                size='small'
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                type='text'
                                error={errors.main_description !== undefined}
                                helperText={errors.main_description}
                            />
                        </Grid>
                        <Grid item xs={12} mb={3}>
                            <TextField 
                                variant='outlined'
                                value={values.main_get_esim}
                                onChange={handleChange('main_get_esim')}
                                label='Principal obtener esim'
                                size='small'
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                type='text'
                                error={errors.main_get_esim !== undefined}
                                helperText={errors.main_get_esim}
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
            <Grid item xs={12} md={6}>
                <Typography fontWeight='500' mb={3}>Background Imagen Home</Typography>
                <Grid item xs={12} mb={3}>
                    <UploadFileAndPreview 
                        isRequired
                        type={['png', 'jpeg', 'jpg', 'svg']}
                        sizeMax={1}
                        sizeFormatMax='MB'
                        img={background_image_url}
                        onChangeFile={(files) => setBackgroundFile(files[0])}
                    />
                    <div style={{ margin: '12px 0' }}>
                        <AlertCollapse 
                            typeAlert='error'
                            show={err}
                            description='La imagen background es requerido'
                        />
                    </div>
                </Grid>
                <Grid item xs={12} >
                    <Button 
                        variant='outlined'
                        color='info'
                        disableElevation
                        size='medium'
                        startIcon={<Save />}
                        sx={{ textTransform: 'capitalize' }}
                        onClick={onSaveImageBackground}
                    >
                        Guardar background
                    </Button>
                </Grid>
            </Grid>
        </Grid>
       
    )
}
