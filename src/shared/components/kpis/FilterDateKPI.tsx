import React, { useMemo, useState, useEffect } from 'react';
import { EventOutlined, KeyboardArrowDownOutlined, RefreshOutlined } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogTitle, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, TextField } from '@mui/material';
import { getDateCurrent, getDateMonthFromTo, getDateYesterday, getDateLast7Days  } from '@/shared/helpers/handligDateHelper';

type TypeSearchSelectDate = 'TODAY' | 'YESTERDAY' | 'LAST-7-DAYS' | 'THIS-MONTH' | 'CUSTOM' | `YEAR-${number}`;

const START_YEAR = 2024;
const CURRENT_YEAR = new Date().getFullYear();
const AVAILABLE_YEARS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

export interface IFilterDateKPI{
  from: string;
  to: string;
}

interface FilterDateKPIProps{
  initValues: IFilterDateKPI;
  onChangeDate: (values: IFilterDateKPI) => void;
  onReset: () => void;
}

export const FilterDateKPI = ({
  onChangeDate,
  initValues,
  onReset
}: FilterDateKPIProps) => {
  const styles = stylesFilterOvervieKPI();

  const [valueFrom, setValueFrom] = useState(initValues.from);
  const [valueTo, setValueTo] = useState(initValues.to);
  const [errorDate, setErrorDate] = useState<'none' | 'from' | 'to'>('none');
  const [typeSearchDate, setTypeSearchDate] = useState<TypeSearchSelectDate>('TODAY');
  const [showFilter, setShowFilter] = useState(false)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorUl, setAnchorUl] = useState(290)
  const open = Boolean(anchorEl);

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorUl(event.currentTarget.clientWidth)
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const value = useMemo(() => {
    let valueNew = '--/--/---- a --/--/----';



    if( valueFrom !== '' && valueTo !== ''){
      valueNew = valueFrom.split('-').reverse().join('/')+' a '+valueTo.split('-').reverse().join('/');
    }else if ( valueFrom !== '' && valueTo == ''){
      valueNew = valueFrom.split('-').reverse().join('/')+' a --/--/----';
    }else if( valueTo !== '' && valueFrom == '' ){
      valueNew = '--/--/---- a '+valueTo.split('-').reverse().join('/');
    }

    return valueNew;

  }, [valueFrom, valueTo])

  useEffect(() => {
    if( valueFrom !== '' && valueTo !== ''){
      onChangeDate({
        to: valueTo,
        from: valueFrom
      })

      
      setErrorDate('none');
    }else{
      setErrorDate(valueFrom == '' ? 'from' : valueTo == '' ? 'to' : 'none')
    }
  }, [valueFrom, valueTo]);  

  const onChangeTypeSearchDate = (typeSearch: TypeSearchSelectDate) => {
    handleClose();
    setTypeSearchDate(typeSearch);

    switch (typeSearch) {
      case 'TODAY':
        setValueFrom(getDateCurrent())
        setValueTo(getDateCurrent())
        break;
      case 'YESTERDAY':
        setValueFrom(getDateYesterday())
        setValueTo(getDateYesterday())
        break;
      case 'LAST-7-DAYS':
        const last7Days = getDateLast7Days();
        setValueFrom(last7Days.from)
        setValueTo(last7Days.to)
        break;
      case 'THIS-MONTH':
        const thisMonth = getDateMonthFromTo()
        setValueFrom(thisMonth.from)
        setValueTo(thisMonth.to)
        break;
      default:
        if (typeSearch.startsWith('YEAR-')) {
          const year = parseInt(typeSearch.split('-')[1]);
          setValueFrom(`${year}-01-01`);
          setValueTo(`${year}-12-31`);
          break;
        }
        setShowFilter(true)
        break;
    }
  }

  return (
    <Box sx={[styles.root]}>
      <Box component='div' sx={[styles.box]} className='width-sm-full width-auto' display='flex' flexDirection='row' alignItems='center'> 
        <Box  className='minWidth-sm-full minWidth-sm-290px'   component={'button'} onClick={handleClickListItem}
          sx={{
            background: 'transparent',
            borderWidth: 0
          }}
        >
          <ListItemButton
            id="lock-button"
            aria-haspopup="listbox"
            aria-controls="lock-menu"
            aria-label="when device is locked"
            aria-expanded={open ? 'true' : undefined}
          >
            <ListItemIcon sx={{minWidth: 'auto', marginRight: '8px'}} >
              <EventOutlined fontSize='small' />
            </ListItemIcon>
            <ListItemText
              secondary={value}
              sx={{ '& .MuiTypography-root': {fontWeight: '500'} }}
            />
            <ListItemIcon sx={{minWidth: 'auto' }} >
              <KeyboardArrowDownOutlined fontSize='small' />
            </ListItemIcon>
          </ListItemButton>
        </Box>
        <IconButton
          size='small'
          onClick={() => {
            setValueFrom(initValues.from);
            setValueTo(initValues.to)
          }}
        >
          <RefreshOutlined color='primary' />
        </IconButton>
        <Menu
          id="lock-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'lock-button',
            role: 'listbox',
            sx: { minWidth: `${anchorUl}px`}
          }}
          PaperProps={{
            elevation: 0,
            sx: {
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))'
            }
          }}
        >
          <MenuItem onClick={() => onChangeTypeSearchDate('TODAY')} selected={typeSearchDate === 'TODAY'}>Hoy</MenuItem>
          <MenuItem onClick={() => onChangeTypeSearchDate('YESTERDAY')} selected={typeSearchDate === 'YESTERDAY'}>Ayer</MenuItem>
          <MenuItem onClick={() => onChangeTypeSearchDate('LAST-7-DAYS')} selected={typeSearchDate === 'LAST-7-DAYS'}>Últimos 7 días</MenuItem>
          <MenuItem onClick={() => onChangeTypeSearchDate('THIS-MONTH')} selected={typeSearchDate === 'THIS-MONTH'}>Este Mes</MenuItem>
          <MenuItem onClick={() => onChangeTypeSearchDate('CUSTOM')} selected={typeSearchDate === 'CUSTOM'}>Personalizado</MenuItem>
          {AVAILABLE_YEARS.map((year) => (
            <MenuItem key={year} onClick={() => onChangeTypeSearchDate(`YEAR-${year}`)} selected={typeSearchDate === `YEAR-${year}`}>{year}</MenuItem>
          ))}
        </Menu>
      </Box>
      <Dialog
        open={showFilter}
        maxWidth='sm'
        fullWidth={true}
        BackdropProps={{
          sx:{
            backgroundColor: 'transparent'
          }
        }}
        onClose={() => setShowFilter(false)}
      >
          <DialogTitle id="responsive-dialog-title" sx={{ m: 0, p: 2 }}>
            Filtrar por:
          </DialogTitle>
          <IconButton
          aria-label="close"
          onClick={() => setShowFilter(false)}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 10,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
          <Card elevation={0} sx={{overflow: 'auto'}}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    id="standard-basic" 
                    label="Fecha Desde"  
                    type='date'
                    value={valueFrom}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) => setValueFrom(event.target.value)}
                    sx={{marginBottom: 2.5}}
                    error={errorDate === 'from'}
                    helperText={errorDate == 'from' ? 'Debe agregar la fecha desde' : ''}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    id="standard-basic" 
                    label="Fecha Hasta"  
                    type='date'
                    value={valueTo}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) => setValueTo(event.target.value)}
                    sx={{marginBottom: 2.5}}
                    error={errorDate === 'to'}
                    helperText={errorDate == 'to' ? 'Debe agregar la fecha hasta' : ''}
                  />
                </Grid>
              </Grid>

            </CardContent>
          </Card>
        </Dialog>
    </Box>
  )
}


interface Props<T = React.CSSProperties>{
  root: T;
  box: T;
}


const stylesFilterOvervieKPI = () : Props => ({
  root: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  box: {
    borderRadius: '4px',
    backgroundColor: 'white',
    padding: '0 16px 0 0',
    border: '1px solid rgba(0, 0, 0, 0.09)',
    maxWidth: '100%'
},
})