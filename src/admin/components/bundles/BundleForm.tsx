import { useState } from 'react';
import { Formik } from 'formik';
import { 
  Box, 
  Button, 
  FormControl, 
  FormHelperText, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography 
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { LayerCardForm } from '../LayerCardForm';
import { FormBundleShema } from '@/admin/utils/shemas/FormBundleShema';
import { IBundleFormDataModule, IListCountryRate } from '@/admin/utils/interfaces/bundle-module-data.interface';
import { BoxLoading } from '@/shared';
import { IChoicePool } from '@/admin/utils';


interface Props{
  dataForm?: IBundleFormDataModule,
  title?: string;
  onBack: () => void;
  onSubmit: (values: IBundleFormDataModule) => void;
  loading?: boolean;
  countries: IListCountryRate[];
  loadNetwork: boolean;
  pools: IChoicePool[],
  loadPools: boolean;
}

export const BundleForm = ({
    dataForm,
    title = 'Agregar Paquete',
    loading = false,
    onBack,
    onSubmit,
    countries,
    loadNetwork,
    pools,
    loadPools
}: Props) => {

  const formInit: IBundleFormDataModule = dataForm || {
    name: '',
    description: '',
    dataAmount: 0,
    duration: 0,
    price: 0,
    iso: '',
    serving_mcc_mnc: [],
    choicePoolId: ''
  }

  const [dataNetWorks, setDataNetWorks] = useState<Omit<IListCountryRate, 'name' | 'iso' | 'region'>[]>([]);

  return (
    <LayerCardForm
      title={title}
      loading={loading}
      onBack={onBack}
    >
      <BoxLoading 
        isLoading={loadNetwork}
        title='Obteniendo datos de paises...'
        position='absolute'
      />
      <BoxLoading 
        isLoading={loadPools}
        title='Obteniendo los pools de choice...'
        position='absolute'
      />
      <Formik
        initialValues={formInit}
        validationSchema={FormBundleShema}
        onSubmit={onSubmit}
      >
        {({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
          <Box component='form' width={'100%'} onSubmit={handleSubmit} pt={2.5}>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={6}>
                <Box width={'100%'} mb={3}>
                  <TextField 
                    variant='outlined'
                    value={values.name}
                    onChange={handleChange('name')}
                    label='Nombre de codigo'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type='text'
                    error={errors.name !== undefined}
                    helperText={errors.name}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box width={'100%'} mb={3}>
                  <TextField 
                    variant='outlined'
                    value={values.description}
                    onChange={handleChange('description')}
                    label='Descripcion'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type='text'
                    error={errors.description !== undefined}
                    helperText={errors.description}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box width={'100%'} mb={3}>
                  <TextField 
                    variant='outlined'
                    value={values.duration}
                    onChange={handleChange('duration')}
                    label='Dias de duracion'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type='number'
                    error={errors.duration !== undefined}
                    helperText={errors.duration}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl  variant='outlined' sx={{marginBottom: 3}} fullWidth error={errors.iso !== undefined}>
                  <InputLabel id="simple-select-type-label">Pais</InputLabel>
                  <Select
                    labelId="simple-select-type-label"
                    id="simple-select-type"
                    value={values.iso}
                    label="Selecciona un pais"
                    onChange={(e) => {
                      setFieldValue('iso', e.target.value)
                      countries.filter(item => item.iso === e.target.value).map((value) => {
                        const { name, iso, region, ...data } = value;
                        setDataNetWorks(values => ([...values, data]))
                      })
                    }}
                  >
                    {
                      
                      countries.filter(
                        (item, index, array) =>
                          array.findIndex((el) => el.iso === item.iso) === index
                      ).map((item, idx) => (
                        <MenuItem value={item.iso} key={idx}>
                          { item.name }
                        </MenuItem>
                      ))
                    }
                  </Select>
                  { errors.iso && <FormHelperText>{errors.iso}</FormHelperText> }
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl  variant='outlined' sx={{marginBottom: 3}} fullWidth error={errors.serving_mcc_mnc !== undefined}>
                  <InputLabel id="simple-select-type-label">Networks</InputLabel>
                  <Select
                    labelId="simple-select-type-label"
                    id="simple-select-type"
                    value={values.serving_mcc_mnc}
                    label="Seleccion de network"
                    onChange={(e) => {
                      setFieldValue('serving_mcc_mnc', e.target.value)
                    }}
                    multiple
                  >
                    {
                      dataNetWorks.map((item, idx) => (
                        <MenuItem value={`${item.mcc}${item.mnc}`} key={idx}>
                          { item.network } ({ item.mcc+''+item.mnc })
                        </MenuItem>
                      ))
                    }
                  </Select>
                  { errors.serving_mcc_mnc && <FormHelperText>{
                    Array.isArray(errors.serving_mcc_mnc) ? 
                    errors.serving_mcc_mnc.join(' ')
                    : errors.serving_mcc_mnc
                  }</FormHelperText> }
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box width={'100%'} mb={3}>
                  <TextField 
                    variant='outlined'
                    value={values.dataAmount}
                    onChange={handleChange('dataAmount')}
                    label='Datos'
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    type='number'
                    error={errors.dataAmount !== undefined}
                    helperText={errors.dataAmount}
                    InputProps={{
                      endAdornment: (<Typography color='GrayText'>GB</Typography>)
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
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
                      
                      pools.map((item, idx) => (
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
