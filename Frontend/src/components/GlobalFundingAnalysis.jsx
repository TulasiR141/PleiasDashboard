import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/GlobalFundingAnalysis.css';
import { API_BASE_URL } from '../config/environment';
import TopDataTables from './TopDataTables';

let globalDataCache = { projects: null, mipData: null, lastFetch: null };

const GlobalFundingAnalysis = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ period: '21-27', fundingType: 'engaged' });
  const [apiData, setApiData] = useState({ projects: null, mipData: null, loading: true, error: null });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);

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
    // Europe
    'Albania': [41.1533, 20.1683],
    'Andorra': [42.5462, 1.6016],
    'Austria': [47.5162, 14.5501],
    'Belarus': [53.7098, 27.9534],
    'Belgium': [50.5039, 4.4699],
    'Bosnia and Herzegovina': [43.9159, 17.6791],
    'Bulgaria': [42.7339, 25.4858],
    'Croatia': [45.1000, 15.2000],
    'Cyprus': [35.1264, 33.4299],
    'Czech Republic': [49.8175, 15.4730],
    'Denmark': [56.2639, 9.5018],
    'Estonia': [58.5953, 25.0136],
    'Finland': [61.9241, 25.7482],
    'France': [46.6034, 1.8883],
    'Germany': [51.1657, 10.4515],
    'Greece': [39.0742, 21.8243],
    'Hungary': [47.1625, 19.5033],
    'Iceland': [64.9631, -19.0208],
    'Ireland': [53.4129, -8.2439],
    'Italy': [41.8719, 12.5674],
    'Latvia': [56.8796, 24.6032],
    'Liechtenstein': [47.1660, 9.5554],
    'Lithuania': [55.1694, 23.8813],
    'Luxembourg': [49.8153, 6.1296],
    'Malta': [35.9375, 14.3754],
    'Moldova': [47.4116, 28.3699],
    'Monaco': [43.7384, 7.4246],
    'Montenegro': [42.7087, 19.3744],
    'Netherlands': [52.1326, 5.2913],
    'North Macedonia': [41.6086, 21.7453],
    'Norway': [60.4720, 8.4689],
    'Poland': [51.9194, 19.1451],
    'Portugal': [39.3999, -8.2245],
    'Romania': [45.9432, 24.9668],
    'Russia': [61.5240, 105.3188],
    'San Marino': [43.9424, 12.4578],
    'Serbia': [44.0165, 21.0059],
    'Slovakia': [48.6690, 19.6990],
    'Slovenia': [46.1512, 14.9955],
    'Spain': [40.4637, -3.7492],
    'Sweden': [60.1282, 18.6435],
    'Switzerland': [46.8182, 8.2275],
    'Ukraine': [48.3794, 31.1656],
    'United Kingdom': [55.3781, -3.4360],
    'Vatican City': [41.9029, 12.4534],

    // Asia
    'Afghanistan': [33.9391, 67.7100],
    'Armenia': [40.0691, 45.0382],
    'Azerbaijan': [40.1431, 47.5769],
    'Bahrain': [25.9304, 50.6378],
    'Bangladesh': [23.6850, 90.3563],
    'Bhutan': [27.5142, 90.4336],
    'Brunei': [4.5353, 114.7277],
    'Cambodia': [12.5657, 104.9910],
    'China': [35.8617, 104.1954],
    'Georgia': [42.3154, 43.3569],
    'India': [20.5937, 78.9629],
    'Indonesia': [-0.7893, 113.9213],
    'Iran': [32.4279, 53.6880],
    'Iraq': [33.2232, 43.6793],
    'Israel': [31.0461, 34.8516],
    'Japan': [36.2048, 138.2529],
    'Jordan': [30.5852, 36.2384],
    'Kazakhstan': [48.0196, 66.9237],
    'Kuwait': [29.3117, 47.4818],
    'Kyrgyzstan': [41.2044, 74.7661],
    'Laos': [19.8563, 102.4955],
    'Lebanon': [33.8547, 35.8623],
    'Malaysia': [4.2105, 101.9758],
    'Maldives': [3.2028, 73.2207],
    'Mongolia': [46.8625, 103.8467],
    'Myanmar': [21.9162, 95.9560],
    'Nepal': [28.3949, 84.1240],
    'North Korea': [40.3399, 127.5101],
    'Oman': [21.4735, 55.9754],
    'Pakistan': [30.3753, 69.3451],
    'Palestine': [31.9522, 35.2332],
    'Philippines': [12.8797, 121.7740],
    'Qatar': [25.3548, 51.1839],
    'Saudi Arabia': [23.8859, 45.0792],
    'Singapore': [1.3521, 103.8198],
    'South Korea': [35.9078, 127.7669],
    'Sri Lanka': [7.8731, 80.7718],
    'Syria': [34.8021, 38.9968],
    'Taiwan': [23.6978, 120.9605],
    'Tajikistan': [38.8610, 71.2761],
    'Thailand': [15.8700, 100.9925],
    'Timor-Leste': [-8.8742, 125.7275],
    'Turkey': [38.9637, 35.2433],
    'Turkmenistan': [38.9697, 59.5563],
    'United Arab Emirates': [23.4241, 53.8478],
    'Uzbekistan': [41.3775, 64.5853],
    'Vietnam': [14.0583, 108.2772],
    'Yemen': [15.5527, 48.5164],

    // Africa
    'Algeria': [28.0339, 1.6596],
    'Angola': [-11.2027, 17.8739],
    'Benin': [9.3077, 2.3158],
    'Botswana': [-22.3285, 24.6849],
    'Burkina Faso': [12.2383, -1.5616],
    'Burundi': [-3.3731, 29.9189],
    'Cameroon': [7.3697, 12.3547],
    'Cape Verde': [16.5388, -24.0132],
    'Central African Republic': [6.6111, 20.9394],
    'Chad': [15.4542, 18.7322],
    'Comoros': [-11.6455, 43.3333],
    'Democratic Republic of the Congo': [-4.0383, 21.7587],
    'Republic of the Congo': [-0.2280, 15.8277],
    'Djibouti': [11.8251, 42.5903],
    'Egypt': [26.0975, 30.0444],
    'Equatorial Guinea': [1.6508, 10.2679],
    'Eritrea': [15.1794, 39.7823],
    'Eswatini': [-26.5225, 31.4659],
    'Ethiopia': [9.1450, 40.4897],
    'Gabon': [-0.8037, 11.6094],
    'Gambia': [13.4432, -15.3101],
    'Ghana': [7.9465, -1.0232],
    'Guinea': [9.9456, -9.6966],
    'Guinea-Bissau': [11.8037, -15.1804],
    'Ivory Coast': [7.5400, -5.5471],
    'Kenya': [-0.0236, 37.9062],
    'Lesotho': [-29.6100, 28.2336],
    'Liberia': [6.4281, -9.4295],
    'Libya': [26.3351, 17.2283],
    'Madagascar': [-18.7669, 46.8691],
    'Malawi': [-13.2543, 34.3015],
    'Mali': [17.5707, -3.9962],
    'Mauritania': [21.0079, -10.9408],
    'Mauritius': [-20.3484, 57.5522],
    'Morocco': [31.7917, -7.0926],
    'Mozambique': [-18.6657, 35.5296],
    'Namibia': [-22.9576, 18.4904],
    'Niger': [17.6078, 8.0817],
    'Nigeria': [9.0820, 8.6753],
    'Rwanda': [-1.9403, 29.8739],
    'Sao Tome and Principe': [0.1864, 6.6131],
    'Senegal': [14.4974, -14.4524],
    'Seychelles': [-4.6796, 55.4920],
    'Sierra Leone': [8.4606, -11.7799],
    'Somalia': [5.1521, 46.1996],
    'South Africa': [-30.5595, 22.9375],
    'South Sudan': [6.8770, 31.3070],
    'Sudan': [12.8628, 30.2176],
    'Tanzania': [-6.3690, 34.8888],
    'Togo': [8.6195, 0.8248],
    'Tunisia': [33.8869, 9.5375],
    'Uganda': [1.3733, 32.2903],
    'Zambia': [-13.1339, 27.8493],
    'Zimbabwe': [-19.0154, 29.1549],

    // North America
    'Antigua and Barbuda': [17.0608, -61.7964],
    'Bahamas': [25.0343, -77.3963],
    'Barbados': [13.1939, -59.5432],
    'Belize': [17.1899, -88.4976],
    'Canada': [56.1304, -106.3468],
    'Costa Rica': [9.7489, -83.7534],
    'Cuba': [21.5218, -77.7812],
    'Dominica': [15.4150, -61.3710],
    'Dominican Republic': [18.7357, -70.1627],
    'El Salvador': [13.7942, -88.8965],
    'Grenada': [12.1165, -61.6790],
    'Guatemala': [15.7835, -90.2308],
    'Haiti': [18.9712, -72.2852],
    'Honduras': [15.2000, -86.2419],
    'Jamaica': [18.1096, -77.2975],
    'Mexico': [23.6345, -102.5528],
    'Nicaragua': [12.2650, -85.2072],
    'Panama': [8.5380, -80.7821],
    'Saint Kitts and Nevis': [17.3578, -62.7830],
    'Saint Lucia': [13.9094, -60.9789],
    'Saint Vincent and the Grenadines': [12.9843, -61.2872],
    'Trinidad and Tobago': [10.6918, -61.2225],
    'United States': [37.0902, -95.7129],

    // South America
    'Argentina': [-38.4161, -63.6167],
    'Bolivia': [-16.2902, -63.5887],
    'Brazil': [-14.2350, -51.9253],
    'Chile': [-35.6751, -71.5430],
    'Colombia': [4.5709, -74.2973],
    'Ecuador': [-1.8312, -78.1834],
    'Guyana': [4.8604, -58.9302],
    'Paraguay': [-23.4425, -58.4438],
    'Peru': [-9.1900, -75.0152],
    'Suriname': [3.9193, -56.0278],
    'Uruguay': [-32.5228, -55.7658],
    'Venezuela': [6.4238, -66.5897],

    // Oceania
    'Australia': [-25.2744, 133.7751],
    'Fiji': [-16.5780, 179.4144],
    'Kiribati': [-3.3704, -168.7340],
    'Marshall Islands': [7.1315, 171.1845],
    'Micronesia': [7.4256, 150.5508],
    'Nauru': [-0.5228, 166.9315],
    'New Zealand': [-40.9006, 174.8860],
    'Palau': [7.5150, 134.5825],
    'Papua New Guinea': [-6.314993, 143.95555],
    'Samoa': [-13.7590, -172.1046],
    'Solomon Islands': [-9.6457, 160.1562],
    'Tonga': [-21.1789, -175.1982],
    'Tuvalu': [-7.1095, 177.6493],
    'Vanuatu': [-15.3767, 166.9592],

    // Additional territories and special cases from your list
    'Hong Kong': [22.3193, 114.1694],
    'Macao': [22.1987, 113.5439],
    'Puerto Rico': [18.2208, -66.5901],
    'Greenland': [71.7069, -42.6043],
    'Faroe Islands': [61.8926, -6.9118],
    'Aruba': [12.5211, -69.9683],
    'Caribbean Netherlands': [12.1784, -68.2385],
    'Cook Islands': [-21.2367, -159.7777],
    'Curaçao': [12.1696, -68.9900],
    'French Polynesia': [-17.6797, -149.4068],
    'French Southern and Antarctic Lands': [-49.2804, 69.3486],
    'New Caledonia': [-20.9043, 165.6180],
    'Niue': [-19.0544, -169.8672],
    'Saint Barthélemy': [17.9000, -62.8333],
    'Saint Pierre and Miquelon': [46.8852, -56.3159],
    'São Tomé and Príncipe': [0.1864, 6.6131], // Alternative spelling with accents
    'Sint Maarten': [18.0425, -63.0548],
    'The Gambia': [13.4432, -15.3101], // Alternative name for Gambia
    'Wallis and Futuna': [-13.7687, -177.1562],
    'People\'s Republic of China': [35.8617, 104.1954] // Alias for China
  };

  const fetchApiData = useCallback(async () => {
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000;
    
    if (globalDataCache.projects && globalDataCache.mipData && globalDataCache.lastFetch && (now - globalDataCache.lastFetch) < CACHE_DURATION) {
      setApiData({ projects: globalDataCache.projects, mipData: globalDataCache.mipData, loading: false, error: null });
      return;
    }

    try {
      setApiData(prev => ({ ...prev, loading: true, error: null }));

      const [projectsResponse, mipResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/projects`),
        fetch(`${API_BASE_URL}/api/mipdata`)
      ]);

      if (!projectsResponse.ok) throw new Error(`Projects API not available: ${projectsResponse.status}`);
      if (!mipResponse.ok) throw new Error(`MIP Data API not available: ${mipResponse.status}`);

      const projects = await projectsResponse.json();
      const mipData = await mipResponse.json();

      if (!Array.isArray(projects)) throw new Error('Projects API response is not an array');
      if (!Array.isArray(mipData)) throw new Error('MIP Data API response is not an array');

      globalDataCache = { projects, mipData, lastFetch: now };
      setApiData({ projects, mipData, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching API data:', error);
      setApiData({ projects: [], mipData: [], loading: false, error: error.message });
    }
  }, []);

  const availablePeriods = useMemo(() => {
    return [
      { value: '21-27', label: '2021-2027' },
      { value: '21-24', label: '2021-2024' },
      { value: '25-27', label: '2025-2027' }
    ];
  }, []);

  // Function to get coordinates for a country, with fallback to geocoding API
  const getCountryCoordinates = useCallback(async (countryName) => {
    // First, check our static coordinates
    if (countryCoordinates[countryName]) {
      return countryCoordinates[countryName];
    }
    
    // If not found, try some common name variations
    const nameVariations = [
      countryName.toLowerCase(),
      countryName.replace(/'/g, "'"), // Handle different apostrophe types
      countryName.replace(/'/g, ""), // Remove apostrophes
      countryName.replace(/\s+/g, " ").trim(), // Normalize spaces
    ];
    
    for (const variation of nameVariations) {
      const found = Object.keys(countryCoordinates).find(key => 
        key.toLowerCase() === variation ||
        key.toLowerCase().replace(/'/g, "") === variation.replace(/'/g, "")
      );
      if (found) {
        return countryCoordinates[found];
      }
    }
    
    // As a last resort, try to fetch from a geocoding API
    try {
      console.log(`Attempting to geocode: ${countryName}`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(countryName)}&countrycodes&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        console.log(`Found coordinates for ${countryName}:`, coords);
        return coords;
      }
    } catch (error) {
      console.warn(`Failed to geocode ${countryName}:`, error);
    }
    
    console.warn(`No coordinates found for country: ${countryName}`);
    return null;
  }, []);

  const mapData = useMemo(() => {
    const countryData = {};

    // Helper function to get MIP amount based on period
    const getMIPAmountForPeriod = (mipItem, period) => {
      let total = 0;

      if (period === '21-24' || period === '21-27') {
        total += (mipItem.supporT_MEASURES_AMOUNT_21_24 || 0);
        total += (mipItem.p1_AMOUNT_21_24 || 0);
        total += (mipItem.p2_AMOUNT_21_24 || 0);
        total += (mipItem.p3_AMOUNT_21_24 || 0);
      }

      if (period === '25-27' || period === '21-27') {
        total += (mipItem.supporT_MEASURES_AMOUNT_25_27 || 0);
        total += (mipItem.p1_AMOUNT_25_27 || 0);
        total += (mipItem.p2_AMOUNT_25_27 || 0);
        total += (mipItem.p3_AMOUNT_25_27 || 0);
      }

      return total;
    };

    // Helper function to check if project year matches period
    const isProjectInPeriod = (project, period) => {
      let projectYear = null;
      if (project.year) {
        projectYear = parseInt(typeof project.year === 'string' ? project.year : project.year.toString());
      } else if (project.startDate) {
        const year = new Date(project.startDate).getFullYear();
        if (!isNaN(year)) projectYear = year;
      }

      if (!projectYear) return false;

      switch (period) {
        case '21-24': return projectYear >= 2021 && projectYear <= 2024;
        case '25-27': return projectYear >= 2025 && projectYear <= 2027;
        case '21-27': return projectYear >= 2021 && projectYear <= 2027;
        default: return false;
      }
    };

    if (filters.fundingType === 'engaged') {
      // Process projects data for engaged funding
      if (apiData.projects && Array.isArray(apiData.projects)) {
        // Collect unique countries
        const uniqueCountries = new Set();
        apiData.projects.forEach(project => {
          if (project.country && typeof project.country === 'string') {
            uniqueCountries.add(project.country);
          }
        });

        // Log countries that don't have coordinates
        const missingCoordinates = Array.from(uniqueCountries).filter(country =>
          !countryCoordinates[country]
        );

        if (missingCoordinates.length > 0) {
          console.log('Countries missing coordinates:', missingCoordinates);
        }

        apiData.projects.forEach(project => {
          try {
            if (!isProjectInPeriod(project, filters.period)) return;

            const country = project.country;
            if (!country || typeof country !== 'string') return;

            const fundingAmount = project.columN_1_3_1_TOTAL_AMOUNT || project.totalFunding || project.totalAmount || project.amount || 0;
            const numericAmount = parseFloat(fundingAmount) || 0;

            if (countryData[country]) {
              countryData[country].funding += numericAmount;
              countryData[country].projectCount += 1;
            } else {
              countryData[country] = {
                funding: numericAmount,
                projectCount: 1,
                coordinates: countryCoordinates[country] || null
              };
            }
          } catch (error) {
            console.warn('Error processing project:', error);
          }
        });
      }
    } else if (filters.fundingType === 'projected') {
      // Process MIP data for projected funding
      if (apiData.mipData && Array.isArray(apiData.mipData)) {
        apiData.mipData.forEach(mipItem => {
          try {
            const country = mipItem.country;
            if (!country || typeof country !== 'string') return;

            const fundingAmount = getMIPAmountForPeriod(mipItem, filters.period);

            if (countryData[country]) {
              countryData[country].funding += fundingAmount;
              countryData[country].projectCount += 1;
            } else {
              countryData[country] = {
                funding: fundingAmount,
                projectCount: 1,
                coordinates: countryCoordinates[country] || null
              };
            }
          } catch (error) {
            console.warn('Error processing MIP data:', error);
          }
        });
      }
    }

    return countryData;
  }, [apiData.projects, apiData.mipData, filters]);

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

    const getMarkerColor = (amount) => {
      if (amount <= 0) return '#9E9E9E';
      if (amount >= 500000000) return '#4CAF50'; // Vert foncé : 500M€+
      if (amount >= 200000000) return '#8BC34A'; // Vert clair : 200-500M€
      if (amount >= 50000000) return '#FFC107';  // Jaune : 50-200M€
      if (amount >= 10000000) return '#FF9800';  // Orange : 10-50M€
      return '#F44336'; // Rouge : moins de 10M€
    };

    countriesWithCoords.forEach(([countryName, countryData]) => {
      const [lat, lng] = countryData.coordinates;
      if (isNaN(lat) || isNaN(lng)) return;
      
      const baseSize = 8; const maxSize = 25;
      let size = baseSize;
      if (countryData.funding > 0) {
        // Taille basée sur les seuils fixes
        if (countryData.funding >= 500000000) size = maxSize; // 500M€+
        else if (countryData.funding >= 200000000) size = maxSize * 0.8; // 200-500M€
        else if (countryData.funding >= 50000000) size = maxSize * 0.6; // 50-200M€
        else if (countryData.funding >= 10000000) size = maxSize * 0.4; // 10-50M€
        else size = maxSize * 0.2; // moins de 10M€
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
            <p style="margin: 4px 0; font-size: 14px;"><strong>${filters.fundingType === 'engaged' ? 'Engaged' : 'Projected'} Funding:</strong> ${formatCurrency(countryData.funding)}</p>
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

  // Initialize map when data is loaded and there is data to show
  useEffect(() => {
    if (!apiData.loading && !apiData.error && apiData.projects && apiData.projects.length > 0 && Object.keys(mapData).length > 0 && !mapInitialized) {
      const timer = setTimeout(() => { 
        initializeMap(); 
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [apiData.loading, apiData.error, apiData.projects, mapData, mapInitialized, initializeMap]);

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

  // Check if there's no data for current filters
  const hasDataForFilters = Object.keys(mapData).length > 0;

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
            <label className="filter-label">Period Filter</label>
            <select className="filter-select" value={filters.period} onChange={(e) => handleFilterChange('period', e.target.value)}>
              {availablePeriods.map(period => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Funding Type</label>
            <select className="filter-select" value={filters.fundingType} onChange={(e) => handleFilterChange('fundingType', e.target.value)}>
              <option value="engaged">Engaged Budget (Action Plans)</option>
              <option value="projected">Projected Budget (MIPs)</option>
            </select>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <div className="chart-icon"><Globe size={24} /></div>
            <div className="chart-title-section">
              <h2 className="chart-title">Global Funding Map</h2>
              <p className="chart-subtitle">
                {filters.fundingType === 'engaged' ? 'Engaged' : 'Projected'} funding by country for period {availablePeriods.find(p => p.value === filters.period)?.label || filters.period}
              </p>
            </div>
          </div>

          <div className="chart-content">
            {!hasDataForFilters ? (
              <div className="no-data-container">
                <div className="no-data-message">
                  <h3>No Data Available</h3>
                  <p>No funding data found for the selected filters.</p>
                  <p>Try adjusting your year or funding type filters to see available data.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="map-legend">
                  {[
                    { color: '#4CAF50', size: 25, label: 'Plus de 500M€' },
                    { color: '#8BC34A', size: 20, label: '200M€ - 500M€' },
                    { color: '#FFC107', size: 15, label: '50M€ - 200M€' },
                    { color: '#FF9800', size: 12, label: '10M€ - 50M€' },
                    { color: '#F44336', size: 8, label: 'Moins de 10M€' },
                    { color: '#9E9E9E', size: 8, label: 'Pas de données' }
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
                    <div className="fallback-loading">
                      Interactive map loading...
                    </div>
                  )}
                </div>
                
                {selectedCountry && mapData[selectedCountry] && (
                  <div className="country-tooltip">
                    <h3>{selectedCountry}</h3>
                    <p><strong>Projects:</strong> {mapData[selectedCountry].projectCount}</p>
                    <p><strong>{filters.fundingType === 'engaged' ? 'Engaged' : 'Projected'} Funding:</strong> {formatCurrency(mapData[selectedCountry].funding)}</p>
                  </div>
                )}

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
              </>
            )}
          </div>
        </div>

        {/* Top Data Tables Section */}
        <TopDataTables />

      </main>
    </div>
  );
};

export default GlobalFundingAnalysis;

/* Add these CSS styles to your GlobalFundingAnalysis.css file */
/*
.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.no-data-message {
  text-align: center;
  color: #6c757d;
}

.no-data-message h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
}

.no-data-message p {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.no-data-message p:last-child {
  margin-bottom: 0;
  font-weight: 500;
  color: #6f42c1;
}

@media (max-width: 768px) {
  .no-data-container {
    min-height: 300px;
    padding: 1.5rem;
  }

  .no-data-message h3 {
    font-size: 1.25rem;
  }

  .no-data-message p {
    font-size: 0.875rem;
  }
}
*/