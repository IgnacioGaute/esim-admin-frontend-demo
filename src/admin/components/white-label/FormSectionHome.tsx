
import { useState } from 'react'
import { Box, Button, Grid, TextField, Typography } from '@mui/material'
import { Save, Add } from '@mui/icons-material';
import { UploadFileAndPreview, AlertCollapse } from '@/shared/components'
import { IDataFormSectionHome } from '@/admin/utils/interfaces/whitelabel-data.interface';


interface Props{
    dataForm?: IDataFormSectionHome[];
    onSave: (item: IDataFormSectionHome, idx: number) => void;
}

const initItemForm: IDataFormSectionHome = {
    heading: '',
    description: ''
}

export const FormSectionHome = ({
    dataForm,
    onSave
}: Props) => {
    const [arrObjectForm, setArrObjectForm] = useState<IDataFormSectionHome[]>(dataForm && dataForm.length > 0 ? dataForm : [initItemForm]);

    const onSaveSection = async(item: IDataFormSectionHome, idx: number) => {
        console.log("item save", item);
        onSave(item, idx);
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography mb={1} fontWeight='500'>Secciones del Home</Typography>
            </Grid>
            {
                arrObjectForm.map((section, idx) => (
                    <ItemForm 
                        key={idx}
                        moreSection={arrObjectForm.length - 1 == idx && arrObjectForm.length !== 3}
                        onMoreSection={() => setArrObjectForm(values => ([...values, initItemForm]))}
                        values={section}
                        onSaved={(value) => onSaveSection(value, idx)}
                    />
                ))
            }
        </Grid>
    )
}


interface ItemFormProps{
    moreSection?: boolean;
    values:  IDataFormSectionHome;
    onMoreSection?: () => void;
    onSaved: (data: IDataFormSectionHome) => void;
}

const ItemForm = ({
    moreSection = true,
    values,
    onMoreSection,
    onSaved
}: ItemFormProps) => {

    const [formValues, setFormValues] = useState<IDataFormSectionHome>(values);
    const [showErr, setShowErr] = useState(false);

    const handleChange = (key: keyof IDataFormSectionHome, value: string | File) => {
        setFormValues(values => ({...values, [key]: value}))
    }

    const onSaveData = () => {
        const { heading, description, image, image_url } = formValues;

        if( heading == '' || description == '' || ( image == undefined && (image_url == '' || image_url == undefined) ) ){
            setShowErr(true)
            return;
        }

        onSaved(formValues);
    }

    return (
        <Grid item xs={12} container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
                <Grid item xs={12} mb={3}>
                    <TextField 
                        variant='outlined'
                        value={formValues.heading}
                        onChange={(e) => handleChange('heading', e.target.value)}
                        label='Título'
                        size='small'
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        type='text'
                    />
                </Grid>
                <Grid item xs={12} mb={3}>
                    <TextField 
                        variant='outlined'
                        value={formValues.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        label='Descripción'
                        size='small'
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        type='text'
                    />
                </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
                <UploadFileAndPreview 
                    isRequired
                    type={['png', 'jpeg', 'jpg', 'svg']}
                    sizeMax={1}
                    sizeFormatMax='MB'
                    img={formValues.image_url}
                    onChangeFile={(files) => handleChange('image', files[0])}
                />
            </Grid>
            <Grid item xs={12}>
                <AlertCollapse 
                    show={showErr}
                    typeAlert='error'
                    description='Los campos de esta sección son obligatorios'
                />
                <Box width='100%' display='flex' flexDirection='row' alignItems='center' pt={showErr ? 2 : 1} pb={1}>
                    <Button 
                        variant='contained'
                        color='info'
                        disableElevation
                        type='button'
                        size='small'
                        startIcon={<Save />}
                        onClick={onSaveData}
                    >
                        Guardar sección
                    </Button>
                    {
                        moreSection  && onMoreSection &&
                        <Button 
                            variant='outlined'
                            color='info'
                            disableElevation
                            size='small'
                            startIcon={<Add />}
                            sx={{ textTransform: 'capitalize', ml: 2 }}
                            onClick={() => onMoreSection()}
                        >
                            Agregar otra sección
                        </Button>
                    }
                </Box>
            </Grid>
        </Grid>
    )
}