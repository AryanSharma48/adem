import React from 'react';
import { Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TelegramAlertStatus({ liveData, loading }) {
  const isAvailable = liveData && liveData.pm25_predicted !== undefined;
  
  const pm25 = isAvailable ? Math.round(liveData.pm25_predicted) : 78;
  const hasWarning = pm25 > 50; // WHO Limit is 50 µg/m³
  const district = isAvailable ? liveData.district : "Astana northeast";

  return (
    <div className="bg-white rounded-none shadow-sm border-2 border-slate-300 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-500 p-3 rounded-xl text-white">
          <Send className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="font-bold text-slate-900 mr-3">Telegram Alert System</h3>
            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Active
            </span>
          </div>
          <p className="text-xs text-slate-500">Automatic alerts sent to 12,543 subscribers</p>
        </div>
      </div>
      
      {hasWarning ? (
        <div className="hidden lg:flex items-center bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm border border-yellow-100">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
          <span className="font-medium mr-1">Air quality warning —</span> {district}, tomorrow 7–10am. 
          <span className="ml-1 text-slate-600">Limit outdoor activity for children and elderly.</span>
        </div>
      ) : (
        <div className="hidden lg:flex items-center bg-emerald-50 text-emerald-800 px-4 py-2 rounded-lg text-sm border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
          <span className="font-medium mr-1">Air quality normal —</span> All districts are currently inside safe thresholds.
        </div>
      )}
      
      <div className="flex items-center text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
        Sent 10:30 AM <CheckCircle2 className="w-4 h-4 ml-2 text-emerald-500" />
      </div>
    </div>
  );
}
