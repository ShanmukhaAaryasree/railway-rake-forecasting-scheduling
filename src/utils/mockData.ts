import { Rake, Route, Schedule, Station } from '../types';
import { addHours, addDays, subDays } from 'date-fns';

export function generateMockData() {
  const stations: Station[] = [
    {
      id: 'stn_001',
      name: 'New Delhi Railway Station',
      code: 'NDLS',
      location: { lat: 28.6428, lng: 77.2197 },
      capacity: 16,
      facilities: ['Maintenance', 'Refueling', 'Loading']
    },
    {
      id: 'stn_002',
      name: 'Mumbai Central',
      code: 'BCT',
      location: { lat: 18.9690, lng: 72.8205 },
      capacity: 12,
      facilities: ['Maintenance', 'Loading', 'Passenger']
    },
    {
      id: 'stn_003',
      name: 'Chennai Central',
      code: 'MAS',
      location: { lat: 13.0827, lng: 80.2707 },
      capacity: 10,
      facilities: ['Refueling', 'Loading']
    },
    {
      id: 'stn_004',
      name: 'Kolkata Howrah',
      code: 'HWH',
      location: { lat: 22.5726, lng: 88.3639 },
      capacity: 14,
      facilities: ['Maintenance', 'Refueling', 'Loading', 'Passenger']
    },
    {
      id: 'stn_005',
      name: 'Bangalore City',
      code: 'SBC',
      location: { lat: 12.9716, lng: 77.5946 },
      capacity: 8,
      facilities: ['Loading', 'Passenger']
    }
  ];

  const rakes: Rake[] = [
    {
      id: 'rake_001',
      type: 'freight',
      capacity: 500,
      currentLocation: 'NDLS',
      status: 'available',
      lastMaintenance: subDays(new Date(), 5),
      nextMaintenance: addDays(new Date(), 2)
    },
    {
      id: 'rake_002',
      type: 'passenger',
      capacity: 300,
      currentLocation: 'BCT',
      status: 'in-transit',
      lastMaintenance: subDays(new Date(), 3),
      nextMaintenance: addDays(new Date(), 4)
    },
    {
      id: 'rake_003',
      type: 'express',
      capacity: 400,
      currentLocation: 'MAS',
      status: 'available',
      lastMaintenance: subDays(new Date(), 1),
      nextMaintenance: addDays(new Date(), 6)
    },
    {
      id: 'rake_004',
      type: 'freight',
      capacity: 600,
      currentLocation: 'HWH',
      status: 'loading',
      lastMaintenance: subDays(new Date(), 7),
      nextMaintenance: addDays(new Date(), 0)
    },
    {
      id: 'rake_005',
      type: 'passenger',
      capacity: 350,
      currentLocation: 'SBC',
      status: 'available',
      lastMaintenance: subDays(new Date(), 2),
      nextMaintenance: addDays(new Date(), 5)
    },
    {
      id: 'rake_006',
      type: 'express',
      capacity: 450,
      currentLocation: 'NDLS',
      status: 'maintenance',
      lastMaintenance: new Date(),
      nextMaintenance: addHours(new Date(), 6)
    },
    {
      id: 'rake_007',
      type: 'freight',
      capacity: 550,
      currentLocation: 'BCT',
      status: 'available',
      lastMaintenance: subDays(new Date(), 4),
      nextMaintenance: addDays(new Date(), 3)
    },
    {
      id: 'rake_008',
      type: 'passenger',
      capacity: 320,
      currentLocation: 'MAS',
      status: 'unloading',
      lastMaintenance: subDays(new Date(), 6),
      nextMaintenance: addDays(new Date(), 1)
    }
  ];

  const routes: Route[] = [
    {
      id: 'route_001',
      name: 'Delhi-Mumbai Express',
      origin: 'NDLS',
      destination: 'BCT',
      distance: 1384,
      estimatedTravelTime: 16,
      priority: 'high'
    },
    {
      id: 'route_002',
      name: 'Mumbai-Chennai Freight',
      origin: 'BCT',
      destination: 'MAS',
      distance: 1279,
      estimatedTravelTime: 20,
      priority: 'medium'
    },
    {
      id: 'route_003',
      name: 'Chennai-Kolkata Express',
      origin: 'MAS',
      destination: 'HWH',
      distance: 1663,
      estimatedTravelTime: 24,
      priority: 'high'
    },
    {
      id: 'route_004',
      name: 'Kolkata-Bangalore Passenger',
      origin: 'HWH',
      destination: 'SBC',
      distance: 1871,
      estimatedTravelTime: 28,
      priority: 'low'
    },
    {
      id: 'route_005',
      name: 'Bangalore-Delhi Circuit',
      origin: 'SBC',
      destination: 'NDLS',
      distance: 2146,
      estimatedTravelTime: 32,
      priority: 'medium'
    },
    {
      id: 'route_006',
      name: 'Delhi-Chennai Direct',
      origin: 'NDLS',
      destination: 'MAS',
      distance: 2180,
      estimatedTravelTime: 30,
      priority: 'high'
    }
  ];

  const schedules: Schedule[] = [
    {
      id: 'schedule_001',
      rakeId: 'rake_002',
      routeId: 'route_001',
      departureTime: addHours(new Date(), 2),
      arrivalTime: addHours(new Date(), 18),
      status: 'scheduled',
      cargo: {
        type: 'passengers',
        weight: 250,
        value: 125000
      }
    },
    {
      id: 'schedule_002',
      rakeId: 'rake_004',
      routeId: 'route_002',
      departureTime: addHours(new Date(), 6),
      arrivalTime: addHours(new Date(), 26),
      status: 'in-progress',
      cargo: {
        type: 'coal',
        weight: 480,
        value: 240000
      }
    },
    {
      id: 'schedule_003',
      rakeId: 'rake_003',
      routeId: 'route_003',
      departureTime: addHours(new Date(), 12),
      arrivalTime: addHours(new Date(), 36),
      status: 'scheduled',
      cargo: {
        type: 'express_cargo',
        weight: 320,
        value: 480000
      }
    },
    {
      id: 'schedule_004',
      rakeId: 'rake_001',
      routeId: 'route_005',
      departureTime: subHours(new Date(), 4),
      arrivalTime: addHours(new Date(), 28),
      status: 'completed',
      cargo: {
        type: 'steel',
        weight: 450,
        value: 675000
      }
    }
  ];

  // Historical demand data for forecasting (last 30 days)
  const historicalDemand: Record<string, number[]> = {
    route_001: [85, 92, 78, 95, 88, 102, 96, 89, 94, 87, 99, 91, 86, 98, 93, 88, 97, 84, 90, 95, 89, 92, 87, 94, 91, 96, 88, 93, 89, 97],
    route_002: [65, 72, 58, 75, 68, 82, 76, 69, 74, 67, 79, 71, 66, 78, 73, 68, 77, 64, 70, 75, 69, 72, 67, 74, 71, 76, 68, 73, 69, 77],
    route_003: [95, 102, 88, 105, 98, 112, 106, 99, 104, 97, 109, 101, 96, 108, 103, 98, 107, 94, 100, 105, 99, 102, 97, 104, 101, 106, 98, 103, 99, 107],
    route_004: [45, 52, 38, 55, 48, 62, 56, 49, 54, 47, 59, 51, 46, 58, 53, 48, 57, 44, 50, 55, 49, 52, 47, 54, 51, 56, 48, 53, 49, 57],
    route_005: [75, 82, 68, 85, 78, 92, 86, 79, 84, 77, 89, 81, 76, 88, 83, 78, 87, 74, 80, 85, 79, 82, 77, 84, 81, 86, 78, 83, 79, 87],
    route_006: [105, 112, 98, 115, 108, 122, 116, 109, 114, 107, 119, 111, 106, 118, 113, 108, 117, 104, 110, 115, 109, 112, 107, 114, 111, 116, 108, 113, 109, 117]
  };

  return {
    stations,
    rakes,
    routes,
    schedules,
    historicalDemand
  };
}

function subHours(date: Date, hours: number): Date {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}
