import '../App.css';
import {useState} from 'react';
import {invoicesField} from '../utils';
import {processInvoiceData} from '../utils';
import {formatXeroDate} from '../utils';
import CreateItemModel from './CreateItemModel';
import {useAPIData} from '../utils';

export default function Invoices() {
    const {data: invoices, loading, error} = useAPIData('http://localhost:8000/xero/invoices', 'Invoices');
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
        <div className="Section">
            <div className="section-header">
                <h2>Invoices</h2>
                <button className="primary-btn" onClick={() => setModalOpen(true)}>Create Invoices</button>
            </div>
            <div className="table-scroll">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Invoices #</th>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Due date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Currency</th>
                      {(loading && error) && (
                    <tr>
                        <td colSpan={4} style={{textAlign: 'center', padding: '10px'}}>
                        {loading && 'Loading contacts...'}
                        {error && `Error loading contacts: ${error}`}
                        </td>
                        </tr>
                    )}
                    </tr>
                </thead>

               {(!loading && !error) && ( 
                <tbody>
                    {invoices.map((invoice, index) => (
                        <tr key={index}>
                            <td>{invoice.Type}</td>
                            <td>{invoice.InvoiceNumber}</td>
                            <td>{invoice.Contact?.Name || 'N/A'}</td>
                            <td>{formatXeroDate(invoice.Date)}</td>
                            <td>{formatXeroDate(invoice.DueDate)}</td>
                            <td>{invoice.Status}</td>
                            <td>{invoice.Total}</td>
                            <td>{invoice.CurrencyCode}</td>
                        </tr>
                    ))}
                </tbody>
               )}
            </table>
            </div>
        </div>

        {modalOpen && (
            <CreateItemModel 
                title="Create New Invoice" 
                fields={invoicesField} 
                apiEndpoint="http://localhost:8000/xero/invoices" 
                onSubmit={(formData) => {
                    console.log("Creating invoice: ", formData);}}

                onClose={()=> setModalOpen(false)}
                dataProcessor={processInvoiceData}
            />
        )}
    </>
    );
}