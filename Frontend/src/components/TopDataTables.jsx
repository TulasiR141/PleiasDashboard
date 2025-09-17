import React, { useState, useEffect } from 'react';
import { List, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../config/environment';
import '../styles/TopDataTables.css';

const TopDataTables = () => {
  const [topCADData, setTopCADData] = useState([]);
  const [topDepartmentData, setTopDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cadCount, setCadCount] = useState('10');
  const [departmentCount, setDepartmentCount] = useState('10');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cadResponse, departmentResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/projects/global-top-cad`),
          fetch(`${API_BASE_URL}/api/projects/global-top-departments`)
        ]);

        if (!cadResponse.ok) {
          throw new Error(`Failed to fetch CAD data: ${cadResponse.status}`);
        }
        if (!departmentResponse.ok) {
          throw new Error(`Failed to fetch Department data: ${departmentResponse.status}`);
        }

        const cadData = await cadResponse.json();
        const departmentData = await departmentResponse.json();

        setTopCADData(cadData || []);
        setTopDepartmentData(departmentData || []);
      } catch (error) {
        console.error('Error fetching top data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTopCADItems = () => {
    if (cadCount === 'All') {
      return topCADData;
    }
    return topCADData.slice(0, parseInt(cadCount));
  };

  const getTopDepartmentItems = () => {
    if (departmentCount === 'All') {
      return topDepartmentData;
    }
    return topDepartmentData.slice(0, parseInt(departmentCount));
  };

  if (loading) {
    return (
      <div className="top-data-tables">
        <div className="top-data-loading">Loading global data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="top-data-tables">
        <div className="top-data-error">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="top-data-tables">
      <div className="top-data-tables-container">
        {/* Top CAD Table */}
        <div className="top-data-table-container">
          <div className="top-data-table-header">
            <div className="top-data-table-icon">
              <List size={24} />
            </div>
            <div className="top-data-table-title-section">
              <h2 className="top-data-table-title">Top CAD Codes</h2>
              <p className="top-data-table-subtitle">Most frequently used CAD codes across action plans</p>
            </div>
            <div className="top-data-table-filter">
              <label>Show top: </label>
              <select
                value={cadCount}
                onChange={(e) => setCadCount(e.target.value)}
                className="top-data-count-select"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>

          <div className="top-data-table-content">
            <div className="top-data-grid">
              <div className="top-data-grid-header">
                <div className="top-data-header-cell">Name</div>
                <div className="top-data-header-cell">Action Plans</div>
              </div>
              <div className="top-data-grid-body">
                {getTopCADItems().length > 0 ? (
                  getTopCADItems().map((item, index) => (
                    <div key={index} className="top-data-grid-row">
                      <div className="top-data-grid-cell top-data-name-cell">
                        {item.name || 'N/A'}
                      </div>
                      <div className="top-data-grid-cell top-data-count-cell">
                        <span className="top-data-count-badge">
                          {item.actionPlanCount || 0}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="top-data-no-data">No CAD data available</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Departments Table */}
        <div className="top-data-table-container">
          <div className="top-data-table-header">
            <div className="top-data-table-icon">
              <TrendingUp size={24} />
            </div>
            <div className="top-data-table-title-section">
              <h2 className="top-data-table-title">Top Departments</h2>
              <p className="top-data-table-subtitle">Most frequently used departments across action plans</p>
            </div>
            <div className="top-data-table-filter">
              <label>Show top: </label>
              <select
                value={departmentCount}
                onChange={(e) => setDepartmentCount(e.target.value)}
                className="top-data-count-select"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>

          <div className="top-data-table-content">
            <div className="top-data-grid">
              <div className="top-data-grid-header">
                <div className="top-data-header-cell">Department Name</div>
                <div className="top-data-header-cell">Action Plans</div>
              </div>
              <div className="top-data-grid-body">
                {getTopDepartmentItems().length > 0 ? (
                  getTopDepartmentItems().map((item, index) => (
                    <div key={index} className="top-data-grid-row">
                      <div className="top-data-grid-cell top-data-name-cell">
                        {item.departmentName || 'N/A'}
                      </div>
                      <div className="top-data-grid-cell top-data-count-cell">
                        <span className="top-data-count-badge">
                          {item.actionPlanCount || 0}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="top-data-no-data">No department data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDataTables;