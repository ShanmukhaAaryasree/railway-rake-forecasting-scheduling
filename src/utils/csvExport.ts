import { Rake, Route, Schedule, Station, DemandForecast } from '../types';
import { format } from 'date-fns';

export class CSVExporter {
  static downloadCSV(filename: string, csvContent: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportStations(stations: Station[]): void {
    const headers = 'Station_ID,Station_Name,Station_Code,Latitude,Longitude,Capacity,Facilities\n';
    const rows = stations.map(station => 
      `${station.id},${station.name},${station.code},${station.location.lat},${station.location.lng},${station.capacity},"${station.facilities.join(', ')}"`
    ).join('\n');
    
    this.downloadCSV('railway_stations.csv', headers + rows);
  }

  static exportRakes(rakes: Rake[]): void {
    const headers = 'Rake_ID,Type,Capacity_Tons,Current_Location,Status,Last_Maintenance,Next_Maintenance\n';
    const rows = rakes.map(rake => 
      `${rake.id},${rake.type},${rake.capacity},${rake.currentLocation},${rake.status},${format(new Date(rake.lastMaintenance), 'yyyy-MM-dd')},${format(new Date(rake.nextMaintenance), 'yyyy-MM-dd')}`
    ).join('\n');
    
    this.downloadCSV('railway_rakes.csv', headers + rows);
  }

  static exportRoutes(routes: Route[]): void {
    const headers = 'Route_ID,Route_Name,Origin,Destination,Distance_KM,Travel_Time_Hours,Priority\n';
    const rows = routes.map(route => 
      `${route.id},"${route.name}",${route.origin},${route.destination},${route.distance},${route.estimatedTravelTime},${route.priority}`
    ).join('\n');
    
    this.downloadCSV('railway_routes.csv', headers + rows);
  }

  static exportSchedules(schedules: Schedule[]): void {
    const headers = 'Schedule_ID,Rake_ID,Route_ID,Departure_Time,Arrival_Time,Status,Cargo_Type,Cargo_Weight_Tons,Cargo_Value_USD\n';
    const rows = schedules.map(schedule => 
      `${schedule.id},${schedule.rakeId},${schedule.routeId},${format(new Date(schedule.departureTime), 'yyyy-MM-dd HH:mm')},${format(new Date(schedule.arrivalTime), 'yyyy-MM-dd HH:mm')},${schedule.status},${schedule.cargo?.type || 'N/A'},${schedule.cargo?.weight || 0},${schedule.cargo?.value || 0}`
    ).join('\n');
    
    this.downloadCSV('railway_schedules.csv', headers + rows);
  }

  static exportHistoricalDemand(historicalDemand: Record<string, number[]>, routes: Route[]): void {
    const headers = 'Day,' + routes.map(route => `Route_${route.id.split('_')[1]}_${route.name.replace(/[^a-zA-Z]/g, '_')}`).join(',') + '\n';
    
    const maxDays = Math.max(...Object.values(historicalDemand).map(data => data.length));
    const rows: string[] = [];
    
    for (let day = 0; day < maxDays; day++) {
      const row: (string | number)[] = [day + 1];
      routes.forEach(route => {
        const demandData = historicalDemand[route.id] || [];
        row.push(demandData[day] || 0);
      });
      rows.push(row.join(','));
    }
    
    this.downloadCSV('historical_demand_data.csv', headers + rows.join('\n'));
  }

  static exportForecasts(forecasts: DemandForecast[], routes: Route[]): void {
    const headers = 'Route_ID,Route_Name,Date,Predicted_Demand,Confidence_Percent,Factors\n';
    const rows = forecasts.map(forecast => {
      const route = routes.find(r => r.id === forecast.routeId);
      return `${forecast.routeId},"${route?.name || 'Unknown'}",${format(new Date(forecast.date), 'yyyy-MM-dd')},${forecast.predictedDemand},${Math.round(forecast.confidence * 100)},"${forecast.factors.join(', ')}"`;
    }).join('\n');
    
    this.downloadCSV('demand_forecasts.csv', headers + rows);
  }

  static exportAllData(data: {
    stations: Station[];
    rakes: Rake[];
    routes: Route[];
    schedules: Schedule[];
    historicalDemand: Record<string, number[]>;
    forecasts: DemandForecast[];
  }): void {
    // Create a comprehensive dataset
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    
    let allData = '# Railway Rake Forecasting and Scheduling System - Complete Dataset\n';
    allData += `# Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
    
    // Stations
    allData += '## STATIONS\n';
    allData += 'Station_ID,Station_Name,Station_Code,Latitude,Longitude,Capacity,Facilities\n';
    allData += data.stations.map(station => 
      `${station.id},${station.name},${station.code},${station.location.lat},${station.location.lng},${station.capacity},"${station.facilities.join(', ')}"`
    ).join('\n') + '\n\n';
    
    // Rakes
    allData += '## RAKES\n';
    allData += 'Rake_ID,Type,Capacity_Tons,Current_Location,Status,Last_Maintenance,Next_Maintenance\n';
    allData += data.rakes.map(rake => 
      `${rake.id},${rake.type},${rake.capacity},${rake.currentLocation},${rake.status},${format(new Date(rake.lastMaintenance), 'yyyy-MM-dd')},${format(new Date(rake.nextMaintenance), 'yyyy-MM-dd')}`
    ).join('\n') + '\n\n';
    
    // Routes
    allData += '## ROUTES\n';
    allData += 'Route_ID,Route_Name,Origin,Destination,Distance_KM,Travel_Time_Hours,Priority\n';
    allData += data.routes.map(route => 
      `${route.id},"${route.name}",${route.origin},${route.destination},${route.distance},${route.estimatedTravelTime},${route.priority}`
    ).join('\n') + '\n\n';
    
    // Schedules
    allData += '## SCHEDULES\n';
    allData += 'Schedule_ID,Rake_ID,Route_ID,Departure_Time,Arrival_Time,Status,Cargo_Type,Cargo_Weight_Tons,Cargo_Value_USD\n';
    allData += data.schedules.map(schedule => 
      `${schedule.id},${schedule.rakeId},${schedule.routeId},${format(new Date(schedule.departureTime), 'yyyy-MM-dd HH:mm')},${format(new Date(schedule.arrivalTime), 'yyyy-MM-dd HH:mm')},${schedule.status},${schedule.cargo?.type || 'N/A'},${schedule.cargo?.weight || 0},${schedule.cargo?.value || 0}`
    ).join('\n') + '\n\n';
    
    this.downloadCSV(`railway_complete_dataset_${timestamp}.csv`, allData);
  }
}
