// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './modules/Pages/Dashboard/Main/Dashboard';
import Reports from './modules/Pages/Reports/Reports'; // crea este componente vacío por ahora
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';


const theme = createTheme({
  palette: {
    mode: 'light', // Puedes cambiar a 'dark' si prefieres
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
