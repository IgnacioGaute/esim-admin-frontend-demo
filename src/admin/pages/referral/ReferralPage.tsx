import { useEffect, useState } from 'react'
import { Box, Button } from '@mui/material'
import { useLocation, useNavigate  } from 'react-router-dom';
import { Add, ArrowBack } from '@mui/icons-material';
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { BoxLoading, ModalConfirmDelete, NavigateLink } from "@/shared/components";
import { ICodeReferral } from '@/admin/utils/interfaces/referral.interface';
import { ListReferralDataTable } from '@/admin/components/referral';

const epReferral = '/users/referral-codes';
const epReferralByReseller = `${epReferral}/reseller`;

export const ReferralPage = () => {
    const { search } = useLocation();
    const navigate = useNavigate();
    const { snackBarAlert } = useNotiAlert();

    const [isFetching, setIsFetching] = useState(false);
    const [ loadDelete, setLoadDelete ] = useState(false);
    const [userId, setUserId] = useState<string | undefined>();
    const [userName, setUserName] = useState<string | undefined>();
    const [ referralId, setReferralId ] = useState<string>('');

    const { data, loading, onRefresh, onFetch } = useFetch<ICodeReferral[]>(
        userId ? `${epReferralByReseller}/${userId}` : epReferral, 
        'GET', 
        { init: isFetching !== false }
    );

    useEffect(() => {
        if( search !== '' ){
          const searhString = search.split('?')[1];
          const searchId = searhString.split('&')[0];
          const searchName = searhString.split('&')[1];
    
          if( searchId.includes('userId=') ){
            setUserId(searchId.split('userId=')[1]);
          }
    
          if( searchName.includes('name=') ){
            let name = searchName.split('name=')[1];
            if( name.includes('-') ){
              name = name.replace('-', ' ');
            }
            setUserName(name);
          }
          
        }

        setIsFetching(true);
    }, [search]);

    const onDeleteReferral = async(id: string) => {
        setLoadDelete(true);
        const { ok } = await onFetch(`${epReferral}/${id}`, 'DELETE');
    
        setLoadDelete(false);
    
        if( !ok ) return;
    
        setReferralId('');
        snackBarAlert('El código de referido se ha eliminado correctamente', { variant: 'success' })
        onRefresh();
    } 

    return (
        <div>
      <Box display='flex' width='100%' flexDirection='row' alignItems='center' justifyContent='space-between' mb={2.5}>
        {
          userId &&
          <Box display='flex' alignItems='center' flexDirection='row' gap={2}>
            <Button 
              variant='outlined'
              color='primary' 
              disableElevation sx={{ textTransform: 'capitalize' }}
              startIcon={<ArrowBack />}
              onClick={() => navigate('/admin/users')}
            >
              Volver
            </Button>
            <Box fontSize={18}>{userName}</Box>
          </Box>
        }
        
        <Box justifyContent='flex-end' display='flex'>
          <NavigateLink to={userId ? `new${search}` : 'new'} uiLink={{
            component: 'span',
            underline: 'none',
          }} >
            <Button 
              variant='contained' 
              disableElevation sx={{ textTransform: 'capitalize', ml: 2 }}
              startIcon={<Add />}
            >
              Nuevo código
            </Button>
        </NavigateLink>
        </Box>
      </Box>
      <ListReferralDataTable 
        referralList={data || []}
        loading={loading}
        onDelete={referralId => setReferralId(referralId)}
        onEdit={referralId => navigate(`edit/${referralId+search}`)}
      />
      <BoxLoading 
        isLoading={loadDelete}
        title='Eliminando código de referido...'
        position='absolute'
      /> 
      <ModalConfirmDelete 
        opened={referralId !== ''}
        onClose={() => setReferralId('')}
        onConfirm={() => {
          onDeleteReferral(referralId)
        }}
        title="¿Está seguro de eliminar este código de referido?"
        desp="Si elimina el código de referido, no podrá acceder a su información más adelante."
      />
    </div>
    )
}
