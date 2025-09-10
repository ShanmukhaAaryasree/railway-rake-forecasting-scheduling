import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Target, RefreshCw, Download } from 'lucide-react';
import { DemandForecast, Route } from '../types';
import { ForecastingEngine } from '../utils/forecasting';
import { format, addDays } from 'date-fns';

interface ForecastViewProps {
  forecasts: DemandForecast[];
  routes: Route[];
  onForecastUpdate: (forecasts: DemandForecast[]) => void;
}

const ForecastView: React.FC<ForecastViewProps> = ({ forecasts, routes, onForecastUpdate }) => {
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [forecastPeriod, setForecastPeriod] = useState<number>(7);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateExtendedForecast = async (routeId: string, days: number) => {
    setIsGenerating(true);
    
    // Simulate historical data generation
    const historicalData = Array.from({ length: 30 }, () => 
      Math.floor(Math.random() * 50) + 50 + Math.sin(Date.now() / 1000000) * 20
    );

    const extendedForecasts: DemandForecast[] = [];
    for (let i = 1; i <= days; i++) {
      const targetDate = addDays(new Date(), i);
      const forecast = ForecastingEngine.generateDemandForecast(
        routeId,
        historicalData,
        targetDate,
        ['seasonal', 'trend', 'economic']
      );
      extendedForecasts.push(forecast);
    }

    setTimeout(() => {
      const updatedForecasts = [
        ...forecasts.filter(f => f.routeId !== routeId),
        ...extendedForecasts
      ];
      onForecastUpdate(updatedForecasts);
      setIsGenerating(false);
    }, 1500);
  };

  const filteredForecasts = selectedRoute === 'all' 
    ? forecasts 
    : forecasts.filter(f => f.routeId === selectedRoute);

  const chartData = filteredForecasts
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(forecast => ({
      date: format(new Date(forecast.date), 'MMM dd'),
      demand: forecast.predictedDemand,
      confidence: Math.round(forecast.confidence * 100),
      route: routes.find(r => r.id === forecast.routeId)?.name || forecast.routeId
    }));

  const accuracyData = routes.map(route => {
    const routeForecasts = forecasts.filter(f => f.routeId === route.id);
    const avgConfidence = routeForecasts.length > 0 
      ? routeForecasts.reduce((sum, f) => sum + f.confidence, 0) / routeForecasts.length
      : 0;
    
    return {
      route: route.name.split(' ')[0],
      accuracy: Math.round(avgConfidence * 100),
      forecasts: routeForecasts.length
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demand Forecasting</h2>
          <p className="text-gray-600">AI-powered demand prediction and analysis</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => generateExtendedForecast(selectedRoute === 'all' ? routes[0].id : selectedRoute, forecastPeriod)}
            disabled={isGenerating}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Refresh Forecast'}
          </button>
          <button className="btn-primary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Route:</label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Routes</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Forecast Period:</label>
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-600">
            Last updated: {format(new Date(), 'MMM dd, HH:mm')}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Demand</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(filteredForecasts.reduce((sum, f) => sum + f.predictedDemand, 0) / filteredForecasts.length || 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peak Demand</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.max(...filteredForecasts.map(f => f.predictedDemand), 0)}
              </p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(filteredForecasts.reduce((sum, f) => sum + f.confidence, 0) / filteredForecasts.length * 100 || 0)}%
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Forecasts</p>
              <p className="text-2xl font-bold text-orange-600">{filteredForecasts.length}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'demand' ? `${value} units` : `${value}%`,
                name === 'demand' ? 'Predicted Demand' : 'Confidence'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="demand" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Accuracy by Route</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={accuracyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
            <Bar dataKey="accuracy" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Forecasts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Predicted Demand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factors
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredForecasts.slice(0, 10).map((forecast, index) => {
                const route = routes.find(r => r.id === forecast.routeId);
                return (
                  <tr key={`${forecast.routeId}-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {route?.name || forecast.routeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(forecast.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {forecast.predictedDemand} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${forecast.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(forecast.confidence * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {forecast.factors.join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ForecastView;
