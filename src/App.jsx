import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Start from './pages/Start'; // Start loads immediately

// Lazy load heavy components
const Facecamera = lazy(() => import('./Components/Facecamera'));
const End = lazy(() => import('./pages/End'));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          🌀 Loading...
        </div>
      }>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/exam" element={<Facecamera />} />
        <Route path="/end" element={<End />} />
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
