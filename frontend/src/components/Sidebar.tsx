import React from 'react';
import '../App.css';
import {LogOut} from "lucide-react";
import {Link, useLocation} from 'react-router-dom';

interface sidebarItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

interface SidebarProps{
    title: string | any;
    sidebarItems: sidebarItem[]
    exit: string;
}

export default function Sidebar({title, sidebarItems, exit}: SidebarProps) {

        const location = useLocation()

    return (
        <div className="Sidebar">
            <div className="sidebar-top">
                <h1 className="sidebar-logo">{title}</h1>
                {sidebarItems.map((item, idx) => (
                    <Link
                        to={item.path}
                        key={idx}
                        className={`sidebar-item ${
                            location.pathname === item.path ? "active" : ""
                        }`}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </Link>
                ))}
            </div>
            <div className="sidebar-bottom">
                <div className="Sidebar-items">
                    <LogOut size={20} />
                    <span>{exit}</span>
                </div>
            </div>
        </div>
    );
}
