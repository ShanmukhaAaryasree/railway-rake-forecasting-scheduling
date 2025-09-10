import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Train, Edit, Trash2, Plus } from 'lucide-react';
import { Schedule, Rake, Route } from '../types';
import { format } from 'date-fns';

interface ScheduleViewProps {
  schedules: Schedule[];
  rakes: Rake[];
  routes: Route[];
  onScheduleUpdate: (schedules: Schedule[]) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ schedules, rakes, routes, onScheduleUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'departure' | 'arrival' | 'status'>('departure');

  const getStatusColor = (status: Schedule['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Route['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredSchedules = schedules
    .filter(schedule => selectedStatus === 'all' || schedule.status === selectedStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'departure':
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        case 'arrival':
          return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const handleStatusUpdate = (scheduleId: string, newStatus: Schedule['status']) => {
    const updatedSchedules = schedules.map(schedule =>
      schedule.id === scheduleId ? { ...schedule, status: newStatus } : schedule
    );
    onScheduleUpdate(updatedSchedules);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
    onScheduleUpdate(updatedSchedules);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Management</h2>
          <p className="text-gray-600">Manage and monitor railway rake schedules</p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'departure' | 'arrival' | 'status')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="departure">Departure Time</option>
              <option value="arrival">Arrival Time</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredSchedules.length} of {schedules.length} schedules
          </div>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="grid gap-4">
        {filteredSchedules.map(schedule => {
          const rake = rakes.find(r => r.id === schedule.rakeId);
          const route = routes.find(r => r.id === schedule.routeId);
          
          return (
            <div key={schedule.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Train className="h-6 w-6 text-primary-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{route?.name || 'Unknown Route'}</h3>
                    <p className="text-sm text-gray-600">Rake: {rake?.id || 'Unknown'} ({rake?.type})</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(route?.priority || 'medium')}`}>
                    {route?.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Departure */}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Departure</p>
                    <p className="font-medium">{format(new Date(schedule.departureTime), 'MMM dd, HH:mm')}</p>
                    <p className="text-xs text-gray-600">{route?.origin}</p>
                  </div>
                </div>

                {/* Arrival */}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Arrival</p>
                    <p className="font-medium">{format(new Date(schedule.arrivalTime), 'MMM dd, HH:mm')}</p>
                    <p className="text-xs text-gray-600">{route?.destination}</p>
                  </div>
                </div>

                {/* Cargo Info */}
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Cargo</p>
                    <p className="font-medium">{schedule.cargo?.type || 'N/A'}</p>
                    <p className="text-xs text-gray-600">
                      {schedule.cargo?.weight ? `${schedule.cargo.weight} tons` : 'No cargo data'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>
                    {schedule.status === 'completed' ? '100%' : 
                     schedule.status === 'in-progress' ? '60%' : 
                     schedule.status === 'scheduled' ? '0%' : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      schedule.status === 'completed' ? 'bg-green-500' :
                      schedule.status === 'in-progress' ? 'bg-blue-500' :
                      schedule.status === 'delayed' ? 'bg-red-500' :
                      'bg-gray-300'
                    }`}
                    style={{ 
                      width: schedule.status === 'completed' ? '100%' : 
                             schedule.status === 'in-progress' ? '60%' : 
                             '0%' 
                    }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {schedule.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusUpdate(schedule.id, 'in-progress')}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200"
                    >
                      Start Journey
                    </button>
                  )}
                  {schedule.status === 'in-progress' && (
                    <button
                      onClick={() => handleStatusUpdate(schedule.id, 'completed')}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200"
                    >
                      Mark Complete
                    </button>
                  )}
                  {(schedule.status === 'scheduled' || schedule.status === 'in-progress') && (
                    <button
                      onClick={() => handleStatusUpdate(schedule.id, 'delayed')}
                      className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md hover:bg-yellow-200"
                    >
                      Mark Delayed
                    </button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchedules.length === 0 && (
        <div className="text-center py-12">
          <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
          <p className="text-gray-600">
            {selectedStatus === 'all' 
              ? 'No schedules have been created yet.' 
              : `No schedules with status "${selectedStatus}" found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
