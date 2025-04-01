import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin } from "lucide-react";

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Calculate state-wise consumption
  const getStateConsumption = () => {
    const consumptionMap: Record<string, number> = {};
    stateData.forEach((state) => {
      const stateForecasts = forecastData.filter(
        (f) => f.state_id === state.id
      );
      const totalConsumption = stateForecasts.reduce(
        (sum, f) => sum + (f.predicted_consumption || 0),
        0
      );
      const avgConsumption =
        stateForecasts.length > 0
          ? Math.round(totalConsumption / stateForecasts.length)
          : 0;
      consumptionMap[state.name] = avgConsumption;
    });
    return consumptionMap;
  };

  // Get consumption level color - Enhanced color palette for better visibility
  const getConsumptionColor = (
    stateName: string,
    consumptionData: Record<string, number>,
    isDarkMode: boolean
  ) => {
    if (!consumptionData[stateName]) return isDarkMode ? "#374151" : "#e5e7eb"; // Default gray

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
      // Light mode blues
      if (intensity < 0.3) return "#dbeafe"; // Very light blue
      if (intensity < 0.6) return "#93c5fd"; // Light blue
      if (intensity < 0.8) return "#60a5fa"; // Medium blue
      return "#3b82f6"; // Dark blue
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

  const consumptionData = getStateConsumption();

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
          className="relative flex items-center justify-center h-[900px] md:h-[900px] overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg"
        >
          {/* India Map SVG with proper positioning and coloring */}
          <div className="relative w-[90%] h-[90%] flex items-center justify-center">
            <img
              src="/india.svg"
              alt="India Map"
              className="w-full h-full object-contain max-w-full max-h-full drop-shadow-sm opacity-75 dark:opacity-60 dark:invert-[15%] dark:hue-rotate-180 transition-all duration-300"
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
                Math.max(14 * scale, 8) * (consumption > 0 ? 1 : 0.6);

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
                    className="rounded-full transition-all duration-200 shadow-sm"
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: color,
                      border: isSelected
                        ? "2px solid #000"
                        : isHovered
                        ? `2px solid ${isDarkMode ? "#fff" : "#333"}`
                        : "none",
                      opacity: isHovered || isSelected ? 1 : 0.9,
                    }}
                  />
                </div>
              );
            })}

            {/* State labels - FIXED: Text color in light mode changed to black for better visibility */}
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
                      className={`text-[9px] md:text-xs bg-white/90 dark:bg-gray-900/90 px-1 py-0.5 rounded ${
                        isSelected || isHovered ? "font-medium" : ""
                      }`}
                      style={{
                        color: isDarkMode
                          ? isSelected || isHovered
                            ? "#fff" // White text when selected/hovered in dark mode
                            : "rgba(255,255,255,0.8)" // Improved visibility in dark mode
                          : "#000", // Always black text in light mode for better visibility
                        fontWeight: isSelected || isHovered ? 600 : 500, // Add more weight to text
                        textShadow: isDarkMode
                          ? "none"
                          : "0px 0px 1px rgba(0,0,0,0.1)",
                      }}
                    >
                      {displayText}
                    </span>
                  </div>
                )
              );
            })}

            {/* State details tooltip */}
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
                      {consumptionData[hoveredState]?.toLocaleString() || 0} KWh
                    </p>
                  </div>
                )}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-inherit border-r border-b border-gray-200 dark:border-gray-700"></div>
              </div>
            )}

            {/* Legend - Improved and responsive */}
            <div className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-100 dark:border-gray-700 z-10">
              <p className="text-xs font-medium mb-2">Consumption Level</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {isDarkMode
                  ? ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"].map(
                      (color, i) => (
                        <div key={color} className="flex items-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
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
                  : ["#dbeafe", "#93c5fd", "#60a5fa", "#3b82f6"].map(
                      (color, i) => (
                        <div key={color} className="flex items-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
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
                    )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
