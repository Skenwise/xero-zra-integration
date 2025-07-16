import React from 'react';
import Header from '../components/Header'
import ConnectButton from '../components/ConnectButton'

export default function Home() {

    const handleConnect = async () => {
        console.log("Connecting to Xero")

        try {
            window.location.href = "http://localhost:8000/login"
        } catch (error) {
            console.log("Failed to connect to Xero: ", error);
        }
        

    }

    return (
        <div>
            <Header />
            <div className="home-container">
                <h1>Xero-ZRA Integration</h1>
                <ConnectButton onClick={handleConnect} />
            </div>
        </div>
    );
}