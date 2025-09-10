# Railway Rake Forecasting and Scheduling System - Datasets

This folder contains all the datasets used in the Railway Rake Forecasting and Scheduling System in CSV format, which can be easily opened in Microsoft Excel.

## Files Included:

### 1. railway_stations.csv
Contains information about railway stations including:
- Station ID, Name, and Code
- Geographic coordinates (Latitude, Longitude)
- Station capacity and available facilities

### 2. railway_rakes.csv
Contains railway rake fleet information including:
- Rake ID, type (freight/passenger/express), and capacity
- Current location and operational status
- Maintenance schedule information

### 3. railway_routes.csv
Contains route information including:
- Route ID, name, origin, and destination stations
- Distance in kilometers and estimated travel time
- Route priority levels (high/medium/low)

### 4. railway_schedules.csv
Contains active and completed schedules including:
- Schedule ID, assigned rake, and route
- Departure and arrival times
- Cargo information (type, weight, value)
- Current status

### 5. historical_demand_data.csv
Contains 30 days of historical demand data for all routes:
- Daily demand values for each route
- Used for AI-powered demand forecasting
- Supports trend analysis and seasonal pattern detection

## Usage:
1. Open any CSV file in Microsoft Excel
2. Use Excel's data analysis tools for further processing
3. Create charts and pivot tables for visualization
4. Export to other formats as needed

## Data Structure:
All files use comma-separated values (CSV) format with headers in the first row for easy import into Excel or other data analysis tools.
