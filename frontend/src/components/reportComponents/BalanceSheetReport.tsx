
import '../../App.css';
import React from 'react';

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
  data: any; // JSON report response
}

export default function BalanceSheetReport({ data }: BalanceSheetReportProps) {
  const report = data?.Reports?.[0];
  const headers = report?.Rows?.find((row: ReportRow) => row.RowType !== "Header")?.Cells;

  const renderRow = (row: ReportRow, level = 0, parentIdx: string | number = 0) => {
    if (row.RowType === "Section") {
      return (
        <React.Fragment key={`${row.Title}-${level}-${parentIdx}`}>
          <tr className="report-section">
            <td colSpan={headers?.length || 2} style={{paddingLeft: `${level * 20}px`, fontWeight: 'bold'}}>
              {row.Title}
            </td>
          </tr>
          {row.Rows?.map((subRow, subIdx) => renderRow(subRow, level + 1, `${parentIdx}-${subIdx}`)).filter(Boolean)}
        </React.Fragment>
      );
    }

    if (row.RowType === "Row" || row.RowType === "SummaryRow") {
      return (
        <tr key={`${row.Title || 'row'}-${level}-${parentIdx}`} className={row.RowType === "SummaryRow" ? "report-summary" : ""}>
          {row.Cells?.map((cell, idx) => (
            <td key={idx} className="report-cell">
              {cell.Value}
            </td>
          ))}
        </tr>
      );
    }

    return null;
  };

  return (
    <div className="report-card">
      <h2 className="report-title">{report?.ReportName}</h2>
      <p className="report-subtitle">{report?.ReportTitles?.join(" • ")}</p>

      <div className="table-scroll">
        <table className="report-table">
          <thead>
            <tr>
              {headers?.map((header: ReportCell, idx: number) => (
                <th key={header.Value || idx} className="report-header">{header.Value}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report?.Rows?.filter((row: ReportRow) => row.RowType !== "Header").map((row: ReportRow, idx: number) =>
              renderRow(row, 0, idx)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}