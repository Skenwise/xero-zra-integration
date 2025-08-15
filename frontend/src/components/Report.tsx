import '../App.css';

interface ReportItem {
    label: string;
    value: string;
}

interface ReportItemProps {
    title: string;
    items: ReportItem[];
    highlightLabel?: string;
}

export default function Report ({title, items, highlightLabel}: ReportItemProps) {
    return (
        <div className="report-card">
            <h3 className="report-card-title">{title}</h3>
            <div className="report-card-body">
                {items.map((item, idx) =>(
                <div 
                    key={idx}
                    className ={`report-row ${item.label === highlightLabel ? 'highlight': ''}`} 
                >
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                </div>
                ))}
            </div>
        </div>
    );
}