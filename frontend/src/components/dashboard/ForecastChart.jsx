import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { getForecast } from '../../lib/api';
import { useTranslation } from 'react-i18next';

export default function ForecastChart() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    setError(false);
    try {
      const forecast = await getForecast();
      if (forecast && forecast.length > 0) {
        setData(forecast);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to load forecast from backend:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
    // Poll forecast every 5 minutes
    const interval = setInterval(fetchForecast, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    fetchForecast();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 p-6 flex flex-col h-[350px]">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-slate-200 rounded skeleton"></div>
          <div className="h-4 w-64 bg-slate-200 rounded skeleton hidden sm:block"></div>
        </div>
        <div className="flex-1 w-full bg-slate-50 rounded-xl skeleton flex items-center justify-center">
          <p className="text-slate-400 text-sm font-semibold tracking-wide">Fetching 24-Hour Forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 p-6 flex flex-col h-[350px] items-center justify-center text-center">
        <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Failed to Load Forecast Data</h3>
        <p className="text-slate-500 text-sm max-w-sm mb-4">
          There was an error communicating with the ADEM forecast endpoint.
        </p>
        <button
          onClick={handleRetry}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/20 text-sm transition-all duration-200 active:scale-95 touch-target"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  let peakTime = null;
  if (data.length > 0) {
    const peakIndex = data.reduce((maxIdx, curr, idx, arr) => curr.pm25 > arr[maxIdx].pm25 ? idx : maxIdx, 0);
    peakTime = data[peakIndex].time;
  }

  return (
    <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 p-6 flex flex-col h-[350px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{t('forecast.title')}</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">{t('forecast.predicted')} trends for the next day</p>
        </div>
        
        {/* Responsive, wrapping legend */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span> Good</div>
          <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-1.5"></span> Moderate</div>
          <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5"></span> Unhealthy</div>
          <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></span> Very Unhealthy</div>
          <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-1.5"></span> Hazardous</div>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[200px]">
        <p className="text-[10px] font-bold text-slate-400 absolute -top-4 left-0 z-10">PM2.5 µg/m³</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} dx={-5} domain={[0, 'auto']} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              formatter={(value) => [`${value} µg/m³`, 'PM2.5']}
            />
            <Area 
              type="monotone" 
              dataKey="pm25" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPm25)" 
              dot={{ r: 3, strokeWidth: 1.5, fill: "#fff", stroke: "#ef4444" }}
              activeDot={{ r: 5, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
            />
            {peakTime && (
              <ReferenceLine 
                x={peakTime} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                label={{ position: 'bottom', value: 'Peak Prediction', fill: '#ef4444', fontSize: 9, fontWeight: 'black' }} 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
