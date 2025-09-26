// Fetch forecast consumption data for the most recent 30 days (and future if available)
export interface ForecastDataPoint {
  date: string;
  predicted_consumption: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  state_id: string;
}

export const getForecastConsumption = async (stateId?: string) => {
  try {
    // Get current date and 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];

    // Build the query to get recent forecast data
    let forecastQuery = supabase
      .from("forecasts")
      .select(
        `date, predicted_consumption, confidence_interval_lower, confidence_interval_upper, state_id`
      )
      .gte("date", startDate)
      .order("date", { ascending: true });

    // Apply state filter if provided
    if (stateId) {
      forecastQuery = forecastQuery.eq("state_id", stateId);
    }

    const { data, error } = await forecastQuery;
    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Group by date to handle multiple forecasts per date (keep the most recent)
    const groupedByDate = new Map();

    data.forEach((item) => {
      const dateKey = item.date;

      // If we don't have this date yet, or if this record is more recent, use it
      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, item);
      }
    });

    // Convert back to array and process numeric fields
    const processedData = Array.from(groupedByDate.values())
      .map((item) => ({
        ...item,
        predicted_consumption:
          item.predicted_consumption !== null &&
          item.predicted_consumption !== undefined
            ? Number(item.predicted_consumption)
            : 0,
        confidence_interval_lower:
          item.confidence_interval_lower !== null &&
          item.confidence_interval_lower !== undefined
            ? Number(item.confidence_interval_lower)
            : 0,
        confidence_interval_upper:
          item.confidence_interval_upper !== null &&
          item.confidence_interval_upper !== undefined
            ? Number(item.confidence_interval_upper)
            : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return processedData;
  } catch (error) {
    console.error("Error fetching forecast consumption data:", error);
    throw error;
  }
};
import { supabase } from "@/integrations/supabase/client";

// Fetch future forecast consumption data for the next 7 days
export interface FutureForecastDataPoint {
  forecast_date: string;
  predicted_consumption: number;
  state_id: string;
}

export const getFutureForecasts = async (
  stateId?: string
): Promise<FutureForecastDataPoint[]> => {
  try {
    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("future_forecasts")
      .select("forecast_date, predicted_consumption, state_id")
      .gte("forecast_date", today)
      .order("forecast_date", { ascending: true });

    if (stateId) {
      query = query.eq("state_id", stateId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching future forecasts:", error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error("Error in getFutureForecasts:", error);
    throw error;
  }
};

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
    // Find the most recent date in the forecasts table
    const { data: dateData, error: dateError } = await supabase
      .from("forecasts")
      .select("date")
      .order("date", { ascending: false })
      .limit(1);

    if (dateError) throw dateError;
    const mostRecentDate =
      dateData && dateData.length > 0 ? dateData[0].date : null;
    if (!mostRecentDate) return [];

    // Get consumption data grouped by region for the most recent date
    const { data, error } = await supabase
      .from("forecasts")
      .select(`predicted_consumption, state:state_id (region)`)
      .eq("date", mostRecentDate);

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
export const getWeatherImpactData = async (stateId?: string) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get weather data for the past 30 days
    let weatherQuery = supabase
      .from("weather_data")
      .select(
        `
        date,
        state_id,
        temperature,
        humidity,
        wind_speed,
        rainfall
      `
      )
      .gte("date", thirtyDaysAgo)
      .lte("date", yesterday)
      .order("date", { ascending: true });

    if (stateId) {
      weatherQuery = weatherQuery.eq("state_id", stateId);
    }

    const { data: weatherData, error: weatherError } = await weatherQuery;
    if (weatherError) throw weatherError;

    // Get consumption data for the same period
    let consumptionQuery = supabase
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

    if (stateId) {
      consumptionQuery = consumptionQuery.eq("state_id", stateId);
    }

    const { data: consumptionData, error: consumptionError } =
      await consumptionQuery;

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
          humiditySum: 0,
          humidityCount: 0,
          windSpeedSum: 0,
          windSpeedCount: 0,
          rainfallSum: 0,
          rainfallCount: 0,
          consumption: 0,
        });
      }

      const dateData = dateMap.get(date);
      if (weather.temperature != null) {
        dateData.temperatureSum += weather.temperature;
        dateData.temperatureCount += 1;
      }
      if (weather.humidity != null) {
        dateData.humiditySum += weather.humidity;
        dateData.humidityCount += 1;
      }
      if (weather.wind_speed != null) {
        dateData.windSpeedSum += weather.wind_speed;
        dateData.windSpeedCount += 1;
      }
      if (weather.rainfall != null) {
        dateData.rainfallSum += weather.rainfall;
        dateData.rainfallCount += 1;
      }
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
      .map(
        ({
          date,
          temperatureSum,
          temperatureCount,
          humiditySum,
          humidityCount,
          windSpeedSum,
          windSpeedCount,
          rainfallSum,
          rainfallCount,
          consumption,
        }) => ({
          date,
          temperature:
            temperatureCount > 0
              ? Math.round((temperatureSum / temperatureCount) * 10) / 10
              : 0,
          humidity:
            humidityCount > 0
              ? Math.round((humiditySum / humidityCount) * 10) / 10
              : 0,
          wind_speed:
            windSpeedCount > 0
              ? Math.round((windSpeedSum / windSpeedCount) * 10) / 10
              : 0,
          rainfall:
            rainfallCount > 0
              ? Math.round((rainfallSum / rainfallCount) * 10) / 10
              : 0,
          consumption: Math.round(consumption) || 0,
        })
      )
      .filter((item) => item.consumption > 0) // Only include entries with consumption data
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

    // Get today's confidence percentage from forecasts table
    let accuracyQuery = supabase
      .from("forecasts")
      .select("confidence_percentage")
      .eq("date", today)
      .limit(1)
      .single();

    if (selectedStateId) {
      accuracyQuery = accuracyQuery.eq("state_id", selectedStateId);
    }

    const { data: todayAccuracy, error: accuracyError } = await accuracyQuery;

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

    // Use today's confidence percentage or default value
    const accuracy = todayAccuracy?.confidence_percentage || 95.0;

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
      forecasterAccuracy: Math.round(accuracy * 10) / 10,
      states: statesCount || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Get holiday vs non-holiday consumption comparison for a specific state
export const getHolidayComparisonData = async (stateId?: string) => {
  try {
    // Get all holidays
    const { data: holidayData, error: holidayError } = await supabase
      .from("holidays")
      .select("date, is_holiday")
      .eq("is_holiday", true);

    if (holidayError) throw holidayError;

    // Create a set of holiday dates for faster lookup
    const holidayDates = new Set(
      holidayData?.map((holiday) => holiday.date) || []
    );

    // Get forecast data
    let forecastQuery = supabase
      .from("forecasts")
      .select(
        `
        date,
        predicted_consumption,
        state_id,
        state:state_id (
          name
        )
      `
      )
      .order("date", { ascending: true });

    if (stateId) {
      forecastQuery = forecastQuery.eq("state_id", stateId);
    }

    const { data: forecastData, error: forecastError } = await forecastQuery;

    if (forecastError) throw forecastError;

    // Group forecast data by whether the date is a holiday
    let holidayConsumption = 0;
    let holidayCount = 0;
    let nonHolidayConsumption = 0;
    let nonHolidayCount = 0;

    forecastData?.forEach((forecast) => {
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
        count: holidayCount,
      },
      {
        name: "Normal Day",
        consumption:
          nonHolidayCount > 0
            ? Math.round(nonHolidayConsumption / nonHolidayCount)
            : 0,
        count: nonHolidayCount,
      },
    ];
  } catch (error) {
    console.error("Error fetching holiday comparison data:", error);
    throw error;
  }
};

export const getStatesWithPopulation = async () => {
  try {
    const { data, error } = await supabase
      .from("states")
      .select("id, name, region, population")
      .order("name", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching states with population data:", error);
    throw error;
  }
};
