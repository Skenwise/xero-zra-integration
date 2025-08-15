import Sidebar from "../components/Sidebar";
import Navbar from '../components/Navbar';
import DashboardHeader from '../components/DashboardHeader';
import DashboardTable from '../components/DashboardTable';
import KpiCard from '../components/KpiCard';
import Footer from '../components/Footer';
import {SidebarItems} from '../utils';

export default function Dashboard() {
    const headers = ["Name", "Role", "Email", "Status"]
    const data = [
    {Name: "Sage Kona", Role: "Developper", Email: "Sage.kona.dev@gmail.com", Status: "Active"},
    {Name: "Shawn Michaels", Role: "CEO", Email: "ShawnMichaels@gmail.com", Status: "Active"},
    {Name: "Mark Rubin", Role: "Analyst", Email: "KodackMusicCity@gmail.com", Status: "Active"}
    ]

    return (
      <div className="dashboard-container">
        <Sidebar title="Kabert Hub Limited" sidebarItems={SidebarItems} exit="Logout" />
        <div className="dashboard-main">
            <Navbar title="Dashboard"/>

            <DashboardHeader 
            title="ZRA Smart Invoice System with Xero"
            subtitle="Successfully authenticated by Xero"
            showButton={true}
          />

          <DashboardTable headers={headers} data={data} />

          <KpiCard 
          label="Total Users"
          value="5,230"
          change="+8.4%"
          changeType="up"
          />

          <KpiCard 
          label="Monthly Revenue"
          value="$12,000"
          change="-3.15"
          changeType="down"
          />

          <KpiCard 
          label="Conversion Rate"
          value="4.5%"
          />

        <Footer companyName="Kabert Record Hub Limited" /> 
        </div>
      </div>  
    )
}
