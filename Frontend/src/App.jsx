import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage';

import FundingManagementAnalysis from "./components/FundingManagementAnalysis";
import CountryFundingAnalysis from "./components/CountryFundingAnalysis";
import GlobalFundingAnalysis from "./components/GlobalFundingAnalysis";
import Chatbot  from './components/Chatbot';


function App() {
  console.log("App component rendered");
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/funding-management-analysis" element={<FundingManagementAnalysis />} />
        <Route path="/country-funding-analysis" element={<CountryFundingAnalysis />} />
        <Route path="/global-funding-landscape" element={<GlobalFundingAnalysis />} />
      </Routes>
       <Chatbot />
    </Router>
  );
}

export default App;