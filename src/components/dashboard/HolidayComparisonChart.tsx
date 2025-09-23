import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface HolidayComparisonChartProps {
  data: Array<{
    name: string;
    consumption: number;
    count: number;
  }>;
  title: string;
  description?: string;
}

export function HolidayComparisonChart({
  data,
  title,
  description,
}: HolidayComparisonChartProps) {
  const isMobile = useIsMobile();

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            Average Consumption: {payload[0].value?.toLocaleString()} GWh
          </p>
          <p className="text-xs text-muted-foreground">
            Based on {data.count} days
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 20,
                left: isMobile ? 5 : 30,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.3}
                vertical={false}
              />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                tick={{ fontSize: 12 }}
                width={isMobile ? 40 : 60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="consumption"
                name="Avg. Consumption (GWh)"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
