import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart2, Users, GraduationCap, Globe2 } from "lucide-react";

const AboutPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            About WattSight
          </h1>
          <p className="text-muted-foreground mb-8">
            Understanding our mission and the data behind our electricity
            consumption analytics
          </p>

          <Card className="mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <BarChart2 className="h-10 w-10 text-primary mr-4" />
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="mb-4">
                WattSight was created to provide transparent, data-driven
                insights into electricity consumption patterns across India. We
                believe that better visibility into energy usage can drive more
                sustainable practices and help optimize the national power grid.
              </p>
              <p>
                By visualizing complex data in intuitive ways, we aim to make
                electricity consumption trends accessible to policymakers,
                researchers, businesses, and the general public.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">The Team</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-5 w-5 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Data Scientists</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Our team of data scientists specializes in energy consumption
                  modeling, time series forecasting, and creating predictive
                  algorithms that provide accurate insights into electricity
                  usage patterns.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Globe2 className="h-5 w-5 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Energy Specialists</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Industry experts with deep knowledge of the Indian power
                  sector, regional distribution networks, and the unique
                  challenges and opportunities in different states.
                </p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-6">Data Sources</h2>
          <Card className="mb-8">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Electricity Consumption Data
                </h3>
                <p className="text-muted-foreground text-sm">
                  Our dashboard sources real-time and historical consumption
                  data from state electricity boards, the Central Electricity
                  Authority, and power distribution companies across India.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Weather Information
                </h3>
                <p className="text-muted-foreground text-sm">
                  To analyze the correlation between weather and electricity
                  usage, we incorporate temperature, humidity, and other
                  meteorological data from the Indian Meteorological Department.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Forecasting Models
                </h3>
                <p className="text-muted-foreground text-sm">
                  Our forecasting engine is powered by an XGBoost model, which
                  demonstrated the highest accuracy after a rigorous evaluation
                  against other time-series models like ARIMA, LSTM, and SARIMA.
                  The model leverages sophisticated feature engineering,
                  including lag features, rolling window statistics, and
                  calendar-based variables (like holidays and day of the week)
                  to capture complex consumption patterns. This allows us to
                  provide not just a point forecast but also confidence
                  intervals, giving a clearer picture of the prediction's
                  reliability.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 sm:p-8 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">
              Research &amp; Collaboration
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              We're committed to advancing energy research and welcome
              collaboration opportunities with academic institutions, government
              bodies, and industry partners.
            </p>
            <p className="font-medium">
              Contact us at{" "}
              <span className="text-primary">alisterfernandes@gmail.com</span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
