import React from 'react';
import { Download, FileText, Database } from 'lucide-react';
import { CSVExporter } from '../utils/csvExport';
import { Rake, Route, Schedule, Station, DemandForecast } from '../types';

interface DataExportProps {
  stations: Station[];
  rakes: Rake[];
  routes: Route[];
  schedules: Schedule[];
  historicalDemand: Record<string, number[]>;
  forecasts: DemandForecast[];
}

const DataExport: React.FC<DataExportProps> = ({
  stations,
  rakes,
  routes,
  schedules,
  historicalDemand,
  forecasts
}) => {
  const exportButtons = [
    {
      label: 'Railway Stations',
      description: 'Station details, locations, and facilities',
      onClick: () => CSVExporter.exportStations(stations),
      icon: FileText,
      count: stations.length
    },
    {
      label: 'Railway Rakes',
      description: 'Rake fleet information and maintenance data',
      onClick: () => CSVExporter.exportRakes(rakes),
      icon: FileText,
      count: rakes.length
    },
    {
      label: 'Railway Routes',
      description: 'Route details, distances, and priorities',
      onClick: () => CSVExporter.exportRoutes(routes),
      icon: FileText,
      count: routes.length
    },
    {
      label: 'Schedules',
      description: 'Active and completed schedules with cargo info',
      onClick: () => CSVExporter.exportSchedules(schedules),
      icon: FileText,
      count: schedules.length
    },
    {
      label: 'Historical Demand',
      description: '30 days of demand data for forecasting',
      onClick: () => CSVExporter.exportHistoricalDemand(historicalDemand, routes),
      icon: FileText,
      count: Object.keys(historicalDemand).length
    },
    {
      label: 'Demand Forecasts',
      description: 'AI-generated demand predictions',
      onClick: () => CSVExporter.exportForecasts(forecasts, routes),
      icon: FileText,
      count: forecasts.length
    }
  ];

  const handleExportAll = () => {
    CSVExporter.exportAllData({
      stations,
      rakes,
      routes,
      schedules,
      historicalDemand,
      forecasts
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Export</h2>
          <p className="text-gray-600">Download datasets in CSV format for Excel analysis</p>
        </div>
        <button
          onClick={handleExportAll}
          className="btn-primary flex items-center"
        >
          <Database className="h-4 w-4 mr-2" />
          Export All Data
        </button>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportButtons.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.label}</h3>
                    <p className="text-sm text-gray-600">{item.count} records</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              
              <button
                onClick={item.onClick}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </button>
            </div>
          );
        })}
      </div>

      {/* Usage Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How to Use Downloaded Files</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Open CSV files directly in Microsoft Excel or Google Sheets</li>
              <li>• Use Excel's Data Analysis tools for advanced analytics</li>
              <li>• Create pivot tables and charts for visualization</li>
              <li>• Import into other data analysis tools like Power BI or Tableau</li>
              <li>• All files include proper headers for easy data manipulation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
