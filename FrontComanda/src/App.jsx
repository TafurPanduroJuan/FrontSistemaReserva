import { useState } from 'react'

import './App.css'
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import Form from './pages/Form';
import Footer from './components/Footer';

//Import Intranet
import IntranetLayout from './components/intranet/IntranetLayout';



function App() {
  return(
    <Router>
      <Routes>
        {/* RUTAS PÚBLICAS (Con Navbar y Footer normales) */}
        <Route path="/*" element={
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/about" element={<About />} />
                <Route path="/form" element={<Form />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />

            {/* ── Rutas de intranet (layout propio, sin Navbar público ni Footer) ── */}
            <Route path="/intranet" element={<IntranetLayout />}>
              <Route index                        element={<IntranetHome />} />
              <Route path="restaurantes-solicitudes" element={<SolicitudesRestaurantes />} />
              <Route path="comentarios"           element={<Comentarios />} />
              <Route path="usuarios"              element={<Usuarios />} />
              <Route path="nuevo-restaurante"     element={<NuevoRestaurante />} />
              <Route path="mesas"                 element={<GestionMesas />} />
              <Route path="reservas"              element={<Reservas />} />
            </Route>
        </Routes>
    </Router>
    
  );
  
}

export default App
