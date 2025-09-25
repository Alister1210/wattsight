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

// Weather Impact Chart Component

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

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  // Process data to create correlation points
  const processData = () => {
    return data
      .map((item: any) => ({
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

  const weatherUnits = {
    temperature: "°C",
    humidity: "%",
    wind_speed: "km/h",
    rainfall: "mm",
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 rounded-lg shadow-xl p-4 min-w-[200px]">
          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-3">
            {new Date(data.date).toLocaleDateString()}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#0284c7]"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {weatherLabels[weatherVariable]}:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {data[weatherVariable]}
                  {weatherUnits[weatherVariable]}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#6b7280]"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Consumption:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(data.consumption)} GWh
                </span>
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 shadow-xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 30,
                bottom: 60,
                left: isMobile ? 10 : 40,
              }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeOpacity={0.3} />
              <XAxis
                type="number"
                dataKey={weatherVariable}
                name={weatherLabels[weatherVariable]}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                stroke="#9ca3af"
                tickLine={{ stroke: "#d1d5db" }}
                label={{
                  value: weatherLabels[weatherVariable],
                  position: "insideBottom",
                  offset: -5,
                  style: {
                    textAnchor: "middle",
                    fill: "#6b7280",
                    fontSize: 12,
                    fontWeight: 600,
                  },
                }}
              />
              <YAxis
                type="number"
                dataKey="consumption"
                name="Energy Consumption (GWh)"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickFormatter={(value) => formatNumber(value)}
                stroke="#9ca3af"
                tickLine={{ stroke: "#d1d5db" }}
                label={{
                  value: "Consumption (GWh)",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "#6b7280",
                    fontSize: 12,
                    fontWeight: 600,
                  },
                }}
              />
              <Tooltip
                cursor={{
                  strokeDasharray: "3 3",
                  stroke: "#0284c7",
                  strokeWidth: 1,
                }}
                content={<CustomTooltip />}
              />
              <Scatter
                name="Energy vs Weather"
                data={processData()}
                fill="#0284c7"
                stroke="#0284c7"
                strokeWidth={1}
                r={4}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Information footer */}
        <div className="mt-6 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Correlation analysis between{" "}
              {weatherLabels[weatherVariable].toLowerCase()} and energy
              consumption
            </span>
            <span>
              {processData().length} data points • Weather impact data
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
