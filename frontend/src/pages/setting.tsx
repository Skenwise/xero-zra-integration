import '../App.css';
import { useAPIData } from '../utils';
import { API_URL } from '../utils';
import {handleDisconnect} from '../utils'

interface Tenant {
  id: string;
  authEventId: string;
  tenantId: string;
  tenantType: string;
  tenantName: string;
  createdDateUtc: string;
  updatedDateUtc: string;
}

export default function XeroIdentity() {
  const { data, loading, error } = useAPIData(`${API_URL}/xero/identity`);

  if (loading) return <p className="loading-text">Loading Xero identity...</p>;
  if (error) return <p className="error-text">Error loading identity: {error}</p>;
  if (!data || !Array.isArray(data)) return <p>No identity data available.</p>;

  return (
    <div className="xero-identity-container">
      <h2>Xero Integration</h2>
      {data.map((tenant: Tenant) => (
        <div key={tenant.tenantId} className="xero-tenant-card">
          <h3 className="tenant-name">{tenant.tenantName}</h3>
          <p className="tenant-type"><strong>Type:</strong> {tenant.tenantType}</p>

          <div className="tenant-details">
            <div><strong>Tenant ID:</strong> <span>{tenant.tenantId}</span></div>
            <div><strong>Auth Event ID:</strong> <span>{tenant.authEventId}</span></div>
            <div><strong>Integration Created:</strong> <span>{new Date(tenant.createdDateUtc).toLocaleString()}</span></div>
            <div><strong>Last Updated:</strong> <span>{new Date(tenant.updatedDateUtc).toLocaleString()}</span></div>
          </div>

          <div className="xero-extra-info">
            <p><strong>Connection Status:</strong> <span className="status-connected">Connected</span></p>
            <p><strong>API Access:</strong> Full Accounting API access</p>
            <p><strong>Data Sync:</strong> Automatically synced every 5 minutes</p>
            <p><strong>Notes:</strong> You can connect multiple tenants and manage them here.</p>
          </div>

          <div className="xero-actions">
            <button className="btn-disconnect" onClick={()=> handleDisconnect()}>Disconnect</button>
          </div>
        </div>
      ))}
    </div>
  );
}