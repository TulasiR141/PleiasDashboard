import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, MapPin, FileText } from 'lucide-react';

import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleNavigation = (page) => {
    switch(page) {
      case 'global':
        navigate('/global-funding-landscape');
        break;
      case 'country':
        navigate('/country-funding-analysis');
        break;
      case 'funding':
        navigate('/funding-management-analysis');
        break;
      case 'home':
        navigate('/');
        break;
      default:
        break;
    }
  };

  return (
    <div className="homepage">
      {/* Header Navigation */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <span className="logo-icon">EU</span>
              <div className="logo-text">
                <h1 className="logo-title">EU Funding Analytics</h1>
                <p className="logo-subtitle">European Union Funding Dashboard</p>
              </div>
            </div>
          </div>
          
          <nav className="navigation">
            <a href="#" className="nav-link active" onClick={() => handleNavigation('home')}>Home</a>
            <a href="#" className="nav-link" onClick={() => handleNavigation('global')}>Sectors</a>
            <a href="#" className="nav-link" onClick={() => handleNavigation('country')}>Countries</a>
            <a href="#" className="nav-link" onClick={() => handleNavigation('funding')}>Funding Flows</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="hero-section">
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-description">
            Explore different aspects of EU funding through our comprehensive analytical tools
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="dashboard-grid">
          {/* Global Funding Landscape Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon">
                <Globe size={24} />
              </div>
            </div>
            
            <h3 className="card-title">Global Funding Landscape</h3>
            <p className="card-description">
              Comprehensive overview with world funding heat maps on interactive world map showing EU funding distribution across countries with real-time filtering and comprehensive project statistics.
            </p>
            
            
            
            <div className="key-features">
              <h4>Key Features:</h4>
              <ul>
                <li>World funding heat map</li>
                <li>TYear/type filtering</li>
                <li>Funding level indicators</li>
              </ul>
            </div>
            
            <button className="view-analysis-btn" onClick={() => handleNavigation('global')}>
              View Analysis
            </button>
          </div>

          {/* Country Funding Analysis Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon">
                <MapPin size={24} />
              </div>
            </div>
            
            <h3 className="card-title">Country Funding Analysis</h3>
            <p className="card-description">
            Country-specific funding breakdown with priority area comparison, CAD programs, and direct/indirect funding analysis with comprehensive data tables.
            </p>
            
           
            
            <div className="key-features">
              <h4>Key Features:</h4>
              <ul>
                <li>Projected vs committed funding with Priority areas breakdown</li>
                <li>Top CAD Data</li>
                <li>Direct/indirect programs</li>
                
              </ul>
            </div>
            
            <button className="view-analysis-btn" onClick={() => handleNavigation('country')}>
              View Analysis
            </button>
          </div>

          {/* Funding Management Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon">
                <FileText size={20} />
              </div>
            </div>
            
            <h3 className="card-title">Funding Management</h3>
            <p className="card-description">
             Advanced filtering by year and categories with top-performing countries, programs, and implementation agencies analysis across 
             funding metrics.</p>
            
           
            <div className="key-features">
              <h4>Key Features:</h4>
              <ul>
                <li>Top countries performance (engaged vs projected)</li>
                <li>Programs engagement metrics</li>
                <li>Top Implementation Agencies</li>
              </ul>
            </div>
            
            <button className="view-analysis-btn" onClick={() => handleNavigation('funding')}>
              View Analysis
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;