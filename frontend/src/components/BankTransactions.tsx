import '../App.css';
import {useState} from 'react';
import {useAPIData} from '../utils';
import CreateItemModel from './CreateItemModel';
import {formatXeroDate} from '../utils';
import {transactionsField} from '../utils';
import {processTransactionsData} from '../utils';
import {API_URL} from '../utils';

export default function BankTransactions() {

  const {data: transactions, loading, error} = useAPIData(`${API_URL}/xero/banktransactions`, 'BankTransactions')  
  const [modalOpen, setModalOpen] = useState(false);  

  return (
    <>
    <div className="section">
      <div className="section-header">
        <h2>Bank Transactions</h2>
        <button className="primary-btn" onClick={()=> setModalOpen(true)}>Add bank Transaction</button>
      </div>
      <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>IsReconciled</th>
            <th>Total</th>
            <th>CurrencyCode</th>
            <th>Bank account Name</th>
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
          {transactions.map((txn, index) => (
            <tr key={index}>
              <td>{txn.BankTransactionID}</td>
              <td>{txn.Type}</td>
              <td>{formatXeroDate(txn.Date)}</td>
              <td>{txn.Status}</td>
              <td>{txn.IsReconciled}</td>
              <td>{txn.Total}</td>
              <td>{txn.CurrencyCode}</td>
              <td>{txn.BankAccount.Name}</td>
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
      fields = {transactionsField}
      apiEndpoint = {`${String(API_URL)}/xero/banktransactions`}
      onSubmit={(formData)=> {
        console.log("Contact Created: ", formData)}
      }
      onClose={()=> setModalOpen(false)}
      dataProcessor={processTransactionsData}
      />
    }
    </>
  );
}