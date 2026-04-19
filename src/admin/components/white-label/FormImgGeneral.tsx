import { useState } from 'react'
import { Button, Grid, Typography } from '@mui/material';
import { UploadFileAndPreview, AlertCollapse } from '@/shared/components'
import   Save  from '@mui/icons-material/Save';

interface IProps{
  onSavedImg:        (type: ImgTypeGeneral, file: File) => void;
  is_navbar_logo?:   string;
  is_footer_logo?:   string;
}

export type ImgTypeGeneral = 'navbar_logo' | 'footer_logo';

export const FormImgGeneral = ({
  onSavedImg,
  is_footer_logo,
  is_navbar_logo
}:IProps) => {

  const [isNavbarLogo, setIsNavbarLogo] = useState<File | undefined>();
  const [isFooterLogo, setIsFooterLogo] = useState<File | undefined>();
  const [err, setErr] = useState<Array<'navbar' | 'footer'>>([]);

  const onSaved = (type: ImgTypeGeneral) => {
    if( type == 'navbar_logo' && isNavbarLogo ){
      onSavedImg(type, isNavbarLogo);
      return
    }

    if( type == 'footer_logo' && isFooterLogo ){
      onSavedImg(type, isFooterLogo);
      return;
    }

    setErr([type == 'navbar_logo' ? 'navbar' : 'footer']);
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Typography fontWeight='500' mb={3}>Logo Navbar</Typography>
        <UploadFileAndPreview 
          isRequired
          type={['png', 'jpeg', 'jpg', 'svg']}
          sizeMax={1}
          sizeFormatMax='MB'
          dimension={{
            start: 300,
            end: 96
          }}
          img={is_navbar_logo}
          onChangeFile={(files) => setIsNavbarLogo(files[0])}
        />
        <div style={{ margin: '12px 0' }}>
          <AlertCollapse 
            typeAlert='error'
            show={err.includes('navbar')}
            description='El logo del navbar es requerido'
          />
        </div>
        <Button 
          variant='outlined'
          color='info'
          disableElevation
          size='medium'
          startIcon={<Save />}
          sx={{ textTransform: 'capitalize' }}
          onClick={() => onSaved('navbar_logo')}
        >
          Guardar Logo Navbar
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Typography fontWeight='500' mb={3}>Logo Footer</Typography>
        <UploadFileAndPreview 
          isRequired
          type={['png', 'jpeg', 'jpg', 'svg']}
          sizeMax={1}
          sizeFormatMax='MB'
          dimension={{
            start: 300,
            end: 96
          }}
          img={is_footer_logo}
          onChangeFile={(files) => setIsFooterLogo(files[0])}
        />
        <div style={{ margin: '12px 0' }}>
          <AlertCollapse 
            typeAlert='error'
            show={err.includes('footer')}
            description='El logo del footer es requerido'
          />
        </div>
        <Button 
          variant='outlined'
          color='info'
          disableElevation
          size='medium'
          startIcon={<Save />}
          sx={{ textTransform: 'capitalize' }}
          onClick={() => onSaved('footer_logo')}
        >
          Guardar Logo Footer
        </Button>
      </Grid>
    </Grid>
  )
}
