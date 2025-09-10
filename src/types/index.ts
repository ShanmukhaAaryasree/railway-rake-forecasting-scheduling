export interface Rake {
  id: string;
  type: 'freight' | 'passenger' | 'express';
  capacity: number;
  currentLocation: string;
  status: 'available' | 'in-transit' | 'maintenance' | 'loading' | 'unloading';
  lastMaintenance: Date;
  nextMaintenance: Date;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTravelTime: number; // in hours
  priority: 'high' | 'medium' | 'low';
}

export interface Schedule {
  id: string;
  rakeId: string;
  routeId: string;
  departureTime: Date;
  arrivalTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  cargo?: {
    type: string;
    weight: number;
    value: number;
  };
}

export interface DemandForecast {
  routeId: string;
  date: Date;
  predictedDemand: number;
  confidence: number;
  factors: string[];
}

export interface Station {
  id: string;
  name: string;
  code: string;
  location: {
    lat: number;
    lng: number;
  };
  capacity: number;
  facilities: string[];
}

export interface PerformanceMetrics {
  onTimePerformance: number;
  utilizationRate: number;
  averageDelay: number;
  totalRevenue: number;
  costEfficiency: number;
}
