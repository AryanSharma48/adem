import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "nav.overview": "Overview",
      "nav.map": "Map",
      "nav.sources": "Sources & Forecasts",
      
      "header.greeting": "Good evening",
      "header.city": "Astana",
      "header.lastUpdated": "LAST UPDATED",
      "header.switchToKK": "Қазақшаға ауысу",
      "header.switchToEN": "Switch to English",

      "alert.title": "Tomorrow's Air Quality Alert",
      "alert.description": "Expect high levels of PM2.5 in Astana",
      "alert.action": "Keep windows closed and avoid outdoor activities.",

      "map.liveMap": "Live Air Quality Map",
      "map.live": "Live",
      "map.network": "Astana sensor network",
      "map.viewFull": "View Full Interactive Map",

      "sources.title": "Current Pollution Drivers",
      "sources.subtitle": "Analyzing key contributors to AQI levels right now",
      "sources.traffic": "Traffic Emissions",
      "sources.heating": "Heating/Industrial",
      "sources.natural": "Natural/Dust",
      "sources.active": "Active",
      "sources.high": "High",
      "sources.low": "Low",

      "forecast.title": "24-Hour Forecast",
      "forecast.predicted": "Predicted PM2.5",
      
      "mappage.search": "Search location in Astana...",
      "mappage.network": "Astana Sensor Network",
      "mappage.sensors": "Active Sensors",
      "mappage.searchBtn": "Search",
      "mappage.select": "Select a location from the map or search above to see detailed air quality metrics.",
      
      "sourcespage.liveTitle": "Live Traffic Monitoring",
      "sourcespage.liveSubtitle": "Live traffic feed from Astana's main intersections to track emissions"
    }
  },
  kk: {
    translation: {
      "nav.overview": "Шолу",
      "nav.map": "Карта",
      "nav.sources": "Көздер және болжамдар",

      "header.greeting": "Қайырлы кеш",
      "header.city": "Астана",
      "header.lastUpdated": "СОҢҒЫ ЖАҢАРТЫЛҒАНЫ",
      "header.switchToKK": "Қазақшаға ауысу",
      "header.switchToEN": "Switch to English",

      "alert.title": "Ертеңгі ауа сапасы туралы ескерту",
      "alert.description": "Астанада PM2.5 жоғары деңгейі күтілуде",
      "alert.action": "Терезелерді жабық ұстаңыз және далада жүруден аулақ болыңыз.",

      "map.liveMap": "Нақты уақыттағы ауа сапасының картасы",
      "map.live": "Тікелей",
      "map.network": "Астана сенсорлық желісі",
      "map.viewFull": "Толық интерактивті картаны көру",

      "sources.title": "Ағымдағы ластану көздері",
      "sources.subtitle": "Қазіргі уақытта AQI деңгейінің негізгі факторларын талдау",
      "sources.traffic": "Көлік шығарындылары",
      "sources.heating": "Жылыту/Өнеркәсіп",
      "sources.natural": "Табиғи/Шаң",
      "sources.active": "Белсенді",
      "sources.high": "Жоғары",
      "sources.low": "Төмен",

      "forecast.title": "24-сағаттық болжам",
      "forecast.predicted": "Болжанған PM2.5",

      "mappage.search": "Астанадан орын іздеу...",
      "mappage.network": "Астана сенсорлық желісі",
      "mappage.sensors": "Белсенді сенсорлар",
      "mappage.searchBtn": "Іздеу",
      "mappage.select": "Ауа сапасының толық көрсеткіштерін көру үшін картадан орынды таңдаңыз немесе жоғарыдан іздеңіз.",

      "sourcespage.liveTitle": "Тікелей трафикті бақылау",
      "sourcespage.liveSubtitle": "Шығарындыларды қадағалау үшін Астананың негізгі қиылыстарынан тікелей трафик бейнесі"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
