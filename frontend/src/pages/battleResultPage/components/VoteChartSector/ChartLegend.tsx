import type { ChartLegendProps } from './chart.types';

export default function ChartLegend({ payload, chartData }: ChartLegendProps) {
  if (!payload) return null;

  return (
    <div className="flex flex-col gap-3">
      {payload.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex items-center h-[40px] justify-between px-6 py-4 bg-slate-700/50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white text-base">{entry.value}</span>
          </div>
          <span className="text-white font-bold text-lg">{chartData[index].value}표</span>
        </div>
      ))}
    </div>
  );
}
