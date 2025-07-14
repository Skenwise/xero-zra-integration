import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import axios from 'axios';

function App() {
  useEffect(() => {
  const fetchData = async () => {
    const res = await axios.get("http://localhost/", {withCredentials: true});
  };
  fetchData();
}, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
      </Routes>
    </Router>
  );
}


export default App;
