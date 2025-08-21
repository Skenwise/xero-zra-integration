import React from 'react';
import Header from '../components/Header'
import ConnectButton from '../components/ConnectButton'
import InfoBox from '../components/InfoBox';
import Footer from '../components/Footer';
import Card from '../components/Card';

export default function Home() {

    const handleConnect = async () => {
        console.log("Connecting to Xero")

        try {
            window.location.href = "https://7ad79eaf5978.ngrok-free.app/login"
        } catch (error) {
            console.log("Failed to connect to Xero: ", error);
        }
        

    }

    return (
        <div>
            <Header
            title="Xero-ZRA-Integration"
            subtitle="Sync your ZRA smart invoice system with Xero Seamlessly"
            />  
            <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
                <InfoBox title="Total Transactions" value={152} description="This month" />
                <InfoBox title="Pendig invoices" value={12} highlight description="Need your attention" />
                <InfoBox title="New clients" value={7} />
            </div>
            <Card 
                title="Invoice summary"
                content={
                    <ul>
                        <li>Total: k15,0000</li>
                        <li>paid: k10,0000</li>
                        <li>unpaid: k5,0000</li>
                    </ul>
                }
                footer={<span>Last update: 3 days ago</span>}
            />
            <div className="home-container">
                <h1>Xero-ZRA Integration</h1>
                <ConnectButton onClick={handleConnect} />
            </div>
            <Footer companyName="Kabert Hub Recods Limited"/>
        </div>
    );
}