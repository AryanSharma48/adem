import React from 'react';
import { Car, Bus, Truck } from 'lucide-react';

export default function TrafficCount({ liveData, loading }) {
  const isAvailable = liveData && liveData.vehicle_count !== undefined;
  
  const totalVehicles = isAvailable ? liveData.vehicle_count : 1246;
  
  // Estimate proportions: ~78% Cars, ~13% Buses, remainder Trucks
  const cars = Math.round(totalVehicles * 0.785);
  const buses = Math.round(totalVehicles * 0.125);
  const trucks = Math.max(0, totalVehicles - cars - buses);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900">Live Traffic Count</h3>
        <span className="text-xs font-medium text-slate-500">Right now</span>
      </div>
      
      <div className="flex gap-4 h-[120px]">
        {/* Placeholder image for YOLOv8 traffic camera */}
        <div className="w-1/2 h-full rounded-xl overflow-hidden relative group">
          <img 
             src="https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400&h=300" 
             alt="Traffic Camera"
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Simulated bounding boxes */}
          <div className="absolute top-[40%] left-[30%] w-8 h-8 border-2 border-emerald-400 rounded-sm bg-emerald-400/20"></div>
          <div className="absolute top-[60%] left-[50%] w-10 h-10 border-2 border-emerald-400 rounded-sm bg-emerald-400/20"></div>
          <div className="absolute top-[30%] left-[65%] w-12 h-14 border-2 border-blue-400 rounded-sm bg-blue-400/20"></div>
        </div>
        
        <div className="w-1/2 flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicles Counted</p>
          <div className="flex items-baseline mb-4">
            <span className="text-3xl font-black text-slate-900 mr-2">{totalVehicles.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-500">v / min</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <Car className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
              <p className="text-[10px] text-slate-500">Cars</p>
              <p className="text-sm font-bold text-slate-800">{cars}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <Bus className="w-4 h-4 mx-auto text-blue-500 mb-1" />
              <p className="text-[10px] text-slate-500">Buses</p>
              <p className="text-sm font-bold text-slate-800">{buses}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <Truck className="w-4 h-4 mx-auto text-purple-500 mb-1" />
              <p className="text-[10px] text-slate-500">Trucks</p>
              <p className="text-sm font-bold text-slate-800">{trucks}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
        Feeds into air quality forecast
      </div>
    </div>
  );
}
