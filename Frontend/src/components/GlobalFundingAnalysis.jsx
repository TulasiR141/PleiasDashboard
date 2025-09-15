import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/GlobalFundingAnalysis.css';
import { API_BASE_URL } from '../config/environment';
// Remove the old const API_BASE_URL line completely
let globalDataCache = { projects: null, lastFetch: null };

const GlobalFundingAnalysis = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ year: '2024', fundingType: 'total' });
  const [apiData, setApiData] = useState({ projects: null, loading: true, error: null });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
// NEW

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

  const countryCoordinates = {
    'Belize': [17.1899, -88.4976], 'Bhutan': [27.5142, 90.4336], 'Botswana': [-22.3285, 24.6849],
    'Republic of the Congo': [-0.2280, 15.8277], 'Dominican Republic': [18.7357, -70.1627],
    'Ecuador': [-1.8312, -78.1834], 'Honduras': [15.2000, -86.2419], 'Jamaica': [18.1096, -77.2975],
    'Kazakhstan': [48.0196, 66.9237], 'Malaysia': [4.2105, 101.9758], 'Paraguay': [-23.4425, -58.4438],
    'Thailand': [15.8700, 100.9925], 'Turkmenistan': [38.9697, 59.5563], 'Iraq': [33.2232, 43.6793],
    'Germany': [51.1657, 10.4515], 'France': [46.6034, 1.8883], 'Italy': [41.8719, 12.5674],
    'Spain': [40.4637, -3.7492], 'Netherlands': [52.1326, 5.2913], 'Poland': [51.9194, 19.1451],
    'United Kingdom': [55.3781, -3.4360], 'United States': [37.0902, -95.7129]
  };

  const generateMockData = useCallback(() => {
    const mockProjects = [];
    const countries = Object.keys(countryCoordinates);
    const years = ['2021', '2022', '2023', '2024'];
    
    countries.forEach(country => {
      const projectCount = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < projectCount; i++) {
        mockProjects.push({
          id: Math.floor(Math.random() * 1000),
          projectguid: `${Math.floor(Math.random() * 100000000)}-0000-0000-0000-000000000000`,
          country: country,
          year: years[Math.floor(Math.random() * years.length)],
          action_TITLE: `Sample project ${i + 1} in ${country}`,
          annual_action_TITLE: `Annual action plan 2024 for ${country}`,
          filename: `sample_${country.toLowerCase().replace(' ', '_')}_${i + 1}.txt`,
          columN_1_3_1_TOTAL_AMOUNT: Math.floor(Math.random() * 10000000) + 100000,
          globaL_INDIRECT_MANAGEMENT_AMOUNT: Math.floor(Math.random() * 1000000).toString(),
          startDate: `${years[Math.floor(Math.random() * years.length)]}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`
        });
      }
    });
    return mockProjects;
  }, []);

  const fetchApiData = useCallback(async () => {
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000;
    
    if (globalDataCache.projects && globalDataCache.lastFetch && (now - globalDataCache.lastFetch) < CACHE_DURATION) {
      setApiData({ projects: globalDataCache.projects, loading: false, error: null });
      return;
    }

    try {
      setApiData(prev => ({ ...prev, loading: true, error: null }));
      let projects;
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        if (!response.ok) throw new Error(`API not available: ${response.status}`);
        projects = await response.json();
        if (!Array.isArray(projects)) throw new Error('API response is not an array');
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError.message);
        projects = generateMockData();
      }
      globalDataCache = { projects, lastFetch: now };
      setApiData({ projects, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching API data:', error);
      setApiData(prev => ({ ...prev, loading: false, error: error.message }));
    }
  }, [API_BASE_URL, generateMockData]);

  const availableYears = useMemo(() => {
    if (!apiData.projects || !Array.isArray(apiData.projects) || apiData.projects.length === 0) {
      return ['2024', '2023', '2022', '2021'];
    }
    const years = new Set();
    apiData.projects.forEach(project => {
      try {
        if (project.startDate) {
          const year = new Date(project.startDate).getFullYear();
          if (!isNaN(year) && year > 1900 && year < 2100) years.add(year.toString());
        }
        if (project.year) {
          const yearStr = typeof project.year === 'string' ? project.year : project.year.toString();
          if (yearStr.match(/^\d{4}$/)) years.add(yearStr);
        }
      } catch (e) {}
    });
    return years.size > 0 ? Array.from(years).sort().reverse() : ['2024', '2023', '2022', '2021'];
  }, [apiData.projects]);

  const mapData = useMemo(() => {
    if (!apiData.projects || !Array.isArray(apiData.projects)) return {};
    const countryData = {};
    apiData.projects.forEach(project => {
      try {
        let projectYear = null;
        if (project.year) {
          projectYear = typeof project.year === 'string' ? project.year : project.year.toString();
        } else if (project.startDate) {
          const year = new Date(project.startDate).getFullYear();
          if (!isNaN(year)) projectYear = year.toString();
        }
        if (filters.year !== 'All Years' && projectYear !== filters.year) return;
        
        const country = project.country;
        if (!country || typeof country !== 'string') return;

        let fundingAmount = 0;
        if (filters.fundingType === 'total') {
          fundingAmount = project.columN_1_3_1_TOTAL_AMOUNT || project.totalFunding || project.totalAmount || project.amount || 0;
        } else {
          const indirectAmount = project.globaL_INDIRECT_MANAGEMENT_AMOUNT || 0;
          fundingAmount = typeof indirectAmount === 'string' ? parseFloat(indirectAmount) : indirectAmount;
          if (isNaN(fundingAmount)) {
            fundingAmount = project.remainingFunding || project.remainingAmount || 0;
          }
        }

        const numericAmount = parseFloat(fundingAmount) || 0;
        if (countryData[country]) {
          countryData[country].funding += numericAmount;
          countryData[country].projectCount += 1;
        } else {
          countryData[country] = {
            funding: numericAmount, projectCount: 1, coordinates: countryCoordinates[country] || null
          };
        }
      } catch (error) {
        console.warn('Error processing project:', error);
      }
    });
    return countryData;
  }, [apiData.projects, filters]);

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '€0';
    if (amount >= 1000000000) return `€${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `€${(amount / 1000).toFixed(1)}K`;
    return `€${amount.toLocaleString()}`;
  };

  const clearMarkers = useCallback(() => {
    if (markersRef.current) {
      markersRef.current.forEach(marker => {
        if (mapInstanceRef.current && marker) {
          try { mapInstanceRef.current.removeLayer(marker); } catch (e) {}
        }
      });
      markersRef.current = [];
    }
  }, []);

  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;
    try {
      if (!window.L) {
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (mapInstanceRef.current) {
        try {
          clearMarkers();
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {}
      }

      if (mapRef.current) {
        mapRef.current.innerHTML = '';
        mapRef.current._leaflet_id = null;
      }

      const map = window.L.map(mapRef.current, { center: [20, 0], zoom: 2, maxZoom: 18, minZoom: 1 });
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapInitialized(true);
      
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 100);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [clearMarkers]);

  const updateMapMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !mapInitialized || typeof window === 'undefined' || !window.L) return;
    
    clearMarkers();
    setSelectedCountry(null);
    
    const countriesWithCoords = Object.entries(mapData).filter(([_, data]) => data.coordinates);
    if (countriesWithCoords.length === 0) return;

    const fundingAmounts = countriesWithCoords.map(([_, data]) => data.funding).filter(f => f > 0);
    const maxFunding = fundingAmounts.length > 0 ? Math.max(...fundingAmounts) : 1;
    const minFunding = fundingAmounts.length > 0 ? Math.min(...fundingAmounts) : 0;

    const getMarkerColor = (amount) => {
      if (amount <= 0) return '#9E9E9E';
      const intensity = maxFunding > minFunding ? (amount - minFunding) / (maxFunding - minFunding) : 0;
      if (intensity > 0.8) return '#4CAF50';
      if (intensity > 0.6) return '#8BC34A';
      if (intensity > 0.4) return '#FFC107';
      if (intensity > 0.2) return '#FF9800';
      return '#F44336';
    };

    countriesWithCoords.forEach(([countryName, countryData]) => {
      const [lat, lng] = countryData.coordinates;
      if (isNaN(lat) || isNaN(lng)) return;
      
      const baseSize = 8; const maxSize = 25;
      let size = baseSize;
      if (countryData.funding > 0 && maxFunding > 0) {
        size = Math.max(baseSize, Math.min(maxSize, baseSize + (countryData.funding / maxFunding) * (maxSize - baseSize)));
      } else {
        size = Math.max(baseSize, Math.min(maxSize, baseSize + (countryData.projectCount / 10) * (maxSize - baseSize)));
      }
      
      const markerColor = getMarkerColor(countryData.funding);
      try {
        const marker = window.L.circleMarker([lat, lng], {
          radius: size, fillColor: markerColor, color: '#FFFFFF', weight: 2, opacity: 1, fillOpacity: 0.8
        }).addTo(mapInstanceRef.current);

        const popupContent = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1976D2; font-size: 16px;">${countryName}</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Projects:</strong> ${countryData.projectCount}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>${filters.fundingType === 'total' ? 'Total' : 'Indirect Management'} Funding:</strong> ${formatCurrency(countryData.funding)}</p>
          </div>`;

        marker.bindPopup(popupContent);
        marker.on('mouseover', function(e) { this.openPopup(); setSelectedCountry(countryName); });
        marker.on('mouseout', function(e) { this.closePopup(); setSelectedCountry(null); });
        marker.on('click', function(e) { setSelectedCountry(countryName); });
        markersRef.current.push(marker);
      } catch (error) {
        console.error(`Error creating marker for ${countryName}:`, error);
      }
    });
  }, [mapData, filters.fundingType, formatCurrency, clearMarkers, mapInitialized]);

  // Fetch data on component mount
  useEffect(() => { 
    fetchApiData(); 
  }, [fetchApiData]);

  // Initialize map when data is loaded
  useEffect(() => {
    if (!apiData.loading && !apiData.error && apiData.projects && !mapInitialized) {
      const timer = setTimeout(() => { 
        initializeMap(); 
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [apiData.loading, apiData.error, apiData.projects, mapInitialized, initializeMap]);

  // Update markers when map is initialized and data is available
  useEffect(() => {
    if (mapInitialized && !apiData.loading && Object.keys(mapData).length > 0) {
      const timer = setTimeout(() => { 
        updateMapMarkers(); 
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mapInitialized, mapData, apiData.loading, updateMapMarkers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try { 
          clearMarkers(); 
          mapInstanceRef.current.remove(); 
        } catch (e) {}
      }
    };
  }, [clearMarkers]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  if (apiData.loading) {
    return (
      <div className="global-funding-page">
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
              <a href="#" className="nav-link" onClick={() => handleNavigation('home')}>Home</a>
              <a href="#" className="nav-link active" onClick={() => handleNavigation('global')}>Sectors</a>
              <a href="#" className="nav-link" onClick={() => handleNavigation('country')}>Countries</a>
              <a href="#" className="nav-link" onClick={() => handleNavigation('funding')}>Funding Flows</a>
            </nav>
          </div>
        </header>
        <main className="main-content">
          <div className="loading-container">Loading funding data...</div>
        </main>
      </div>
    );
  }

  if (apiData.error) {
    return (
      <div className="global-funding-page">
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
              <a href="#" className="nav-link" onClick={() => handleNavigation('home')}>Home</a>
              <a href="#" className="nav-link active" onClick={() => handleNavigation('global')}>Sectors</a>
              <a href="#" className="nav-link" onClick={() => handleNavigation('country')}>Countries</a>
              <a href="#" className="nav-link" onClick={() => handleNavigation('funding')}>Funding Flows</a>
            </nav>
          </div>
        </header>
        <main className="main-content">
          <div className="error-container">
            <h2>Error Loading Data</h2>
            <p>{apiData.error}</p>
            <button onClick={fetchApiData}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="global-funding-page">
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
            <a href="#" className="nav-link" onClick={() => handleNavigation('home')}>Home</a>
            <a href="#" className="nav-link active" onClick={() => handleNavigation('global')}>Sectors</a>
            <a href="#" className="nav-link" onClick={() => handleNavigation('country')}>Countries</a>
            <a href="#" className="nav-link" onClick={() => handleNavigation('funding')}>Funding Flows</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header-section">
          <h1 className="page-title">Global Funding Map</h1>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">Year Filter</label>
            <select className="filter-select" value={filters.year} onChange={(e) => handleFilterChange('year', e.target.value)}>
              <option value="All Years">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Funding Type</label>
            <select className="filter-select" value={filters.fundingType} onChange={(e) => handleFilterChange('fundingType', e.target.value)}>
              <option value="total">Total Amount of Funding</option>
              <option value="remaining">Indirect Management Amount</option>
            </select>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <div className="chart-icon"><Globe size={24} /></div>
            <div className="chart-title-section">
              <h2 className="chart-title">Global Funding Map</h2>
              <p className="chart-subtitle">
                {filters.fundingType === 'total' ? 'Total' : 'Indirect management'} funding by country for {filters.year === 'All Years' ? 'all years' : filters.year}
              </p>
            </div>
          </div>

          <div className="chart-content">
            <div className="map-legend">
              {[
                { color: '#4CAF50', size: 24, label: 'Highest Funding' },
                { color: '#8BC34A', size: 20, label: 'High Funding' },
                { color: '#FFC107', size: 16, label: 'Medium Funding' },
                { color: '#FF9800', size: 14, label: 'Low-Medium Funding' },
                { color: '#F44336', size: 12, label: 'Low Funding' },
                { color: '#9E9E9E', size: 10, label: 'No Funding Data' }
              ].map((item, index) => (
                <div key={index} className="legend-item">
                  <div 
                    className="legend-circle" 
                    style={{
                      width: `${item.size}px`, 
                      height: `${item.size}px`, 
                      backgroundColor: item.color
                    }}
                  ></div>
                  <span className="legend-label">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="map-container">
              <div ref={mapRef} className="leaflet-map" />
              {!mapInitialized && (
                <div className="fallback-map">
                  <div className="fallback-info">
                    <strong>Countries with Funding Data:</strong>
                    {Object.entries(mapData).filter(([_, data]) => data.coordinates && data.funding > 0).slice(0, 5).map(([country, data], index) => (
                      <div key={country} className="fallback-country">
                        {country}: {formatCurrency(data.funding)}
                      </div>
                    ))}
                  </div>
                  <div className="fallback-loading">
                    Interactive map loading...
                  </div>
                </div>
              )}
            </div>
            
            {selectedCountry && mapData[selectedCountry] && (
              <div className="country-tooltip">
                <h3>{selectedCountry}</h3>
                <p><strong>Projects:</strong> {mapData[selectedCountry].projectCount}</p>
                <p><strong>{filters.fundingType === 'total' ? 'Total' : 'Indirect Management'} Funding:</strong> {formatCurrency(mapData[selectedCountry].funding)}</p>
              </div>
            )}
          </div>

          <div className="statistics-grid">
            <div className="stat-card">
              <h4>Countries with Data</h4>
              <p>{Object.keys(mapData).filter(country => mapData[country].coordinates).length}</p>
            </div>
            <div className="stat-card">
              <h4>Total Projects</h4>
              <p>{Object.values(mapData).reduce((sum, data) => sum + data.projectCount, 0)}</p>
            </div>
            <div className="stat-card">
              <h4>Total Funding</h4>
              <p>{formatCurrency(Object.values(mapData).reduce((sum, data) => sum + (data.funding || 0), 0))}</p>
            </div>
            <div className="stat-card">
              <h4>Average per Country</h4>
              <p>
                {Object.keys(mapData).length > 0 
                  ? formatCurrency(Object.values(mapData).reduce((sum, data) => sum + (data.funding || 0), 0) / Object.keys(mapData).length)
                  : '€0'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GlobalFundingAnalysis;