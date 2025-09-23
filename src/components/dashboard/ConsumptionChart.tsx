import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  ReferenceLine,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface ConsumptionChartProps {
  data: any[];
  title: string;
  description?: string;
}

export function ConsumptionChart({
  data,
  title,
  description,
}: ConsumptionChartProps) {
  const isMobile = useIsMobile();

  const formatDate = (dateStr: string) => {
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
          {payload.map((entry, index) => (
            <p
              key={`tooltip-${index}`}
              style={{ color: entry.color }}
              className="text-sm"
            >
              {`${entry.name}: ${entry.value?.toLocaleString()} GWH`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get today's date for visual separation of past and future forecasts
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: isMobile ? 0 : 20,
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
                tickFormatter={(value) => `${value.toLocaleString()}`}
                tick={{ fontSize: 12 }}
                width={isMobile ? 40 : 60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Forecast"
                connectNulls={true}
              />
              {/* Reference line to indicate current date */}
              <ReferenceLine
                x={today}
                stroke="#888"
                strokeDasharray="3 3"
                label={{
                  value: "Today",
                  position: "insideTopRight",
                  fill: "#888",
                  fontSize: 12,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
