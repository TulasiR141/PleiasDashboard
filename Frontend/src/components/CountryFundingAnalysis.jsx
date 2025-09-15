import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, BarChart3, PieChart, List } from 'lucide-react';
import '../styles/CountryFundingAnalysis.css';

import { API_BASE_URL } from '../config/environment';

const CountryFundingAnalysis = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    country: '',
    yearRange: '2021-2024'
  });

  const [availableCountries, setAvailableCountries] = useState([]);
  const [apiData, setApiData] = useState(null);
  const [filteredData, setFilteredData] = useState({
    engage: [],
    projected: [],
    cadData: [],
    actionData: []
  });
  const [loading, setLoading] = useState(true);
  const [chart2Count, setChart2Count] = useState('7');

  const yearRangeOptions = ['2021-2024', '2025-2027', '2021-2027'];

  // Get base URL based on environment
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

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/Projects/section2charts`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setApiData(data);

        // Extract unique countries from projected data for filter
        const countries = [...new Set(data.projected.map(item => item.country))].sort();
        setAvailableCountries(countries);
        
        // Set default country to first available
        if (countries.length > 0) {
          setFilters(prev => ({ ...prev, country: countries[0] }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on selected filters
  useEffect(() => {
    if (!apiData || !filters.country) return;

    const filterByCountryAndYear = (data) => {
      return data.filter(item => 
        item.country === filters.country && 
        item.yearRange === filters.yearRange
      );
    };

    setFilteredData({
      engage: filterByCountryAndYear(apiData.engage || []),
      projected: filterByCountryAndYear(apiData.projected || []),
      cadData: filterByCountryAndYear(apiData.cadDataChart2 || []),
      actionData: filterByCountryAndYear(apiData.actionDataChart3 || [])
    });
  }, [apiData, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Render pie chart with legends
  const renderPieChart = (data, title, dataKey = 'percentage') => {
    if (!data || data.length === 0) {
      return (
        <div className="pie-chart-container">
          <h4 className="pie-chart-title">{title}</h4>
          <div className="no-data">No data available</div>
        </div>
      );
    }

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    let cumulativePercentage = 0;

    return (
      <div className="pie-chart-container">
        <h4 className="pie-chart-title">{title}</h4>
        <div className="pie-chart-content">
          <div className="pie-chart-wrapper">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {data.map((item, index) => {
                const percentage = item[dataKey] || 0;
                const startAngle = (cumulativePercentage / 100) * 360;
                const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                
                const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArcFlag = percentage > 50 ? 1 : 0;
                const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                
                // Calculate label position
                const labelAngle = (startAngle + endAngle) / 2;
                const labelRadius = 55;
                const labelX = 100 + labelRadius * Math.cos((labelAngle - 90) * Math.PI / 180);
                const labelY = 100 + labelRadius * Math.sin((labelAngle - 90) * Math.PI / 180);
                
                cumulativePercentage += percentage;
                
                return (
                  <g key={index}>
                    <path
                      d={pathData}
                      fill={colors[index % colors.length]}
                      stroke="white"
                      strokeWidth="2"
                    />
                    {percentage > 8 && (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {percentage.toFixed(1)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="pie-chart-legend">
            {data.map((item, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="legend-text">
                  {item.area || `Area ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render progress bar
  const renderProgressBar = () => (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>
      <span className="progress-text">Loading...</span>
    </div>
  );

  // Get top CAD items based on count
  const getTopCADItems = () => {
    if (chart2Count === 'All') {
      return filteredData.cadData;
    }
    return filteredData.cadData.slice(0, parseInt(chart2Count));
  };

  if (loading) {
    return (
      <div className="country-analysis">
        <div className="loading-screen">
          {renderProgressBar()}
        </div>
      </div>
    );
  }

  return (
    <div className="country-analysis">
      {/* Header */}
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
            <button className="nav-link" onClick={() => handleNavigation('home')}>Home</button>
            <button className="nav-link" onClick={() => handleNavigation('global')}>Sectors</button>
            <button className="nav-link active" onClick={() => handleNavigation('country')}>Countries</button>
            <button className="nav-link" onClick={() => handleNavigation('funding')}>Funding Flows</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header-section">
          <h1 className="page-title">Country Funding Analysis</h1>
        </div>

        {/* Filters Container */}
        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">Country</label>
            <select 
              className="filter-select"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Year Range</label>
            <select 
              className="filter-select"
              value={filters.yearRange}
              onChange={(e) => handleFilterChange('yearRange', e.target.value)}
            >
              {yearRangeOptions.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Charts Container */}
        <div className="charts-container">
          {/* Chart 1: Pie Charts Comparison */}
          <div className="chart-container chart-full-width">
            <div className="chart-header">
              <div className="chart-icon">
                <PieChart size={24} />
              </div>
              <div className="chart-title-section">
                <h2 className="chart-title">Priority Areas Funding Comparison</h2>
                <p className="chart-subtitle">Projected vs Engaged Amount Distribution</p>
              </div>
            </div>

            <div className="chart-content">
              <div className="pie-charts-container">
                {renderPieChart(filteredData.projected, "Projected Amount")}
                {renderPieChart(filteredData.engage, "Engaged Amount")}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="charts-row">
            {/* Chart 2: Top CAD Items Grid */}
            <div className="chart-container">
              <div className="chart-header">
                <div className="chart-icon">
                  <List size={24} />
                </div>
                <div className="chart-title-section">
                  <h2 className="chart-title">Top CAD Data</h2>
                  <p className="chart-subtitle">CAD Code and Name</p>
                </div>
                <div className="chart-filter">
                  <label>Show top: </label>
                  <select 
                    value={chart2Count} 
                    onChange={(e) => setChart2Count(e.target.value)}
                    className="count-select"
                  >
                    <option value="5">5</option>
                    <option value="7">7</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="All">All</option>
                  </select>
                </div>
              </div>

              <div className="chart-content">
                <div className="cad-grid">
                  <div className="cad-grid-header">
                    <div className="cad-header-cell">CAD Code</div>
                    <div className="cad-header-cell">Name</div>
                  </div>
                  {getTopCADItems().length > 0 ? (
                    getTopCADItems().map((item, index) => (
                      <div key={index} className="cad-grid-row">
                        <div className="cad-grid-cell">{item.cadCode || 'N/A'}</div>
                        <div className="cad-grid-cell">{item.name || 'N/A'}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No CAD data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart 3: Action Plans Bar Chart */}
            <div className="chart-container">
              <div className="chart-header">
                <div className="chart-icon">
                  <BarChart3 size={24} />
                </div>
                <div className="chart-title-section">
                  <h2 className="chart-title">Top Programs</h2>
                  <p className="chart-subtitle">Direct Total Fund vs Indirect Total Fund Amount by Programs</p>
                </div>
              </div>

              <div className="chart-content">
                {filteredData.actionData.length > 0 ? (
                  <div className="vertical-bar-chart">
                    <div className="chart-area">
                      <div className="y-axis">
                        {(() => {
                          const maxValue = Math.max(...filteredData.actionData.map(d => Math.max(d.totalAmount || 0, d.indirectAmount || 0)));
                          const steps = [maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0];
                          return steps.map((value, index) => (
                            <div key={index} className="y-axis-label">
                              {(value / 1000000).toFixed(0)}M
                            </div>
                          ));
                        })()}
                      </div>
                      
                      <div className="bars-container">
                        {filteredData.actionData.map((item, index) => {
                          const maxValue = Math.max(...filteredData.actionData.map(d => Math.max(d.totalAmount || 0, d.indirectAmount || 0)));
                          const totalAmount = item.totalAmount || 0;
                          const indirectAmount = item.indirectAmount || 0;
                          const chartHeight = 250;
                          
                          const actionTitle = item.actionTitle || item.title || item.name || 
                                            item.actionName || item.programName || item.program ||
                                            item.actionPlan || item.action || `Program ${index + 1}`;
                          
                          return (
                            <div 
                              key={index} 
                              className="bar-group"
                              data-title={actionTitle}
                            >
                              <div className="bars">
                                <div 
                                  className="bar total-funding"
                                  style={{ 
                                    height: `${Math.max(5, maxValue > 0 ? (totalAmount / maxValue) * chartHeight : 0)}px`,
                                  }}
                                  title={`Direct Total: €${(totalAmount / 1000000).toFixed(1)}M - ${actionTitle}`}
                                ></div>
                                <div 
                                  className="bar indirect-funding"
                                  style={{ 
                                    height: `${Math.max(5, maxValue > 0 ? (indirectAmount / maxValue) * chartHeight : 0)}px`,
                                  }}
                                  title={`Indirect Total: €${(indirectAmount / 1000000).toFixed(1)}M - ${actionTitle}`}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="bar-chart-legend">
                      <div className="legend-item">
                        <div className="legend-color total-funding-color"></div>
                        <span>Direct Total Fund</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color indirect-funding-color"></div>
                        <span>Indirect Total Fund</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">No action data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CountryFundingAnalysis;