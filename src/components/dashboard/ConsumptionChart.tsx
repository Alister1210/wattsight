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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(isMobile ? {} : { year: "2-digit" }),
    });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2 text-sm">
            {formatTooltipDate(label)}
          </p>
          {payload.map((entry, index) => (
            <div
              key={`tooltip-${index}`}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-700">{entry.name}:</span>
              </div>
              <span
                className="font-medium text-sm"
                style={{ color: entry.color }}
              >
                {entry.value?.toLocaleString()} GWh
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center items-center mt-4 mb-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2 mx-4">
            <div
              className="w-4 h-0.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Get today's date for visual separation of past and future forecasts
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="w-full shadow-sm border border-gray-200/60 bg-white/50 backdrop-blur-sm dark:border-gray-700 dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="space-y-2">
          <CardTitle className="text-xl font-semibold text-gray-900 leading-tight">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-gray-600 text-sm leading-relaxed">
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: isMobile ? 10 : 30,
                bottom: 60,
              }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="#e5e7eb"
                strokeOpacity={0.6}
                vertical={false}
                horizontal={true}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{
                  fontSize: isMobile ? 11 : 12,
                  fill: "#6b7280",
                  fontWeight: 500,
                }}
                axisLine={{
                  stroke: "#d1d5db",
                  strokeWidth: 1,
                }}
                tickLine={{
                  stroke: "#d1d5db",
                  strokeWidth: 1,
                }}
                angle={isMobile ? -45 : -30}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                label={{
                  value: "Energy Consumption (GWh)",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "#6b7280",
                    fontSize: "13px",
                    fontWeight: 600,
                  },
                }}
                tick={{
                  fontSize: isMobile ? 10 : 11,
                  fill: "#6b7280",
                  fontWeight: 500,
                }}
                axisLine={{
                  stroke: "#d1d5db",
                  strokeWidth: 1,
                }}
                tickLine={{
                  stroke: "#d1d5db",
                  strokeWidth: 1,
                }}
                width={isMobile ? 45 : 70}
                domain={["dataMin - 100", "dataMax + 100"]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#6b7280",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                  strokeOpacity: 0.7,
                }}
              />
              <Legend
                content={<CustomLegend />}
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{
                  fill: "#f59e0b",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: "#f59e0b",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                name="Energy Forecast"
                connectNulls={true}
              />
              {/* Enhanced reference line to indicate current date */}
              <ReferenceLine
                x={today}
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="6 3"
                strokeOpacity={0.8}
                label={{
                  value: "Today",
                  position: "topRight",
                  offset: 10,
                  style: {
                    fill: "#6b7280",
                    fontSize: "12px",
                    fontWeight: 600,
                    textAnchor: "middle",
                  },
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Additional info section */}
        <div className="mt-4 pt-4 border-t border-gray-200/60">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Data updated in real-time</span>
            <span>Values displayed in Gigawatt hours (GWh)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
