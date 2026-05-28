import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import AirQualityOverview from './components/dashboard/AirQualityOverview';
import TomorrowAlert from './components/dashboard/TomorrowAlert';
import PollutionSources from './components/dashboard/PollutionSources';
import ForecastChart from './components/dashboard/ForecastChart';
import { getLiveStats } from './lib/api';

export default function App() {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getLiveStats();
        if (stats) {
          setLiveData(stats);
        }
      } catch (err) {
        console.error("Error fetching live stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Poll every 30 seconds to fetch live data (e.g. YOLO counter, new predicted value)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout liveData={liveData} loading={loading}>
      <div className="flex flex-col space-y-6 pb-12">
        
        {/* Top Row: Map (Left) + Alerts/Sources (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AirQualityOverview liveData={liveData} loading={loading} />
          </div>
          <div className="flex flex-col space-y-6">
            <TomorrowAlert liveData={liveData} loading={loading} />
            <PollutionSources liveData={liveData} loading={loading} />
          </div>
        </div>

        {/* Bottom Row: Forecast (Full Width) */}
        <div className="w-full">
          <ForecastChart />
        </div>

      </div>
    </DashboardLayout>
  );
}
