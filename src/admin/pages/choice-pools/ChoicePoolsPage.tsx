import { Box, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { ListChoicePoolsDataTable } from '@/admin/components/choice-pools'
import { IChoicePool } from '@/admin/utils';
import { NavigateLink, useFetch } from '@/shared'


export const ChoicePoolsPage = () => {
    const navigate = useNavigate();
    const { data, loading  } = useFetch<IChoicePool[]>('/choice-pools', 'GET', { init: true });

    return (
        <div>
            <Box display='flex' width='100%' justifyContent='flex-end' mb={2.5}>
                <NavigateLink to='new' uiLink={{
                    component: 'span',
                    underline: 'none',
                }} >
                    <Button variant='contained' disableElevation sx={{ textTransform: 'capitalize' }}>
                        Nuevo pool
                    </Button>
                </NavigateLink>
            </Box>
            <ListChoicePoolsDataTable 
                loading={loading}
                data={data || []}
                onDelete={() => null}
                onEdit={(value) => navigate(`edit/${value}`)}
            />
        </div>
    )
}
