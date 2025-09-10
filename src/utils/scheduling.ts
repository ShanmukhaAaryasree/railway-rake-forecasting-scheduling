import { Rake, Route, Schedule, DemandForecast } from '../types';
import { addHours, addDays, isAfter, isBefore } from 'date-fns';

export interface SchedulingConstraints {
  maxRakeUtilization: number;
  minMaintenanceInterval: number; // hours
  maxContinuousOperation: number; // hours
  priorityWeights: {
    high: number;
    medium: number;
    low: number;
  };
}

export class SchedulingEngine {
  private constraints: SchedulingConstraints;

  constructor(constraints: SchedulingConstraints = {
    maxRakeUtilization: 0.85,
    minMaintenanceInterval: 168, // 7 days
    maxContinuousOperation: 72, // 3 days
    priorityWeights: { high: 3, medium: 2, low: 1 }
  }) {
    this.constraints = constraints;
  }

  /**
   * Calculate rake availability considering maintenance and current schedules
   */
  calculateRakeAvailability(
    rake: Rake,
    existingSchedules: Schedule[],
    timeWindow: { start: Date; end: Date }
  ): { available: boolean; nextAvailable: Date; reason?: string } {
    // Check maintenance requirements
    const hoursSinceLastMaintenance = 
      (Date.now() - rake.lastMaintenance.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastMaintenance >= this.constraints.minMaintenanceInterval) {
      return {
        available: false,
        nextAvailable: addHours(new Date(), 24), // Assume 24h maintenance
        reason: 'Maintenance required'
      };
    }

    // Check current status
    if (rake.status === 'maintenance') {
      return {
        available: false,
        nextAvailable: rake.nextMaintenance,
        reason: 'Currently in maintenance'
      };
    }

    // Check existing schedules for conflicts
    const rakeSchedules = existingSchedules.filter(s => s.rakeId === rake.id);
    const conflictingSchedule = rakeSchedules.find(schedule => 
      (isBefore(schedule.departureTime, timeWindow.end) && 
       isAfter(schedule.arrivalTime, timeWindow.start))
    );

    if (conflictingSchedule) {
      return {
        available: false,
        nextAvailable: conflictingSchedule.arrivalTime,
        reason: 'Already scheduled'
      };
    }

    return { available: true, nextAvailable: timeWindow.start };
  }

  /**
   * Calculate priority score for a route based on demand and route priority
   */
  calculateRoutePriority(
    route: Route,
    demandForecast: DemandForecast
  ): number {
    const priorityWeight = this.constraints.priorityWeights[route.priority];
    const demandScore = demandForecast.predictedDemand * demandForecast.confidence;
    return priorityWeight * demandScore;
  }

  /**
   * Optimize rake assignment using a greedy algorithm with priority scoring
   */
  optimizeSchedule(
    rakes: Rake[],
    routes: Route[],
    demandForecasts: DemandForecast[],
    existingSchedules: Schedule[],
    schedulingPeriod: { start: Date; end: Date }
  ): Schedule[] {
    const newSchedules: Schedule[] = [];
    const availableRakes = [...rakes];

    // Create route-demand pairs and sort by priority
    const routeDemandPairs = routes.map(route => {
      const forecast = demandForecasts.find(f => f.routeId === route.id);
      return {
        route,
        forecast: forecast || {
          routeId: route.id,
          date: schedulingPeriod.start,
          predictedDemand: 0,
          confidence: 0.5,
          factors: []
        },
        priority: this.calculateRoutePriority(
          route,
          forecast || {
            routeId: route.id,
            date: schedulingPeriod.start,
            predictedDemand: 0,
            confidence: 0.5,
            factors: []
          }
        )
      };
    }).sort((a, b) => b.priority - a.priority);

    // Assign rakes to routes based on priority and availability
    for (const { route, forecast } in routeDemandPairs) {
      if (forecast.predictedDemand === 0) continue;

      const requiredRakes = Math.ceil(forecast.predictedDemand / 100); // Assume 100 units per rake
      let assignedRakes = 0;

      for (let i = 0; i < availableRakes.length && assignedRakes < requiredRakes; i++) {
        const rake = availableRakes[i];
        
        // Check if rake type is suitable for route
        if (!this.isRakeSuitableForRoute(rake, route)) continue;

        const departureTime = this.calculateOptimalDepartureTime(
          route,
          schedulingPeriod.start,
          existingSchedules
        );

        const arrivalTime = addHours(departureTime, route.estimatedTravelTime);

        const availability = this.calculateRakeAvailability(
          rake,
          [...existingSchedules, ...newSchedules],
          { start: departureTime, end: arrivalTime }
        );

        if (availability.available) {
          const schedule: Schedule = {
            id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            rakeId: rake.id,
            routeId: route.id,
            departureTime,
            arrivalTime,
            status: 'scheduled',
            cargo: {
              type: 'general',
              weight: Math.min(rake.capacity, forecast.predictedDemand * 10),
              value: forecast.predictedDemand * 1000
            }
          };

          newSchedules.push(schedule);
          assignedRakes++;
        }
      }
    }

    return newSchedules;
  }

  /**
   * Check if a rake is suitable for a specific route
   */
  private isRakeSuitableForRoute(rake: Rake, route: Route): boolean {
    // Express routes need express or passenger rakes
    if (route.priority === 'high' && rake.type === 'freight') {
      return false;
    }

    // Check capacity requirements based on route distance
    const minCapacityRequired = route.distance > 500 ? 200 : 100;
    return rake.capacity >= minCapacityRequired;
  }

  /**
   * Calculate optimal departure time considering traffic and constraints
   */
  private calculateOptimalDepartureTime(
    route: Route,
    earliestTime: Date,
    existingSchedules: Schedule[]
  ): Date {
    // Find the least congested time slot
    const timeSlots = [];
    let currentTime = new Date(earliestTime);
    const endTime = addDays(earliestTime, 1);

    while (isBefore(currentTime, endTime)) {
      const conflictCount = existingSchedules.filter(schedule =>
        Math.abs(schedule.departureTime.getTime() - currentTime.getTime()) < 2 * 60 * 60 * 1000 // 2 hours
      ).length;

      timeSlots.push({ time: new Date(currentTime), conflicts: conflictCount });
      currentTime = addHours(currentTime, 1);
    }

    // Return the time slot with minimum conflicts
    const optimalSlot = timeSlots.reduce((min, slot) =>
      slot.conflicts < min.conflicts ? slot : min
    );

    return optimalSlot.time;
  }

  /**
   * Reschedule existing schedules to accommodate high-priority routes
   */
  rescheduleForPriority(
    existingSchedules: Schedule[],
    newPriorityRoute: Route,
    rakes: Rake[]
  ): { updatedSchedules: Schedule[]; rescheduledCount: number } {
    const updatedSchedules = [...existingSchedules];
    let rescheduledCount = 0;

    // Find schedules that can be rescheduled
    const reschedulableSchedules = updatedSchedules.filter(schedule =>
      schedule.status === 'scheduled' && 
      isAfter(schedule.departureTime, addHours(new Date(), 2)) // At least 2 hours notice
    );

    // Sort by priority (lowest first for potential rescheduling)
    const sortedSchedules = reschedulableSchedules.sort((a, b) => {
      const routeA = { priority: 'medium' }; // Simplified - would lookup actual route
      const routeB = { priority: 'medium' };
      return this.constraints.priorityWeights[routeA.priority as keyof typeof this.constraints.priorityWeights] - 
             this.constraints.priorityWeights[routeB.priority as keyof typeof this.constraints.priorityWeights];
    });

    // Attempt to reschedule lower priority items
    for (const schedule of sortedSchedules) {
      if (rescheduledCount >= 3) break; // Limit rescheduling impact

      const newDepartureTime = addHours(schedule.departureTime, 4);
      const newArrivalTime = addHours(schedule.arrivalTime, 4);

      // Check if new time doesn't conflict
      const hasConflict = updatedSchedules.some(s =>
        s.id !== schedule.id &&
        s.rakeId === schedule.rakeId &&
        (isBefore(newDepartureTime, s.arrivalTime) && isAfter(newArrivalTime, s.departureTime))
      );

      if (!hasConflict) {
        schedule.departureTime = newDepartureTime;
        schedule.arrivalTime = newArrivalTime;
        rescheduledCount++;
      }
    }

    return { updatedSchedules, rescheduledCount };
  }

  /**
   * Generate performance metrics for the current schedule
   */
  calculateScheduleMetrics(
    schedules: Schedule[],
    rakes: Rake[]
  ): {
    utilizationRate: number;
    onTimePerformance: number;
    totalScheduledRakes: number;
    averageRouteTime: number;
  } {
    const totalRakes = rakes.length;
    const scheduledRakes = new Set(schedules.map(s => s.rakeId)).size;
    const utilizationRate = scheduledRakes / totalRakes;

    const completedSchedules = schedules.filter(s => s.status === 'completed');
    const onTimeSchedules = completedSchedules.filter(s => 
      // Simplified - would compare actual vs scheduled arrival
      Math.random() > 0.2 // 80% on-time rate simulation
    );
    const onTimePerformance = completedSchedules.length > 0 ? 
      onTimeSchedules.length / completedSchedules.length : 1;

    const totalRouteTime = schedules.reduce((sum, schedule) =>
      sum + (schedule.arrivalTime.getTime() - schedule.departureTime.getTime()), 0
    );
    const averageRouteTime = schedules.length > 0 ? 
      totalRouteTime / (schedules.length * 1000 * 60 * 60) : 0; // Convert to hours

    return {
      utilizationRate,
      onTimePerformance,
      totalScheduledRakes: scheduledRakes,
      averageRouteTime
    };
  }
}
