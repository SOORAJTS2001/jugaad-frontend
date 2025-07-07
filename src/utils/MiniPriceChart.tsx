import { ChartContainer } from '@/components/ui/chart';
import { Line, LineChart } from 'recharts';

interface PriceData {
  price: number;
  timestamp: string;
}

interface MiniPriceChartProps {
  data: PriceData[];
  width?: number;
  height?: number;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "#059fea",
  },
};

export const MiniPriceChart = ({ data, width = 80, height = 32 }: MiniPriceChartProps) => {
  // Transform data for chart
  const chartData = data.map((item, index) => ({
    index,
    price: item.price,
  }));

  // Don't render if no data or insufficient data points
  if (!data || data.length < 2) {
    return (
      <div
        className="flex items-center justify-center bg-muted/20 rounded"
        style={{ width, height }}
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div style={{ width, height }}>
      <ChartContainer config={chartConfig} className="w-full h-full">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="price"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};
