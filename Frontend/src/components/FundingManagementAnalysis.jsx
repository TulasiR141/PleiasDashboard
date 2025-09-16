import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Building2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../styles/FundingManagementAnalysis.css';

import { API_BASE_URL } from '../config/environment';
const FundingManagementAnalysis = () => {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    yearRange: '2021-2024',
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [chartData, setChartData] = useState({
    topCountries: [],
    topPrograms: [],
    topAgencies: []
  });
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load charts data when filters change
  useEffect(() => {
    if (filters.category) {
      fetchChartsData();
    }
  }, [filters.yearRange, filters.category]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Projects/cad-categories`);
      const data = await response.json();
      
      // Extract only the category values from the response
      let categoriesArray = [];
      if (Array.isArray(data)) {
        categoriesArray = data.map(item => {
          // If item is an object with category property, extract it
          if (typeof item === 'object' && item !== null && item.category) {
            return String(item.category);
          }
          // If item is already a string, use it directly
          return String(item);
        }).filter(cat => cat && cat !== 'null' && cat !== 'undefined');
      }
      
      setCategories(categoriesArray);
      
      // Set first category as default
      if (categoriesArray.length > 0) {
        setFilters(prev => ({
          ...prev,
          category: categoriesArray[0]
        }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setLoading(false);
    }
  };

  const fetchChartsData = async () => {
    if (!filters.category) return;
    
    setChartsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Projects/section3charts?yearRange=${filters.yearRange}&category=${encodeURIComponent(filters.category)}`
      );
      const data = await response.json();
      
      // Ensure data structure is valid with proper validation
      setChartData({
        topCountries: Array.isArray(data?.topCountries) ? data.topCountries.filter(item => item && typeof item === 'object') : [],
        topPrograms: Array.isArray(data?.topPrograms) ? data.topPrograms.filter(item => item && typeof item === 'object') : [],
        topAgencies: Array.isArray(data?.topAgencies) ? data.topAgencies.filter(item => item && typeof item === 'object') : []
      });
    } catch (error) {
      console.error('Error fetching charts data:', error);
      // Set empty arrays on error
      setChartData({
        topCountries: [],
        topPrograms: [],
        topAgencies: []
      });
    } finally {
      setChartsLoading(false);
      setLoading(false);
    }
  };

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

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const formatAmount = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0.0';
    return (amount / 1000000).toFixed(1);
  };

  // Prepare data for Countries chart
  const prepareCountriesData = () => {
    if (!Array.isArray(chartData.topCountries) || chartData.topCountries.length === 0) {
      return [];
    }

    return chartData.topCountries.map(item => ({
      country: item.country || 'Unknown',
      engaged: typeof item.engagedAmount === 'number' ? parseFloat(formatAmount(item.engagedAmount)) : 0,
      projected: typeof item.projectedAmount === 'number' ? parseFloat(formatAmount(item.projectedAmount)) : 0
    }));
  };

  // Prepare data for Programs chart
  const prepareProgramsData = () => {
    if (!Array.isArray(chartData.topPrograms) || chartData.topPrograms.length === 0) {
      return [];
    }

    return chartData.topPrograms.map((item, index) => ({
      program: item.program ? (item.program.length > 15 ? `Program ${index + 1}` : item.program) : `Program ${index + 1}`,
      fullProgram: item.program || `Program ${index + 1}`,
      amount: typeof item.totalAmount === 'number' ? parseFloat(formatAmount(item.totalAmount)) : 0
    }));
  };

  // Custom tooltip for Countries chart
  const CountriesTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'engaged' ? 'Engaged' : 'Projected'}: €${entry.value}M`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for Programs chart
  const ProgramsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="recharts-tooltip">
          <p className="tooltip-label">{data.fullProgram}</p>
          <p style={{ color: payload[0].color }}>
            {`Amount: €${payload[0].value}M`}
          </p>
        </div>
      );
    }
    return null;
  };

  const countriesData = prepareCountriesData();
  const programsData = prepareProgramsData();

  if (loading) {
    return (
      <div className="funding-management-page">
        <div className="loading-container">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="funding-management-page">
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
            <a href="#" className="nav-link" onClick={() => handleNavigation('home')}>Home</a>
            <a href="#" className="nav-link" onClick={() => handleNavigation('global')}>Sectors</a>
            <a href="#" className="nav-link" onClick={() => handleNavigation('country')}>Countries</a>
            <a href="#" className="nav-link active" onClick={() => handleNavigation('funding')}>Funding Flows</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header-section">
          <h1 className="page-title">Funding Management</h1>
        </div>

        {/* Filters Container */}
        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">Year Range Filter</label>
            <select 
              className="filter-select"
              value={filters.yearRange}
              onChange={(e) => handleFilterChange('yearRange', e.target.value)}
            >
              <option value="2021-2024">2021-2024</option>
              <option value="2025-2027">2025-2027</option>
              <option value="2021-2027">2021-2027</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Category Filter</label>
            <select 
              className="filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <option>Loading categories...</option>
              ) : (
                categories.map((category, index) => (
                  <option key={`category-${index}`} value={category}>
                    {category}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Charts Grid Container */}
        <div className="charts-grid">
          {/* Top Countries Chart - First Row Full Width */}
          <div className="chart-container countries-container">
            <div className="chart-header">
              <div className="chart-icon">
                <Target size={24} />
              </div>
              <div className="chart-title-section">
                <h2 className="chart-title">Top Countries (Engaged/Projected)</h2>
                <p className="chart-subtitle">Funding distribution by countries (€ Millions)</p>
              </div>
            </div>

            <div className="chart-content">
              {chartsLoading ? (
                <div className="loading-state">Loading chart data...</div>
              ) : countriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={countriesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="country" 
                      tick={false}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value}M`}
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip content={<CountriesTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="engaged" 
                      fill="#1e3a8a" 
                      name="Engaged"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="projected" 
                      fill="#3b82f6" 
                      name="Projected"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No data available</div>
              )}
            </div>
          </div>

          {/* Top Programs Chart - Second Row Left */}
          <div className="chart-container">
            <div className="chart-header">
              <div className="chart-icon">
                <TrendingUp size={24} />
              </div>
              <div className="chart-title-section">
                <h2 className="chart-title">Top Programs (Engaged)</h2>
                <p className="chart-subtitle">Program funding amounts (€ Millions)</p>
              </div>
            </div>

            <div className="chart-content">
              {chartsLoading ? (
                <div className="loading-state">Loading chart data...</div>
              ) : programsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={programsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="program" 
                      tick={false}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value}M`}
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip content={<ProgramsTooltip />} />
                    <Bar 
                      dataKey="amount" 
                      fill="#059669" 
                      name="Programs"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No data available</div>
              )}
            </div>
          </div>

          {/* Top Agencies Grid - Second Row Right */}
          <div className="chart-container">
            <div className="chart-header">
              <div className="chart-icon">
                <Building2 size={24} />
              </div>
              <div className="chart-title-section">
                <h2 className="chart-title">Top Agencies (Engaged)</h2>
                <p className="chart-subtitle">Agency details and funding information</p>
              </div>
            </div>

            <div className="chart-content">
              {chartsLoading ? (
                <div className="loading-state">Loading chart data...</div>
              ) : (
                <div className="agencies-grid">
                  <div className="agencies-header">
                    <div className="agency-column-header">Agency</div>
                    <div className="agency-column-header">Amount (€M)</div>
                    <div className="agency-column-header">Projects</div>
                  </div>
                  <div className="agencies-content">
                    {chartData.topAgencies && chartData.topAgencies.length > 0 ? (
                      chartData.topAgencies.map((item, index) => {
                        if (!item || typeof item !== 'object') return null;
                        
                        const agency = typeof item.agency === 'string' ? item.agency : `Agency ${index + 1}`;
                        const amount = typeof item.indirectAmount === 'number' ? formatAmount(item.indirectAmount) : '0.0';
                        const projectCount = typeof item.projectCount === 'number' ? item.projectCount : item.count || 0;
                        
                        return (
                          <div key={`agency-${index}`} className="agency-row">
                            <div className="agency-name" title={agency}>{agency}</div>
                            <div className="agency-amount">€{amount}M</div>
                            <div className="agency-count">{projectCount}</div>
                          </div>
                        );
                      }).filter(Boolean)
                    ) : (
                      <div className="agency-row">
                        <div className="agency-name" style={{textAlign: 'center', color: '#6b7280', gridColumn: '1 / -1'}}>
                          No data available
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FundingManagementAnalysis;