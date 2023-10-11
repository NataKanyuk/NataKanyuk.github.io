import React from 'react';
import { BrowserRouter, Route, Link, Routes } from 'react-router-dom';
import WeatherApp from './components/WeatherApp';
import AboutApp from './AboutApp';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="navbar">
          <Link to="/">Головна</Link>
          <Link to="/about">Про додаток</Link>
        </nav>

        <Routes>
          <Route path="/" element={<WeatherApp />} />
          <Route path="/about" element={<AboutApp />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
