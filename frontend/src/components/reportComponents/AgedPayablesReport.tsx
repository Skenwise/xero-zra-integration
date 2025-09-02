import '../../App.css';

type AgedPayableReportProps = {
  data: any; // Replace `any` with a proper type once you know the shape
};

export default function AgedPayableReport({ data }: AgedPayableReportProps) {
  if (!data) {
    return <div className="report-container">No data available for Aged Payable Report</div>;
  }

  return (
    <div className="report-container">
      <h2 className="report-title">Aged Payable Report</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Current</th>
            <th>1–30 Days</th>
            <th>31–60 Days</th>
            <th>61–90 Days</th>
            <th>90+ Days</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.rows?.map((row: any, index: number) => (
            <tr key={index}>
              <td>{row.supplier}</td>
              <td>{row.current}</td>
              <td>{row.days1to30}</td>
              <td>{row.days31to60}</td>
              <td>{row.days61to90}</td>
              <td>{row.days90plus}</td>
              <td>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}