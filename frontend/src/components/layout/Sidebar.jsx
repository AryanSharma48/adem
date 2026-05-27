import React from 'react';
import { Home, Map, Activity, Database, Car, Bell, Info, Shield } from 'lucide-react';

const navItems = [
  { name: 'Overview', icon: Home, active: true },
  { name: 'Map', icon: Map, active: false },
  { name: 'Forecast', icon: Activity, active: false },
  { name: 'Sources', icon: Database, active: false },
  { name: 'Traffic', icon: Car, active: false },
  { name: 'Alerts', icon: Bell, active: false },
  { name: 'About', icon: Info, active: false },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#0f172a] text-slate-300 h-screen flex flex-col justify-between hidden md:flex border-r border-slate-800">
      <div>
        <div className="p-6 flex items-center space-x-3 text-white">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AirGuard</h1>
            <p className="text-xs text-slate-400">Astana</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <a
              key={item.name}
              href="#"
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${item.active ? 'text-white' : 'text-slate-400'}`} />
              {item.name}
            </a>
          ))}
        </nav>
      </div>

      <div className="p-6">
        <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-400 mb-2">
            <Shield className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium text-white mb-2">Protect your health. Protect our future.</p>
          <p className="text-xs text-slate-400">AirGuard Astana is an open-source initiative for a cleaner, healthier city.</p>
        </div>
      </div>
    </div>
  );
}
