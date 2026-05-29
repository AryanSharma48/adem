import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Info, AlertTriangle } from 'lucide-react';

const defaultData = [
  { name: 'Heating (Coal)', value: 61, color: '#ef4444' },
  { name: 'Traffic', value: 31, color: '#f59e0b' },
  { name: 'Industrial', value: 8, color: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-none border-2 border-slate-300 shadow-sm flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: payload[0].payload.color }}></span>
        <span>{payload[0].name} <span className="text-slate-900 ml-0.5">{payload[0].value}%</span></span>
      </div>
    );
  }
  return null;
};

export default function PollutionSources({ liveData, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 p-6 flex flex-col h-[288px]">
        <div className="space-y-2 mb-6">
          <div className="h-5 w-2/3 bg-slate-200 rounded skeleton"></div>
          <div className="h-4 w-1/2 bg-slate-200 rounded skeleton"></div>
        </div>
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="w-28 h-28 bg-slate-200 rounded-full skeleton skeleton-circle"></div>
          <div className="flex-1 space-y-3 w-full">
            <div className="h-4 w-full bg-slate-200 rounded skeleton"></div>
            <div className="h-4 w-full bg-slate-200 rounded skeleton"></div>
            <div className="h-4 w-full bg-slate-200 rounded skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for null data if error occurs
  if (!liveData) {
    return (
      <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 p-6 flex flex-col justify-center items-center text-center h-[288px]">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
        <h4 className="text-sm font-extrabold text-slate-800">Source Metrics Unavailable</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Pollution attribution metrics are currently unavailable from the ADEM database.</p>
      </div>
    );
  }

  const isAvailable = liveData.primary_source !== undefined;
  const primarySource = isAvailable ? liveData.primary_source : 'heating';
  const pm25 = liveData.pm25_predicted !== undefined ? Math.round(liveData.pm25_predicted) : 78;

  let statusText = "Unhealthy";
  if (pm25 <= 15) {
    statusText = "Good";
  } else if (pm25 <= 50) {
    statusText = "Moderate";
  } else if (pm25 <= 100) {
    statusText = "Unhealthy";
  } else if (pm25 <= 150) {
    statusText = "Very Unhealthy";
  } else {
    statusText = "Hazardous";
  }

  // Use SHAP values from backend when available
  const hasShap = liveData.shap_heating !== null && liveData.shap_traffic !== null && liveData.shap_pm25 !== null && 
                  liveData.shap_heating !== undefined && liveData.shap_traffic !== undefined && liveData.shap_pm25 !== undefined;

  let chartData = defaultData;
  if (hasShap) {
    const heating = Math.round(liveData.shap_heating * 100);
    const traffic = Math.round(liveData.shap_traffic * 100);
    // Industrial serves as our PM2.5 history/background contribution
    const industrial = Math.max(0, 100 - heating - traffic);
    chartData = [
      { name: 'Heating (Coal)', value: heating, color: '#ef4444' },
      { name: 'Traffic', value: traffic, color: '#f59e0b' },
      { name: 'Industrial', value: industrial, color: '#8b5cf6' },
    ];
  } else if (isAvailable) {
    // Legacy fallback based on primary source enum
    if (primarySource === 'heating') {
      chartData = [
        { name: 'Heating (Coal)', value: 72, color: '#ef4444' },
        { name: 'Traffic', value: 20, color: '#f59e0b' },
        { name: 'Industrial', value: 8, color: '#8b5cf6' },
      ];
    } else if (primarySource === 'traffic') {
      chartData = [
        { name: 'Heating (Coal)', value: 25, color: '#ef4444' },
        { name: 'Traffic', value: 68, color: '#f59e0b' },
        { name: 'Industrial', value: 7, color: '#8b5cf6' },
      ];
    } else if (primarySource === 'background') {
      chartData = [
        { name: 'Heating (Coal)', value: 30, color: '#ef4444' },
        { name: 'Traffic', value: 25, color: '#f59e0b' },
        { name: 'Industrial', value: 45, color: '#8b5cf6' },
      ];
    }
  }

  return (
    <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 p-6 min-h-[288px] flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Why Tomorrow Will Be {statusText}</h3>
        <p className="text-sm text-slate-500 mb-4">Source attribution for predicted pollution</p>
        
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6">
          <div className="w-full sm:w-1/2 h-[130px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={58}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Inner Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900">{pm25}</span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">PM2.5</span>
            </div>
          </div>
          
          <div className="w-full sm:w-1/2 sm:pl-2">
            <div className="space-y-2.5">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span 
                      className="w-2.5 h-2.5 rounded-full mr-2.5" 
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-xs font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        AI Model: ADEM v1.0
        <Info className="w-3.5 h-3.5 ml-1.5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
      </div>
    </div>
  );
}
