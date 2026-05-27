import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getForecast } from '../../lib/api';

export default function ForecastChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const forecast = await getForecast();
        if (forecast && forecast.length > 0) {
          setData(forecast);
        } else {
          loadMockData();
        }
      } catch (err) {
        console.error("Failed to load forecast from backend:", err);
        loadMockData();
      }
    };

    const loadMockData = () => {
      const times = ["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "12 AM"];
      const values = [15, 14, 20, 35, 60, 78, 65, 40, 22];
      
      const mockData = times.map((time, index) => ({
        time,
        pm25: values[index]
      }));
      setData(mockData);
    };

    fetchForecast();
    // Poll forecast every 5 minutes
    const interval = setInterval(fetchForecast, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900">24-Hour Air Quality Forecast</h3>
        <div className="flex space-x-4 text-xs font-medium">
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Good</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span> Moderate</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span> Unhealthy</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Very Unhealthy</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-600 mr-2"></span> Hazardous</div>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[250px]">
        <p className="text-xs text-slate-500 absolute -top-2 left-0 z-10">PM2.5 µg/m³</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            />
            {/* Base gradient area */}
            <Area 
              type="monotone" 
              dataKey="pm25" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPm25)" 
              dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
            />
            {data.length > 5 && (
              <ReferenceLine 
                x={data[Math.min(data.length - 1, 15)]?.time} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                label={{ position: 'bottom', value: 'Predicted Alert', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
