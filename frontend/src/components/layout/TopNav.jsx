import React, { useState, useEffect } from 'react';
import { Bell, CloudSun, Menu, Lightbulb } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function TopNav({ liveData, loading, onMenuToggle }) {
  const { t, i18n } = useTranslation();
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
  let greeting = t('header.greeting');
  if (currentHour >= 4 && currentHour < 12) {
    greeting = t('header.greeting').replace('evening', 'morning'); // Or specific translation if desired
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = t('header.greeting').replace('evening', 'afternoon');
  }

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'kk' : 'en');
  };

  return (
    <div className="bg-white border-b border-slate-200 h-16 md:h-20 px-3 md:px-8 flex items-center justify-between">
      <div className="flex items-center min-w-0">
        {/* Hamburger Menu Button */}
        <button
          onClick={onMenuToggle}
          className="p-2 mr-2 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors md:hidden touch-target shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <div className="min-w-0 flex flex-col justify-center">
          <h2 className="text-base sm:text-lg md:text-2xl font-bold text-slate-900 flex items-center whitespace-nowrap truncate">
            <span>{greeting},&nbsp;</span>{t('header.city')}
            <div className="ml-2 md:ml-3 flex items-center text-[10px] md:text-sm font-medium text-slate-600 bg-slate-100 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full shrink-0">
              <CloudSun className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5 text-blue-500" />
              {weatherLoading ? (
                <span className="w-6 h-3 md:w-8 md:h-4 skeleton bg-slate-200 block"></span>
              ) : temperature !== null ? (
                `${temperature}°C`
              ) : (
                "-12°C"
              )}
            </div>
          </h2>
          <p className="hidden md:block text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1 truncate">Real-time air quality across the city</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6 shrink-0">
        
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center text-[10px] md:text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-full transition-colors"
          aria-label="Toggle language"
        >
          <Lightbulb className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 text-yellow-500" />
          {i18n.language === 'en' ? t('header.switchToKK') : t('header.switchToEN')}
        </button>

        {/* Telegram Tooltip Icon */}
        <div className="relative group hidden sm:flex items-center">
          <a 
            href="https://t.me/adem_astana"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-[#0088cc]"
            aria-label="Telegram Channel"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.204-.054-.31-.346-.116L7.473 14.18 4.7 13.31c-.603-.188-.617-.604.126-.893l10.884-4.195c.504-.188.943.11 1.184.6z" />
            </svg>
          </a>
        </div>

        <div className="text-right">
          <p className="hidden sm:block text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-wider">{t('header.lastUpdated')}</p>
          {loading ? (
            <div className="h-3 md:h-4 bg-slate-200 rounded w-12 md:w-16 skeleton ml-auto mt-0.5"></div>
          ) : (
            <p className="text-[10px] md:text-sm font-extrabold text-blue-600 mt-0.5">{formattedTime}</p>
          )}
        </div>
      </div>
    </div>
  );
}
