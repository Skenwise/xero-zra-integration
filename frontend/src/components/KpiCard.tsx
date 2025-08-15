import '../App.css';

interface KpiCardProps {
    label: string;
    value: string | number;
    change?: string;
    changeType?: "up" | "down";
    className?: string;
}

export default function ({label, value, change, changeType, className}: KpiCardProps) {
    const changeColor = changeType === "up" ? "green" : changeType === "down" ? "red": "gray";
    
    return (
        <div className={`kpi-card ${className}`}>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
            {change && ( 
                <div className={`kpi-change`} style = {{color: changeColor}}>
                    {change}
                </div>
            )}
        </div>
    );
}