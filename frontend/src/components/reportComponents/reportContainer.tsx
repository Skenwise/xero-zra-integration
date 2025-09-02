
import '../../App.css';
import { useState } from 'react';
import Report from '../Report';
import { useAPIData } from '../../utils';
import { API_URL } from '../../utils';
import {REPORT_TYPES} from '../../utils';

type reportType= "BalanceSheet"  | "ProfitAndLoss" | "trialBalance";


export default function ReportsContainer() {
  const [selectedReport, setSelectedReport] = useState<reportType>('BalanceSheet');

  const { data: reportData, loading, error } = useAPIData(
    `${API_URL}/xero/reports/${selectedReport}`
  );

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Reports</h2>
        <select
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value as reportType)}
          className="report-select"
        >
          {REPORT_TYPES.map((report) => (
            <option key={report.value} value={report.value}>
              {report.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="loading-text">Loading report...</p>}
      {error && <p className="error-text">Error loading report: {error}</p>}
      {!loading && !error && reportData && (
        <Report reportType={selectedReport} reportData={reportData} />
      )}
    </div>
  );
}