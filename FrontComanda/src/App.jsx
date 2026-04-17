import { useState } from 'react'

import './App.css'
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import Form from './pages/Form';
import Footer from './components/Footer';

function App() {
  return(
     <div className="d-flex flex-column min-vh-100">
    <Router>
      <Navbar />
        <main>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/catalog' element={<Catalog/>}/>
            <Route path='/about' element={<About/>}/>
            <Route path='/form' element={<Form/>}/>

          </Routes>
        </main>
      <Footer/>
    </Router>
    </div>
  );
  
}

export default App
