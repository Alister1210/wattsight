
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  change, 
  icon,
  className = ""
}: StatsCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold">{value}</h2>
              {change !== undefined && (
                <div className={`flex items-center text-xs font-medium ${
                  change > 0 
                    ? 'text-green-500' 
                    : change < 0 
                      ? 'text-red-500' 
                      : 'text-muted-foreground'
                }`}>
                  {change > 0 ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : change < 0 ? (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  ) : null}
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground/60">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
