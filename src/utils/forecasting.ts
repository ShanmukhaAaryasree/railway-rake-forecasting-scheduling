import { DemandForecast, Schedule } from '../types';

export class ForecastingEngine {
  /**
   * Simple Moving Average forecasting
   */
  static simpleMovingAverage(data: number[], window: number): number {
    if (data.length < window) return data[data.length - 1] || 0;
    
    const slice = data.slice(-window);
    return slice.reduce((sum, val) => sum + val, 0) / window;
  }

  /**
   * Exponential Smoothing forecasting
   */
  static exponentialSmoothing(data: number[], alpha: number = 0.3): number {
    if (data.length === 0) return 0;
    if (data.length === 1) return data[0];

    let forecast = data[0];
    for (let i = 1; i < data.length; i++) {
      forecast = alpha * data[i] + (1 - alpha) * forecast;
    }
    return forecast;
  }

  /**
   * Linear Trend forecasting
   */
  static linearTrend(data: number[], periods: number = 1): number {
    if (data.length < 2) return data[0] || 0;

    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = data;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * (n + periods) + intercept;
  }

  /**
   * Seasonal decomposition and forecasting
   */
  static seasonalForecast(
    data: number[],
    seasonLength: number = 7,
    periods: number = 1
  ): number {
    if (data.length < seasonLength * 2) {
      return this.exponentialSmoothing(data);
    }

    // Calculate seasonal indices
    const seasons = Math.floor(data.length / seasonLength);
    const seasonalSums = new Array(seasonLength).fill(0);
    const seasonalCounts = new Array(seasonLength).fill(0);

    for (let i = 0; i < data.length; i++) {
      const seasonIndex = i % seasonLength;
      seasonalSums[seasonIndex] += data[i];
      seasonalCounts[seasonIndex]++;
    }

    const seasonalAverages = seasonalSums.map(
      (sum, i) => sum / seasonalCounts[i]
    );
    const overallAverage = data.reduce((sum, val) => sum + val, 0) / data.length;
    const seasonalIndices = seasonalAverages.map(avg => avg / overallAverage);

    // Deseasonalize data
    const deseasonalized = data.map(
      (val, i) => val / seasonalIndices[i % seasonLength]
    );

    // Forecast trend
    const trendForecast = this.linearTrend(deseasonalized, periods);

    // Apply seasonal adjustment
    const seasonIndex = (data.length + periods - 1) % seasonLength;
    return trendForecast * seasonalIndices[seasonIndex];
  }

  /**
   * Generate demand forecast for a route
   */
  static generateDemandForecast(
    routeId: string,
    historicalData: number[],
    targetDate: Date,
    factors: string[] = []
  ): DemandForecast {
    // Use multiple forecasting methods and combine them
    const smaForecast = this.simpleMovingAverage(historicalData, 7);
    const esForecast = this.exponentialSmoothing(historicalData, 0.3);
    const trendForecast = this.linearTrend(historicalData, 1);
    const seasonalForecast = this.seasonalForecast(historicalData, 7, 1);

    // Weighted combination of forecasts
    const combinedForecast = 
      0.2 * smaForecast +
      0.3 * esForecast +
      0.25 * trendForecast +
      0.25 * seasonalForecast;

    // Calculate confidence based on historical variance
    const mean = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
    const variance = historicalData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalData.length;
    const standardDeviation = Math.sqrt(variance);
    const confidence = Math.max(0.5, 1 - (standardDeviation / mean));

    return {
      routeId,
      date: targetDate,
      predictedDemand: Math.max(0, Math.round(combinedForecast)),
      confidence: Math.min(1, confidence),
      factors
    };
  }

  /**
   * Batch forecast for multiple routes
   */
  static batchForecast(
    routeData: { routeId: string; historicalData: number[]; factors?: string[] }[],
    targetDate: Date
  ): DemandForecast[] {
    return routeData.map(({ routeId, historicalData, factors = [] }) =>
      this.generateDemandForecast(routeId, historicalData, targetDate, factors)
    );
  }
}
