import React, { useState, useEffect } from 'react';
import { Bell, CloudSun, Menu } from 'lucide-react';
import axios from 'axios';

export default function TopNav({ liveData, loading, onMenuToggle }) {
  const [temperature, setTemperature] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

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
  }, []);

  const formattedTime = liveData && liveData.timestamp 
    ? new Date(liveData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "10:30 AM";

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
            <span className="hidden sm:inline">Good morning, </span>Astana
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
        <div className="relative cursor-pointer p-1.5 rounded-full hover:bg-slate-100 transition-all">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
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
