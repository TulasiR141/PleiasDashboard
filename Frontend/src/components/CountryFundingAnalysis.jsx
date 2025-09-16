import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, BarChart3, PieChart, List, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const [isExporting, setIsExporting] = useState(false);

  const yearRangeOptions = ['2021-2024', '2025-2027', '2021-2027'];

  // Navigation handler
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

    // Special filtering logic for CAD data
    const filterCADData = (data) => {
      if (filters.yearRange === '2021-2027') {
        // Show all data for selected country regardless of year range
        return data.filter(item => item.country === filters.country);
      } else {
        // Filter normally by both country and year range
        return data.filter(item => 
          item.country === filters.country && 
          item.yearRange === filters.yearRange
        );
      }
    };

    setFilteredData({
      engage: filterByCountryAndYear(apiData.engage || []),
      projected: filterByCountryAndYear(apiData.projected || []),
      cadData: filterCADData(apiData.cadDataChart2 || []),
      actionData: filterByCountryAndYear(apiData.actionDataChart3 || [])
    });
  }, [apiData, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Download MIP Report function
  const downloadMipReport = async (country, username, start, end) => {
    try {
      const res = await fetch(`${API_BASE_URL}/py/generate_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, country, start, end }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Request failed: ${res.status} ${text}`);
      }

      const blob = await res.blob();
      
      // Get filename from Content-Disposition header
      const disposition = res.headers.get('Content-Disposition') || '';
      let filename = 'Analyse_MIP.xlsx';
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/['"]/g, "");
      }
      
      // Create temporary link to trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  };

  // Handle export button click
  const handleExport = async () => {
    if (!filters.country) {
      alert('Please select a country to export data.');
      return;
    }

    try {
      setIsExporting(true);

      // Parse year range to get start and end years
      const yearRange = filters.yearRange;
      let startYear, endYear;

      if (yearRange === '2021-2024') {
        startYear = '2021';
        endYear = '2024';
      } else if (yearRange === '2025-2027') {
        startYear = '2025';
        endYear = '2027';
      } else if (yearRange === '2021-2027') {
        startYear = '2021';
        endYear = '2027';
      }

      await downloadMipReport(filters.country, 'user', startYear, endYear);
      console.log('Download started');
    } catch (error) {
      console.error(error);
      alert('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Render pie chart with legends
  const renderPieChart = (data, title, dataKey = 'percentage') => {
    if (!data || data.length === 0) {
      return (
        <div className="country-funding-pie-chart-container">
          <h4 className="country-funding-pie-chart-title">{title}</h4>
          <div className="country-funding-no-data">No data available</div>
        </div>
      );
    }

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    let cumulativePercentage = 0;

    return (
      <div className="country-funding-pie-chart-container">
        <h4 className="country-funding-pie-chart-title">{title}</h4>
        <div className="country-funding-pie-chart-content">
          <div className="country-funding-pie-chart-wrapper">
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
          <div className="country-funding-pie-chart-legend">
            {data.map((item, index) => (
              <div key={index} className="country-funding-legend-item">
                <div 
                  className="country-funding-legend-color" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="country-funding-legend-text">
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
    <div className="country-funding-progress-container">
      <div className="country-funding-progress-bar">
        <div className="country-funding-progress-fill"></div>
      </div>
      <span className="country-funding-progress-text">Loading...</span>
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
      <div className="country-funding-analysis">
        <div className="country-funding-loading-screen">
          {renderProgressBar()}
        </div>
      </div>
    );
  }

  return (
    <div className="country-funding-analysis">
      {/* Header */}
      <header className="country-funding-header">
        <div className="country-funding-header-content">
          <div className="country-funding-logo-section">
            <div className="country-funding-logo">
              <span className="country-funding-logo-icon">EU</span>
              <div className="country-funding-logo-text">
                <h1 className="country-funding-logo-title">EU Funding Analytics</h1>
                <p className="country-funding-logo-subtitle">European Union Funding Dashboard</p>
              </div>
            </div>
          </div>
          
          <nav className="country-funding-navigation">
            <button className="country-funding-nav-link" onClick={() => handleNavigation('home')}>Home</button>
            <button className="country-funding-nav-link" onClick={() => handleNavigation('global')}>Sectors</button>
            <button className="country-funding-nav-link active" onClick={() => handleNavigation('country')}>Countries</button>
            <button className="country-funding-nav-link" onClick={() => handleNavigation('funding')}>Funding Flows</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="country-funding-main-content">
        <div className="country-funding-page-header-section">
          <h1 className="country-funding-page-title">Country Funding Analysis</h1>
        </div>

        {/* Filters Container */}
        <div className="country-funding-filters-container">
          <div className="country-funding-filter-group">
            <label className="country-funding-filter-label">Country</label>
            <select 
              className="country-funding-filter-select"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="country-funding-filter-group">
            <label className="country-funding-filter-label">Year Range</label>
            <select 
              className="country-funding-filter-select"
              value={filters.yearRange}
              onChange={(e) => handleFilterChange('yearRange', e.target.value)}
            >
              {yearRangeOptions.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          <button
            className="country-funding-export-button"
            onClick={handleExport}
            disabled={isExporting || !filters.country}
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>

        {/* Charts Container */}
        <div className="country-funding-charts-container">
          {/* Chart 1: Pie Charts Comparison */}
          <div className="country-funding-chart-container country-funding-chart-full-width">
            <div className="country-funding-chart-header">
              <div className="country-funding-chart-icon">
                <PieChart size={24} />
              </div>
              <div className="country-funding-chart-title-section">
                <h2 className="country-funding-chart-title">Priority Areas Funding Comparison</h2>
                <p className="country-funding-chart-subtitle">Projected vs Engaged Amount Distribution</p>
              </div>
            </div>

            <div className="country-funding-chart-content">
              <div className="country-funding-pie-charts-container">
                {renderPieChart(filteredData.projected, "Projected Amount")}
                {renderPieChart(filteredData.engage, "Engaged Amount")}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="country-funding-charts-row">
            {/* Chart 2: Top CAD Items Grid - FIXED SIZE */}
            <div className="country-funding-chart-container">
              <div className="country-funding-chart-header">
                <div className="country-funding-chart-icon">
                  <List size={24} />
                </div>
                <div className="country-funding-chart-title-section">
                  <h2 className="country-funding-chart-title">Top CAD Data</h2>
                  <p className="country-funding-chart-subtitle">CAD Code and Name</p>
                </div>
                <div className="country-funding-chart-filter">
                  <label>Show top: </label>
                  <select 
                    value={chart2Count} 
                    onChange={(e) => setChart2Count(e.target.value)}
                    className="country-funding-count-select"
                  >
                    <option value="5">5</option>
                    <option value="7">7</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="All">All</option>
                  </select>
                </div>
              </div>

              <div className="country-funding-chart-content">
                <div className="country-funding-cad-grid">
                  <div className="country-funding-cad-grid-header">
                    <div className="country-funding-cad-header-cell">CAD Code</div>
                    <div className="country-funding-cad-header-cell">Name</div>
                  </div>
                  <div className="country-funding-cad-grid-body">
                    {getTopCADItems().length > 0 ? (
                      getTopCADItems().map((item, index) => (
                        <div key={index} className="country-funding-cad-grid-row">
                          <div className="country-funding-cad-grid-cell">{item.cadCode || 'N/A'}</div>
                          <div className="country-funding-cad-grid-cell">{item.name || 'N/A'}</div>
                        </div>
                      ))
                    ) : (
                      <div className="country-funding-no-data">No CAD data available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: Action Plans Bar Chart - FIXED SIZE */}
            <div className="country-funding-chart-container">
              <div className="country-funding-chart-header">
                <div className="country-funding-chart-icon">
                  <BarChart3 size={24} />
                </div>
                <div className="country-funding-chart-title-section">
                  <h2 className="country-funding-chart-title">Top Programs</h2>
                  <p className="country-funding-chart-subtitle">Direct Total Fund vs Indirect Total Fund Amount by Programs</p>
                </div>
              </div>

              <div className="country-funding-chart-content">
                {filteredData.actionData.length > 0 ? (
                  <div className="country-funding-recharts-container">
                    <div className="country-funding-recharts-wrapper">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredData.actionData.map((item, index) => ({
                            name: item.actionTitle || item.title || item.name || 
                                  item.actionName || item.programName || item.program ||
                                  item.actionPlan || item.action || `Program ${index + 1}`,
                            directTotal: (item.totalAmount || 0) / 1000000, // Convert to millions
                            indirectTotal: (item.indirectAmount || 0) / 1000000 // Convert to millions
                          }))}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="name" 
                            tick={false} // Hide x-axis labels
                            axisLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="country-funding-custom-tooltip">
                                    <div className="country-funding-tooltip-label">
                                      {label}
                                    </div>
                                    {payload.map((entry, index) => (
                                      <div key={index} className="country-funding-tooltip-item">
                                        <div 
                                          className="country-funding-tooltip-color"
                                          style={{ backgroundColor: entry.color }}
                                        ></div>
                                        <span>
                                          {entry.dataKey === 'directTotal' ? 'Direct Total Fund' : 'Indirect Total Fund'}: 
                                          €{entry.value.toFixed(1)}M
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="directTotal" 
                            fill="#1e40af" 
                            name="Direct Total Fund"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar 
                            dataKey="indirectTotal" 
                            fill="#3b82f6" 
                            name="Indirect Total Fund"
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="country-funding-bar-chart-legend">
                      <div className="country-funding-legend-item">
                        <div className="country-funding-legend-color country-funding-total-funding-color"></div>
                        <span>Direct Total Fund</span>
                      </div>
                      <div className="country-funding-legend-item">
                        <div className="country-funding-legend-color country-funding-indirect-funding-color"></div>
                        <span>Indirect Total Fund</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="country-funding-no-data">No action data available</div>
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