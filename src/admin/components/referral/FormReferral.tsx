import { Formik } from 'formik';
import { Button, FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import Save  from '@mui/icons-material/Save';
import { LayerCardForm } from '../LayerCardForm';
import { IFormCodeReferral } from '@/admin/utils/interfaces/referral.interface';
import { FormCodeReferralShema } from '@/admin/utils/shemas/FormCodeReferralShema';


interface Props{
    dataForm?: IFormCodeReferral,
    title?: string;
    onBack: () => void;
    onSubmit: (values: IFormCodeReferral) => void;
    loading?: boolean;
}

export const FormReferral = ({
    title = 'Agregar Código de referido',
    loading = false,
    dataForm,
    onBack,
    onSubmit,
}: Props) => {

    const formInit: IFormCodeReferral = dataForm || {
        referer_code: '',
        commission_percent: 0,
        is_whitelabel: false
    }

    return (
        <LayerCardForm
      title={title}
      loading={loading}
      onBack={onBack}
    >
      <Formik
        initialValues={formInit}
        validationSchema={FormCodeReferralShema}
        onSubmit={onSubmit}
      >
        {({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
            <Grid container spacing={2} component='form' width={'100%'} onSubmit={handleSubmit}>
                <Grid item xs={12} md={4}>
                    <TextField 
                        variant='outlined'
                        value={values.referer_code}
                        onChange={handleChange('referer_code')}
                        label='Código de referido'
                        size='small'
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        type='text'
                        error={errors.referer_code !== undefined}
                        helperText={errors.referer_code}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField 
                      variant='outlined'
                      value={values.commission_percent}
                      onChange={handleChange('commission_percent')}
                      label='% Comisión'
                      size='small'
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      type='number'
                      error={errors.commission_percent !== undefined}
                      helperText={errors.commission_percent}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Grid spacing={2} display='flex' direction='row' gap={2}>
                        <p>Referral whitelabel?</p>
                        <FormControlLabel 
                            control={
                            <Switch 
                                checked={values.is_whitelabel} 
                                onChange={() => setFieldValue('is_whitelabel', values.is_whitelabel ? false : true)} 
                            />
                            } 
                            label="NO/SI" 
                        />
                    </Grid>
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
        )}
      </Formik>
    </LayerCardForm>
    )
}
