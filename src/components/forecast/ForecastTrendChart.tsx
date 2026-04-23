import { ReferenceLine, ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import type { ForecastDetailLinePoint } from '@/lib/forecastDetail';

interface ForecastTrendChartProps {
  data: ForecastDetailLinePoint[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ForecastTrendChart = ({ data }: ForecastTrendChartProps) => {
  const currentDay = data.find((point) => point.isCurrentDay);

  return (
    <div className="h-[19rem] min-[380px]:h-80">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
          <CartesianGrid stroke="rgba(138, 154, 104, 0.58)" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
            tickMargin={6}
            minTickGap={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            width={40}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => formatCurrency(Number(value))}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '16px',
              color: 'hsl(var(--popover-foreground))',
            }}
            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
            labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
          />
          <ReferenceLine y={0} stroke="hsl(var(--success))" strokeDasharray="6 4" />
          {currentDay ? <ReferenceLine x={currentDay.label} stroke="hsl(var(--foreground))" strokeDasharray="3 3" /> : null}
          <Line
            type="monotone"
            dataKey="actualBalance"
            stroke="#6FB7A1"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="projectedBalance"
            stroke="#D8E9E2"
            strokeWidth={2.5}
            strokeDasharray="7 5"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastTrendChart;
