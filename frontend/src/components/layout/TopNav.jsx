import React, { useState, useEffect } from 'react';
import { Bell, CloudSun, Menu } from 'lucide-react';
import axios from 'axios';

export default function TopNav({ liveData, loading, onMenuToggle }) {
  const [temperature, setTemperature] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchTemperature = async () => {
      try {
        const response = await axios.get("https://api.open-meteo.com/v1/forecast?latitude=51.1694&longitude=71.4206&current=temperature_2m");
        const temp = response.data?.current?.temperature_2m;
        if (temp !== undefined) {
          setTemperature(temp);
        }
      } catch (err) {
        console.error("Error fetching temperature in TopNav:", err);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchTemperature();

    const timeTimer = setInterval(() => setCurrentTime(new Date()), 60000);
    const tempTimer = setInterval(fetchTemperature, 300000); // refresh every 5 mins
    
    return () => {
      clearInterval(timeTimer);
      clearInterval(tempTimer);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const currentHour = new Date().getHours();
  let greeting = "Good evening";
  if (currentHour >= 4 && currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
  }

  return (
    <div className="bg-white border-b border-slate-200 h-20 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center">
        {/* Hamburger Menu Button */}
        <button
          onClick={onMenuToggle}
          className="p-2 mr-3 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors md:hidden touch-target"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 flex items-center">
            {greeting}, Astana
            <div className="ml-3 flex items-center text-xs md:text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <CloudSun className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 text-blue-500" />
              {weatherLoading ? (
                <span className="w-8 h-4 skeleton bg-slate-200 block"></span>
              ) : temperature !== null ? (
                `${temperature}°C`
              ) : (
                "-12°C"
              )}
            </div>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">Real-time air quality across the city</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Telegram Tooltip Icon */}
        <div className="relative group flex items-center">
          <a 
            href="https://t.me/adem_astana"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-[#0088cc]"
            aria-label="Telegram Channel"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.204-.054-.31-.346-.116L7.473 14.18 4.7 13.31c-.603-.188-.617-.604.126-.893l10.884-4.195c.504-.188.943.11 1.184.6z" />
            </svg>
          </a>
          
          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-3 w-56 p-3 bg-slate-900 border border-slate-800 text-slate-100 text-[11px] leading-relaxed rounded-xl shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-20">
            <div className="absolute -top-1.5 right-3.5 w-3 h-3 bg-slate-900 border-l border-t border-slate-800 transform rotate-45"></div>
            <p className="relative z-10 font-medium">Get real-time air quality alerts</p>
            <p className="relative z-10 text-slate-400 mt-0.5">Join our Telegram channel</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-wider">Last updated</p>
          {loading ? (
            <div className="h-4 bg-slate-200 rounded w-16 skeleton ml-auto mt-0.5"></div>
          ) : (
            <p className="text-xs md:text-sm font-extrabold text-blue-600 mt-0.5">{formattedTime}</p>
          )}
        </div>
      </div>
    </div>
  );
}
