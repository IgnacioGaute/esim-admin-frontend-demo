import { useEffect, useState } from 'react';
import { Formik } from 'formik';
import Save  from '@mui/icons-material/Save';
import { Box, Button, Chip, FormControl, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Select, Switch, TextField } from '@mui/material';
import { BundleAutoComplete, CountryAutoComplete, ICountryOption, IBundleOption } from '@/shared/components';
import { IRuleUserRegister, FormRuleUserShema, RuleScopeType, RuleType, IFormDataRuleUser } from '@/admin/utils';
import { LayerCardForm } from '../LayerCardForm';




interface Props{
  dataForm?: IRuleUserRegister,
  title?: string;
  onBack: () => void;
  onSubmit: (values: IFormDataRuleUser) => void;
  loading?: boolean;
  country?: {
    data:   ICountryDataOption[];
    search: (value: string) => void;
    loading?: boolean;
    country?: ICountryOption;
  },
  bundle?:  {
    data: IBundleDataOption[];
    loading?: boolean;
    onChangeIso: (iso: string) => void;
    bundle?: IBundleDataOption;
  };
  isEdit?:  boolean;
}

export interface ICountryDataOption extends ICountryOption{}
export interface IBundleDataOption extends IBundleOption{}

const scopeType: RuleScopeType[] = ['BUNDLE', 'COUNTRY'];
const ruleType: RuleType[] = ['INCLUSION', 'EXCLUSION'];

export const RuleUserForm = ({
  dataForm,
  title = 'Nueva Regla',
  onBack,
  onSubmit,
  loading,
  country,
  bundle,
  isEdit = false
}: Props) => {

  const formInit: IRuleUserRegister  = dataForm || {
    is_active: false,
    scope_type: 'BUNDLE',
    scope_value: '',
    type: 'INCLUSION',
    profit_margin: 0,
  }

 

  const [selectCountry, setSelectCountry] = useState<ICountryDataOption | undefined>(country?.country);
  const [selectBundle, setSelectBundle] = useState<IBundleDataOption | undefined>(bundle?.bundle);

  const [selectCountries, setSelectCountries] = useState<ICountryDataOption[]>([]);
  const [selectBundles, setSelectBundles] = useState<IBundleDataOption[]>([]);

  useEffect(() => {
    setSelectCountry(country?.country);
  }, [country?.country])
  
  useEffect(() => {
    setSelectBundle(bundle?.bundle);
  }, [bundle?.bundle])

  const onValues = (values: IRuleUserRegister) => {
    const scope_values = values.scope_value.includes(',') ? values.scope_value.split(',') : [values.scope_value];

    onSubmit({
      ...values,
      profit_margin: parseFloat(values.profit_margin+'').toFixed(2),
      multiple_scope_values: scope_values
    })
  }

  return (
    <LayerCardForm
      title={title}
      loading={loading || false}
      onBack={onBack}
    >
      <Formik
        initialValues={formInit}
        validationSchema={FormRuleUserShema}
        onSubmit={onValues}
      >
        {({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
          <Grid container spacing={3} mb={3} pt={2.5} component='form' width={'100%'} onSubmit={handleSubmit} >
            <Grid item xs={12} md={4}>
              <FormControl  variant='outlined' fullWidth error={errors.type !== undefined}>
                <InputLabel id="simple-select-type-label">Tipo</InputLabel>
                <Select
                  labelId="simple-select-type-label"
                  id="simple-select-type"
                  value={values.type}
                  label="Tipo"
                  onChange={(e) => setFieldValue('type', e.target.value)}
                >
                  {
                    ruleType.map((type, idx) => (
                      <MenuItem value={type} key={idx}>
                        { type }
                      </MenuItem>
                    ))
                  }
                </Select>
                { errors.type && <FormHelperText>{errors.type}</FormHelperText> }
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl  variant='outlined'  fullWidth error={errors.type !== undefined}>
                <InputLabel id="simple-select-type-label">Tipo de ámbito</InputLabel>
                <Select
                  labelId="simple-select-type-label"
                  id="simple-select-type"
                  value={values.scope_type}
                  label="Tipo de ámbito"
                  onChange={(e) => setFieldValue('scope_type', e.target.value)}
                >
                  {
                    scopeType.map((type, idx) => (
                      <MenuItem value={type} key={idx}>
                        { type }
                      </MenuItem>
                    ))
                  }
                </Select>
                { errors.type && <FormHelperText>{errors.type}</FormHelperText> }
              </FormControl>
            </Grid>
            {
              country &&
              <Grid item xs={12} md={4}>
                <CountryAutoComplete 
                  countries={country.data}
                  onChangeSearch={value => {
                    if( selectCountry && value !== '' ){
                      return;
                    }else{
                      setSelectCountry(undefined);
                      if( bundle?.onChangeIso ){
                        bundle.onChangeIso('');
                      }
                    } 
                      

                    country.search(value)
                  }}
                  loading={country.loading}
                  onSelectCountry={country => {
                    setSelectCountry(country);

                    if( values.scope_type == 'COUNTRY' ){
                      let scopeValue = values.scope_value == '' ? country.iso : values.scope_value;
                      const scopeValuesArr = scopeValue.includes(',') ? scopeValue.split(',') : values.scope_value != '' ?  [scopeValue, country.iso]: [];
                        
                      if( !scopeValuesArr.includes(country.iso) ){
                        scopeValuesArr.push(country.iso);
                      }
                        

                      if( scopeValuesArr.length > 0 )  scopeValue = scopeValuesArr.join(',');

                      setSelectCountries(values => {
                        if( values.find(value => value.iso == country.iso) ){
                          return [...values];
                        }

                        return [...values, country]
                      });

                      setFieldValue('scope_value', isEdit ? country.iso : scopeValue);
                      return;
                    }

                    
                    if( bundle?.onChangeIso ) {
                      bundle.onChangeIso(country.iso)
                    }
                  }}
                  selectCountry={selectCountry}
                />
              </Grid>
            }
            
            {
              values.scope_type == 'BUNDLE' && selectCountry &&
              <Grid item xs={12} md={4}>
                <BundleAutoComplete 
                  bundles={bundle?.data || []}
                  loading={bundle?.loading}
                  onSelectBundle={bundleValue => {
                    let scopeValue = values.scope_value == '' ? bundleValue.name : values.scope_value;
                    const scopeValuesArr = scopeValue.includes(',') ? scopeValue.split(',') : values.scope_value != '' ?  [scopeValue, bundleValue.name]: [];

                    if( !scopeValuesArr.includes(bundleValue.name) ){
                      scopeValuesArr.push(bundleValue.name);
                    }
                      

                    if( scopeValuesArr.length > 0 )  scopeValue = scopeValuesArr.join(',');

                    setSelectBundles(values => {
                      if( values.find(value => value.name == bundleValue.name) ){
                        return [...values];
                      }

                      return [...values, bundleValue]
                    });

                    setFieldValue('scope_value', isEdit ? bundleValue : scopeValue);
                    setSelectBundle(bundleValue);
                  }}
                  selectBundle={selectBundle}
                />
              </Grid>
            }

            {
              !isEdit && ( selectCountries.length > 0 || selectBundles.length > 0 ) &&
              <Grid item xs={12} md={8}>
                {
                  values.scope_type == 'COUNTRY' &&
                  selectCountries.map((item, idx) => (
                    <Chip 
                      key={idx}
                      variant='outlined'
                      label={`${item.name} (${item.iso})`}
                      onDelete={() => {
                        const newCountries = selectCountries.filter(value => value.iso !== item.iso);
                        let value = '';

                        newCountries.map(({iso}, idx) => {
                          value = idx == 0 ? value+''+iso : value+','+iso;
                        });

                        

                        setFieldValue('scope_value', value);
                        setSelectCountries(newCountries);
                      }}
                      sx={{ margin: '5px'}}
                    />
                  ))
                }
                {
                  values.scope_type == 'BUNDLE' &&
                  selectBundles.map((item, idx) => (
                    <Chip 
                      key={idx}
                      variant='outlined'
                      label={`${item.name} ($${item.price.toFixed(2)})`}
                      onDelete={() => {
                        const newBundles = selectBundles.filter(value => value.name !== item.name);
                        let value = '';

                        newBundles.map(({name}, idx) => {
                          value = idx == 0 ? value+''+name : value+','+name;
                        });

                        setFieldValue('scope_value', value);
                        setSelectBundles(newBundles);
                      }}
                      sx={{ margin: '5px'}}
                    />
                  ))
                }
              </Grid>
            }
            <Grid item xs={12} md={4}>
              <TextField 
                variant='outlined'
                value={values.scope_value}
                onChange={handleChange('scope_value')}
                label='Valor de ámbito'
                size='small'
                fullWidth
                InputLabelProps={{ shrink: true }}
                type='text'
                error={errors.scope_value !== undefined}
                helperText={errors.scope_value}
                disabled
              />
            </Grid>
          
            <Grid item xs={12} md={4}>
              <TextField 
                variant='outlined'
                value={values.profit_margin}
                onChange={handleChange('profit_margin')}
                label='Margen de profit'
                size='small'
                fullWidth
                InputLabelProps={{ shrink: true }}
                type='number'
                error={errors.profit_margin !== undefined}
                helperText={errors.profit_margin}
              />
            </Grid>  
            <Grid item xs={12} md={4}>
              <FormControlLabel 
                control={
                  <Switch 
                    checked={values.is_active} 
                    onChange={() => setFieldValue('is_active', values.is_active ? false : true)} 
                  />
                } 
                label="Desactivar/Activar" 
              />
            </Grid>
            <Grid item xs={12} pt={2}>
              <Box display='flex' justifyContent='flex-end'>
                <Button 
                  variant='contained'
                  color='info'
                  disableElevation
                  type='submit'
                  size='medium'
                  style={{padding: '6px 12px'}}
                  startIcon={<Save />}
                >
                  Guardar
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Formik>
    </LayerCardForm>
  )
}
