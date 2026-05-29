import React from 'react';
import { Database, Car, Truck, Bus } from 'lucide-react';
import PollutionSources from '../dashboard/PollutionSources';
import ForecastChart from '../dashboard/ForecastChart';
import { useTranslation } from 'react-i18next';

export default function SourcesPage({ liveData, loading }) {
  const { t } = useTranslation();
  const isAvailable = liveData && liveData.vehicle_count !== undefined;
  const totalVehicles = isAvailable ? liveData.vehicle_count : 1246;
  const cars = Math.round(totalVehicles * 0.785);
  const buses = Math.round(totalVehicles * 0.125);
  const trucks = Math.max(0, totalVehicles - cars - buses);

  return (
    <div className="flex flex-col space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white p-6 border-2 border-slate-300 rounded-none flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Database className="w-6 h-6 mr-3 text-blue-500" />
            {t('sources.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('sourcespage.liveSubtitle')}
          </p>
        </div>
        <div className="hidden sm:flex items-center bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-none border-2 border-emerald-200 text-sm font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          {t('map.live')}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Traffic Camera Feed */}
        <div className="bg-white border-2 border-slate-300 rounded-none p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">{t('sourcespage.liveTitle')}</h2>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Astana Center</span>
          </div>
          
          {/* Video Container */}
          <div className="flex-1 relative w-full overflow-hidden border-2 border-slate-200 bg-slate-900 rounded-none min-h-[300px] mb-6">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover opacity-90"
              src="/traffic.mp4"
            />
            {/* Overlay status */}
            <div className="absolute top-4 right-4 bg-black/60 text-emerald-400 px-2 py-1 text-[10px] font-mono border border-emerald-500/50 flex items-center backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              REC
            </div>
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-2 py-1 text-[10px] font-mono border border-slate-600/50 backdrop-blur-sm">
              Model: YOLOv8_nano | Conf: 0.85
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-50 border-2 border-slate-200 p-4 text-center flex flex-col justify-center">
              <Car className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Cars</p>
              <p className="text-xl font-black text-slate-800">{cars}</p>
            </div>
            <div className="bg-slate-50 border-2 border-slate-200 p-4 text-center flex flex-col justify-center">
              <Bus className="w-6 h-6 mx-auto text-blue-500 mb-2" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Buses</p>
              <p className="text-xl font-black text-slate-800">{buses}</p>
            </div>
            <div className="bg-slate-50 border-2 border-slate-200 p-4 text-center flex flex-col justify-center">
              <Truck className="w-6 h-6 mx-auto text-purple-500 mb-2" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Trucks</p>
              <p className="text-xl font-black text-slate-800">{trucks}</p>
            </div>
          </div>
        </div>

        {/* Breakdown / SHAP Values & Forecast */}
        <div className="flex flex-col gap-6">
          <PollutionSources liveData={liveData} loading={loading} />
          <ForecastChart />
        </div>
      </div>
      
    </div>
  );
}
