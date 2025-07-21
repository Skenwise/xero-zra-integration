import React from 'react';
import '../App.css';

interface InfoBoxProps {
    title: string;
    value: string | number;
    description? : string;
    highlight?: boolean;
}

export default function InfoBox({title, value, description, highlight = false}: InfoBoxProps) {
    return (
        <div className={`infoBox ${highlight ? 'highlight' : ''}`}>
            <h3 className="infoBox-title">{title}</h3>
            < p className="infoBox-value">{value}</p>
            {description && <p className="infoBox-description">{description}</p>}
            <p> Info Box is rendering   </p>
        </div>
    );
}