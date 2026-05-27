import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Info } from 'lucide-react';

const defaultData = [
  { name: 'Heating (Coal)', value: 61, color: '#ef4444' },
  { name: 'Traffic', value: 31, color: '#f59e0b' },
  { name: 'Industrial', value: 8, color: '#8b5cf6' },
];

export default function PollutionSources({ liveData, loading }) {
  const isAvailable = liveData && liveData.primary_source !== undefined;
  const primarySource = isAvailable ? liveData.primary_source : 'heating';
  const pm25 = liveData && liveData.pm25_predicted !== undefined ? Math.round(liveData.pm25_predicted) : 78;

  let chartData = defaultData;
  if (isAvailable) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900">Why Tomorrow Will Be Unhealthy</h3>
      <p className="text-sm text-slate-500 mb-6">Source attribution for predicted pollution</p>
      
      <div className="flex items-center">
        <div className="w-1/2 h-[160px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 itemStyle={{ fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Inner Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900">{pm25}</span>
            <span className="text-xs text-slate-500 font-medium">PM2.5</span>
          </div>
        </div>
        
        <div className="w-1/2 pl-4">
          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-3" 
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-400">
        AI Model: AirGuard v1.0
        <Info className="w-3.5 h-3.5 ml-1.5" />
      </div>
    </div>
  );
}
