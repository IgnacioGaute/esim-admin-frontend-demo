import Checkbox from '@mui/material/Checkbox';
import { useDataTable } from "@/shared/hooks/useDataTable";
import { DataTable, DataTableToolbar, PaperDataTable } from '@/shared/components/data-table';
import { formatterDateDDMMYYYY } from '@/shared/helpers/handligDateHelper';
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks";
import { ICodeReferral } from '@/admin/utils/interfaces/referral.interface';

interface Props {
    referralList: ICodeReferral[],
    loading?: boolean;
    onEdit: (ruleId: string) => void;
    onDelete: (ruleId: string) => void;
}

export const ListReferralDataTable = ({
    referralList,
    loading,
    onEdit,
    onDelete
}: Props) => {

    const { 
        ListItemTable, 
        ItemDataTable, 
        pagination, 
        DataTableHead, 
        rows, 
        onSelectItem, 
        isSelectedItem, 
        onGetItemSelectd,
        selected,
        onSearch
      } = useDataTable<ICodeReferral>(
        headCells,
        referralList,
        'referer_code',
        {
          showCheckbocHead: true,
        }
    );

    const onActionSendId = (action: 'delete' | 'update') => {
        const referral = onGetItemSelectd();
    
        if( referral.length > 0 ){
          switch (action) {
            case 'delete':
              return onDelete(referral[0].id)
            default:
              return onEdit(referral[0].id)
          }
        }
    }

  return (
    <PaperDataTable>
      <DataTableToolbar 
        numSelected={selected.length}
        onChangeSearch={onSearch}
        onDelete={() => onActionSendId('delete')}
        onEdit={() => onActionSendId('update')}
      />
      <DataTable
        DataTableHead={DataTableHead}
        pagination={pagination}
        loading={{
          load: loading || false,
          cell: headCells.length + 1
        }}
      >
        {
          rows.map((row, idx) => {
            const labelId = `enhanced-table-checkbox-${idx}`;
              
            return (
              <ListItemTable
                key={row.id_data_table}
                id_data_table={row.id_data_table}
                isHandleClick={false}
              >
                <ItemDataTable
                  padding='checkbox'
                >
                    <Checkbox
                        color="primary"
                        checked={isSelectedItem(row.id_data_table)}
                        onChange={() => onSelectItem(row.id_data_table)}
                        inputProps={{
                        'aria-label': 'select all desserts',
                        }}
                    />
                </ItemDataTable>
                <ItemDataTable
                  component="th"
                  id={labelId}
                  scope="row"
                >
                  {row.referer_code}
                </ItemDataTable>
                <ItemDataTable>{row.commission_percent.toFixed(2)}</ItemDataTable>
                <ItemDataTable align='left' sx={{ color: row.is_whitelabel ? 'green' : 'red' }}>
                    { row.is_whitelabel ? 'SI' : 'NO' }
                </ItemDataTable>
                <ItemDataTable align='right'>
                    {formatterDateDDMMYYYY(row.created_at)}
                </ItemDataTable>
                <ItemDataTable align='right'>
                    {formatterDateDDMMYYYY(row.updated_at)}
                </ItemDataTable>
             </ListItemTable>
            )
          })
        }
      </DataTable>
    </PaperDataTable>
  )
}

const headCells: DataTableHeadCellProps<ICodeReferral>[] = [
    {
      id: 'referer_code',
      numeric: false,
      disablePadding: false,
      label: 'código de referido',
    },
    {
      id: 'commission_percent',
      numeric: false,
      disablePadding: false,
      label: '% Comisión',
    },
    {
      id: 'is_whitelabel',
      numeric: false,
      disablePadding: false,
      label: 'Es whitelabel',
    },
    {
        id: 'created_at',
        numeric: true,
        disablePadding: false,
        label: 'Fecha creado'
    },
    {
      id: 'updated_at',
      numeric: true,
      disablePadding: false,
      label: 'Fecha actualizado',
    }
];
