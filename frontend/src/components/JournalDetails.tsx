import '../App.css';

interface JournalLine {
  JournalLineID: string;
  AccountID: string;
  AccountCode: string;
  AccountType: string;
  AccountName: string;
  NetAmount: number;
  GrossAmount: number;
  TaxAmount: number;
  TaxType: string;
  TaxName: string;
  Description?: string;
  TrackingCategories: any[];
}

interface Journal {
  JournalID: string;
  JournalDate: string;
  JournalNumber: number;
  CreatedDateUTC: string;
  Reference?: string;
  SourceID?: string;
  SourceType?: string;
  JournalLines: JournalLine[];
}

interface JournalDetailProps {
    journal: Journal
}

export default function JournalDetail ({journal}: JournalDetailProps) {

    return (
        <div className='main-section'>
            <h2>Journal Details</h2>
            <table>
                <tbody>
                    <tr>
                        <td>Journal Number</td>
                        <td>{journal.JournalNumber}</td>
                    </tr>
                    <tr>
                        <td>Created Date </td>
                        <td>{journal.CreatedDateUTC}</td>
                    </tr>
                    <tr>
                        <td>Journal ID</td>
                        <td>{journal.JournalID}</td>
                    </tr>
                </tbody>
            </table>

            {journal.JournalLines.length > 0 && (
                <div style={{marginTop: "20px"}}>
                    <h3>Journal Lines</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Account Code</th>
                                <th>Account Name</th>
                                <th>Account Type</th>
                                <th>Gross Amount</th>
                                <th>Net Amount</th>
                                <th>Tax Name</th>
                                <th>Tax Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {journal.JournalLines.map((line, idx)=> (
                                <tr key={idx}>
                                    <td>{line.AccountCode}</td>
                                    <td>{line.AccountName}</td>
                                    <td>{line.AccountType}</td>
                                    <td>{line.GrossAmount}</td>
                                    <td>{line.NetAmount}</td>
                                    <td>{line.TaxName}</td>
                                    <td>{line.TaxAmount}</td>
                                </tr>
                            ))};
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}