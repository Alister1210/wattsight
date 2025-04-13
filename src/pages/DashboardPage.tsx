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
  getDashboardStats,
} from "@/lib/real-data";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { IndiaMapChart } from "@/components/dashboard/IndiaMapChart";
import { ForecastConsumptionChart } from "@/components/dashboard/ForecastConsumptionChart";
import { HolidayComparisonChart } from "@/components/dashboard/HolidayComparisonChart";
import { WeatherImpactChart } from "@/components/dashboard/WeatherImpactChart";
import { useSearchParams } from "react-router-dom";

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const stateParam = searchParams.get("state");

  const [loading, setLoading] = useState(true);
  const [stateData, setStateData] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<string>("Maharashtra");
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [modelPerformanceData, setModelPerformanceData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [holidayData, setHolidayData] = useState<any[]>([]);
  const [filteredForecastData, setFilteredForecastData] = useState<any[]>([]);
  const [combinedWeatherForecastData, setCombinedWeatherForecastData] =
    useState<any[]>([]);

  const [holidayComparisonData, setHolidayComparisonData] = useState<any[]>([]);

  // Get selected state's ID
  const getSelectedStateId = (stateName: string) => {
    const state = states.find((s) => s.name === stateName);
    return state?.id;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          statesList,
          statesConsumption,
          regionalConsumption,
          weatherImpact,
          modelMetrics,
          dashboardStatsData,
          // Add the holiday comparison data fetch
          holidayComparison,
        ] = await Promise.all([
          getStates(),
          getStateConsumption(),
          getRegionalConsumption(),
          getWeatherImpactData(),
          getModelPerformanceData(),
          getDashboardStats(),
          // Fetch holiday comparison data without state filter initially
          getHolidayComparisonData(),
        ]);

        // Add this with the other state setters
        if (holidayComparison) setHolidayComparisonData(holidayComparison);

        // Rest of the existing code...
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stateParam]);

  // Add this to the useEffect that updates when selected state changes
  useEffect(() => {
    const updateStateData = async () => {
      try {
        const selectedStateId = getSelectedStateId(selectedState);
        if (!selectedStateId) return;

        const [newStats, newModelData, newHolidayComparisonData] =
          await Promise.all([
            getDashboardStats(selectedStateId),
            getModelPerformanceData(selectedStateId),
            getHolidayComparisonData(selectedStateId),
          ]);

        setDashboardStats(newStats);
        setModelPerformanceData(newModelData);
        setHolidayComparisonData(newHolidayComparisonData);

        // Rest of the existing code...
      } catch (error) {
        console.error("Error updating state data:", error);
      }
    };

    if (states.length > 0 && forecastData.length > 0) {
      updateStateData();
    }
  }, [selectedState, states, forecastData]);

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
          weatherImpact,
          modelMetrics,
          dashboardStatsData,
        ] = await Promise.all([
          getStates(),
          getStateConsumption(),
          getRegionalConsumption(),
          getWeatherImpactData(),
          getModelPerformanceData(),
          getDashboardStats(),
        ]);

        // Add proper null checks before setting state
        if (statesList) setStates(statesList);
        if (statesConsumption) setStateData(statesConsumption);
        if (regionalConsumption) setRegionalData(regionalConsumption);
        if (weatherImpact) setWeatherData(weatherImpact);
        if (modelMetrics) setModelPerformanceData(modelMetrics);
        if (dashboardStatsData) setDashboardStats(dashboardStatsData);

        // Fetch forecast data from Supabase
        const { data: forecastsData, error: forecastError } = await supabase
          .from("forecasts")
          .select(
            `
            id,
            date,
            predicted_consumption,
            confidence_interval_lower,
            confidence_interval_upper,
            state_id,
            state:state_id (name)
          `
          )
          .order("date", { ascending: true });

        if (forecastError) throw forecastError;
        setForecastData(forecastsData || []);

        // Filter forecast data for the default or URL-specified state
        const initialState =
          stateParam && statesList.some((s) => s.name === stateParam)
            ? stateParam
            : "Maharashtra";

        const filteredData =
          forecastsData?.filter(
            (forecast) => forecast.state && forecast.state.name === initialState
          ) || [];
        setFilteredForecastData(filteredData);

        // Set the selected state based on URL parameter if it exists
        if (stateParam && statesList.some((s) => s.name === stateParam)) {
          setSelectedState(stateParam);
        }

        // Fetch holiday data
        const { data: holidaysData, error: holidayError } = await supabase
          .from("holidays")
          .select("*")
          .order("date", { ascending: true });

        if (holidayError) throw holidayError;
        setHolidayData(holidaysData || []);

        // Combine weather and forecast data for weather impact charts
        if (weatherImpact && forecastsData) {
          const combined = weatherImpact.map((weather) => {
            const matchingForecast = forecastsData.find(
              (forecast) => forecast.date === weather.date
            );
            return {
              ...weather,
              predicted_consumption:
                matchingForecast?.predicted_consumption || weather.consumption,
            };
          });
          setCombinedWeatherForecastData(combined);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Consider showing an error state to the user here
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stateParam]);

  // Update data when selected state changes
  useEffect(() => {
    const updateStateData = async () => {
      try {
        const selectedStateId = getSelectedStateId(selectedState);
        if (!selectedStateId) return;

        const [newStats, newModelData] = await Promise.all([
          getDashboardStats(selectedStateId),
          getModelPerformanceData(selectedStateId),
        ]);

        setDashboardStats(newStats);
        setModelPerformanceData(newModelData);

        const filtered = forecastData.filter(
          (forecast) => forecast.state && forecast.state.name === selectedState
        );
        setFilteredForecastData(filtered);

        // Update weather impact data for the selected state
        const { data: stateWeatherData, error: weatherError } = await supabase
          .from("weather_data")
          .select("*")
          .eq("state_id", selectedStateId)
          .order("date", { ascending: true });

        if (!weatherError && stateWeatherData) {
          const combined = stateWeatherData.map((weather) => {
            const matchingForecast = forecastData.find(
              (forecast) =>
                forecast.date === weather.date &&
                forecast.state_id === selectedStateId
            );
            return {
              ...weather,
              predicted_consumption:
                matchingForecast?.predicted_consumption || 0,
            };
          });
          setCombinedWeatherForecastData(combined);
        }
      } catch (error) {
        console.error("Error updating state data:", error);
      }
    };

    if (states.length > 0 && forecastData.length > 0) {
      updateStateData();
    }
  }, [selectedState, states, forecastData]);

  // Format large numbers with appropriate units
  const formatConsumption = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} GWh`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} MWh`;
    }
    return `${value.toFixed(2)} KWh`;
  };

  const handleDownloadData = () => {
    alert("Download feature would be implemented in a future version!");
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
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
            <Button variant="outline" size="icon" onClick={handleDownloadData}>
              <Download className="h-4 w-4" />
            </Button>
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
                data={filteredForecastData}
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
              <ForecastConsumptionChart
                data={filteredForecastData}
                title="Electricity Consumption Forecast"
                description="Predicted energy usage over time with confidence intervals"
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
