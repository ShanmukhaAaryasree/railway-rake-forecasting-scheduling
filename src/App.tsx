import React, { useState, useEffect } from 'react';
import { Train, Calendar, BarChart3, Settings, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ScheduleView from './components/ScheduleView';
import ForecastView from './components/ForecastView';
import RakeManagement from './components/RakeManagement';
import DataExport from './components/DataExport';
import { Rake, Route, Schedule, DemandForecast } from './types';
import { ForecastingEngine } from './utils/forecasting';
import { SchedulingEngine } from './utils/scheduling';
import { generateMockData } from './utils/mockData';

type View = 'dashboard' | 'schedule' | 'forecast' | 'rakes' | 'export';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [rakes, setRakes] = useState<Rake[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mockData, setMockData] = useState<any>(null);

  useEffect(() => {
    // Initialize with mock data
    const data = generateMockData();
    setMockData(data);
    setRakes(data.rakes);
    setRoutes(data.routes);
    setSchedules(data.schedules);
    
    // Generate forecasts
    const generatedForecasts = data.routes.map(route => 
      ForecastingEngine.generateDemandForecast(
        route.id,
        data.historicalDemand[route.id] || [50, 60, 45, 70, 55, 80, 65],
        new Date(),
        ['seasonal', 'economic']
      )
    );
    setForecasts(generatedForecasts);
    setIsLoading(false);
  }, []);

  const handleOptimizeSchedule = () => {
    const schedulingEngine = new SchedulingEngine();
    const optimizedSchedules = schedulingEngine.optimizeSchedule(
      rakes,
      routes,
      forecasts,
      schedules,
      {
        start: new Date(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    );
    setSchedules([...schedules, ...optimizedSchedules]);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'forecast', label: 'Forecast', icon: Train },
    { id: 'rakes', label: 'Rake Management', icon: Settings },
    { id: 'export', label: 'Data Export', icon: Download },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Railway Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Train className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Railway Rake Scheduler
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                System Online
              </div>
              <button
                onClick={handleOptimizeSchedule}
                className="btn-primary"
              >
                Optimize Schedule
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentView(item.id as View)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentView === item.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentView === 'dashboard' && (
            <Dashboard
              rakes={rakes}
              routes={routes}
              schedules={schedules}
              forecasts={forecasts}
            />
          )}
          {currentView === 'schedule' && (
            <ScheduleView
              schedules={schedules}
              rakes={rakes}
              routes={routes}
              onScheduleUpdate={setSchedules}
            />
          )}
          {currentView === 'forecast' && (
            <ForecastView
              forecasts={forecasts}
              routes={routes}
              onForecastUpdate={setForecasts}
            />
          )}
          {currentView === 'rakes' && (
            <RakeManagement
              rakes={rakes}
              schedules={schedules}
              onRakeUpdate={setRakes}
            />
          )}
          {currentView === 'export' && (
            <DataExport
              stations={mockData?.stations || []}
              rakes={rakes}              routes={routes}
              schedules={schedules}
              historicalDemand={mockData?.historicalDemand || {}}
              forecasts={forecasts}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
