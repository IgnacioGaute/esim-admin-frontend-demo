import styled from '@emotion/styled';
import { AddOutlined, RemoveOutlined } from '@mui/icons-material';
import { Button, Stack, TextField } from '@mui/material';
import React, { useState } from 'react'

export interface QuantityInputProps{
  quantity?: number;
  onChangeQuantity: (qty: number) => void;
}


export const QuantityInput = ({
  quantity = 1,
  onChangeQuantity
}: QuantityInputProps) => {
  const [bundleQuantity, setBundleQuantity] = useState(quantity);

  const handleAddQuantity = () => {
    const qty = bundleQuantity <= 0 ? 1 : bundleQuantity + 1;

    handleBundleQuantity(qty);
  };

  const handleRestQuantity = () => {
    const qty = bundleQuantity <= 0 ? 1 : bundleQuantity - 1;

    handleBundleQuantity(qty);
  };
  
  const handleBundleQuantity = (qty: number) => {
    setBundleQuantity(qty);
    onChangeQuantity(qty);
  }

  return (
    <StyledQuantityContainer>
      <Button onClick={handleRestQuantity}>
        <RemoveOutlined />
      </Button>
      <Stack width="40%" height="100%">
        <TextField
          fullWidth
          value={bundleQuantity <= 0 ? 1 : bundleQuantity}
          type="number"
          onChange={(e: any) => handleBundleQuantity(parseInt(e.target.value))}
          InputProps={{
            inputProps: {
              type: 'number',
              style: { textAlign: 'center' },
            },
            sx: {
              height: '45px',
            },
          }}
          sx={{ 
            border: 'none', 
            '& fieldset': { border: 'none' },
            '& input[type=number]': {
              '-moz-appearance': 'textfield',
            },
            '& input[type=number]::-webkit-outer-spin-button': {
              '-webkit-appearance': 'none',
              margin: 0,
            },
            '& input[type=number]::-webkit-inner-spin-button': {
              '-webkit-appearance': 'none',
              margin: 0,
            },
          }}
        />
      </Stack>
      <Button onClick={handleAddQuantity}>
        <AddOutlined />
      </Button>
    </StyledQuantityContainer>
  )
}

const StyledQuantityContainer = styled(({ ...otherProps }) => (
    <Stack component="section" {...otherProps} />
  ))`
    width: 100%;
    height: 100%;
    flex-direction: row;
    align-self: center;
  
    @media (max-width: 768px) {
      width: 60%;
    }
`;
