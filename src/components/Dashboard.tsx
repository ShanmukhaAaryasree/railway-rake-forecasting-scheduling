import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Train, Clock, AlertTriangle, TrendingUp, MapPin, Activity } from 'lucide-react';
import { Rake, Route, Schedule, DemandForecast } from '../types';
import { SchedulingEngine } from '../utils/scheduling';

interface DashboardProps {
  rakes: Rake[];
  routes: Route[];
  schedules: Schedule[];
  forecasts: DemandForecast[];
}

const Dashboard: React.FC<DashboardProps> = ({ rakes, routes, schedules, forecasts }) => {
  const schedulingEngine = new SchedulingEngine();
  const metrics = schedulingEngine.calculateScheduleMetrics(schedules, rakes);

  // Calculate status distribution
  const rakeStatusData = [
    { name: 'Available', value: rakes.filter(r => r.status === 'available').length, color: '#10b981' },
    { name: 'In Transit', value: rakes.filter(r => r.status === 'in-transit').length, color: '#3b82f6' },
    { name: 'Maintenance', value: rakes.filter(r => r.status === 'maintenance').length, color: '#f59e0b' },
    { name: 'Loading', value: rakes.filter(r => r.status === 'loading').length, color: '#8b5cf6' },
    { name: 'Unloading', value: rakes.filter(r => r.status === 'unloading').length, color: '#ef4444' }
  ];

  // Forecast data for chart
  const forecastChartData = forecasts.map(f => ({
    route: routes.find(r => r.id === f.routeId)?.name.split(' ')[0] || f.routeId,
    demand: f.predictedDemand,
    confidence: Math.round(f.confidence * 100)
  }));

  // Schedule status data
  const scheduleStatusData = [
    { name: 'Scheduled', count: schedules.filter(s => s.status === 'scheduled').length },
    { name: 'In Progress', count: schedules.filter(s => s.status === 'in-progress').length },
    { name: 'Completed', count: schedules.filter(s => s.status === 'completed').length },
    { name: 'Delayed', count: schedules.filter(s => s.status === 'delayed').length }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    color?: string;
  }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {trend && (
            <p className="text-sm text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Railway Operations Dashboard</h2>
        <p className="text-gray-600">Real-time overview of rake scheduling and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Rakes"
          value={rakes.length}
          icon={Train}
          trend={`${rakes.filter(r => r.status === 'available').length} available`}
          color="blue"
        />
        <StatCard
          title="Active Schedules"
          value={schedules.filter(s => s.status === 'scheduled' || s.status === 'in-progress').length}
          icon={Clock}
          trend={`${Math.round(metrics.onTimePerformance * 100)}% on-time`}
          color="green"
        />
        <StatCard
          title="Utilization Rate"
          value={`${Math.round(metrics.utilizationRate * 100)}%`}
          icon={Activity}
          trend="Target: 85%"
          color="purple"
        />
        <StatCard
          title="Maintenance Due"
          value={rakes.filter(r => new Date(r.nextMaintenance) <= new Date(Date.now() + 24 * 60 * 60 * 1000)).length}
          icon={AlertTriangle}
          trend="Next 24 hours"
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand Forecast Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecastChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="route" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="demand" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rake Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rake Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rakeStatusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {rakeStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Schedule Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={scheduleStatusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Alerts</h3>
          <div className="space-y-3">
            {rakes
              .filter(r => r.status === 'maintenance' || new Date(r.nextMaintenance) <= new Date(Date.now() + 24 * 60 * 60 * 1000))
              .slice(0, 5)
              .map(rake => (
                <div key={rake.id} className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Rake {rake.id} - {rake.status === 'maintenance' ? 'In Maintenance' : 'Maintenance Due'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Location: {rake.currentLocation} | Type: {rake.type}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* High Priority Routes */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">High Priority Routes</h3>
          <div className="space-y-3">
            {routes
              .filter(r => r.priority === 'high')
              .map(route => {
                const forecast = forecasts.find(f => f.routeId === route.id);
                return (
                  <div key={route.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{route.name}</p>
                        <p className="text-xs text-gray-600">
                          {route.origin} → {route.destination}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">
                        {forecast?.predictedDemand || 0} units
                      </p>
                      <p className="text-xs text-gray-600">
                        {Math.round((forecast?.confidence || 0) * 100)}% confidence
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
