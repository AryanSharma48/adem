import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function TomorrowAlert({ liveData, loading }) {
  const isAvailable = liveData && liveData.pm25_predicted !== undefined;
  
  const pm25 = isAvailable ? Math.round(liveData.pm25_predicted) : 78;
  const district = isAvailable ? liveData.district : "Northeast District";
  
  let statusText = "Unhealthy";
  let statusClass = "text-red-500";
  let alertBadgeClass = "bg-red-50 text-red-600";
  
  if (pm25 <= 25) {
    statusText = "Good";
    statusClass = "text-emerald-500";
    alertBadgeClass = "bg-emerald-50 text-emerald-600";
  } else if (pm25 <= 50) {
    statusText = "Moderate";
    statusClass = "text-yellow-500";
    alertBadgeClass = "bg-yellow-50 text-yellow-600";
  } else if (pm25 <= 100) {
    statusText = "Unhealthy";
    statusClass = "text-orange-500";
    alertBadgeClass = "bg-orange-50 text-orange-600";
  } else {
    statusText = "Very Unhealthy";
    statusClass = "text-purple-600";
    alertBadgeClass = "bg-purple-50 text-purple-600";
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className={`flex items-center font-bold mb-4 ${statusClass}`}>
        <AlertTriangle className="w-5 h-5 mr-2" />
        Tomorrow's Air Quality Alert
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-1">{district}</p>
          <h2 className={`text-3xl font-black mb-1 ${statusClass}`}>{statusText}</h2>
          <p className="text-lg font-medium text-slate-700 mb-4">
            PM2.5 <span className="font-bold text-slate-900">{pm25}</span> µg/m³
          </p>
          <div className={`inline-block font-medium px-3 py-1 rounded-md text-sm mb-4 ${alertBadgeClass}`}>
            7:00 AM – 10:00 AM
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-[250px]">
            {pm25 > 50 
              ? "Limit outdoor activity for children, elderly and people with respiratory conditions."
              : "Air quality is suitable for standard outdoor physical activities."}
          </p>
        </div>
        
        <div className="w-32 h-24 relative hidden md:block">
           {/* Mini sparkline visualization placeholder */}
           <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
             <defs>
               <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4"/>
                 <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
               </linearGradient>
             </defs>
             <path d="M0,40 Q25,40 40,25 T70,5 T100,30 L100,50 L0,50 Z" fill="url(#alertGrad)" />
             <path d="M0,40 Q25,40 40,25 T70,5 T100,30" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
             <circle cx="70" cy="5" r="4" fill="#ef4444" className="shadow-[0_0_10px_rgba(239,68,68,1)]" />
             <text x="70" y="-8" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="fill-white drop-shadow-md">
                <tspan dx="0" dy="0" fill="#ef4444">{pm25}</tspan>
             </text>
           </svg>
        </div>
      </div>
    </div>
  );
}
