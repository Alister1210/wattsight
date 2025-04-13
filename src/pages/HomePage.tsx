import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart2, Zap, TrendingUp, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import Spline from "@splinetool/react-spline";

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <BarChart2 className="h-8 w-8 mb-4 text-primary" />,
      title: "Interactive Charts",
      description:
        "Visualize electricity consumption patterns with interactive charts and graphs.",
    },
    {
      icon: <Zap className="h-8 w-8 mb-4 text-warning-400" />,
      title: "Real-time Analysis",
      description:
        "Track real-time energy usage across different states of India.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 mb-4 text-energy-500" />,
      title: "Forecasting",
      description:
        "Predict future energy consumption using advanced forecasting algorithms.",
    },
    {
      icon: <PieChart className="h-8 w-8 mb-4 text-primary" />,
      title: "Comparative Analysis",
      description:
        "Compare energy usage patterns between different states and regions.",
    },
  ];

  const stats = [
    { value: "29", label: "Indian States" },
    { value: "450+", label: "MWh Annual Consumption" },
    { value: "95%", label: "Forecast Accuracy" },
    { value: "250M+", label: "Data Points Analyzed" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <main className="relative h-screen">
        {/* Spline background container covering the entire screen and receiving pointer events */}
        <div className="w-screen h-screen">
          <Spline scene="https://prod.spline.design/SFL26SUJOuKqrsRv/scene.splinecode" />
        </div>

        {/* Content section with pointer-events-none by default */}
        <section className="absolute inset-0 py-16 md:py-24 pointer-events-none">
          {/* Improved gradient that works better in both modes */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background/20 to-transparent dark:from-background/60 dark:via-background/30"></div>

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-screen">
              {/* Left content column - with pointer-events-auto to make buttons clickable */}
              <div
                className={`${
                  isVisible ? "animate-fade-up" : "opacity-0"
                } transition-all duration-1000 ease-out`}
              >
                <div className="pointer-events-auto bg-background/40 dark:bg-background/30 p-6 rounded-lg backdrop-blur-sm border border-border/30 shadow-sm">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                    <span className="text-primary dark:text-primary">
                      Visualize
                    </span>{" "}
                    India's <br />
                    Energy Consumption
                  </h1>
                  <p className="text-lg text-foreground/90 dark:text-foreground/80 mb-8 max-w-xl">
                    An interactive dashboard providing data-driven insights into
                    electricity consumption patterns across Indian states.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/dashboard">
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Explore Dashboard
                      </Button>
                    </Link>
                    <Link to="/states">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-primary/20 hover:border-primary/30 hover:bg-primary/5"
                      >
                        View State Data
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right side - removed the elements that were blocking interaction */}
              <div className="hidden lg:block"></div>
            </div>
          </div>
        </section>
      </main>
      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Powerful Features
            </h2>
            <p className="text-muted-foreground">
              WattSight provides comprehensive tools to analyze and visualize
              electricity consumption data across all Indian states.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="stat-card flex flex-col items-center text-center p-8 transition-all duration-300 hover:translate-y-[-5px] bg-card dark:bg-card/40 rounded-lg border border-border/50 shadow-sm"
              >
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary/5 dark:bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-background/50 dark:bg-background/20 backdrop-blur-sm border border-border/30"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-700 dark:to-teal-600 rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to analyze energy data?
              </h2>
              <p className="text-blue-50 max-w-md opacity-90">
                Explore our interactive dashboard and discover insights about
                electricity consumption across India.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-white/90 dark:hover:bg-white"
                >
                  Launch Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
