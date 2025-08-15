import '../App.css';
import {useState} from 'react';
import {useAPIData} from '../utils';
import CreateItemModel from './CreateItemModel';
import {formatXeroDate} from '../utils';
import {paymentsField} from '../utils';
import {processPaymentData} from '../utils';

export default function Payments() {

    const {data: payments, loading, error} = useAPIData('http://localhost:8000/xero/payments', 'Payments');
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
         <div className="Section">
            <div className="section-header">
                <h2>Payments</h2>
                <button className="primary-btn" onClick={()=> setModalOpen(true)}>Create Payement</button>
            </div>
            <div className="table-scroll">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Payment ID</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Payment Type</th>
                        <th>Status</th>
                        <th>Invoice Number</th>
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
                    {payments.map((payment, index) => (
                        <tr key={index}>
                            <td>{payment.PaymentID}</td>
                            <td>{formatXeroDate(payment.Date)}</td>
                            <td>{payment.Amount}</td>
                            <td>{payment.PaymentType}</td>
                            <td>{payment.Status}</td>
                            <td>{payment.Invoice.InvoiceNumber}</td>
                            <td>{payment.Invoice.Contact.Name}</td>
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
      fields = {paymentsField}
      apiEndpoint = "http://localhost:8000/xero/payments"
      onSubmit={(formData)=> {
        console.log("Contact Created: ", formData)}
      }
      onClose={()=> setModalOpen(false)}
      dataProcessor={processPaymentData}
      />
    }
    </>
  );
}          


