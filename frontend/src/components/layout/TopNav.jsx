import React from 'react';
import { Bell, CloudSun } from 'lucide-react';

export default function TopNav() {
  return (
    <div className="bg-white border-b border-slate-200 h-20 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
          Good morning, Astana
          <div className="ml-4 flex items-center text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            <CloudSun className="w-4 h-4 mr-2 text-blue-500" />
            -12°C
          </div>
        </h2>
        <p className="text-sm text-slate-500 mt-1">Real-time air quality across the city</p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Last updated</p>
          <p className="text-sm font-bold text-blue-600">10:30 AM</p>
        </div>
      </div>
    </div>
  );
}
