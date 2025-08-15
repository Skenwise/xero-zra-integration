import '../App.css';
import {useState} from 'react';
import {useAPIData} from '../utils';
import CreateItemModel from './CreateItemModel';
import {contactsField} from '../utils';
import {processContactData} from '../utils';

export default function Contacts() {

  const {data: contacts, loading, error} = useAPIData('http://localhost:8000/xero/contacts', 'Contacts')
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
    <div className="section">
      <div className="section-header">
        <h2>Contacts</h2>
        <button className="primary-btn" onClick={() => setModalOpen(true)}>Create Contact</button>
      </div>

      <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Is a Supplier</th>
            <th>Is a customer</th>
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
          {contacts.map((contact, index) => (
            <tr key={index}>
              <td>{contact.Name}</td>
              <td>{contact.ContactStatus}</td>
              <td>{contact.IsSupplier ? 'Yes' : 'No'}</td>
              <td>{contact.IsCustomer ? 'Yes' : 'No'}</td>
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
      fields = {contactsField}
      apiEndpoint = "http://localhost:8000/xero/contacts"
      onSubmit={(formData)=> {
        console.log("Contact Created: ", formData)}
      }
      onClose={()=> setModalOpen(false)}
      dataProcessor={processContactData}
      />
    }
    </>
  );
}
