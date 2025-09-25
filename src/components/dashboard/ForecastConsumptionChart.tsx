import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts";
import { ForecastDataPoint } from "@/lib/real-data";

interface ForecastConsumptionChartProps {
  data: ForecastDataPoint[];
  title: string;
  description?: string;
}

export const ForecastConsumptionChart: React.FC<
  ForecastConsumptionChartProps
> = ({ data, title, description }) => {
  // Make sure we have valid data with all required fields
  const validData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort data by date to ensure the chart line is correct
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sortedData.map((item) => ({
      date: item.date, // Keep original date for tooltip
      displayDate: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      prediction: item.predicted_consumption,
      lower: item.confidence_interval_lower,
      confidenceRange:
        (item.confidence_interval_upper || 0) -
        (item.confidence_interval_lower || 0),
    }));
  }, [data]);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return `${value}`;
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

  const formatValueWithUnit = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} MWh`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} TWh`;
    }
    return `${value.toFixed(2)} GWh`;
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const prediction = payload.find((p) => p.dataKey === "prediction");
      const lower = dataPoint.lower;
      const upper = lower + dataPoint.confidenceRange;

      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-3 text-sm">
            {formatTooltipDate(dataPoint.date)}
          </p>
          <div className="space-y-2">
            {prediction?.value !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-600" />
                  <span className="text-sm text-gray-700">Predicted:</span>
                </div>
                <span className="font-medium text-sm text-sky-600">
                  {formatValueWithUnit(prediction.value as number)}
                </span>
              </div>
            )}
            {lower !== undefined && upper !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  <span className="text-sm text-gray-700">Confidence:</span>
                </div>
                <span className="font-medium text-sm text-slate-600">
                  {formatValueWithUnit(lower as number)} -{" "}
                  {formatValueWithUnit(upper)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    const legendItems = [
      { name: "Predicted Consumption", color: "#0284c7", type: "line" },
      { name: "Confidence Interval", color: "#94a3b8", type: "area" },
    ];

    return (
      <div className="flex justify-center items-center mt-4 mb-2">
        {legendItems.map((item, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2 mx-4">
            <div
              className={`w-4 ${
                item.type === "line" ? "h-0.5" : "h-3"
              } rounded-full`}
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Display a message if no data is available
  if (!validData || validData.length === 0) {
    return (
      <Card className="w-full shadow-sm border-gray-200/60 bg-white/50 backdrop-blur-sm">
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
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">
              No forecast data available
            </p>
            <p className="text-gray-400 text-sm">
              Please check your data source or try again later
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm border-gray-200/60 bg-white/50 backdrop-blur-sm">
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
            <AreaChart
              data={validData}
              margin={{ top: 20, right: 30, left: 30, bottom: 60 }}
            >
              <defs>
                <linearGradient
                  id="colorPrediction"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient
                  id="colorConfidence"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="#e5e7eb"
                strokeOpacity={0.6}
                vertical={false}
                horizontal={true}
              />
              <XAxis
                dataKey="displayDate"
                tick={{
                  fontSize: 12,
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
                tickMargin={10}
                angle={-30}
                textAnchor="end"
                height={60}
                label={{
                  value: "Forecast Period",
                  position: "insideBottom",
                  offset: -10,
                  style: {
                    textAnchor: "middle",
                    fill: "#6b7280",
                    fontSize: "13px",
                    fontWeight: 600,
                  },
                }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{
                  fontSize: 11,
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
                tickMargin={10}
                width={70}
                domain={["dataMin - 50", "dataMax + 50"]}
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
              {/* Area for confidence interval */}
              <Area
                type="monotone"
                dataKey="lower"
                stackId="1"
                stroke="none"
                fill="none"
              />
              <Area
                type="monotone"
                dataKey="confidenceRange"
                stackId="1"
                stroke="none"
                fill="url(#colorConfidence)"
                name="confidenceRange"
              />
              {/* Area for predicted consumption */}
              <Area
                type="monotone"
                dataKey="prediction"
                stroke="#0284c7"
                strokeWidth={3}
                fill="url(#colorPrediction)"
                name="prediction"
                dot={{
                  fill: "#0284c7",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                  fill: "#0284c7",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Additional info section */}
        <div className="mt-4 pt-4 border-t border-gray-200/60">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Forecast with confidence intervals</span>
            <span>Predicted energy consumption trends</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
