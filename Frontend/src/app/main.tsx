import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/global.scss';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/authContext/AuthContext.tsx';
import { ReservationProvider } from './providers/reservationContext/ReservationContext.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ReservationProvider>
                    <App />
                </ReservationProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
