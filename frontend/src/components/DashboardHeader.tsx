import React from 'react';
import '../App.css';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    showButton: boolean;
}


export default function DashboardHeader({title, subtitle, showButton=true}: DashboardHeaderProps) {
    return (
        <div className="dashboard-header">
            <div className="header-left">
                <h1 className="header-title">{title}</h1>
                {subtitle && <div className="header-subtitles">{subtitle}</div>}
            </div>
            {showButton && (
                <div className="header-right">
                    <button className="header-btn">Add New</button>
                    <button className="header-btn">Download</button>
                </div>
            )}
       </div>
    );
}