import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ModelPerformanceTableProps {
  data: Array<{
    model: string;
    state: string;
    rmse: number;
    mae: number;
    accuracy: number;
  }>;
  title: string;
  description?: string;
}

export function ModelPerformanceTable({
  data,
  title,
  description,
}: ModelPerformanceTableProps) {
  // Get accuracy badge variant based on accuracy percentage
  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 95) return "default";
    if (accuracy >= 85) return "secondary";
    return "destructive";
  };

  // Format accuracy as percentage
  const formatAccuracy = (accuracy: number) => `${accuracy.toFixed(1)}%`;

  // Ensure we have data before rendering
  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No model data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>State</TableHead>
              <TableHead>RMSE</TableHead>
              <TableHead>MAE</TableHead>
              <TableHead>Accuracy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((model, index) => (
              <TableRow key={`${model.model}-${index}`}>
                <TableCell className="font-medium">{model.model}</TableCell>
                <TableCell>{model.state}</TableCell>
                <TableCell>{model.rmse.toFixed(2)}</TableCell>
                <TableCell>{model.mae.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getAccuracyBadge(model.accuracy)}>
                    {formatAccuracy(model.accuracy)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
