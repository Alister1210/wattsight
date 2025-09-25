import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ConsumptionChart } from "@/components/dashboard/ConsumptionChart";
import { TemperatureConsumptionChart } from "@/components/dashboard/TemperatureConsumptionChart";
import { RegionalBarChart } from "@/components/dashboard/RegionalBarChart";
// import { HourlyConsumptionChart } from "@/components/dashboard/HourlyConsumptionChart";
// import { ModelPerformanceTable } from "@/components/dashboard/ModelPerformanceTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHolidayComparisonData } from "@/lib/real-data";
import {
  Zap,
  LineChart,
  BarChart3,
  CalendarCheck2,
  Download,
  Loader2,
} from "lucide-react";

import {
  getStateConsumption,
  getRegionalConsumption,
  getWeatherImpactData,
  getModelPerformanceData,
  getStates,
  getForecastConsumption,
  getDashboardStats,
  getFutureForecasts,
} from "@/lib/real-data";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { IndiaMapChart } from "@/components/dashboard/IndiaMapChart";
import { ForecastConsumptionChart } from "@/components/dashboard/ForecastConsumptionChart";
import { FutureForecastChart } from "@/components/dashboard/FutureForecastChart";
import { HolidayComparisonChart } from "@/components/dashboard/HolidayComparisonChart";
import { WeatherImpactChart } from "@/components/dashboard/WeatherImpactChart";
import type { ForecastDataPoint } from "@/lib/real-data";
import { useSearchParams } from "react-router-dom";

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const stateParam = searchParams.get("state");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stateData, setStateData] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<string>("Maharashtra");
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [modelPerformanceData, setModelPerformanceData] = useState<any[]>([]);
  const [holidayData, setHolidayData] = useState<any[]>([]);
  const [combinedWeatherForecastData, setCombinedWeatherForecastData] =
    useState<any[]>([]);
  const [futureForecastData, setFutureForecastData] = useState<any[]>([]);

  const [holidayComparisonData, setHolidayComparisonData] = useState<any[]>([]);

  // Get selected state's ID
  const getSelectedStateId = (stateName: string) => {
    if (!states || states.length === 0) return undefined;
    const state = states.find((s) => s.name === stateName);
    return state?.id;
  };

  // Add this to the useEffect that updates when selected state changes
  useEffect(() => {
    const updateStateData = async () => {
      try {
        setLoading(true);
        const selectedStateId = getSelectedStateId(selectedState);

        const [
          newStats,
          newModelData,
          newHolidayComparisonData,
          newForecastData,
          newWeatherImpact,
          newFutureForecasts,
        ] = await Promise.all([
          getDashboardStats(selectedStateId),
          getModelPerformanceData(selectedStateId),
          getHolidayComparisonData(selectedStateId),
          getForecastConsumption(selectedStateId),
          getWeatherImpactData(selectedStateId),
          getFutureForecasts(selectedStateId),
        ]);

        setDashboardStats(newStats);
        setModelPerformanceData(newModelData);
        setHolidayComparisonData(newHolidayComparisonData);
        setForecastData(newForecastData);
        setWeatherData(newWeatherImpact);
        setFutureForecastData(
          newFutureForecasts.map((d) => ({
            date: d.forecast_date,
            consumption: d.predicted_consumption,
          }))
        );

        // Combine weather and forecast data for weather impact charts
        const combined = newWeatherImpact.map((weather) => {
          const matchingForecast = newForecastData.find(
            (f) => f.date === weather.date
          );
          return {
            ...weather,
            predicted_consumption:
              matchingForecast?.predicted_consumption || weather.consumption,
          };
        });
        setCombinedWeatherForecastData(combined);

        // Rest of the existing code...
      } catch (error) {
        console.error(`Error updating data for state: ${selectedState}`, error);
      } finally {
        setLoading(false);
      }
    };

    if (states.length > 0) {
      updateStateData();
    }
  }, [selectedState, states]); // Note: `states` is stable after initial fetch

  // Set initial state from URL parameter once states are loaded
  useEffect(() => {
    if (states.length > 0 && stateParam) {
      // Check if the state from URL exists in our list
      const stateExists = states.some((state) => state.name === stateParam);
      if (stateExists) {
        setSelectedState(stateParam);
      }
    }
  }, [stateParam, states]);

  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);

  // Fetch all required data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          statesList,
          statesConsumption,
          regionalConsumption,
          // weatherImpact, // This will now be fetched in the state-specific useEffect
        ] = await Promise.all([
          getStates(),
          getStateConsumption(),
          getRegionalConsumption(),
          // getWeatherImpactData(), // Moved to state-specific fetch
        ]);

        // Add proper null checks before setting state
        if (statesList) setStates(statesList);
        if (statesConsumption) setStateData(statesConsumption);
        if (regionalConsumption) setRegionalData(regionalConsumption);
        // if (weatherImpact) setWeatherData(weatherImpact);

        // Set the selected state based on URL parameter if it exists
        if (stateParam && statesList.some((s) => s.name === stateParam)) {
          setSelectedState(stateParam);
        } else if (statesList && statesList.length > 0) {
          setSelectedState("Maharashtra"); // Default state
        }

        // Fetch holiday data
        const { data: holidaysData, error: holidayError } = await supabase
          .from("holidays")
          .select("*")
          .order("date", { ascending: true });

        if (holidayError) throw holidayError;
        setHolidayData(holidaysData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Consider showing an error state to the user here
      }
    };

    fetchData();
  }, []); // Run only once on mount

  // Format large numbers with appropriate units
  const formatConsumption = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} MWh`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} TWh`;
    }
    return `${value.toFixed(2)} GWh`;
  };

  const handleExportCSV = () => {
    if (forecastData.length === 0) {
      alert("No forecast data available to export.");
      return;
    }

    const headers = [
      "date",
      "predicted_consumption",
      "confidence_interval_lower",
      "confidence_interval_upper",
    ];

    const csvRows = [
      headers.join(","),
      ...forecastData.map((row: ForecastDataPoint) =>
        // Ensure values are properly formatted for CSV, handling commas in strings if necessary
        [
          row.date,
          row.predicted_consumption,
          row.confidence_interval_lower,
          row.confidence_interval_upper,
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedState}_forecast_data.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const { default: autoTable } = await import("jspdf-autotable");

      const dashboardElement = document.getElementById("dashboard-content");
      if (!dashboardElement) {
        console.error("Dashboard content element not found!");
        return;
      }

      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      // 1. Add Title
      pdf.setFontSize(22);
      pdf.text(
        `Electricity Consumption Report: ${selectedState}`,
        pdfWidth / 2,
        40,
        { align: "center" }
      );
      pdf.setFontSize(12);
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        pdfWidth / 2,
        60,
        { align: "center" }
      );

      // 2. Add Summary Table
      autoTable(pdf, {
        startY: 80,
        head: [["Metric", "Value"]],
        body: [
          [
            "Total Consumption (Last 24h)",
            formatConsumption(dashboardStats.totalConsumption),
          ],
          [
            "Forecasted Consumption (Next 24h)",
            formatConsumption(dashboardStats.totalForecast),
          ],
          [
            "Week-over-Week Change",
            `${dashboardStats.weekOverWeekChange > 0 ? "+" : ""}${
              dashboardStats.weekOverWeekChange
            }%`,
          ],
          [
            "Forecaster Accuracy",
            `${dashboardStats.forecasterAccuracy.toFixed(1)}%`,
          ],
        ],
        theme: "striped",
        headStyles: { fillColor: [3, 105, 161] }, // A nice blue for the header
      });

      // 3. Add Charts as an Image
      const canvas = await html2canvas(dashboardElement, {
        scale: 2, // Increase scale for better resolution
        useCORS: true,
        // Ignore the header and export button to avoid capturing them in the PDF
        ignoreElements: (element) => element.id === "dashboard-header",
      });
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * (pdfWidth - 40)) / canvas.width;
      pdf.addImage(
        imgData,
        "PNG",
        20,
        (pdf as any).lastAutoTable.finalY + 20,
        pdfWidth - 40,
        imgHeight
      );

      pdf.save(`${selectedState}_dashboard_report.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Sorry, there was an error generating the PDF.");
    } finally {
      setExporting(false);
    }
  };

  const selectedStateData = stateData.find(
    (item) => item.state === selectedState
  );

  if (loading || !dashboardStats || stateData.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-medium">Loading dashboard data...</h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        id="dashboard-content"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div
          id="dashboard-header"
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Electricity Consumption Dashboard
            </h1>
            <p className="text-muted-foreground">
              Analyze real-time insights across Indian states
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <div className="w-full sm:w-48">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" disabled={exporting}>
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Consumption"
            value={formatConsumption(dashboardStats.totalConsumption)}
            description="Last 24 hours"
            icon={<Zap className="h-5 w-5" />}
          />
          <StatsCard
            title="Forecasted Consumption"
            value={formatConsumption(dashboardStats.totalForecast)}
            description="Next 24 hours"
            icon={<LineChart className="h-5 w-5" />}
          />
          <StatsCard
            title="Week over Week"
            value={`${dashboardStats.weekOverWeekChange > 0 ? "+" : ""}${
              dashboardStats.weekOverWeekChange
            }%`}
            description="Consumption change"
            change={dashboardStats.weekOverWeekChange}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatsCard
            title="Forecaster Accuracy"
            value={`${dashboardStats.forecasterAccuracy.toFixed(1)}%`}
            description="Last 30 days"
            icon={<CalendarCheck2 className="h-5 w-5" />}
          />
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="overview"
          className="mb-8"
          value={selectedTab}
          onValueChange={setSelectedTab}
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="forecast">Forecast Analysis</TabsTrigger>
            <TabsTrigger value="weather">Weather Impact</TabsTrigger>
            <TabsTrigger value="state">{selectedState}</TabsTrigger>
            {/* <TabsTrigger value="models">Model Performance</TabsTrigger> */}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ForecastConsumptionChart
                data={forecastData}
                title="Predicted Energy Consumption"
                description="Forecasted energy usage with confidence intervals"
              />
              <RegionalBarChart
                data={regionalData}
                title="Regional Consumption"
                description="Energy consumption by Indian regions"
              />
            </div>
          </TabsContent>

          {/* Forecast Analysis Tab */}
          <TabsContent value="forecast" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* <ForecastConsumptionChart
                data={forecastData}
                title="Electricity Consumption Forecast"
                description="Predicted energy usage over time with confidence intervals"
              /> */}
              <FutureForecastChart
                data={futureForecastData}
                title="7-Day Consumption Forecast"
                description={`Predicted energy usage for the next 7 days in ${selectedState}`}
              />
              <HolidayComparisonChart
                data={holidayComparisonData}
                title="Holiday vs. Normal Day Consumption"
                description={`Average energy consumption comparison for ${selectedState}`}
              />
            </div>
          </TabsContent>

          {/* Weather Impact Tab */}
          <TabsContent value="weather" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WeatherImpactChart
                data={combinedWeatherForecastData}
                weatherVariable="temperature"
                title="Temperature Impact on Consumption"
                description="Correlation between temperature and energy consumption"
              />
              <WeatherImpactChart
                data={combinedWeatherForecastData}
                weatherVariable="humidity"
                title="Humidity Impact on Consumption"
                description="Correlation between humidity and energy consumption"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WeatherImpactChart
                data={combinedWeatherForecastData}
                weatherVariable="wind_speed"
                title="Wind Speed Impact on Consumption"
                description="Correlation between wind speed and energy consumption"
              />
              <WeatherImpactChart
                data={combinedWeatherForecastData}
                weatherVariable="rainfall"
                title="Rainfall Impact on Consumption"
                description="Correlation between rainfall and energy consumption"
              />
            </div>
          </TabsContent>

          {/* State Tab */}
          <TabsContent value="state" className="space-y-6">
            {selectedStateData && (
              <ConsumptionChart
                data={selectedStateData.data}
                title={`${selectedState} Consumption Forecast`}
                description={`Forecasted consumption over the last 30 days and upcoming period`}
              />
            )}
          </TabsContent>

          {/* Models Tab */}
          {/* <TabsContent value="models">
            <ModelPerformanceTable
              data={modelPerformanceData}
              title="Forecasting Model Performance"
              description="Accuracy metrics of different prediction models"
            />
          </TabsContent> */}
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
