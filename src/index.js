import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';

import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary';
import AuthProvider from './Auth/authContext';
import App from './App';

import './index.scss';

const theme = createTheme({
  typography: {
    fontFamily: ['Source Sans Pro', 'Arial', 'sans-serif'].join(','),
    button: {
      textTransform: 'none',
    },
  },
  palette: {
    success: {
      main: '#21d07a',
    },
    warning: {
      main: '#d2d531',
    },
    error: {
      main: '#db2360',
    },
    info: {
      main: '#5f6161',
    },
    secondary: {
      main: '#01b4e4',
    },
  },
});

const rootElement = document.getElementById('root');

createRoot(rootElement).render(
  <ErrorBoundary>
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  </ErrorBoundary>
);
