import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wind, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';

const getAqiColorClass = (val) => {
  if (val <= 15) return 'bg-emerald-500';
  if (val <= 50) return 'bg-yellow-400';
  if (val <= 100) return 'bg-orange-500';
  if (val <= 150) return 'bg-red-500';
  return 'bg-purple-600';
};

const getAqiTextClass = (val) => {
  if (val <= 15) return 'text-emerald-600';
  if (val <= 50) return 'text-yellow-600';
  if (val <= 100) return 'text-orange-600';
  if (val <= 150) return 'text-red-600';
  return 'text-purple-700';
};

const getAqiCategory = (val) => {
  if (val <= 15) return 'Good';
  if (val <= 50) return 'Moderate';
  if (val <= 100) return 'Unhealthy';
  if (val <= 150) return 'Very Unhealthy';
  return 'Hazardous';
};

const getUsAqiColorClass = (val) => {
  if (val <= 50) return 'bg-emerald-500';
  if (val <= 100) return 'bg-yellow-400';
  if (val <= 150) return 'bg-orange-500';
  if (val <= 200) return 'bg-red-500';
  return 'bg-purple-600';
};

const getUsAqiTextClass = (val) => {
  if (val <= 50) return 'text-emerald-600';
  if (val <= 100) return 'text-yellow-600';
  if (val <= 150) return 'text-orange-600';
  if (val <= 200) return 'text-red-600';
  return 'text-purple-700';
};

const getUsAqiCategory = (val) => {
  if (val <= 50) return 'Good';
  if (val <= 100) return 'Moderate';
  if (val <= 150) return 'Unhealthy (Sens.)';
  if (val <= 200) return 'Unhealthy';
  return 'Hazardous';
};

const calcAqi = (pm25) => {
  if (pm25 <= 12) return Math.round((50/12) * pm25);
  if (pm25 <= 35.4) return Math.round(((100-51)/(35.4-12.1)) * (pm25 - 12.1) + 51);
  if (pm25 <= 55.4) return Math.round(((150-101)/(55.4-35.5)) * (pm25 - 35.5) + 101);
  if (pm25 <= 150.4) return Math.round(((200-151)/(150.4-55.5)) * (pm25 - 55.5) + 151);
  return Math.round(((300-201)/(250.4-150.5)) * (pm25 - 150.5) + 201);
};

// Create custom marker icons
const createCustomIcon = (value, colorClass) => {
  const bgColor = colorClass.replace('bg-', '');
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute inset-0 rounded-full ${colorClass} opacity-25 animate-ping"></div>
        <div class="relative z-10 w-6 h-6 rounded-full ${colorClass} border-2 border-white shadow-md flex items-center justify-center">
          <span class="text-[10px] font-bold text-white">${Math.round(value)}</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function MapPage({ liveData }) {
  const { t } = useTranslation();
  const [displayMode, setDisplayMode] = useState('PM2.5'); // 'PM2.5' or 'AQI'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  const initialCities = [
    { name: "Saryarka District (West)", lat: 51.1685, lng: 71.4082, pm25: null, aqi: null, isLive: true },
    { name: "Almaty District (Northeast)", lat: 51.1833, lng: 71.4667, pm25: null, aqi: null, isLive: true },
    { name: "Nursultan District (Southwest)", lat: 51.1282, lng: 71.4305, pm25: null, aqi: null, isLive: true },
    { name: "Yesil District (South)", lat: 51.1147, lng: 71.4167, pm25: null, aqi: null, isLive: true },
    { name: "Expo 2017 Area (Southeast)", lat: 51.0898, lng: 71.4150, pm25: null, aqi: null, isLive: true },
    { name: "Koktal (Northwest)", lat: 51.1923, lng: 71.3508, pm25: null, aqi: null, isLive: true },
    { name: "Railway Station (North)", lat: 51.2052, lng: 71.4138, pm25: null, aqi: null, isLive: true }
  ];

  const [nearbyCities, setNearbyCities] = useState(initialCities);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const lats = initialCities.map(c => c.lat).join(',');
        const lngs = initialCities.map(c => c.lng).join(',');
        const res = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lngs}&current=pm2_5,us_aqi`);
        if (Array.isArray(res.data)) {
          setNearbyCities(prev => prev.map((city, i) => ({
            ...city,
            pm25: res.data[i]?.current?.pm2_5,
            aqi: res.data[i]?.current?.us_aqi
          })));
        }
      } catch (err) {
        console.error("Error fetching nearby districts AQI:", err);
      }
    };
    fetchNearby();
    const interval = setInterval(fetchNearby, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      // 1. Geocode search
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`);
      
      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        setError("No locations found. Try a different search term.");
        setIsSearching(false);
        return;
      }

      const locations = geoRes.data.results;
      
      // 2. Fetch AQI for all locations
      const lats = locations.map(loc => loc.latitude).join(',');
      const lngs = locations.map(loc => loc.longitude).join(',');
      
      const aqiRes = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lngs}&current=pm2_5,us_aqi`);
      
      const resultsWithAqi = locations.map((loc, index) => {
        // API returns array if multiple coords, or single object if 1 coord
        let pm25 = null;
        let aqi = null;
        if (Array.isArray(aqiRes.data)) {
          pm25 = aqiRes.data[index]?.current?.pm2_5;
          aqi = aqiRes.data[index]?.current?.us_aqi;
        } else {
          pm25 = aqiRes.data?.current?.pm2_5;
          aqi = aqiRes.data?.current?.us_aqi;
        }
        
        return {
          ...loc,
          pm25: pm25 !== undefined ? pm25 : null,
          aqi: aqi !== undefined ? aqi : null
        };
      });

      setSearchResults(resultsWithAqi);
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const isPM = displayMode === 'PM2.5';
  const livePM25 = liveData?.pm25_actual !== undefined && liveData.pm25_actual !== null ? liveData.pm25_actual : 0.0;
  const liveAQI = calcAqi(livePM25);
  
  const stations = [
    {
      name: liveData?.district || "Astana Center",
      lat: 51.1694,
      lng: 71.4206,
      pm25: livePM25,
      aqi: liveAQI,
      isLive: true
    },
    ...nearbyCities.filter(city => city.pm25 !== null)
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-140px)] lg:min-h-[600px] pb-6">
      {/* Search Sidebar */}
      <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 flex flex-col overflow-hidden h-full">
        <div className="p-6 border-b border-slate-100">
            <h1 className="text-xl font-black text-slate-900 mb-1">{t('mappage.network')}</h1>
            <p className="text-sm font-semibold text-blue-600 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse-dot"></span>
              {stations.length} {t('mappage.sensors')}
            </p>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
            <form onSubmit={handleSearch} className="relative mb-6">
              <input 
                type="text" 
                placeholder={t('mappage.search')} 
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <button 
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </form>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start text-sm font-medium">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {!isSearching && !error && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
              <MapPin className="w-12 h-12 mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">Search for a location</p>
              <p className="text-xs mt-1">Results will appear here</p>
            </div>
          )}

          <div className="space-y-3">
            {searchResults.map((result, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-300 rounded-none p-4 cursor-pointer hover:border-blue-500" onClick={() => setSelectedStation(result)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{result.name}</h3>
                    <p className="text-xs font-medium text-slate-500 flex items-center mt-0.5">
                      {result.admin1 && `${result.admin1}, `}{result.country}
                    </p>
                  </div>
                  {result.pm25 !== null && (
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${isPM ? getAqiColorClass(result.pm25) : getUsAqiColorClass(result.aqi)} text-white shadow-sm`}>
                      {Math.round(isPM ? result.pm25 : result.aqi)} {displayMode}
                    </div>
                  )}
                </div>
                
                {result.pm25 !== null && (
                  <div className="flex items-center text-xs font-semibold mt-3">
                    <span className="text-slate-500 mr-2">Status:</span>
                    <span className={isPM ? getAqiTextClass(result.pm25) : getUsAqiTextClass(result.aqi)}>{isPM ? getAqiCategory(result.pm25) : getUsAqiCategory(result.aqi)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="lg:col-span-2 bg-white rounded-none shadow-sm border-2 border-slate-300 p-4 flex flex-col h-full min-h-[500px] lg:min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-2 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('mappage.network')}</h2>
            <div className="flex items-center text-sm mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse-dot"></span>
              <span className="text-emerald-600 font-bold mr-2">{t('map.live')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setDisplayMode('PM2.5')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${displayMode === 'PM2.5' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                PM2.5
              </button>
              <button 
                onClick={() => setDisplayMode('AQI')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${displayMode === 'AQI' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                AQI
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 rounded-xl relative overflow-hidden border border-slate-100 bg-slate-50">
          <MapContainer 
            center={[51.15, 71.43]} 
            zoom={11.5} 
            scrollWheelZoom={true}
            className="h-full w-full absolute inset-0 z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {stations.map((station, index) => {
              const val = isPM ? station.pm25 : station.aqi;
              const colorClass = isPM ? getAqiColorClass(val) : getUsAqiColorClass(val);
              const textClass = isPM ? getAqiTextClass(val) : getUsAqiTextClass(val);
              const cat = isPM ? getAqiCategory(val) : getUsAqiCategory(val);
              const unit = isPM ? 'µg/m³' : 'Index';

              return (
                <Marker 
                  key={index}
                  position={[station.lat, station.lng]}
                  icon={createCustomIcon(val, colorClass)}
                >
                  <Popup className="custom-popup">
                    <div className="text-center p-1">
                      <div className="font-bold text-slate-900 text-xs mb-1">{station.name}</div>
                      <div className={`text-sm font-black ${textClass}`}>
                        {Math.round(val)} {unit}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-wider">
                        {cat}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Legend Overlay */}
          <div className="absolute bottom-10 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-none border-2 border-slate-300 shadow-lg z-[1000] hidden sm:block whitespace-nowrap">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-wider mb-2">{isPM ? 'AQI Legend (PM2.5)' : 'AQI Legend (US AQI)'}</p>
            <div className="space-y-1.5 text-[10px] font-bold text-slate-600 w-full">
              <div className="flex items-center justify-between gap-4"><div className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Good</div> <span className="text-slate-400">{isPM ? '0-15' : '0-50'}</span></div>
              <div className="flex items-center justify-between gap-4"><div className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span> Moderate</div> <span className="text-slate-400">{isPM ? '16-50' : '51-100'}</span></div>
              <div className="flex items-center justify-between gap-4"><div className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span> {isPM ? 'Unhealthy' : 'Unhealthy (Sens.)'}</div> <span className="text-slate-400">{isPM ? '51-100' : '101-150'}</span></div>
              <div className="flex items-center justify-between gap-4"><div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> {isPM ? 'Very Unhealthy' : 'Unhealthy'}</div> <span className="text-slate-400">{isPM ? '101-150' : '151-200'}</span></div>
              <div className="flex items-center justify-between gap-4"><div className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-600 mr-2"></span> Hazardous</div> <span className="text-slate-400">{isPM ? '150+' : '200+'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
