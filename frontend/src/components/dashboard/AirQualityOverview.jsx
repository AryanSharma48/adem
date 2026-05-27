import React from 'react';

export default function AirQualityOverview() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Live Air Quality Map</h3>
          <div className="flex items-center text-sm mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            <span className="text-emerald-600 font-medium mr-2">Live</span>
            <span className="text-slate-500">193 government sensors</span>
          </div>
        </div>
      </div>
      
      {/* Map Placeholder Area */}
      <div className="flex-1 bg-slate-50 rounded-xl relative overflow-hidden border border-slate-100 flex items-center justify-center min-h-[300px]">
        {/* Simulate map dots */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
        <div className="z-10 text-center">
           <h4 className="font-bold text-xl text-slate-800">Astana</h4>
        </div>
        
        {/* Example dots */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        <div className="absolute top-1/3 left-1/2 w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
        <div className="absolute top-1/2 left-2/3 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
        <div className="absolute top-2/3 left-1/3 w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-700 mb-2">AQI (PM2.5)</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Good <span className="ml-auto text-slate-400">0-25</span></div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span> Moderate <span className="ml-auto text-slate-400">26-50</span></div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span> Unhealthy <span className="ml-auto text-slate-400">51-100</span></div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Very Unhealthy <span className="ml-auto text-slate-400">101-150</span></div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-600 mr-2"></span> Hazardous <span className="ml-auto text-slate-400">150+</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
