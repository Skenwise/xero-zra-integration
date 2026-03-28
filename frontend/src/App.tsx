// frontend/src/App.tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { theme } from './theme';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Accounting from './pages/Accounting';
import AccountingReport from './pages/AccountingReport';
import JournalDetailPages from './pages/JournalDetailPages';
import Setting from './pages/setting';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounting/operations" element={<Accounting />} />
          <Route path="/accounting/records" element={<AccountingReport />} />
          <Route path="/accounting/records/journal/:JournalID" element={<JournalDetailPages />} />
          <Route path="/settings" element={<Setting />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;