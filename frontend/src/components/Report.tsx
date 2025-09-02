import '../App.css';
import BalanceSheetReport from './reportComponents/BalanceSheetReport';
import ProfitLossReport from './reportComponents/ProfitLossReport';
import TrialBalanceReport from './reportComponents/TrialBalanceReport';

interface RenderReportProps {
    reportType: "BalanceSheet" | "ProfitAndLoss" | "trialBalance";
    reportData: any;
}


export default function Report ({reportType, reportData}: RenderReportProps) {
        switch (reportType) {
            case "BalanceSheet":
                return <BalanceSheetReport data={reportData} />;

            case "ProfitAndLoss":
                return <ProfitLossReport data={reportData} />

            case "trialBalance":
                return <TrialBalanceReport data={reportData} />
            
            default:
                return <div>No report Selected</div>;
        }
}