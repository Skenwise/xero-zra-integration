import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Journals from '../components/AccountingJournal';
import ReportsContainer from '../components/reportComponents/reportContainer'; 
import Footer from '../components/Footer';
import {SidebarItems} from '../utils';

export default function Accounting () {
    return (
        <div className="accounting-container">
           <Sidebar title="Kabert Hub Limited" sidebarItems={SidebarItems} exit="Logout"/>

           <div className="accounting-main">
                <Navbar title="Accounting Records" />

                <DashboardHeader title="Report" showButton={false} />
                <Journals />
                <div className="report-section">
                    <h2 className="reports-title">Financial Reports</h2>

                    <ReportsContainer />
                </div> 
                <Footer companyName="Kabert Records Hub Limited" />    
            </div> 
        </div>
    );
}