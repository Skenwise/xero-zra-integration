import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Invoices from '../components/Invoices';
import Payments from '../components/Payments';
import Contacts from '../components/Contacts';
import BankTransactions from '../components/BankTransactions';
import CreditNotes from '../components/CreditNotes'; 
import Footer from '../components/Footer';
import {SidebarItems} from '../utils';

export default function Accounting () {
    return (
        <div className="accounting-container">
           <Sidebar title="Kabert Hub Limited" sidebarItems={SidebarItems} exit="Logout"/>

           <div className="accounting-main">
                <Navbar title="Accounting" />

                <DashboardHeader title="Accounting Operation" showButton={false} />
                <Invoices />
                <Payments />
                <Contacts />
                <BankTransactions />
                <CreditNotes />
                <Footer companyName="Kabert Records Hub Limited" />    
            </div> 
        </div>
    );
}