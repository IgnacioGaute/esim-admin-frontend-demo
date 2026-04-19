import { Formik } from 'formik';
import { Save } from "@mui/icons-material";
import { Dialog, Card, CardContent, Typography, DialogActions, Button, Alert,    Box, 
    FormControl, 
    FormHelperText, 
    Grid, 
    InputLabel, 
    MenuItem, 
    Select,  TextField} from "@mui/material";
import { FormBundlePoolShema, IChoicePool } from '@/admin/utils';


interface Props{
    onClose: () => void;
    opened: boolean;
    name: string;
    desp: string;
    pools: IChoicePool[],
    idPoolCurrent?: string;
    onSubmit: (newPool: {  choicePoolId: string }) => void;
}

export const EditBundlePoolChoice = ({
    opened,
    name,
    desp,
    onClose,
    onSubmit,
    pools,
    idPoolCurrent = ''
}: Props) => {

      const formInit: {  choicePoolId: string } = {
        choicePoolId: ''
      }

  return (
        <Dialog
            open={opened}
            onClose={onClose}
            maxWidth='xs'
            fullWidth={true}
        >
            <Card elevation={0} sx={{overflow: 'auto'}}>
                <CardContent>
                    <Typography
                        variant='h6'
                        component='h1'
                        fontWeight='500'
                    >
                     { `Editar bundle: ${name}` }
                    </Typography>
                    <Typography>{desp}</Typography>
                    <br />
                    <Formik
                        initialValues={formInit}
                        validationSchema={FormBundlePoolShema}
                        onSubmit={onSubmit}
                    >
                        {({ handleSubmit, values, errors, setFieldValue }) => (
                            <Box component='form' width={'100%'} onSubmit={handleSubmit} pt={2.5}>
                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={12} md={12}>
                                    <FormControl  variant='outlined' sx={{marginBottom: 3}} fullWidth error={errors.choicePoolId !== undefined}>
                                    <InputLabel id="simple-select-type-label">Choice Pool</InputLabel>
                                    <Select
                                        labelId="simple-select-type-label"
                                        id="simple-select-type"
                                        value={values.choicePoolId}
                                        label="Selecciona un pool"
                                        onChange={(e) => {
                                        setFieldValue('choicePoolId', e.target.value)
                                        }}
                                    >
                                        {
                                        
                                        pools.filter(item => item.id !== idPoolCurrent).map((item, idx) => (
                                            <MenuItem value={item.id} key={idx}>
                                            { item.name } <br />
                                            { item.imsiFrom } - { item.imsiTo }
                                            </MenuItem>
                                        ))
                                        }
                                    </Select>
                                    { errors.choicePoolId && <FormHelperText>{errors.choicePoolId}</FormHelperText> }
                                    </FormControl>
                                </Grid>
                                <Box display='flex' justifyContent='flex-end' px={2}>
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
                            </Grid>
                            </Box>
                        )}
                    </Formik>
                </CardContent>
            </Card>
            <DialogActions>
                <Button 
                     variant='contained'
                    color='secondary'
                    sx={{textTransform: 'capitalize',  minWidth: '110px'}}
                    onClick={onClose}
                    disableElevation
                >
                    Cancelar
                </Button>
            </DialogActions>
        </Dialog>
  )
}
