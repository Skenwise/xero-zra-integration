import React from 'react';
import '../App.css';

interface CardProps {
    title: string;
    content: React.ReactNode;
    footer: React.ReactNode;
}

export default function Card({title, content, footer}: CardProps) {
    return (
        <div className="custom-card">
            <h2 className="card-title">{title}</h2>
            <div className="card-content">{content}</div>
            {footer && <div className="card-footer">{footer}</div>}
        </div>
    );
}