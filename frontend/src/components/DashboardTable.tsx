import '../App.css';

interface DashboardTableProps{
    headers: string[];
    data: Array<Record<string, any>>;
}

export default function DashboardTable({headers, data}: DashboardTableProps) {
    return (
        <div className="dashboard-table">
            <table>
                <thead>
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx}>
                            {headers.map((key, colIdx) => (
                                <td key={colIdx}>{row[key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}