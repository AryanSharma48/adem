import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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

const createCustomIcon = (value, colorClass) => {
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center">
             <div class="absolute w-8 h-8 rounded-full ${colorClass} opacity-30 animate-ping"></div>
             <div class="relative w-6 h-6 rounded-full border-2 border-white ${colorClass} shadow-lg shadow-black/20 flex items-center justify-center text-[10px] text-white font-black">${Math.round(value)}</div>
           </div>`,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10]
  });
};

export default function AirQualityOverview({ liveData, loading }) {
  const [displayMode, setDisplayMode] = useState('PM2.5');
  
  const [nearbyCities, setNearbyCities] = useState([
    { name: "Saryarka District (West)", lat: 51.1685, lng: 71.4082, pm25: null, aqi: null, isLive: true },
    { name: "Almaty District (Northeast)", lat: 51.1833, lng: 71.4667, pm25: null, aqi: null, isLive: true },
    { name: "Nursultan District (Southwest)", lat: 51.1282, lng: 71.4305, pm25: null, aqi: null, isLive: true }
  ]);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const res = await axios.get("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=51.1685,51.1833,51.1282&longitude=71.4082,71.4667,71.4305&current=pm2_5,us_aqi");
        if (Array.isArray(res.data)) {
          setNearbyCities(prev => [
            { ...prev[0], pm25: res.data[0]?.current?.pm2_5, aqi: res.data[0]?.current?.us_aqi },
            { ...prev[1], pm25: res.data[1]?.current?.pm2_5, aqi: res.data[1]?.current?.us_aqi },
            { ...prev[2], pm25: res.data[2]?.current?.pm2_5, aqi: res.data[2]?.current?.us_aqi }
          ]);
        }
      } catch (err) {
        console.error("Error fetching nearby districts AQI:", err);
      }
    };
    fetchNearby();
    const interval = setInterval(fetchNearby, 300000); // refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2.5 w-1/3">
            <div className="h-6 w-full bg-slate-200 rounded skeleton"></div>
            <div className="h-4 w-2/3 bg-slate-200 rounded skeleton"></div>
          </div>
          <div className="h-8 w-20 bg-slate-200 rounded-full skeleton"></div>
        </div>
        <div className="flex-1 bg-slate-100 rounded-xl skeleton flex items-center justify-center">
          <p className="text-slate-400 text-sm font-semibold tracking-wide">Loading Astana Air Quality Map...</p>
        </div>
      </div>
    );
  }

  // Handle case where API is down or empty
  if (!liveData) {
    return (
      <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 p-6 flex flex-col h-full items-center justify-center text-center">
        <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Failed to Load Map Data</h3>
        <p className="text-slate-500 text-sm max-w-sm">
          The ADEM backend service is currently unreachable. Please verify that the local server is running on port 8000.
        </p>
      </div>
    );
  }

  const isPM = displayMode === 'PM2.5';
  const livePM25 = liveData.pm25_actual !== null ? liveData.pm25_actual : 0.0;
  const liveAQI = calcAqi(livePM25);
  
  const aqiColorClass = isPM ? getAqiColorClass(livePM25) : getUsAqiColorClass(liveAQI);
  const aqiTextClass = isPM ? getAqiTextClass(livePM25) : getUsAqiTextClass(liveAQI);
  const aqiCategory = isPM ? getAqiCategory(livePM25) : getUsAqiCategory(liveAQI);

  const stations = [
    {
      name: liveData.district || "Astana Center",
      lat: 51.1694,
      lng: 71.4206,
      pm25: livePM25,
      aqi: liveAQI,
      isLive: true
    },
    ...nearbyCities.filter(city => city.pm25 !== null)
  ];

  return (
    <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Live Air Quality Map</h3>
          <div className="flex items-center text-sm mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse-dot"></span>
            <span className="text-emerald-600 font-bold mr-2">Live</span>
            <span className="text-slate-500">Astana sensor network</span>
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
          {/* Global AQI Badge for Astana Center */}
          <div className={`px-4 py-1.5 rounded-full border text-sm font-extrabold flex items-center bg-slate-50 hidden sm:flex ${aqiTextClass}`}>
            <span className={`w-2.5 h-2.5 rounded-full mr-2 ${aqiColorClass}`}></span>
            {aqiCategory} ({Math.round(isPM ? livePM25 : liveAQI)} {isPM ? 'µg/m³' : 'AQI'})
          </div>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="flex-1 bg-slate-50 rounded-xl relative overflow-hidden border border-slate-100 min-h-[300px]">
        <MapContainer 
          center={[51.15, 71.43]} 
          zoom={11.5} 
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {stations.map((station, idx) => {
            const val = isPM ? station.pm25 : station.aqi;
            const colorClass = isPM ? getAqiColorClass(val) : getUsAqiColorClass(val);
            const textClass = isPM ? getAqiTextClass(val) : getUsAqiTextClass(val);
            const cat = isPM ? getAqiCategory(val) : getUsAqiCategory(val);
            const unit = isPM ? 'µg/m³' : 'Index';

            return (
              <Marker 
                key={idx}
                position={[station.lat, station.lng]}
                icon={createCustomIcon(val, colorClass)}
              >
                <Popup>
                  <div className="p-1 font-sans">
                    <h4 className="font-extrabold text-sm text-slate-900 mb-1">{station.name}</h4>
                    <p className="text-xs text-slate-500 mb-2">
                      Station Type: <span className="font-semibold text-blue-600">{station.isLive ? "Primary Sensor (Live)" : "Satellite Station"}</span>
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-xs text-slate-600 font-semibold">{displayMode}:</span>
                      <span className="text-xs font-black text-slate-900">{Math.round(val)} {unit}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-600 font-semibold">Status:</span>
                      <span className={`text-xs font-black ${textClass}`}>
                        {cat}
                      </span>
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
  );
}
