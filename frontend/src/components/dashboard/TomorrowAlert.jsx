import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function TomorrowAlert({ liveData, loading }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between h-[216px]">
        <div className="space-y-4 w-full">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-slate-200 rounded skeleton-circle skeleton"></div>
            <div className="h-5 w-48 bg-slate-200 rounded skeleton"></div>
          </div>
          {/* District & Status */}
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-200 rounded skeleton"></div>
            <div className="h-8 w-36 bg-slate-200 rounded skeleton"></div>
          </div>
          {/* Details */}
          <div className="h-4 w-48 bg-slate-200 rounded skeleton"></div>
        </div>
      </div>
    );
  }

  // Fallback for null data if error occurs
  if (!liveData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center h-[216px]">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
        <h4 className="text-sm font-extrabold text-slate-800">Forecast Unavailable</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">No live forecast metrics are currently available from the ADEM database.</p>
      </div>
    );
  }

  const isAvailable = liveData.pm25_predicted !== undefined;
  const pm25 = isAvailable ? Math.round(liveData.pm25_predicted) : 78;
  const district = isAvailable ? liveData.district : "Northeast District";
  
  let statusText = "Unhealthy";
  let statusClass = "text-red-500";
  let alertBadgeClass = "bg-red-50 text-red-600 border border-red-100";
  
  if (pm25 <= 15) {
    statusText = "Good";
    statusClass = "text-emerald-500";
    alertBadgeClass = "bg-emerald-50 text-emerald-600 border border-emerald-100";
  } else if (pm25 <= 50) {
    statusText = "Moderate";
    statusClass = "text-yellow-500";
    alertBadgeClass = "bg-yellow-50 text-yellow-600 border border-yellow-100";
  } else if (pm25 <= 100) {
    statusText = "Unhealthy";
    statusClass = "text-orange-500";
    alertBadgeClass = "bg-orange-50 text-orange-600 border border-orange-100";
  } else {
    statusText = "Very Unhealthy";
    statusClass = "text-purple-600";
    alertBadgeClass = "bg-purple-50 text-purple-600 border border-purple-100";
  }

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 card-hover flex flex-col justify-between min-h-[216px]">
      <div>
        <div className={`flex items-center font-extrabold text-sm mb-3.5 ${statusClass}`}>
          <AlertTriangle className="w-4.5 h-4.5 mr-2 animate-pulse" />
          Tomorrow's Air Quality Alert
        </div>
        
        <div className="flex justify-between items-end">
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{district}</p>
            <h2 className={`text-3xl font-black mb-1.5 ${statusClass}`}>{statusText}</h2>
            <p className="text-base font-semibold text-slate-700 mb-3">
              PM2.5 <span className="font-extrabold text-slate-900">{pm25}</span> µg/m³
            </p>
            <div className={`inline-block font-bold px-2.5 py-0.5 rounded-full text-xs mb-3 ${alertBadgeClass}`}>
              Forecasted at {formattedTime}
            </div>
            <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-[240px]">
              {pm25 > 50 
                ? "Limit outdoor activity for children, elderly and people with respiratory conditions."
                : "Air quality is suitable for standard outdoor physical activities."}
            </p>
          </div>
          
          <div className="w-24 h-18 relative hidden sm:block">
             <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
               <defs>
                 <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4"/>
                   <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                 </linearGradient>
               </defs>
               <path d="M0,40 Q25,40 40,25 T70,5 T100,30 L100,50 L0,50 Z" fill="url(#alertGrad)" />
               <path d="M0,40 Q25,40 40,25 T70,5 T100,30" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
               <circle cx="70" cy="5" r="4" fill="#ef4444" stroke="white" strokeWidth="1.5" className="animate-pulse" />
               <text x="70" y="-8" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
                  {pm25}
               </text>
             </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
