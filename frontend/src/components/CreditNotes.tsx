import '../App.css';
import {useState} from 'react';
import {useAPIData} from '../utils';
import CreateItemModel from './CreateItemModel';
import {formatXeroDate} from '../utils';
import {notesField} from '../utils';
import {processNotesData} from '../utils';


export default function CreditNotes() {
  const {data: notes, loading, error} = useAPIData('http://localhost:8000/xero/creditnotes', 'CreditNotes')  
  const [modalOpen, setModalOpen] = useState(false);  

  return (
    <>
    <div className="section">
      <div className="section-header">
        <h2>Credit Notes</h2>
        <button className="primary-btn" onClick={()=> setModalOpen(true)}>Add Credit Notes</button>
      </div>
      <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Credit Notes ID</th>
            <th>Credit Notes Number</th>
            <th>Date</th>
            <th>Status</th>
            <th>SubTotal</th>
            <th>Total Tax</th>
            <th>Total</th>
            <th>CurrencyCode</th>
            <th>RemainingCredit</th>
            <th>Name</th>
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
          {notes.map((txn, index) => (
            <tr key={index}>
              <td>{txn.CreditNoteID}</td>
              <td>{txn.CreditNoteNumber}</td>
              <td>{formatXeroDate(txn.Date)}</td>
              <td>{txn.Status}</td>
              <td>{txn.SubTotal}</td>
              <td>{txn.TotalTax}</td>
              <td>{txn.Total}</td>
              <td>{txn.CurrencyCode}</td>
              <td>{txn.RemainingCredit}</td>
              <td>{txn.Contact.Name}</td>
            </tr>
          ))}
        </tbody>
        )}
      </table>
      </div>
    </div>
     {modalOpen && 
    <CreateItemModel
      title = "Create New Contact"
      fields = {notesField}
      apiEndpoint = "http://localhost:8000/xero/creditnotes"
      onSubmit={(formData)=> {
        console.log("Credit Notes Created: ", formData)}
      }
      onClose={()=> setModalOpen(false)}
      dataProcessor={processNotesData}
      />
    }
    </>
  );
}