import { useState, useEffect, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin } from "lucide-react";
import { getStatesWithPopulation } from "@/lib/real-data";
import { toast } from "@/components/ui/use-toast";

interface IndiaMapChartProps {
  stateData: any[];
  forecastData: any[];
  title: string;
  description?: string;
}

export function IndiaMapChart({
  stateData,
  forecastData,
  title,
  description,
}: IndiaMapChartProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [statesWithPopulation, setStatesWithPopulation] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Fetch states with population data
  useEffect(() => {
    const fetchStatesWithPopulation = async () => {
      setIsLoading(true);
      try {
        const data = await getStatesWithPopulation();
        setStatesWithPopulation(data);
      } catch (error) {
        console.error("Failed to fetch states with population:", error);
        toast({
          title: "Error",
          description: "Failed to load population data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatesWithPopulation();
  }, []);

  // Calculate today's or latest consumption for each state (robust)
  // - Matches dates in local YYYY-MM-DD (handles ISO with timezones)
  // - Falls back to the most recent timestamped forecast or last-added entry
  const getStateConsumption = (targetDate?: string) => {
    const consumptionMap: Record<string, number> = {};
    // Use local YYYY-MM-DD so we avoid UTC/local timezone mismatches
    const today = targetDate || new Date().toLocaleDateString("en-CA"); // "en-CA" -> YYYY-MM-DD

    const normalize = (d?: string | Date) =>
      d ? new Date(d).toLocaleDateString("en-CA") : ""; // normalize forecast dates to YYYY-MM-DD in local timezone

    stateData.forEach((state) => {
      // Keep original index so we can prefer later entries if timestamps tie or are invalid
      const stateForecasts = forecastData
        .map((f: any, idx: number) => ({ ...f, __originalIndex: idx }))
        .filter(
          (f: any) =>
            String(f.state_id) === String(state.id) && // robust id comparison
            f.predicted_consumption != null // ignore null/undefined consumption
        );

      if (stateForecasts.length === 0) {
        consumptionMap[state.name] = 0;
        return;
      }

      // 1) Try to find exact match for the target date (normalized)
      const todayForecast = stateForecasts.find(
        (f: any) => normalize(f.date) === today
      );
      if (todayForecast) {
        consumptionMap[state.name] =
          Number(todayForecast.predicted_consumption) || 0;
        return;
      }

      // 2) Fallback: pick forecast with the latest timestamp (or last-added if date invalid)
      let latest = stateForecasts[0];
      let latestTs = Number(new Date(latest.date).getTime());

      for (const f of stateForecasts) {
        const ts = Number(new Date(f.date).getTime());
        if (Number.isFinite(ts)) {
          if (
            !Number.isFinite(latestTs) ||
            ts > latestTs ||
            (ts === latestTs && f.__originalIndex > latest.__originalIndex)
          ) {
            latest = f;
            latestTs = ts;
          }
        } else {
          // invalid date -> prefer items later in array (assumed last-added)
          if (
            !Number.isFinite(latestTs) &&
            f.__originalIndex > latest.__originalIndex
          ) {
            latest = f;
          }
        }
      }

      consumptionMap[state.name] = Number(latest.predicted_consumption) || 0;
    });

    return consumptionMap;
  };

  // Get consumption level color - Enhanced color palette for better visibility in light mode
  const getConsumptionColor = (
    stateName: string,
    consumptionData: Record<string, number>,
    isDarkMode: boolean
  ) => {
    if (!consumptionData[stateName]) return isDarkMode ? "#374151" : "#d1d5db"; // Lighter gray for light mode

    const consumption = consumptionData[stateName];
    const allValues = Object.values(consumptionData).filter((v) => v > 0);
    const max = Math.max(...allValues);
    const intensity = consumption / max;

    if (isDarkMode) {
      // Dark mode blues - brighter for better visibility
      if (intensity < 0.3) return "#93c5fd"; // Light blue
      if (intensity < 0.6) return "#60a5fa"; // Medium blue
      if (intensity < 0.8) return "#3b82f6"; // Darker blue
      return "#2563eb"; // Darkest blue
    } else {
      // Light mode blues - Higher contrast colors for better visibility
      if (intensity < 0.3) return "#bfdbfe"; // Very light blue
      if (intensity < 0.6) return "#60a5fa"; // Medium blue
      if (intensity < 0.8) return "#3b82f6"; // Darker blue
      return "#1d4ed8"; // Very dark blue for highest contrast
    }
  };

  // Calculate map dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (mapContainerRef.current) {
        const { width, height } =
          mapContainerRef.current.getBoundingClientRect();
        setMapDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const consumptionData = useMemo(
    () => getStateConsumption(),
    [stateData, forecastData]
  );

  // Detect dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(
      darkModeQuery.matches ||
        document.documentElement.classList.contains("dark")
    );

    const darkModeListener = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeQuery.addEventListener("change", darkModeListener);
    return () => darkModeQuery.removeEventListener("change", darkModeListener);
  }, []);

  // Updated map coordinates for all Indian states and union territories
  // Using percentages instead of absolute pixels for better responsiveness
  const stateCoordinates: Record<
    string,
    { x: number; y: number; displayName?: string; scale?: number }
  > = {
    // Major States
    "J&K": { x: 36, y: 10, scale: 0.8, displayName: "Jammu and Kashmir" },
    HP: { x: 38, y: 17, scale: 0.8, displayName: "Himachal Pradesh" },
    Punjab: { x: 34, y: 21, scale: 0.9 },
    Chandigarh: { x: 38, y: 23, scale: 0.45 },
    Uttarakhand: { x: 43, y: 25, scale: 0.8 },
    Haryana: { x: 35, y: 27, scale: 0.9 },
    Delhi: { x: 38, y: 30, scale: 0.75, displayName: "Delhi" },
    UP: { x: 46, y: 34, scale: 1.1, displayName: "Uttar Pradesh" },
    Bihar: { x: 56, y: 38, scale: 0.9 },
    Sikkim: { x: 62, y: 33, scale: 0.7 },
    "Arunachal Pradesh": { x: 76, y: 30, scale: 0.7 },
    Nagaland: { x: 76, y: 37, scale: 0.7 },
    Assam: { x: 72, y: 37, scale: 0.9 },
    Meghalaya: { x: 68, y: 40, scale: 0.7 },
    Mizoram: { x: 72, y: 46, scale: 0.7 },
    Tripura: { x: 68, y: 47, scale: 0.7 },
    Manipur: { x: 73, y: 43, scale: 0.7 },
    "West Bengal": { x: 61, y: 48, scale: 1 },
    Jharkhand: { x: 56, y: 46, scale: 0.8 },
    Chhattisgarh: { x: 50, y: 50, scale: 0.8 },
    Odisha: { x: 55, y: 55, scale: 0.9 },
    MP: { x: 41, y: 47, scale: 1, displayName: "Madhya Pradesh" },
    Rajasthan: { x: 32, y: 36, scale: 1.1 },
    DNH: {
      x: 29,
      y: 57,
      scale: 0.45,
      displayName: "Dadra and Nagar Haveli",
    },
    Maharashtra: { x: 33, y: 62, scale: 1.1 },
    Goa: { x: 32, y: 73, scale: 0.7 },
    Karnataka: { x: 36, y: 74, scale: 1 },
    Gujarat: { x: 26, y: 48, scale: 1.1 },
    Telangana: { x: 41, y: 66, scale: 0.8 },
    "Andhra Pradesh": { x: 42, y: 72, scale: 1 },
    Pondy: { x: 47, y: 70, scale: 0.55, displayName: "Puducherry" },
    Kerala: { x: 36, y: 86, scale: 0.9 },
    "Tamil Nadu": { x: 42, y: 86, scale: 1 },
  };

  // Get state details for tooltip
  const getStateDetails = (stateName: string) => {
    // First try to find the state in the statesWithPopulation array
    const stateWithPop = statesWithPopulation.find((s) => s.name === stateName);

    // If found, use that data
    if (stateWithPop) {
      const consumption = consumptionData[stateName] || 0;
      return {
        name: stateName,
        consumption,
        region: stateWithPop.region || "Unknown",
        population: stateWithPop.population
          ? stateWithPop.population.toLocaleString()
          : "Unknown",
      };
    }

    // Fallback to the original stateData if statesWithPopulation doesn't have it
    const state = stateData.find((s) => s.name === stateName);
    if (!state) return null;
    const consumption = consumptionData[stateName] || 0;
    return {
      name: stateName,
      consumption,
      region: state.region || "Unknown",
      population: state.population
        ? state.population.toLocaleString()
        : "Unknown",
    };
  };

  // Handle state click
  const handleStateClick = (stateName: string) => {
    setSelectedState(selectedState === stateName ? null : stateName);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div
          ref={mapContainerRef}
          className="relative flex items-center justify-center h-[900px] md:h-[900px] overflow-hidden bg-gray-100 dark:bg-gray-900 rounded-lg"
        >
          {/* India Map SVG with proper positioning and coloring */}
          <div className="relative w-[90%] h-[90%] flex items-center justify-center">
            <img
              src="/india.svg"
              alt="India Map"
              className="w-full h-full object-contain max-w-full max-h-full drop-shadow-sm opacity-50 dark:opacity-60 dark:invert-[15%] dark:hue-rotate-180 transition-all duration-300"
            />

            {/* State circles with data binding */}
            {stateData.map((state) => {
              const coords = stateCoordinates[state.name];
              if (!coords) return null;

              const consumption = consumptionData[state.name] || 0;
              const color = getConsumptionColor(
                state.name,
                consumptionData,
                isDarkMode
              );
              const isSelected = selectedState === state.name;
              const isHovered = hoveredState === state.name;
              const scale = coords.scale || 1;
              const size =
                Math.max(16 * scale, 10) * (consumption > 0 ? 1 : 0.6); // Increased base size

              return (
                <div
                  key={state.id}
                  className="absolute cursor-pointer transition-all duration-200 ease-in-out"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    transform: `translate(-50%, -50%) scale(${
                      isHovered || isSelected ? 1.15 : 1
                    })`,
                    zIndex: isHovered || isSelected ? 5 : 1,
                  }}
                  onMouseEnter={() => setHoveredState(state.name)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => handleStateClick(state.name)}
                >
                  <div
                    className="rounded-full transition-all duration-200 shadow-md" // Better shadow
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: color,
                      border: isSelected
                        ? "2px solid #000"
                        : isHovered
                        ? `2px solid ${isDarkMode ? "#fff" : "#000"}`
                        : isDarkMode
                        ? "none"
                        : "1px solid rgba(0,0,0,0.2)", // Add light border in light mode for better visibility
                      opacity: isHovered || isSelected ? 1 : 0.95, // Slightly higher base opacity
                    }}
                  />
                </div>
              );
            })}

            {/* State labels with improved visibility */}
            {stateData.map((state) => {
              const coords = stateCoordinates[state.name];
              if (!coords) return null;

              const isSelected = selectedState === state.name;
              const isHovered = hoveredState === state.name;
              const displayText = coords.displayName || state.name;

              // Only show labels for states with consumption or if mobile view, limit shown labels
              const shouldShow =
                consumptionData[state.name] > 0 &&
                (!isMobile ||
                  isSelected ||
                  isHovered ||
                  (coords.scale || 0) > 0.8);

              return (
                shouldShow && (
                  <div
                    key={`label-${state.id}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${coords.x}%`,
                      top: `${coords.y + 2}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 2,
                    }}
                  >
                    <span
                      className={`text-[9px] md:text-xs ${
                        isDarkMode
                          ? "bg-gray-900/90"
                          : "bg-white/95 shadow-sm border border-gray-200" // Added border and shadow for better contrast
                      } px-1.5 py-0.5 rounded-md ${
                        isSelected || isHovered ? "font-medium" : ""
                      }`}
                      style={{
                        color: isDarkMode
                          ? isSelected || isHovered
                            ? "#fff" // White text when selected/hovered in dark mode
                            : "rgba(255,255,255,0.9)" // Improved visibility in dark mode
                          : isSelected || isHovered
                          ? "#000" // Black text when selected/hovered in light mode
                          : "rgba(0,0,0,0.9)", // Dark text in light mode for better visibility
                        fontWeight: isSelected || isHovered ? 600 : 500, // Add more weight to text
                        textShadow: isDarkMode
                          ? "none"
                          : "0px 0px 1px rgba(255,255,255,0.8)", // White text shadow in light mode
                      }}
                    >
                      {displayText}
                    </span>
                  </div>
                )
              );
            })}

            {/* State details tooltip with improved visibility */}
            {hoveredState && (
              <div
                className="absolute p-3 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20 w-56 transition-all"
                style={{
                  left: `${stateCoordinates[hoveredState]?.x}%`,
                  top: `${stateCoordinates[hoveredState]?.y}%`,
                  transform: "translate(-50%, -120%)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-primary" />
                  <h4 className="font-medium">{hoveredState}</h4>
                </div>
                {getStateDetails(hoveredState) && (
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>Region: {getStateDetails(hoveredState)?.region}</p>
                    <p>
                      Population: {getStateDetails(hoveredState)?.population}
                    </p>
                    <p className="font-medium text-foreground">
                      Consumption:{" "}
                      {consumptionData[hoveredState]?.toLocaleString() || 0} GWh
                    </p>
                  </div>
                )}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-inherit border-r border-b border-gray-200 dark:border-gray-700"></div>
              </div>
            )}

            {/* Legend - Improved with better contrast for light mode */}
            <div className="absolute bottom-4 left-4 p-3 bg-white dark:bg-gray-800 backdrop-blur-sm rounded-md shadow-md border border-gray-200 dark:border-gray-700 z-10">
              <p className="text-xs font-medium mb-2">Consumption Level</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {isDarkMode
                  ? ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"].map(
                      (color, i) => (
                        <div key={color} className="flex items-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm border border-gray-700"
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="text-xs whitespace-nowrap">
                            {i === 0
                              ? "Low"
                              : i === 1
                              ? "Medium"
                              : i === 2
                              ? "High"
                              : "Very High"}
                          </span>
                        </div>
                      )
                    )
                  : ["#bfdbfe", "#60a5fa", "#3b82f6", "#1d4ed8"].map(
                      (color, i) => (
                        <div key={color} className="flex items-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm border border-gray-300"
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="text-xs whitespace-nowrap font-medium">
                            {i === 0
                              ? "Low"
                              : i === 1
                              ? "Medium"
                              : i === 2
                              ? "High"
                              : "Very High"}
                          </span>
                        </div>
                      )
                    )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
