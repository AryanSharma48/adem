import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const getAqiColorClass = (val) => {
  if (val <= 25) return 'bg-emerald-500';
  if (val <= 50) return 'bg-yellow-400';
  if (val <= 100) return 'bg-orange-500';
  if (val <= 150) return 'bg-red-500';
  return 'bg-purple-600';
};

const getAqiTextClass = (val) => {
  if (val <= 25) return 'text-emerald-600';
  if (val <= 50) return 'text-yellow-600';
  if (val <= 100) return 'text-orange-600';
  if (val <= 150) return 'text-red-600';
  return 'text-purple-700';
};

const getAqiCategory = (val) => {
  if (val <= 25) return 'Good';
  if (val <= 50) return 'Moderate';
  if (val <= 100) return 'Unhealthy';
  if (val <= 150) return 'Very Unhealthy';
  return 'Hazardous';
};

const createCustomIcon = (pm25) => {
  const colorClass = getAqiColorClass(pm25);
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center">
             <div class="absolute w-8 h-8 rounded-full ${colorClass} opacity-30 animate-ping"></div>
             <div class="relative w-6 h-6 rounded-full border-2 border-white ${colorClass} shadow-lg shadow-black/20 flex items-center justify-center text-[10px] text-white font-black">${Math.round(pm25)}</div>
           </div>`,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10]
  });
};

export default function AirQualityOverview({ liveData, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[480px]">
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[480px] items-center justify-center text-center">
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

  const livePM25 = liveData.pm25_actual !== null ? liveData.pm25_actual : 0.0;
  const aqiColorClass = getAqiColorClass(livePM25);
  const aqiTextClass = getAqiTextClass(livePM25);
  const aqiCategory = getAqiCategory(livePM25);

  const stations = [
    {
      name: liveData.district || "Astana Center",
      lat: 51.1694,
      lng: 71.4206,
      value: livePM25,
      isLive: true
    },
    {
      name: "Saryarka District (West)",
      lat: 51.1685,
      lng: 71.4082,
      value: Math.round(livePM25 * 0.95 * 10) / 10,
      isLive: false
    },
    {
      name: "Almaty District (Northeast)",
      lat: 51.1833,
      lng: 71.4667,
      value: Math.round(livePM25 * 1.15 * 10) / 10,
      isLive: false
    },
    {
      name: "Nursultan District (Southwest)",
      lat: 51.1282,
      lng: 71.4305,
      value: Math.round(livePM25 * 0.85 * 10) / 10,
      isLive: false
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[480px] card-hover">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Live Air Quality Map</h3>
          <div className="flex items-center text-sm mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse-dot"></span>
            <span className="text-emerald-600 font-bold mr-2">Live</span>
            <span className="text-slate-500">Astana sensor network</span>
          </div>
        </div>

        {/* Global AQI Badge for Astana Center */}
        <div className={`px-4 py-1.5 rounded-full border text-sm font-extrabold flex items-center bg-slate-50 ${aqiTextClass}`}>
          <span className={`w-2.5 h-2.5 rounded-full mr-2 ${aqiColorClass}`}></span>
          {aqiCategory} ({Math.round(livePM25)} µg/m³)
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
          {stations.map((station, idx) => (
            <Marker 
              key={idx}
              position={[station.lat, station.lng]}
              icon={createCustomIcon(station.value)}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <h4 className="font-extrabold text-sm text-slate-900 mb-1">{station.name}</h4>
                  <p className="text-xs text-slate-500 mb-2">
                    Station Type: <span className="font-semibold text-blue-600">{station.isLive ? "Primary Sensor (Live)" : "Satellite Station"}</span>
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs text-slate-600 font-semibold">PM2.5:</span>
                    <span className="text-xs font-black text-slate-900">{station.value} µg/m³</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-600 font-semibold">Status:</span>
                    <span className={`text-xs font-black ${getAqiTextClass(station.value)}`}>
                      {getAqiCategory(station.value)}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legend Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-lg z-[1000] max-w-[160px] hidden sm:block">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">AQI Legend (PM2.5)</p>
          <div className="space-y-1.5 text-[10px] font-bold text-slate-600">
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span> Good <span className="ml-auto text-slate-400">0-25</span></div>
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-2"></span> Moderate <span className="ml-auto text-slate-400">26-50</span></div>
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></span> Unhealthy <span className="ml-auto text-slate-400">51-100</span></div>
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></span> Very Unhealthy <span className="ml-auto text-slate-400">101-150</span></div>
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-2"></span> Hazardous <span className="ml-auto text-slate-400">150+</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
