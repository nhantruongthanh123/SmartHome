import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  id: string;
  time: string;
  value: number;
}

interface SensorChartProps {
  data: ChartDataPoint[];
  title: string;
  color?: string;
}

export default function SensorChart({ data, title, color = '#3b82f6' }: SensorChartProps) {
  return (
    <div className="card-surface p-6 rounded-3xl flex flex-col gap-4 w-full h-[350px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="card-title text-lg font-bold">{title}</h3>
        <span className="chart-chip text-xs font-medium px-3 py-1 rounded-full">
          Real-time (20 points)
        </span>
      </div>

      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />

            <YAxis
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-soft)'
              }}
              labelStyle={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '4px' }}
              itemStyle={{ color: color, fontWeight: 'bold' }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={false} // Tắt các chấm tròn để nhìn mượt hơn
              activeDot={{ r: 6, strokeWidth: 0 }}
              isAnimationActive={false} // Tắt animation mặc định để trượt real-time mượt hơn
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}