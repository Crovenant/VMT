import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardWrapper from './modules/Pages/Dashboard/Main/DashboardWrapper'; // ✅ Usamos DashboardWrapper
import Reports from './modules/Pages/Reports/Reports';
import CSODashboard from './modules/Pages/CSO/csoDashboard'; // ✅ Nueva vista CSO
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Redirige la raíz al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardWrapper />} />
          <Route path="/reports" element={<Reports />} /> 
          <Route path="/csoDashboard" element={<CSODashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}