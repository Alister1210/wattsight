import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface TemperatureConsumptionChartProps {
  data: Array<{
    date: string;
    temperature: number;
    consumption: number;
  }>;
  title: string;
  description?: string;
}

export function TemperatureConsumptionChart({
  data,
  title,
  description,
}: TemperatureConsumptionChartProps) {
  const isMobile = useIsMobile();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{formatDate(label)}</p>
          <p className="text-sm" style={{ color: "#0ea5e9" }}>
            Temperature: {payload[0]?.value}°C
          </p>
          <p className="text-sm" style={{ color: "#f59e0b" }}>
            Consumption: {payload[1]?.value?.toLocaleString()} GWH
          </p>
        </div>
      );
    }
    return null;
  };

  // Ensure we have data before rendering
  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: isMobile ? 5 : 20,
                bottom: 25,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                yAxisId="temperature"
                orientation="left"
                tickFormatter={(value) => `${value}°C`}
                domain={["auto", "auto"]}
                tick={{ fontSize: 12 }}
                width={isMobile ? 35 : 50}
                stroke="#0ea5e9"
              />
              <YAxis
                yAxisId="consumption"
                orientation="right"
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                tick={{ fontSize: 12 }}
                width={isMobile ? 35 : 50}
                stroke="#f59e0b"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="temperature"
                type="monotone"
                dataKey="temperature"
                stroke="#0ea5e9"
                fill="#0ea5e920"
                name="Temperature (°C)"
              />
              <Area
                yAxisId="consumption"
                type="monotone"
                dataKey="consumption"
                stroke="#f59e0b"
                fill="#f59e0b20"
                name="Consumption (GWH)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
