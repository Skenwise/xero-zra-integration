import React from 'react';
import '../App.css';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type?: AlertType;
    message: string;
    description?: string;
}

export default function Alert({type = 'info', message, description}: AlertProps) {
    return (
        <div className={`alert alert-${type}`}>
            <strong>{message}</strong>
            {description && <p className="alert-description">{description}</p>}
        </div>
    );
}