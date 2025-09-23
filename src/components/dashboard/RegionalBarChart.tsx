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

interface RegionalBarChartProps {
  data: Array<{
    name: string;
    totalConsumption: number;
  }>;
  title: string;
  description?: string;
}

export function RegionalBarChart({
  data,
  title,
  description,
}: RegionalBarChartProps) {
  const isMobile = useIsMobile();

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{label} Region</p>
          <p className="text-sm text-primary">
            Consumption: {payload[0]?.value?.toLocaleString()} GWH
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
            <BarChart
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
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
                width={isMobile ? 40 : 60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="totalConsumption"
                name="Consumption (GWH)"
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
