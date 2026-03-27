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
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 w-full h-[350px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          Real-time (20 points)
        </span>
      </div>

      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />
            
            <YAxis 
              domain={['dataMin - 1', 'dataMax + 1']} // Tự động zoom biểu đồ theo biên độ nhiệt
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}`}
            />
            
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
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