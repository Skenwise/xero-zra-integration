import React from 'react';
import '../App.css';

interface footerProp {
        companyName: string;
}

export default function Footer({companyName}: footerProp) {
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        </footer>
    );
}