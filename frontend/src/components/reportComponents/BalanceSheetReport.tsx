// frontend/src/components/reportComponents/BalanceSheetReport.tsx
import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ReportCell {
  Value: string;
  Attributes?: any[];
}

interface ReportRow {
  RowType: string;
  Title?: string;
  Cells?: ReportCell[];
  Rows?: ReportRow[];
}

interface BalanceSheetReportProps {
  data: any;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  padding: '12px 16px',
  fontSize: '0.875rem',
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  padding: '14px 16px',
  fontWeight: 600,
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.03),
}));

const formatNumber = (value: string): string => {
  if (!value) return '—';
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const isNumberValue = (value: string): boolean => {
  return /^[\d,.-]+$/.test(value.replace(/[()]/g, ''));
};

export default function BalanceSheetReport({ data }: BalanceSheetReportProps) {
  const theme = useTheme();
  const report = data?.Reports?.[0];
  const headers = report?.Rows?.find((row: ReportRow) => row.RowType === "Header")?.Cells;

  const renderRow = (row: ReportRow, level = 0, parentIdx: string | number = 0) => {
    if (row.RowType === "Section") {
      return (
        <React.Fragment key={`${row.Title}-${level}-${parentIdx}`}>
          <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
            <StyledTableCell
              colSpan={headers?.length || 2}
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: theme.palette.primary.main,
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                py: 1.5,
              }}
            >
              {row.Title}
            </StyledTableCell>
          </TableRow>
          {row.Rows?.map((subRow, subIdx) => renderRow(subRow, level + 1, `${parentIdx}-${subIdx}`))}
        </React.Fragment>
      );
    }

    if (row.RowType === "Row" || row.RowType === "SummaryRow") {
      const isSummary = row.RowType === "SummaryRow";
      return (
        <TableRow
          key={`${row.Title || 'row'}-${level}-${parentIdx}`}
          sx={{
            backgroundColor: isSummary ? alpha(theme.palette.secondary.main, 0.08) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
            },
          }}
        >
          {row.Cells?.map((cell, idx) => {
            const isLastColumn = idx === (row.Cells?.length || 0) - 1;
            const isNumber = isNumberValue(cell.Value);
            return (
              <StyledTableCell
                key={idx}
                sx={{
                  fontWeight: isSummary ? 700 : 400,
                  color: isSummary ? theme.palette.primary.main : theme.palette.text.primary,
                  textAlign: isLastColumn && isNumber ? 'right' : 'left',
                  pl: level > 0 ? `${level * 24 + 16}px` : '16px',
                  fontFamily: isNumber ? 'monospace' : 'inherit',
                  fontSize: isSummary ? '0.95rem' : '0.875rem',
                }}
              >
                {isNumber ? (
                  <Box component="span" sx={{ fontWeight: isSummary ? 700 : 500 }}>
                    {formatNumber(cell.Value)}
                  </Box>
                ) : (
                  cell.Value
                )}
              </StyledTableCell>
            );
          })}
        </TableRow>
      );
    }

    return null;
  };

  if (!report) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No balance sheet data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        {report?.ReportName}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
        {report?.ReportTitles?.join(" • ")}
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              {headers?.map((header: ReportCell, idx: number) => (
                <StyledHeaderCell key={idx}>
                  {header.Value}
                </StyledHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {report?.Rows?.filter((row: ReportRow) => row.RowType !== "Header").map((row: ReportRow, idx: number) =>
              renderRow(row, 0, idx)
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}