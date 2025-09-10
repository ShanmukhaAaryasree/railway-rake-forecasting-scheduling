import React, { useState } from 'react';
import { Train, Wrench, MapPin, Clock, AlertTriangle, CheckCircle, Edit, Plus } from 'lucide-react';
import { Rake, Schedule } from '../types';
import { format, differenceInHours } from 'date-fns';

interface RakeManagementProps {
  rakes: Rake[];
  schedules: Schedule[];
  onRakeUpdate: (rakes: Rake[]) => void;
}

const RakeManagement: React.FC<RakeManagementProps> = ({ rakes, schedules, onRakeUpdate }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'type' | 'capacity' | 'status' | 'maintenance'>('id');

  const getStatusIcon = (status: Rake['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-transit': return <Train className="h-5 w-5 text-blue-500" />;
      case 'maintenance': return <Wrench className="h-5 w-5 text-orange-500" />;
      case 'loading': return <Clock className="h-5 w-5 text-purple-500" />;
      case 'unloading': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Rake['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'loading': return 'bg-purple-100 text-purple-800';
      case 'unloading': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatus = (rake: Rake) => {
    const hoursUntilMaintenance = differenceInHours(new Date(rake.nextMaintenance), new Date());
    if (hoursUntilMaintenance <= 0) return { status: 'overdue', color: 'text-red-600', text: 'Overdue' };
    if (hoursUntilMaintenance <= 24) return { status: 'urgent', color: 'text-orange-600', text: 'Due Soon' };
    if (hoursUntilMaintenance <= 72) return { status: 'upcoming', color: 'text-yellow-600', text: 'Upcoming' };
    return { status: 'good', color: 'text-green-600', text: 'Good' };
  };

  const filteredRakes = rakes
    .filter(rake => selectedType === 'all' || rake.type === selectedType)
    .filter(rake => selectedStatus === 'all' || rake.status === selectedStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'id': return a.id.localeCompare(b.id);
        case 'type': return a.type.localeCompare(b.type);
        case 'capacity': return b.capacity - a.capacity;
        case 'status': return a.status.localeCompare(b.status);
        case 'maintenance': 
          return new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime();
        default: return 0;
      }
    });

  const handleStatusUpdate = (rakeId: string, newStatus: Rake['status']) => {
    const updatedRakes = rakes.map(rake =>
      rake.id === rakeId ? { ...rake, status: newStatus } : rake
    );
    onRakeUpdate(updatedRakes);
  };

  const handleMaintenanceUpdate = (rakeId: string) => {
    const updatedRakes = rakes.map(rake =>
      rake.id === rakeId ? { 
        ...rake, 
        status: 'available',
        lastMaintenance: new Date(),
        nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      } : rake
    );
    onRakeUpdate(updatedRakes);
  };

  const getRakeSchedules = (rakeId: string) => {
    return schedules.filter(s => s.rakeId === rakeId && (s.status === 'scheduled' || s.status === 'in-progress'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rake Management</h2>
          <p className="text-gray-600">Monitor and manage railway rake fleet</p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add New Rake
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(['available', 'in-transit', 'maintenance', 'loading', 'unloading'] as const).map(status => {
          const count = rakes.filter(r => r.status === status).length;
          return (
            <div key={status} className="card text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon(status)}
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{status.replace('-', ' ')}</p>
            </div>
          );
        })}
      </div>

      {/* Filters and Controls */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Types</option>
              <option value="freight">Freight</option>
              <option value="passenger">Passenger</option>
              <option value="express">Express</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="in-transit">In Transit</option>
              <option value="maintenance">Maintenance</option>
              <option value="loading">Loading</option>
              <option value="unloading">Unloading</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="id">Rake ID</option>
              <option value="type">Type</option>
              <option value="capacity">Capacity</option>
              <option value="status">Status</option>
              <option value="maintenance">Maintenance Due</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredRakes.length} of {rakes.length} rakes
          </div>
        </div>
      </div>

      {/* Rake Grid */}
      <div className="grid gap-4">
        {filteredRakes.map(rake => {
          const maintenanceStatus = getMaintenanceStatus(rake);
          const rakeSchedules = getRakeSchedules(rake.id);
          
          return (
            <div key={rake.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Train className="h-8 w-8 text-primary-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{rake.id}</h3>
                    <p className="text-sm text-gray-600 capitalize">{rake.type} Rake</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rake.status)}`}>
                    {rake.status.charAt(0).toUpperCase() + rake.status.slice(1).replace('-', ' ')}
                  </span>
                  <span className={`text-xs font-medium ${maintenanceStatus.color}`}>
                    {maintenanceStatus.text}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Capacity */}
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Train className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Capacity</p>
                    <p className="font-medium">{rake.capacity} tons</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Location</p>
                    <p className="font-medium">{rake.currentLocation}</p>
                  </div>
                </div>

                {/* Last Maintenance */}
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wrench className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Last Service</p>
                    <p className="font-medium">{format(new Date(rake.lastMaintenance), 'MMM dd')}</p>
                  </div>
                </div>

                {/* Next Maintenance */}
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${
                    maintenanceStatus.status === 'overdue' ? 'bg-red-100' :
                    maintenanceStatus.status === 'urgent' ? 'bg-orange-100' :
                    maintenanceStatus.status === 'upcoming' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    <Clock className={`h-4 w-4 ${
                      maintenanceStatus.status === 'overdue' ? 'text-red-600' :
                      maintenanceStatus.status === 'urgent' ? 'text-orange-600' :
                      maintenanceStatus.status === 'upcoming' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Next Service</p>
                    <p className="font-medium">{format(new Date(rake.nextMaintenance), 'MMM dd')}</p>
                  </div>
                </div>
              </div>

              {/* Active Schedules */}
              {rakeSchedules.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Active Schedules:</p>
                  <div className="space-y-1">
                    {rakeSchedules.slice(0, 2).map(schedule => (
                      <p key={schedule.id} className="text-xs text-blue-700">
                        {format(new Date(schedule.departureTime), 'MMM dd, HH:mm')} - 
                        {format(new Date(schedule.arrivalTime), 'MMM dd, HH:mm')}
                      </p>
                    ))}
                    {rakeSchedules.length > 2 && (
                      <p className="text-xs text-blue-600">+{rakeSchedules.length - 2} more</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {rake.status === 'maintenance' && (
                    <button
                      onClick={() => handleMaintenanceUpdate(rake.id)}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200"
                    >
                      Complete Maintenance
                    </button>
                  )}
                  {rake.status === 'available' && maintenanceStatus.status === 'overdue' && (
                    <button
                      onClick={() => handleStatusUpdate(rake.id, 'maintenance')}
                      className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-md hover:bg-orange-200"
                    >
                      Send to Maintenance
                    </button>
                  )}
                  {rake.status === 'loading' && (
                    <button
                      onClick={() => handleStatusUpdate(rake.id, 'in-transit')}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200"
                    >
                      Start Journey
                    </button>
                  )}
                  {rake.status === 'unloading' && (
                    <button
                      onClick={() => handleStatusUpdate(rake.id, 'available')}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200"
                    >
                      Mark Available
                    </button>
                  )}
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRakes.length === 0 && (
        <div className="text-center py-12">
          <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rakes found</h3>
          <p className="text-gray-600">
            No rakes match the current filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default RakeManagement;
