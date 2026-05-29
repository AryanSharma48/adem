import React from 'react';
import { Home, Map, Activity, Database, X, Send } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

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
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { name: t('nav.overview'), icon: Home, path: '/' },
    { name: t('nav.map'), icon: Map, path: '/map' },
    { name: t('nav.sources'), icon: Database, path: '/sources' },
  ];

  return (
    <>
      <div>
        <div className="p-6 flex items-center space-x-3 text-white">
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
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 space-y-4">
        {/* Telegram CTA Box */}
        <div className="bg-[#0088cc]/10 rounded-xl p-4 border border-[#0088cc]/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#0088cc] mr-2 animate-pulse"></span>
              Real-time Alerts
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Get notified instantly when pollution spikes in your area.
            </p>
            <a 
              href="https://t.me/adem_astana" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white text-xs font-bold rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Join Telegram Channel
            </a>
          </div>
        </div>

        {/* Existing Protect Health Box */}
        <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-800">
          <p className="font-bold text-white mb-2 mt-1">
            Protect your health.<br/>Protect our future.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">ADEM Astana is an open-source initiative for a cleaner, healthier city.</p>
        </div>
      </div>
    </>
  );
}
