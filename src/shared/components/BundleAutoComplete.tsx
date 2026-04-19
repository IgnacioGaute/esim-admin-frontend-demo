import { memo  } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material'


interface Props {
  bundles:          IBundleOption[];
  loading?:         boolean;
  onSelectBundle:  (bundle: IBundleOption) => void;
  selectBundle?:  IBundleOption; 
}

export interface IBundleOption{
  name:           string;
  description:    string;
  price:          number;
}

export const BundleAutoComplete = memo((props: Props) => {
  const { bundles, loading, onSelectBundle, selectBundle } = props;
  return (
    <Autocomplete
      id="bundle-select"
      sx={{ width: '100%' }}
      size='small'
      options={bundles}
      autoHighlight
      loading={loading}
      value={selectBundle}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            key={key}
            component="li"
            {...optionProps}
          >
            
            {option.description}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Bundle"
          InputLabelProps={{ shrink: true }}
          inputProps={{
            ...params.inputProps,
            style:{
              padding: '6px 14px',
            }
          }}
        />
      )}
      onChange={(event: any, newValue: IBundleOption | null) => {
        if( newValue ){
          onSelectBundle(newValue);
        }
      }}
    />
  )
})
