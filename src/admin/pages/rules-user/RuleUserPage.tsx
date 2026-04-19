import { useEffect, useState, useMemo } from 'react'
import { Box, Button } from '@mui/material'
import { useLocation, useNavigate  } from 'react-router-dom';
import { Add, ArrowBack } from '@mui/icons-material';
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { BoxLoading, ModalConfirmDelete, NavigateLink } from "@/shared/components";
import { IUsersType } from '@/shared/interfaces/user';
import { IRuleUser } from '@/admin/utils/interfaces/rule-user.interface';
import { ListRuleUserDataTable } from '@/admin/components/rules-user';


const epRule = '/rules';
const epRuleByReseller = `${epRule}/reseller`;

export const RuleUserPage = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { snackBarAlert } = useNotiAlert();

  const [ loadDelete, setLoadDelete ] = useState(false);
  const [resellerId, setResellerId] = useState<string | undefined>();
  const [resellerName, setResellerName] = useState<string | undefined>();
  const [ ruleId, setRuleId ] = useState<string>('');

  const { data: user } = useFetch<{ type: keyof IUsersType, id: string }>('auth/me', 'get', { init: true });
  const { data, loading, onRefresh, onFetch } = useFetch<IRuleUser[]>(
    resellerId ? `${epRuleByReseller}/${resellerId}` : epRule, 
    'GET', 
    { init: true }
  );

  useEffect(() => {
    if( search !== '' ){
      const searhString = search.split('?')[1];
      const searchId = searhString.split('&')[0];
      const searchName = searhString.split('&')[1];

      if( searchId.includes('resellerId=') ){
        setResellerId(searchId.split('resellerId=')[1]);
      }

      if( searchName.includes('name=') ){
        let name = searchName.split('name=')[1];
        if( name.includes('-') ){
          name = name.replace('-', ' ');
        }
        setResellerName(name);
      }
      
    }
    
  }, [search]);

  const onDeleteRule = async(id: string) => {
    setLoadDelete(true);
    const { ok } = await onFetch(`${epRule}/${id}`, 'DELETE');

    setLoadDelete(false);

    if( !ok ) return;

    setRuleId('');
    snackBarAlert('La regla se ha eliminado correctamente', { variant: 'success' })
    onRefresh();
  } 

  const rulesUsers = useMemo(() => {
    if( data && user){
      if( user.type == 'SELLER' ){
        return data.filter(item => item.is_reseller_rule !== false);
      }

      return data;
    }

    return [];
  }, [data, user])
  

  return (
    <div>
      <Box display='flex' width='100%' flexDirection='row' alignItems='center' justifyContent='space-between' mb={2.5}>
        {
          resellerId &&
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
            <Box fontSize={18}>{resellerName}</Box>
          </Box>
        }
        
        <Box justifyContent='flex-end' display='flex'>
          <NavigateLink to={resellerId ? `new${search}` : 'new'} uiLink={{
            component: 'span',
            underline: 'none',
          }} >
            <Button 
              variant='contained' 
              disableElevation sx={{ textTransform: 'capitalize', ml: 2 }}
              startIcon={<Add />}
            >
              Nueva regla
            </Button>
        </NavigateLink>
        </Box>
      </Box>
      <ListRuleUserDataTable 
        rulesList={rulesUsers}
        loading={loading}
        onDelete={ruleId => setRuleId(ruleId)}
        onEdit={ruleId => navigate(`edit/${ruleId}`+search)}
        isReseller={user?.type === 'SELLER'}
      />
      <BoxLoading 
        isLoading={loadDelete}
        title='Eliminando regla...'
        position='absolute'
      /> 
      <ModalConfirmDelete 
        opened={ruleId !== ''}
        onClose={() => setRuleId('')}
        onConfirm={() => {
          onDeleteRule(ruleId)
        }}
        title="¿Está seguro de eliminar esta regla?"
        desp="Si elimina la regla, no podrá acceder a su información más adelante."
      />
    </div>
  )
}
