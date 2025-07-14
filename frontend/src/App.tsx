import React, {useEffect} from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import axios from 'axios';

function App() {
  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost/", {withCredentials: true});
      console.log("Backend response: ",res.data)
    } catch (error) {
      console.error("Error connecting to backend: ", error);
    }
    
  };

  fetchData();
}, []);

const handleConnect = async () => {
  try {
    const response = await fetch("http://localhost:8000/login", {
      method: "GET",
      credentials: "include" //Needed to keep session cookie
    });

    // redirect to xero api
    if (response.redirected) {
      window.location.href = response.url
    }
  } catch (err) {
    console.error("Failed to connect to Xero", err);
  }
};

  return (
    <Router>
      <div className="App">
        <button 
        onClick={handleConnect}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
           Connect To Xero
        </button>
        <Routes>
        <Route path="/" element={<Home />} />
        
      </Routes>
      </div>
    </Router>
  );
}


export default App;
