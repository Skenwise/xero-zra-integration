import '../App.css';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import JournalDetails from '../components/JournalDetails';
import Footer from '../components/Footer'; import {SidebarItems} from '../utils'; import {useAPIDataJournal} from '../utils'; import {useParams} from 'react-router-dom'; export default function Details () {
const {JournalID} = useParams<{JournalID: string}>();

const {journal, loading, error} = useAPIDataJournal(JournalID || '');

if (!JournalID) {
    return <div>Invalid Journal ID</div>;
}

if (loading) {return <div>Loading...</div>}

if (error) {return <div>Error loading Journal. </div>}

    return (
        <div className="accounting-container">
            <Sidebar title="Kabert Hub Limited" sidebarItems={SidebarItems} exit="Logout"/>

           <div className="accounting-main">
                <Navbar title={`Journal ${JournalID}`} />

                <DashboardHeader title="Journal Details" showButton={false} />
                <JournalDetails journal={journal}/>
                <Footer companyName="Kabert Records Hub Limited" />    
            </div> 
        </div>
    )           
  }     
    