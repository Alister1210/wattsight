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
  forecastData: any[];
  holidayData: any[];
  title: string;
  description?: string;
}

export function HolidayComparisonChart({
  forecastData,
  holidayData,
  title,
  description,
}: HolidayComparisonChartProps) {
  const isMobile = useIsMobile();

  // Process data to compare holiday vs non-holiday consumption
  const processData = () => {
    // Create a set of holiday dates for faster lookup
    const holidayDates = new Set(
      holidayData.filter((h) => h.is_holiday).map((h) => h.date)
    );

    // Group forecast data by whether the date is a holiday
    let holidayConsumption = 0;
    let holidayCount = 0;
    let nonHolidayConsumption = 0;
    let nonHolidayCount = 0;

    forecastData.forEach((forecast) => {
      if (holidayDates.has(forecast.date)) {
        holidayConsumption += forecast.predicted_consumption || 0;
        holidayCount++;
      } else {
        nonHolidayConsumption += forecast.predicted_consumption || 0;
        nonHolidayCount++;
      }
    });

    return [
      {
        name: "Holiday",
        consumption:
          holidayCount > 0 ? Math.round(holidayConsumption / holidayCount) : 0,
      },
      {
        name: "Normal Day",
        consumption:
          nonHolidayCount > 0
            ? Math.round(nonHolidayConsumption / nonHolidayCount)
            : 0,
      },
    ];
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            Average Consumption: {payload[0].value?.toLocaleString()} MWh
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
              data={processData()}
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
                name="Avg. Consumption (MWh)"
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
