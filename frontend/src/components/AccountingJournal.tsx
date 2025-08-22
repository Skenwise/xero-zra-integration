import '../App.css';
import {useState} from 'react';
import {useAPIData} from '../utils';
import CreateItemModel from './CreateItemModel';
import {formatXeroDate} from '../utils';
import {journalsField} from '../utils';
import {processJournalData} from '../utils';
import {useNavigate} from 'react-router-dom';
import {API_URL} from '../utils';

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

interface JournalsResponse {
  Id: string;
  Status: string;
  ProviderName: string;
  DateTimeUTC: string;
  Journals: Journal[];
}

export default function Journals() {

  const {data:entries, loading, error } = useAPIData<JournalsResponse>(`${API_URL}/xero/journals`, 'Journals')
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate()

  const handleRowClick = (entry: Journal) => {
    alert(`🔎 Coming soon: View details for ${entry.JournalID}`);
    navigate(`/accounting/records/journal/${entry.JournalID}`) 
  };

  return (
    <>
    <div className="journals-section">
      <div className="journals-header">
        <h2>Journals</h2>
        <button className="add-button" onClick={()=> setModalOpen(true)}>+ Add Manual Journal</button>
      </div>
      <div className="table-scroll">
      <table className="journals-table">
        <thead>
          <tr>
            <th>Journal ID</th>
            <th>Date</th>
            <th>Journal Number</th>
            <th>Created at</th>
            <th>Reference</th>
            <th>Source Type</th>
          </tr>
          {(loading && error) && (
            <tr>
              <td colSpan={4} style={{textAlign: 'center', padding: '10px'}}>
                {loading && 'Loading contacts...'}
                {error && `Error loading contacts: ${error}`}
              </td>
            </tr>
          )}
                
        </thead>

        {(!loading && !error) && (
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index} onClick={() => handleRowClick(entry)} className="journal-row">
              <td>{entry.JournalID}</td>
              <td>{formatXeroDate(entry.JournalDate)}</td>
              <td>{entry.JournalNumber}</td>
              <td>{formatXeroDate(entry.CreatedDateUTC)}</td>
              <td>{entry.Reference || "No reference"}</td>
              <td>{entry.SourceType}</td>
            </tr>
          ))}
        </tbody>
        )}
      </table>
      </div>
    </div>
     {modalOpen && 
    <CreateItemModel
      title = "Create New Journal"
      fields = {journalsField}
      apiEndpoint = {`${String(API_URL)}/xero/journals`}
      onSubmit={(formData)=> {
        console.log("Journal Created: ", formData)}
      }
      onClose={()=> setModalOpen(false)}
      dataProcessor={processJournalData}
      />
    }
     </>
  );
}