import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import { Navigate } from 'react-router-dom';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
