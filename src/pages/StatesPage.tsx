import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStates } from "@/lib/real-data";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MapPin, Search, Loader2 } from "lucide-react";
import { IndiaMapChart } from "@/components/dashboard/IndiaMapChart";
import { supabase } from "@/lib/supabaseClient";

const StatesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [filteredForecastData, setFilteredForecastData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const statesData = await getStates();
        setStates(statesData);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Fetch forecast data from Supabase
  useEffect(() => {
    const fetchForecasts = async () => {
      try {
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

        // Filter forecast data for Maharashtra (or you can make this dynamic)
        const filteredData =
          forecastsData?.filter(
            (forecast) =>
              forecast.state && forecast.state.name === "Maharashtra"
          ) || [];
        setFilteredForecastData(filteredData);
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      }
    };

    fetchForecasts();
  }, []);

  const filteredStates = states.filter(
    (state) =>
      state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group states by region
  const groupedByRegion: Record<string, typeof states> = {};
  filteredStates.forEach((state) => {
    if (!groupedByRegion[state.region]) {
      groupedByRegion[state.region] = [];
    }
    groupedByRegion[state.region].push(state);
  });

  // Get the regions in a specific order
  const regions = ["North", "South", "East", "West"];

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-medium">Loading states data...</h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold gradient-text mb-4">
          Explore Indian States
        </h1>
        <p className="text-muted-foreground mb-8">
          View electricity consumption data for each state in India, grouped by
          region
        </p>

        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search states or regions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* India Map - Primary focus */}
        <div className="mb-8 sm:block hidden md:block">
          <IndiaMapChart
            stateData={states}
            forecastData={forecastData}
            title="Electricity Forecast Across India"
            description="Interactive heatmap visualization of predicted energy consumption by state"
          />
        </div>

        <div className="space-y-8">
          {regions.map((region) => {
            // Skip regions that don't have any states after filtering
            if (!groupedByRegion[region]?.length) return null;

            return (
              <div key={region}>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  {region} Region
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedByRegion[region].map((state) => (
                    <Link to={`/dashboard?state=${state.name}`} key={state.id}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-medium">
                                {state.name}
                              </h3>
                              <Badge variant="outline" className="mt-2">
                                {state.region}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredStates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No states found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StatesPage;
