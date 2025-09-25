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

// Regional Bar Chart Component
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

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 rounded-lg shadow-xl p-4 min-w-[200px]">
          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-3">
            {label} Region
          </p>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#0284c7]"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Consumption:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {formatNumber(payload[0]?.value || 0)} GWh
              </span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center items-center gap-6 mt-4 mb-2">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Enhanced empty state
  if (!data || data.length === 0) {
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
          <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0284c7] to-[#6b7280] rounded-full flex items-center justify-center opacity-20">
              <svg
                className="w-8 h-8 text-white"
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
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No regional data available
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Check back later for updated information
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: isMobile ? 10 : 40,
                bottom: 60,
              }}
            >
              <defs>
                <linearGradient
                  id="regionalBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                stroke="#9ca3af"
                tickLine={{ stroke: "#d1d5db" }}
                label={{
                  value: "Region",
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
                tickFormatter={(value) => `${formatNumber(value)}`}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                width={isMobile ? 50 : 70}
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
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Bar
                dataKey="totalConsumption"
                name="Consumption (GWh)"
                fill="url(#regionalBarGradient)"
                radius={[6, 6, 0, 0]}
                stroke="#0284c7"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Information footer */}
        <div className="mt-6 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Regional energy consumption comparison</span>
            <span>{data.length} regions • Total consumption data</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
