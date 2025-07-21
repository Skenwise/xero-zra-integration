import React from 'react';
import '../App.css'

interface HeaderProps {
    title: string;
    subtitle: string;
}

export default function Header ({title, subtitle}: HeaderProps) {
    return (
        <header className="Header">
            <h1 className="Header-title">{title}</h1>
            {subtitle && <p className="header-subtitles">{subtitle}</p>}
        </header>
    )
}