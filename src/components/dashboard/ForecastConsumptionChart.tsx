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
      return `${(value / 1000000).toFixed(1)}MWh`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}TWh`;
    }
    return `${value}GWh`;
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
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Date:{" "}
                {new Date(dataPoint.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {prediction?.value !== undefined && (
                <span
                  className="font-bold text-muted-foreground"
                  style={{ color: prediction.color }}
                >
                  Predicted: {formatYAxis(prediction.value as number)}
                </span>
              )}
              {lower !== undefined && upper !== undefined && (
                <span
                  className="font-bold text-muted-foreground"
                  style={{ color: "#94a3b8" }}
                >
                  Range: {formatYAxis(lower as number)} - {formatYAxis(upper)}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Display a message if no data is available
  if (!validData || validData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No forecast data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={validData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient
                  id="colorConfidence"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => {
                  // Rename legend items
                  const nameMap = {
                    prediction: "Predicted Consumption",
                    confidenceRange: "Confidence Interval",
                  };
                  return nameMap[value] || value;
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
              {/* Line for predicted consumption */}
              <Area
                type="monotone"
                dataKey="prediction"
                stroke="#0284c7"
                strokeWidth={2}
                fill="url(#colorPrediction)"
                name="prediction"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
