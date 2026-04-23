import { Paper, PaperProps, Skeleton, Table, TableBody, TableCell, TableContainer, TableContainerProps, TablePagination, TableProps, TableRow, keyframes, alpha } from '@mui/material'
import React, { memo, ReactNode, useMemo } from 'react'
import { useTronTheme } from '@/theme/TronThemeContext'

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface Props{
    children: ReactNode;
    DataTableHead: ReactNode;
    tableContainerProps?: TableContainerProps;
    tableProps?: TableProps;
    loading?: {
      load: boolean;
      cell: number;
    }
    pagination?: {
      rowsPerPageOptions: number[];
      count: number;
      rowsPerPage: number;
      page: number;
      handleChangePage: (page: number) => void;
      handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
    },
    rowsLoandings?: number[];
}

export const PaperDataTable = ({ children, paperProps } : { children: ReactNode, paperProps?: PaperProps }) => {
  const { identity, glowLevel } = useTronTheme();
  const primaryRgb = hexToRgb(identity.primary);
  
  return (
    <Paper 
      sx={{ 
        width: '100%', 
        mb: 2, 
        border: `1px solid rgba(${primaryRgb}, 0.15)`,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(15, 15, 25, 0.85)',
        backdropFilter: 'blur(20px)',
        boxShadow: glowLevel > 0 
          ? `0 4px 24px rgba(0, 0, 0, 0.3), 0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.05)`
          : '0 4px 24px rgba(0, 0, 0, 0.3)',
        '&:hover': {
          boxShadow: glowLevel > 0
            ? `0 8px 32px rgba(0,0,0,0.4), 0 0 ${15 * glowLevel}px rgba(${primaryRgb}, 0.1)`
            : '0 8px 32px rgba(0,0,0,0.4)',
          borderColor: `rgba(${primaryRgb}, 0.3)`,
        },
        ...paperProps?.sx 
      }} 
      elevation={0}
    >
      { children }
    </Paper>
  );
} 

export const DataTable = memo((props: Props)=> {
  const { children, DataTableHead, tableContainerProps, tableProps, pagination, loading, rowsLoandings = [1,2,3,4,5,6,7,8] } = props;
  const { identity, glowLevel } = useTronTheme();
  const primaryRgb = hexToRgb(identity.primary);

  const cells = useMemo(() => {
    if( loading?.cell ){
      const cellLength = loading.cell;
      let nums: number[] = [];

      for (let i = 1; i <= cellLength; i++) {
        nums.push(i);
      }

      return nums;
    }

    return [1,2,3,4,5,6];
  }, [loading?.cell])

  return (
      <>
        <TableContainer 
          sx={{ 
            maxHeight: 520,
            '&::-webkit-scrollbar': {
              width: 6,
              height: 6,
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(10, 10, 18, 0.5)',
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              background: `rgba(${primaryRgb}, 0.3)`,
              borderRadius: 3,
              '&:hover': {
                background: `rgba(${primaryRgb}, 0.5)`,
              },
            },
            ...tableContainerProps?.sx 
          }} 
          {...tableContainerProps}
        >
          <Table
            aria-labelledby="tableTitle"
            size={'medium'}
            sx={{
              '& .MuiTableHead-root': {
                '& .MuiTableCell-head': {
                  background: 'rgba(15, 15, 25, 0.95)',
                  fontWeight: 700,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: identity.primary,
                  borderBottom: `2px solid rgba(${primaryRgb}, 0.25)`,
                  py: 2,
                  whiteSpace: 'nowrap',
                },
              },
              '& .MuiTableBody-root': {
                '& .MuiTableRow-root': {
                  transition: 'all 0.15s ease',
                  animation: `${fadeIn} 0.3s ease forwards`,
                  '&:hover': {
                    background: `rgba(${primaryRgb}, 0.06)`,
                  },
                  '&:last-child .MuiTableCell-root': {
                    borderBottom: 'none',
                  },
                },
                '& .MuiTableCell-root': {
                  borderColor: `rgba(${primaryRgb}, 0.1)`,
                  py: 1.75,
                  color: '#E8E8E8',
                  fontSize: '13px',
                  transition: 'background 0.15s ease',
                },
              },
              ...tableProps?.sx
            }}
            {...tableProps}
          >
            { DataTableHead }
            <TableBody>
              {
                loading && loading.load ?
                  rowsLoandings.map((value, index)=> (
                    <TableRow 
                      key={value}
                      sx={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      {
                        cells.map((cell) => (
                          <TableCell key={`${value}-${cell}`}>
                            <Skeleton 
                              variant='text' 
                              sx={{
                                borderRadius: 1,
                                background: `linear-gradient(90deg, rgba(${primaryRgb}, 0.05) 25%, rgba(${primaryRgb}, 0.12) 50%, rgba(${primaryRgb}, 0.05) 75%)`,
                                backgroundSize: '200% 100%',
                                animation: `${shimmer} 1.5s infinite`,
                              }}
                            />
                          </TableCell>
                        ))
                      }
                    </TableRow>
                  ))
                : children 
              }
            </TableBody>
          </Table>
        </TableContainer>
        {
            pagination &&
            <TablePagination
                rowsPerPageOptions={pagination.rowsPerPageOptions}
                component="div"
                count={pagination.count}
                rowsPerPage={pagination.rowsPerPage}
                page={pagination.page}
                labelRowsPerPage='Filas por página'
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
                onPageChange={(e, page) => pagination.handleChangePage(page)}
                onRowsPerPageChange={pagination.handleChangeRowsPerPage}
                sx={{
                  borderTop: `1px solid rgba(${primaryRgb}, 0.12)`,
                  background: 'rgba(15, 15, 25, 0.6)',
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontSize: '12px',
                    color: 'rgba(232, 232, 232, 0.6)',
                    fontWeight: 500,
                  },
                  '& .MuiTablePagination-select': {
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    color: '#E8E8E8',
                    '&:hover': {
                      background: `rgba(${primaryRgb}, 0.1)`,
                    },
                  },
                  '& .MuiTablePagination-selectIcon': {
                    color: identity.primary,
                  },
                  '& .MuiTablePagination-actions': {
                    '& .MuiIconButton-root': {
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      color: 'rgba(232, 232, 232, 0.7)',
                      '&:hover': {
                        background: `rgba(${primaryRgb}, 0.1)`,
                        color: identity.primary,
                      },
                      '&.Mui-disabled': {
                        opacity: 0.3,
                        color: 'rgba(232, 232, 232, 0.3)',
                      },
                    },
                  },
                }}
            />
        }
      </>
  )
})
