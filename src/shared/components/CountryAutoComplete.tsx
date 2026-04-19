import { memo, useState, useEffect } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material'
import { useDebouncedValue } from '../hooks/useDebouncedValue';

interface Props{
    countries:      ICountryOption[];
    onChangeSearch: (value: string) => void;
    onSelectCountry: (country: ICountryOption) => void;
    selectCountry?: ICountryOption;
    loading?:       boolean;
}

export interface ICountryOption {
    name:        string;
    description: string;
    iso:         string;
    region:      string;
    currency:    string[];
    flag:        string;
}

export const CountryAutoComplete = memo((props: Props) => {
    const { countries, onChangeSearch, loading, onSelectCountry, selectCountry } = props;

    const [inputSearch, setInputSearch] = useState('');
    const valueSearch = useDebouncedValue(inputSearch);

    useEffect(() => {
      onChangeSearch(valueSearch);
    }, [valueSearch])
    

    return (
        <Autocomplete
            id="country-search-select"
            options={countries}
            size='small'
            sx={{ 
              width: '100%', 
              //'& .MuiAutocomplete-endAdornment': { display: 'none' },
              //'& .MuiOutlinedInput-root': { paddingRight: '20px' } 
            }}
            disableClearable
            autoComplete
            includeInputInList
            filterSelectedOptions
            filterOptions={(x) => x}
            noOptionsText="No hay paises"
            loading={loading}
            value={selectCountry}
            getOptionLabel={(option) =>
                typeof option === 'string' ? option : `${option.name} (${option.iso})`
            }
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box
                    key={key}
                    component="li"
                    sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                    {...optionProps}
                  >
                    <img
                      loading="lazy"
                      width="20"
                      srcSet={`https://flagcdn.com/w40/${option.iso.toLowerCase()}.png 2x`}
                      src={`https://flagcdn.com/w20/${option.iso.toLowerCase()}.png`}
                      alt=""
                    />
                    {option.name} ({option.iso})
                  </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pais"
                  size='small'
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    ...params.inputProps,
                    
                    style:{
                      padding: '6px 14px',
                    },
                  }}
                />
            )}
            onInputChange={(e, newInputValue) => {
                setInputSearch(newInputValue);
            }}
            onChange={(event: any, newValue: ICountryOption | null) => {
                if( newValue ){
                    onSelectCountry(newValue);
                }
            }}
        />
    )
})
