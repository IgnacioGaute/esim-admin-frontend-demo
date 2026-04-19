import { Paper, PaperProps, Skeleton, Table, TableBody, TableCell, TableContainer, TableContainerProps, TablePagination, TableProps, TableRow, keyframes } from '@mui/material'
import React, { memo, ReactNode, useMemo } from 'react'

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

export const PaperDataTable = ({ children, paperProps } : { children: ReactNode, paperProps?: PaperProps }) => (
  <Paper 
    sx={{ 
      width: '100%', 
      mb: 2, 
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: (theme) => theme.palette.mode === 'dark' 
        ? 'linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(20,20,20,0.95) 100%)'
        : 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(250,250,252,0.9) 100%)',
      '&:hover': {
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 8px 32px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(0,0,0,0.08)',
        borderColor: 'primary.main',
      },
      ...paperProps?.sx 
    }} 
    elevation={0}
  >
    { children }
  </Paper>
) 

export const DataTable = memo((props: Props)=> {
  const { children, DataTableHead, tableContainerProps, tableProps, pagination, loading, rowsLoandings = [1,2,3,4,5,6,7,8] } = props;

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
            maxHeight: 480,
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.2)' 
                : 'rgba(0,0,0,0.15)',
              borderRadius: 4,
              '&:hover': {
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.3)' 
                  : 'rgba(0,0,0,0.25)',
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
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(0,0,0,0.02)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'text.secondary',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  py: 2,
                },
              },
              '& .MuiTableBody-root': {
                '& .MuiTableRow-root': {
                  transition: 'all 0.2s ease',
                  animation: `${fadeIn} 0.3s ease forwards`,
                  '&:hover': {
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(25, 118, 210, 0.04)',
                  },
                  '&:last-child .MuiTableCell-root': {
                    borderBottom: 'none',
                  },
                },
                '& .MuiTableCell-root': {
                  borderColor: 'divider',
                  py: 1.75,
                  transition: 'background 0.2s ease',
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
                                background: (theme) => theme.palette.mode === 'dark'
                                  ? 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)'
                                  : 'linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)',
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
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(0,0,0,0.01)',
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                  },
                  '& .MuiTablePagination-select': {
                    borderRadius: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.04)',
                    },
                  },
                  '& .MuiTablePagination-actions': {
                    '& .MuiIconButton-root': {
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(25, 118, 210, 0.08)',
                        color: 'primary.main',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.3,
                      },
                    },
                  },
                }}
            />
        }
      </>
  )
})
