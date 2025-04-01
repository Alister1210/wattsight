import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  ZAxis,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface WeatherImpactChartProps {
  data: any[];
  title: string;
  description?: string;
  weatherVariable?: "temperature" | "humidity" | "wind_speed" | "rainfall";
}

export function WeatherImpactChart({
  data,
  title,
  description,
  weatherVariable = "temperature",
}: WeatherImpactChartProps) {
  const isMobile = useIsMobile();

  // Process data to create correlation points
  const processData = () => {
    return data
      .map((item) => ({
        [weatherVariable]: item[weatherVariable],
        consumption: item.predicted_consumption,
        date: item.date,
      }))
      .filter(
        (item) => item[weatherVariable] !== null && item.consumption !== null
      );
  };

  const weatherLabels = {
    temperature: "Temperature (°C)",
    humidity: "Humidity (%)",
    wind_speed: "Wind Speed (km/h)",
    rainfall: "Rainfall (mm)",
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="text-sm font-medium">
            Date: {new Date(data.date).toLocaleDateString()}
          </p>
          <p className="text-sm" style={{ color: "#0ea5e9" }}>
            {weatherLabels[weatherVariable]}: {data[weatherVariable]}
          </p>
          <p className="text-sm" style={{ color: "#f59e0b" }}>
            Consumption: {data.consumption?.toLocaleString()} MWh
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
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: isMobile ? 5 : 30,
              }}
            >
              <CartesianGrid opacity={0.3} />
              <XAxis
                type="number"
                dataKey={weatherVariable}
                name={weatherLabels[weatherVariable]}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="consumption"
                name="Energy Consumption (MWh)"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<CustomTooltip />}
              />
              <Scatter
                name="Energy vs Weather"
                data={processData()}
                fill="#0ea5e9"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
