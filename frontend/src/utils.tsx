import {Home, FileText, Settings} from 'lucide-react';
import {useState, useEffect} from 'react';

export const SidebarItems = [
    {label: "Home",
    path: "/dashboard",
    icon: <Home size={20}/>
    },
    {
    label: "Accounting",
    path: "/accounting/operations",
    icon: <FileText size={20}/>
    },
    {
    label: "Report",
    path: "/accounting/records",
    icon: <FileText size={20}/>
    },
    {
    label: "Settings",
    path: "/settings",
    icon: <Settings size={20}/>
    },
]

export const journalsField = [
  { label: "Journal Date", name: "JournalDate", type: "date" },
  { label: "Journal Number", name: "JournalNumber", type: "number" },
  { label: "Reference", name: "Reference", type: "text" },
  { label: "Source Type", name: "SourceType", type: "text" },
  { label: "Account Name", name: "AccountName", type: "text" },
  { label: "Account Code", name: "AccountCode", type: "text" },
  { label: "Net Amount", name: "NetAmount", type: "number" },
  { label: "Gross Amount", name: "GrossAmount", type: "number" },
  { label: "Tax Amount", name: "TaxAmount", type: "number" },
  { label: "Tax Type", name: "TaxType", type: "text" },
  { label: "Tax Name", name: "TaxName", type: "text" },
  { label: "Description", name: "Description", type: "text" },
];

export const incomeStatement = [
  {label: 'Revenue', value: '$12,0000'},
  {label: 'Expenses', value: '$4,0000'},
  {label: 'Net Profit', value: '$8,0000'}
]

export const balanceSheets = [
  {label: 'Assets', value: '$25,0000'},
  {label: 'Liabilities', value: '$10,0000'},
  {label: 'Equity', value: '$15,0000'}
]
export const notesField = [
  {label: "Type", name: "Type", type:"text"},
  {label: "Date", name: "Date", type: "text"},
  {label: "Contact ID", name: "ContactID", type: "text"},
  {label: "SubTotal", name:"SubTotal", type:"number"},
  {label:"TotalTax", name: "TotalTax", type:"number"},
  {label: "Total", name: "Total", type:"number"},
  {label: "Currency Code", name: "CurrencyCode", type: "text"}
] 
export const paymentsField = [
  {label: "Payment ID", name: "PaymentID", type:"text"},
  {label: "Date", name: "Date", type: "text"},
  {label: "Amount", name: "Amount", type: "text"},
  {label: "Payment type", name:"PaymentAmount", type:"text"},
  {label:"Status", name: "Status", type:"text"},
  {label: "Invoice Number", name: "InvoiceNumber", type:"text"},
  {label: "Name", name: "Name", type: "text"}
]

export const transactionsField = [
  {label: "Type", name: "Type", type:"text"},
  {label: "Date", name: "Date", type:"text"},
  {label: " Bank Accound ID", name: "Account ID", type: "text"},
  {label: "Contact ID", name: "ContactID", type: "text"},
  {label: "Total", name: "Total", type: "number"},
  {label: "Currency Code", name: "CurrencyCode", type: "text"}
]

export const invoicesField = [
  {label: "Type", name:"Type", type: "text"},
  {label: "Invoice Number", name: "invoiceNumber", type: "text"},
  {label: "Contact Name", name: "ContactName", type: "text"},
  {label: "Date", name: "Date", type: "text"},
  {label: "Due Date", name: "DueDate", type: "text"},
  {label: "Status", name: "Status", type: "text"},

  // line Item field
  {label: "Description", name: "Description", type:"text"},
  {label: "Quantity", name:"Quantity", type:"number"},
  {label: "Unit Amount", name: "UnitAmount", type:"number"},
  {label: "Account Code", name: "AccountCode", type:"text"}
]

export const contactsField = [
  { label: "Name", name: "Name", type: "text" },
  { label: "Status", name: "ContactStatus", type: "text" },
  { label: "Is Customer", name: "IsCustomer", type: "checkbox" },
  { label: "Is Supplier", name: "IsSupplier", type: "checkbox" },
];

export const processInvoiceData = (formData: Record<string, any>) => ({
  Type: formData.Type || 'ACCREC',
  InvoiceNumber: formData.InvoiceNumber || 'INV-101',
  Contact: {
    Name: formData.ContactName || ''
  },
  Date: formData.Date || '',
  DueDate: formData.DueDate || '',
  Status: formData.Status || 'Draft',
  LineItems: [
    {
      Description: formData.Description || '',
      Quantity: parseFloat(formData.Quantity || '1'),
      UnitAmount: parseFloat(formData.UnitAmount || '0'),
      AccountCode: formData.AccountCode || '200'
    },
  ]
});

export const processContactData = (formData: Record<string, any>) => ({
  Name: formData.Name || '',
  ContactStatus: formData.ContactStatus || 'ACTIVE',
  IsSupplier: formData.IsSupplier ?? false,
  IsCustomer: formData.Iscustomer ?? false 
});

export const processPaymentData = (formData: Record<string, any>) => ({
  PaymentId: formData.PaymentID || 'PAY-001',
  Date: formData.Date || '',
  Amount: parseFloat(formData.Amount || '0'),
  PaymentType: formData.PaymentType,
  Status: formData.Status,
  Invoice: {
    InvoiceNumber: formData.InvoiceNumber || 'INV-001',
    Contact: {
      Name: formData.Name || ''
    }
  }
})

export const processTransactionsData = (formData: Record<string, any>) => ({
  Type: formData.Type || 'SPEND',
  Date: formData.Date || '',
  BankAccount: {
    AccountID: formData.AccountID || ''
  },
  Contact: {
    ContactID: formData.ContactID || ''
  },
  Total: formData.Total || '1',
CurrencyCode: formData.CurrencyCode || 'USD'
})

export const processNotesData = (formData: Record<string, any>) => ({
  Type: formData.Type || '',
  Date: formData.Date || '',
  Contact: {
    ContactID: formData.ContactID || ''
  },
  SubTotal: formData.SubTotal || '0',
  TotalTax: formData.TotalTax || '0',
  Total: formData.Total || '1',
  CurrencyCode: formData.CurrencyCode || 'USD'
})

export const processJournalData = (formData: Record<string, any>) => ({
  JournalDate: formData.JournalDate || '',
  JournalNumber: parseInt(formData.JournalNumber || '0'),
  Reference: formData.Reference || '',
  SourceType: formData.SourceType || '',
  JournalLines: [
    {
      AccountName: formData.AccountName || '',
      AccountCode: formData.AccountCode || '',
      NetAmount: parseFloat(formData.NetAmount || '0'),
      GrossAmount: parseFloat(formData.GrossAmount || '0'),
      TaxAmount: parseFloat(formData.TaxAmount || '0'),
      TaxType: formData.TaxType || 'NONE',
      TaxName: formData.TaxName || '',
      Description: formData.Description || '',
      TrackingCategories: [],
    },
  ],
});


export function formatXeroDate(XeroDate: string | null | undefined): string {
  if (!XeroDate) return '';
  const timestamp = XeroDate.match(/\d+/)?.[0];
  if(!timestamp) return '';
  return new Date(parseInt(timestamp)).toLocaleDateString();
}

export function useAPIData<T> (url: string, datakey?: string) {

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=> {
   fetch(url, {credentials: 'include'})

   .then(res => {
      if(!res.ok) {
        throw new Error(`Http Error: ${res.status}`)
      } return res.json()
   })
   
   .then(responseData=> {
      console.log("Backend response: ", responseData);
      const extractedData = datakey ? responseData[datakey] : responseData;
      setData(extractedData || []);
      setLoading(false)
   })
    .catch(error => {
      console.error("Failed to fetch data: ", error);
      setError(error.message);
      setData([]);
      setLoading(false)
    });
  }, [url, datakey]);

  return {data, loading, error}
}

export function useAPIDataJournal(JournalID: string) {
  const {data: journalsArray, loading, error} = useAPIData(`http://localhost:8000/xeor/journals/${JournalID}`, 'Journals')

  if (loading) {
    return {journal: null, loading: true, error: null}
  }

  if (error) {
    return {journal: null, loading: null, error}
    }
  if (!journalsArray || journalsArray.length === 0) {
    return {journal: null, loading: false, error: null}
  
  }

  return {journal: journalsArray[0], loading: false, error: null}
}