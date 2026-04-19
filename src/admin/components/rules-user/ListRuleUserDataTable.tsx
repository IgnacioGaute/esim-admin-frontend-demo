import { useState } from "react";
import { Checkbox, Typography }  from '@mui/material';
import { useDataTable } from "@/shared/hooks/useDataTable";
import { DataTable, DataTableToolbar, PaperDataTable } from '@/shared/components/data-table';
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks";
import { FilterRuleUser, IRuleUserByFilter } from './FilterRuleUser';
import { IRuleUser } from '@/admin/utils/interfaces/rule-user.interface';


interface Props {
  rulesList: IRuleUser [],
  loading?: boolean;
  onEdit: (ruleId: string) => void;
  onDelete: (ruleId: string) => void;
  isReseller?: boolean;
}

const initRuleFilter: IRuleUserByFilter = {
  scope_type: 'all',
  type: 'all',
}

export const ListRuleUserDataTable = ({
  rulesList,
  loading,
  onDelete,
  onEdit,
  isReseller = false
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
      onApplyFilter,
      dataByFilter,
      onSetFilter,
      onSearch
    } = useDataTable<IRuleUser>(
      headCells,
      rulesList,
      'scope_type',
      {
        showCheckbocHead: true,
      }
    );

    const [filterRule, setFilterRule] = useState<IRuleUserByFilter>(initRuleFilter);

    const onActionSendId = (action: 'delete' | 'update') => {
      const rules = onGetItemSelectd();
  
      if( rules.length > 0 ){
        switch (action) {
          case 'delete':
            return onDelete(rules[0].id)
          default:
            return onEdit(rules[0].id)
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
        onApplyFilter={() => onApplyFilter(dataByFilter)}
        onResetFilter={() => {
          setFilterRule({...initRuleFilter});
          onApplyFilter([], true);
        }}
        filterChildren={
          <FilterRuleUser 
            onChange={(field, value) => {
              setFilterRule(values => {
                onSetFilter(field, '=', value);

                return {...values, [field]: value}
              });
            }}
            ruleFilter={filterRule}
          /> 
        }
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
                props={{
                  sx: {
                    backgroundColor: !row.is_reseller_rule && isReseller ? 'ButtonFace' : 'transparent'
                  }
                }}
              >
                <ItemDataTable
                  padding='checkbox'
                >
                  {
                    isReseller && !row.is_reseller_rule ? null
                    : <Checkbox
                      color="primary"
                      checked={isSelectedItem(row.id_data_table)}
                      onChange={() => onSelectItem(row.id_data_table)}
                      inputProps={{
                      'aria-label': 'select all desserts',
                    }}
                  />
                  }
                </ItemDataTable>
                <ItemDataTable
                  component="th"
                  id={labelId}
                  scope="row"
                >
                  {row.scope_type}
                </ItemDataTable>
                <ItemDataTable align='left'>{row.scope_value}</ItemDataTable>
                <ItemDataTable align='left'>{row.type}</ItemDataTable>
                <ItemDataTable align='right'>
                  { isReseller && !row.is_reseller_rule ? '-- --' : `%${row.profit_margin}` }
                </ItemDataTable>
                <ItemDataTable align='right'>
                  <Typography 
                    color={row.is_active ? 'green' : 'red'}
                    sx={{ borderRadius: 0, padding: '5px 8px' }}
                    fontSize={15}
                  >
                    { row.is_active ? 'Activo' : 'Desactivado' }
                  </Typography>
                </ItemDataTable>

                <ItemDataTable align='right'>
                    <Typography 
                      color={ row.is_reseller_rule ? 'InfoText' : 'GrayText' }
                      sx={{ borderRadius: 0, padding: '5px 8px' }}
                      fontSize={15}
                    >
                      { row.is_reseller_rule ? isReseller ? 'Personalizado' : 'Por seller' : isReseller ? 'Predeterminado' : 'Por admin' }
                    </Typography>
                  </ItemDataTable>
             </ListItemTable>
            )
          })
        }
      </DataTable>
    </PaperDataTable>
  )
}

const headCells: DataTableHeadCellProps<IRuleUser>[] = [
    {
      id: 'scope_type',
      numeric: false,
      disablePadding: false,
      label: 'Tipo de ámbito',
    },
    {
      id: 'scope_value',
      numeric: false,
      disablePadding: false,
      label: 'Valor de ámbito',
    },
    {
      id: 'type',
      numeric: false,
      disablePadding: false,
      label: 'Tipo',
    },
    {
      id: 'profit_margin',
      numeric: true,
      disablePadding: false,
      label: 'Margen de profit',
    },
    {
      id: 'is_active',
      numeric: true,
      disablePadding: false,
      label: 'Activo/Desactivado',
    },
    {
      id: 'is_reseller_rule',
      numeric: true,
      disablePadding: false,
      label: 'Config.',
    }
  ];
