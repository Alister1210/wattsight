import { supabase } from "@/integrations/supabase/client";

// Fetch states data from Supabase
export const getStates = async () => {
  const { data, error } = await supabase
    .from("states")
    .select("id, name, region")
    .order("name");

  if (error) {
    console.error("Error fetching states:", error);
    throw error;
  }

  return data;
};

// Modified getStateConsumption function to use forecasts table only
export const getStateConsumption = async (stateId?: string) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    // Get date 30 days ago for historical trend
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Build query for forecast data for the past 30 days and future predictions
    let forecastQuery = supabase
      .from("forecasts")
      .select(
        `
        state_id,
        date,
        predicted_consumption,
        created_at,
        state:state_id (
          id,
          name,
          region
        )
      `
      )
      .gte("date", thirtyDaysAgo)
      .order("date", { ascending: true });

    if (stateId) {
      forecastQuery = forecastQuery.eq("state_id", stateId);
    }

    const { data: forecastData, error: forecastError } = await forecastQuery;

    if (forecastError) throw forecastError;

    // Create a map of states
    const statesMap = new Map();

    // Process forecast data
    forecastData?.forEach((forecast) => {
      const stateName = forecast.state.name;
      const stateRegion = forecast.state.region;
      const stateId = forecast.state.id;

      if (!statesMap.has(stateName)) {
        statesMap.set(stateName, {
          state: stateName,
          region: stateRegion,
          stateId: stateId,
          data: [],
        });
      }

      const state = statesMap.get(stateName);

      // Check if we already have an entry for this date
      const existingEntry = state.data.find(
        (entry) => entry.date === forecast.date
      );

      if (existingEntry) {
        // For the same date, we might have multiple forecasts created at different times
        // Keep the most recent forecast if we have multiple for the same date
        const existingTimestamp = new Date(
          existingEntry.forecastCreatedAt || 0
        ).getTime();
        const newTimestamp = new Date(forecast.created_at || 0).getTime();

        if (newTimestamp > existingTimestamp) {
          existingEntry.forecast = forecast.predicted_consumption;
          existingEntry.forecastCreatedAt = forecast.created_at;
        }
      } else {
        // Add new entry
        state.data.push({
          date: forecast.date,
          forecast: forecast.predicted_consumption,
          forecastCreatedAt: forecast.created_at,
        });
      }
    });

    // Convert map to array and sort data by date for each state
    const result = Array.from(statesMap.values()).map((state) => {
      state.data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return state;
    });

    return result;
  } catch (error) {
    console.error("Error fetching consumption data:", error);
    throw error;
  }
};

// Get regional consumption aggregated by region
export const getRegionalConsumption = async () => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get consumption data grouped by region for yesterday
    const { data, error } = await supabase
      .from("forecasts")
      .select(
        `
        predicted_consumption,
        state:state_id (
          region
        )
      `
      )
      .eq("date", yesterday);

    if (error) throw error;

    // Aggregate by region
    const regions = (data || []).reduce(
      (acc: { [key: string]: number }, record) => {
        const region = record.state?.region;
        if (region) {
          acc[region] =
            (acc[region] || 0) + (record.predicted_consumption || 0);
        }
        return acc;
      },
      {}
    );

    // Transform to required format
    return Object.entries(regions).map(([name, totalConsumption]) => ({
      name,
      totalConsumption: Math.round(totalConsumption),
    }));
  } catch (error) {
    console.error("Error fetching regional consumption:", error);
    throw error;
  }
};

// Improved getWeatherImpactData function
export const getWeatherImpactData = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get weather data for the past 30 days
    const { data: weatherData, error: weatherError } = await supabase
      .from("weather_data")
      .select(
        `
        temperature,
        date,
        state_id
      `
      )
      .gte("date", thirtyDaysAgo)
      .lte("date", yesterday)
      .order("date", { ascending: true });

    if (weatherError) throw weatherError;

    // Get consumption data for the same period
    const { data: consumptionData, error: consumptionError } = await supabase
      .from("forecasts")
      .select(
        `
        predicted_consumption,
        date,
        state_id
      `
      )
      .gte("date", thirtyDaysAgo)
      .lte("date", yesterday);

    if (consumptionError) throw consumptionError;

    // Create a map to aggregate data by date
    const dateMap = new Map();

    // Process weather data
    weatherData?.forEach((weather) => {
      const date = weather.date;

      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          temperatureSum: 0,
          temperatureCount: 0,
          consumption: 0,
        });
      }

      const dateData = dateMap.get(date);
      dateData.temperatureSum += weather.temperature || 0;
      dateData.temperatureCount += 1;
    });

    // Process consumption data
    consumptionData?.forEach((consumption) => {
      const date = consumption.date;

      if (dateMap.has(date)) {
        const dateData = dateMap.get(date);
        dateData.consumption += consumption.predicted_consumption || 0;
      }
    });

    // Calculate final averages and make sure we have valid numbers
    const result = Array.from(dateMap.values())
      .map(({ date, temperatureSum, temperatureCount, consumption }) => ({
        date,
        temperature:
          temperatureCount > 0
            ? Math.round((temperatureSum / temperatureCount) * 10) / 10
            : 0,
        consumption: Math.round(consumption) || 0,
      }))
      .filter((item) => item.temperature > 0 && item.consumption > 0) // Only include entries with valid data
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return result;
  } catch (error) {
    console.error("Error fetching weather impact data:", error);
    throw error;
  }
};

// Get model performance metrics
export const getModelPerformanceData = async (stateId?: string) => {
  try {
    let query = supabase
      .from("model_metrics")
      .select(
        "model_name, mae, rmse, accuracy_percentage, state_id, state:state_id(name)"
      )
      .order("accuracy_percentage", { ascending: false });

    if (stateId) {
      query = query.eq("state_id", stateId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((metric) => ({
      model: metric.model_name,
      state: metric.state?.name,
      rmse: metric.rmse,
      mae: metric.mae,
      accuracy: metric.accuracy_percentage,
    }));
  } catch (error) {
    console.error("Error fetching model performance data:", error);
    throw error;
  }
};

// Generate stats for the dashboard
export const getDashboardStats = async (selectedStateId?: string) => {
  try {
    // Get yesterday's date
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    // Get date 14 days ago for week-over-week comparison
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get yesterday's forecast
    let yesterdayForecastQuery = supabase
      .from("forecasts")
      .select(
        `
        predicted_consumption,
        confidence_interval_lower,
        confidence_interval_upper,
        state:state_id (
          id,
          name
        )
      `
      )
      .eq("date", yesterday);

    if (selectedStateId) {
      yesterdayForecastQuery = yesterdayForecastQuery.eq(
        "state_id",
        selectedStateId
      );
    }

    const { data: yesterdayForecasts, error: forecastError } =
      await yesterdayForecastQuery;

    if (forecastError) throw forecastError;

    // Get today's forecast
    let todayForecastQuery = supabase
      .from("forecasts")
      .select(
        `
        predicted_consumption,
        confidence_interval_lower,
        confidence_interval_upper,
        state:state_id (
          id,
          name
        )
      `
      )
      .eq("date", today);

    if (selectedStateId) {
      todayForecastQuery = todayForecastQuery.eq("state_id", selectedStateId);
    }

    const { data: todayForecasts, error: todayForecastError } =
      await todayForecastQuery;

    if (todayForecastError) throw todayForecastError;

    // Get yesterday's actual consumption
    let actualConsumptionQuery = supabase
      .from("forecasts")
      .select(
        `
        predicted_consumption,
        confidence_interval_lower,
        confidence_interval_upper,
        state:state_id (
          id,
          name
        )
      `
      )
      .eq("date", yesterday);

    if (selectedStateId) {
      actualConsumptionQuery = actualConsumptionQuery.eq(
        "state_id",
        selectedStateId
      );
    }

    const { data: actualConsumption, error: consumptionError } =
      await actualConsumptionQuery;

    if (consumptionError) throw consumptionError;

    // Get weekly consumption for week-over-week comparison
    let weeklyQuery = supabase
      .from("forecasts")
      .select(
        `
        predicted_consumption,
        confidence_interval_lower,
        confidence_interval_upper,
        date,
        state:state_id (
          id,
          name
        )
      `
      )
      .gte("date", twoWeeksAgo)
      .lte("date", yesterday)
      .order("date", { ascending: true });

    if (selectedStateId) {
      weeklyQuery = weeklyQuery.eq("state_id", selectedStateId);
    }

    const { data: weeklyData, error: weeklyError } = await weeklyQuery;

    if (weeklyError) throw weeklyError;

    // Get model accuracy
    let modelQuery = supabase
      .from("model_metrics")
      .select("accuracy_percentage, model_name, state:state_id(id, name)")
      .order("training_date", { ascending: false });

    if (selectedStateId) {
      modelQuery = modelQuery.eq("state_id", selectedStateId);
    }

    const { data: modelMetrics, error: metricsError } = await modelQuery.limit(
      10
    );

    if (metricsError) throw metricsError;

    // Calculate totals
    const totalConsumption =
      actualConsumption?.reduce(
        (sum, record) => sum + (record.predicted_consumption || 0),
        0
      ) || 0;

    const yesterdayForecastTotal =
      yesterdayForecasts?.reduce(
        (sum, record) => sum + (record.predicted_consumption || 0),
        0
      ) || 0;

    const todayForecastTotal =
      todayForecasts?.reduce(
        (sum, record) => sum + (record.predicted_consumption || 0),
        0
      ) || 0;

    // Calculate week-over-week change
    const latestDate = new Date(yesterday);
    const weekAgo = new Date(latestDate);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const currentWeekData =
      weeklyData?.filter(
        (record) =>
          new Date(record.date) > weekAgo && new Date(record.date) <= latestDate
      ) || [];

    const previousWeekData =
      weeklyData?.filter(
        (record) =>
          new Date(record.date) <= weekAgo &&
          new Date(record.date) > new Date(twoWeeksAgo)
      ) || [];

    const currentWeekConsumption = currentWeekData.reduce(
      (sum, record) => sum + (record.predicted_consumption || 0),
      0
    );

    const previousWeekConsumption = previousWeekData.reduce(
      (sum, record) => sum + (record.predicted_consumption || 0),
      0
    );

    const weekOverWeekChange =
      previousWeekConsumption > 0
        ? ((currentWeekConsumption - previousWeekConsumption) /
            previousWeekConsumption) *
          100
        : 0;

    // Get average model accuracy
    let avgAccuracy = 95.0; // Default value

    if (modelMetrics && modelMetrics.length > 0) {
      const accuracySum = modelMetrics.reduce(
        (sum, metric) => sum + (metric.accuracy_percentage || 0),
        0
      );
      avgAccuracy = accuracySum / modelMetrics.length;
    }

    // Get total number of states in the system
    const { count: statesCount, error: countError } = await supabase
      .from("states")
      .select("id", { count: "exact", head: true });

    if (countError) throw countError;

    return {
      totalConsumption: Math.round(totalConsumption),
      totalForecast: Math.round(todayForecastTotal),
      yesterdayForecast: Math.round(yesterdayForecastTotal),
      weekOverWeekChange: Math.round(weekOverWeekChange * 10) / 10,
      forecasterAccuracy: Math.round(avgAccuracy * 10) / 10,
      states: statesCount || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Get data for a specific state
// export const getStateData = async (stateName: string) => {
//   try {
//     // First get the state ID
//     const { data: stateData, error: stateError } = await supabase
//       .from("states")
//       .select("id")
//       .eq("name", stateName)
//       .single();

//     if (stateError) throw stateError;

//     const stateId = stateData?.id;

//     if (!stateId) {
//       throw new Error(`State ${stateName} not found`);
//     }

//     // Now fetch data with the state ID
//     const consumptionData = await getStateConsumption(stateId);
//     const modelData = await getModelPerformanceData(stateId);
//     const dashboardStats = await getDashboardStats(stateId);

//     return {
//       stateId,
//       consumptionData: consumptionData.find((item) => item.stateId === stateId),
//       modelPerformance: modelData,
//       stats: dashboardStats,
//     };
//   } catch (error) {
//     console.error(`Error fetching data for state ${stateName}:`, error);
//     throw error;
//   }
// };
