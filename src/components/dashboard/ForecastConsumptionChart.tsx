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
} from "recharts";

export const ForecastConsumptionChart = ({ data, title, description }) => {
  // Make sure we have valid data with all required fields
  const validData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      prediction: item.predicted_consumption || 0,
      lower: item.confidence_interval_lower || 0,
      upper: item.confidence_interval_upper || 0,
      // Calculate the range for proper area chart display
      confidenceRange:
        (item.confidence_interval_upper || 0) -
        (item.confidence_interval_lower || 0),
    }));
  }, [data]);

  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}GWh`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}MWh`;
    }
    return `${value}kWh`;
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
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name) => {
                  // Format values and rename series for tooltip
                  const formattedValue = formatYAxis(value);
                  const nameMap = {
                    prediction: "Predicted Consumption",
                    upper: "Upper Confidence Bound",
                    lower: "Lower Confidence Bound",
                  };
                  return [formattedValue, nameMap[name] || name];
                }}
              />
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
