import React, {useState} from 'react';
import '../App.css'

interface ConnectButtonProps {
    onClick: () => Promise<void>
    disabled?: boolean
}


export default function ConnectButton ({onClick, disabled = false}: ConnectButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            await onClick();
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
        className="connectButton"
        onClick={handleClick}
        disabled= {disabled || loading}>
            {loading ? 'Connecting...' : 'Connect to Xero'}
        </button>
    );
}