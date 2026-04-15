export interface ChartDataPoint {
  id: string;
  time: string;
  value: number;
}

export interface SensorData {
  value: number;
  lastUpdated: Date | null;
}
