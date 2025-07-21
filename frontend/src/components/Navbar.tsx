import React from 'react';
import '../App.css';
import * as FiIcons from "react-icons/fi";
import * as FaIcons from 'react-icons/fa';

interface NavBarProps {
    title: string
}

export default function Navbar({title}: NavBarProps) {
    return (
        <nav className="navbar">
            <h2 className="navbar-title">{title}</h2>
            
            <div className="navabr-action">
                <input 
                type="text"
                className = "navbar-search"
                placeholder="Search...."
                />
                <FiIcons.FiBell className="navbar-icons" size={20} />
                <FaIcons.FaUserCircle className="navbar-icons" size={20} />
            </div>
        </nav>
    );
}

