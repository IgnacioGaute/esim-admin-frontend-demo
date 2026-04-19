import { Components, Theme } from "@mui/material";

export const customComponentsTheme: Components<Omit<Theme, 'components'>> = {
  'MuiTextField': {
    styleOverrides: {
      root: {
        '& .MuiFormLabel-root': {
          fontSize: 14,
          transform: 'translate(14px, 14px) scale(1)'
        },
        '& .MuiFormLabel-root.MuiInputLabel-shrink': {
          transform: 'translate(14px, -9px) scale(0.90)',
          fontSize: 15,
        },
        '& input': {
          padding: '12px 14px',
        },
        '& .MuiOutlinedInput-notchedOutline legend': {
          fontSize: '0.85rem'
        }
      }
    }
  },
  'MuiFormControl': {
    styleOverrides: {
      root: {
        '& .MuiInputLabel-outlined': {
          fontSize: 14,
          transform: 'translate(14px, 14px) scale(1)'
        },
        '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
          transform: 'translate(14px, -9px) scale(0.90)',
          fontSize: 15,
        },
        '& .MuiSelect-outlined': {
          padding: '12px 14px',
        },
        '& .MuiOutlinedInput-notchedOutline legend': {
          fontSize: '0.85rem'
        }
      }
    }
  },
  'MuiDialog': {
    styleOverrides: {
      root: {
        '& .MuiDialog-paperScrollPaper': {
          '@media (max-width:768px)': {
            margin: '32px 0px',
            width: 'calc(100% - 16px)'
          },
        },
      }
    }
  }
}