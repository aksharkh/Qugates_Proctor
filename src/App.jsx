import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import End from './pages/End';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Start from './pages/Start'
import Facecamera from './Components/Facecamera';



function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
  <Routes>
    <Route path="/" element={<Start />} />
    <Route path="/exam" element={<Facecamera />} />
    <Route path="/end" element={<End />} />
  </Routes>
</Router>
  )
}

export default App
