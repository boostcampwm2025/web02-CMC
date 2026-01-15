export interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

export interface LegendPayload {
  value: string;
  color: string;
}

export interface ChartLegendProps {
  payload?: LegendPayload[];
  chartData: ChartData[];
}
