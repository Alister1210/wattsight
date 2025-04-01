
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart2, Zap, TrendingUp, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <BarChart2 className="h-8 w-8 mb-4 text-primary" />,
      title: "Interactive Charts",
      description: "Visualize electricity consumption patterns with interactive charts and graphs."
    },
    {
      icon: <Zap className="h-8 w-8 mb-4 text-warning-400" />,
      title: "Real-time Analysis",
      description: "Track real-time energy usage across different states of India."
    },
    {
      icon: <TrendingUp className="h-8 w-8 mb-4 text-energy-500" />,
      title: "Forecasting",
      description: "Predict future energy consumption using advanced forecasting algorithms."
    },
    {
      icon: <PieChart className="h-8 w-8 mb-4 text-primary" />,
      title: "Comparative Analysis",
      description: "Compare energy usage patterns between different states and regions."
    }
  ];

  const stats = [
    { value: "29", label: "Indian States" },
    { value: "450+", label: "TWh Annual Consumption" },
    { value: "95%", label: "Forecast Accuracy" },
    { value: "250M+", label: "Data Points Analyzed" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-background via-background to-blue-50 dark:to-blue-950/20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`${isVisible ? 'animate-fade-up' : 'opacity-0'} transition-all duration-1000 ease-out`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="gradient-text">Visualize</span> India's <br />
                Energy Consumption
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                An interactive dashboard providing data-driven insights into electricity 
                consumption patterns across Indian states.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Explore Dashboard
                  </Button>
                </Link>
                <Link to="/states">
                  <Button size="lg" variant="outline">
                    View State Data
                  </Button>
                </Link>
              </div>
            </div>
            <div className={`relative ${isVisible ? 'animate-fade-in' : 'opacity-0'} transition-all duration-1000 delay-300 ease-out`}>
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute top-0 left-0 w-72 h-72 bg-energy-300 dark:bg-energy-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow delay-1000"></div>
                <div className="relative shadow-xl rounded-2xl overflow-hidden border bg-card">
                  <img 
                    src="https://placehold.co/600x400/0ea5e9/FFFFFF?text=WattSight+Dashboard&font=montserrat" 
                    alt="WattSight Dashboard Preview" 
                    className="w-full h-auto rounded-t-lg"
                  />
                  <div className="p-6 bg-card">
                    <h3 className="font-bold text-lg mb-2">Power Consumption Analytics</h3>
                    <p className="text-sm text-muted-foreground">Interactive and real-time electricity consumption data across Indian states</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground">
              WattSight provides comprehensive tools to analyze and visualize electricity consumption 
              data across all Indian states.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="stat-card flex flex-col items-center text-center p-8 transition-all duration-300 hover:translate-y-[-5px]"
              >
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
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
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to analyze energy data?</h2>
              <p className="text-blue-50 max-w-md">
                Explore our interactive dashboard and discover insights about electricity consumption across India.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
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
