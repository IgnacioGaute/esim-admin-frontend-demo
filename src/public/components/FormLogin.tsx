import { useState } from 'react';
import { Formik } from 'formik';
import {
  Box,
  Button,
  TextField,
  Link,
  InputAdornment,
  IconButton,
  styled,
  keyframes,
} from '@mui/material';
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import { ISignInForm, SignInSchema } from '../utils';
import { useNavigate } from 'react-router-dom';
import { useTronTheme } from '@/theme/TronThemeContext';

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

const scanLine = keyframes`
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
`;

const NeonTextField = styled(TextField)<{ $color: string; $glowLevel: number }>(
  ({ $color, $glowLevel }) => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(10, 10, 18, 0.6)',
      backdropFilter: 'blur(10px)',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: `rgba(${hexToRgb($color)}, 0.3)`,
        transition: 'all 0.3s ease',
      },
      '&:hover fieldset': {
        borderColor: `rgba(${hexToRgb($color)}, 0.5)`,
      },
      '&.Mui-focused fieldset': {
        borderColor: $color,
        borderWidth: '1px',
        boxShadow:
          $glowLevel > 0
            ? `0 0 ${12 * $glowLevel}px rgba(${hexToRgb($color)}, 0.3)`
            : 'none',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(232, 232, 232, 0.5)',
      fontSize: '13px',
      letterSpacing: '0.05em',
      '&.Mui-focused': {
        color: $color,
      },
    },
    '& .MuiInputBase-input': {
      color: '#E8E8E8',
      fontSize: '14px',
      padding: '14px 16px',
      '&::placeholder': {
        color: 'rgba(232, 232, 232, 0.3)',
      },
    },
    '& .MuiIconButton-root': {
      color: `rgba(${hexToRgb($color)}, 0.6)`,
      '&:hover': {
        color: $color,
        backgroundColor: `rgba(${hexToRgb($color)}, 0.1)`,
      },
    },
    '& .MuiFormHelperText-root': {
      color: '#FF4136',
      marginLeft: '4px',
      fontSize: '11px',
      letterSpacing: '0.03em',
    },
  })
);

const NeonButton = styled(Button)<{ $color: string; $glowLevel: number }>(
  ({ $color, $glowLevel }) => ({
    position: 'relative',
    background: `linear-gradient(135deg, rgba(${hexToRgb($color)}, 0.9) 0%, rgba(${hexToRgb($color)}, 0.7) 100%)`,
    color: '#0A0A0F',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.15em',
    padding: '14px 32px',
    borderRadius: '6px',
    border: 'none',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow:
      $glowLevel > 0
        ? `0 0 ${20 * $glowLevel}px rgba(${hexToRgb($color)}, 0.4),
           0 4px 15px rgba(0, 0, 0, 0.3)`
        : '0 4px 15px rgba(0, 0, 0, 0.3)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)`,
      transition: 'left 0.5s ease',
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow:
        $glowLevel > 0
          ? `0 0 ${30 * $glowLevel}px rgba(${hexToRgb($color)}, 0.5),
             0 8px 25px rgba(0, 0, 0, 0.4)`
          : '0 8px 25px rgba(0, 0, 0, 0.4)',
      '&::before': {
        left: '100%',
      },
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      background: 'rgba(100, 100, 100, 0.3)',
      color: 'rgba(255, 255, 255, 0.3)',
      boxShadow: 'none',
    },
  })
);

const NeonLink = styled(Link)<{ $color: string }>(({ $color }) => ({
  color: `rgba(${hexToRgb($color)}, 0.7)`,
  fontSize: '12px',
  letterSpacing: '0.03em',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    color: $color,
    textDecoration: 'none',
    textShadow: `0 0 10px rgba(${hexToRgb($color)}, 0.5)`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-2px',
    left: 0,
    width: '0%',
    height: '1px',
    background: $color,
    transition: 'width 0.3s ease',
  },
  '&:hover::after': {
    width: '100%',
  },
}));

interface Props {
  onSubmit: (values: ISignInForm) => void;
}

export const FormLogin = ({ onSubmit }: Props) => {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { identity, glowLevel } = useTronTheme();

  return (
    <Formik
      initialValues={{ email: '', password: '' } as ISignInForm}
      validationSchema={SignInSchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleSubmit, values, errors }) => (
        <Box component="form" width="100%" onSubmit={handleSubmit}>
          <Box width="100%" mb={3}>
            <NeonTextField
              $color={identity.primary}
              $glowLevel={glowLevel}
              variant="outlined"
              value={values.email}
              onChange={handleChange('email')}
              label="CORREO ELECTRONICO"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="email"
              error={errors.email !== undefined}
              helperText={errors.email}
              placeholder="usuario@ejemplo.com"
            />
          </Box>
          <Box width="100%" mb={2}>
            <NeonTextField
              $color={identity.primary}
              $glowLevel={glowLevel}
              variant="outlined"
              value={values.password}
              onChange={handleChange('password')}
              label="CONTRASENA"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              type={showPass ? 'text' : 'password'}
              error={errors.password !== undefined}
              helperText={errors.password}
              placeholder="********"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPass(!showPass)}
                      onMouseDown={(event) => event.preventDefault()}
                      size="small"
                    >
                      {showPass ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box mb={4} display="flex" justifyContent="flex-end" width="100%">
            <NeonLink
              component="button"
              type="button"
              $color={identity.primary}
              onClick={() => navigate('/forgot-password')}
            >
              Ha olvidado su contrasena?
            </NeonLink>
          </Box>
          <Box textAlign="center" width="100%">
            <NeonButton
              $color={identity.primary}
              $glowLevel={glowLevel}
              variant="contained"
              disableElevation
              type="submit"
              fullWidth
              size="medium"
            >
              AUTENTICAR
            </NeonButton>
          </Box>
        </Box>
      )}
    </Formik>
  );
};
