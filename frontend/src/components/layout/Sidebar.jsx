import React from 'react';
import { Home, Map, Activity, Database, Shield, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Overview', icon: Home, path: '/' },
  { name: 'Map', icon: Map, path: '/map' },
  { name: 'Sources', icon: Database, path: '#' },
  { name: 'Forecasts', icon: Activity, path: '#' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <div className="w-64 bg-[#0f172a] text-slate-300 h-screen flex-col justify-between border-r border-slate-800 hidden md:flex flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar — slide-in drawer */}
      <div className={`sidebar-mobile w-72 bg-[#0f172a] text-slate-300 flex flex-col justify-between md:hidden ${isOpen ? 'open' : ''}`}>
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors touch-target"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent onItemClick={onClose} />
      </div>
    </>
  );
}

function SidebarContent({ onItemClick }) {
  const location = useLocation();

  return (
    <>
      <div>
        <div className="p-6 flex items-center space-x-3 text-white">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight">ADEM</h1>
            <p className="text-xs text-slate-400">Astana</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/');
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (onItemClick) onItemClick();
                }}
                className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 touch-target ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20'
                    : 'hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 text-emerald-400 mb-2">
            <Shield className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium text-white mb-2">Protect your health. Protect our future.</p>
          <p className="text-xs text-slate-400 leading-relaxed">ADEM Astana is an open-source initiative for a cleaner, healthier city.</p>
        </div>
      </div>
    </>
  );
}
