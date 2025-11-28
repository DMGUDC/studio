import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, CircleDollarSign, Percent } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartData = [
  { date: "2024-01-01", revenue: 4000, cogs: 2400 },
  { date: "2024-02-01", revenue: 3000, cogs: 1398 },
  { date: "2024-03-01", revenue: 2000, cogs: 9800 },
  { date: "2024-04-01", revenue: 2780, cogs: 3908 },
  { date: "2024-05-01", revenue: 1890, cogs: 4800 },
  { date: "2024-06-01", revenue: 2390, cogs: 3800 },
  { date: "2024-07-01", revenue: 3490, cogs: 4300 },
];

const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "hsl(var(--chart-2))",
  },
  cogs: {
    label: "COGS",
    color: "hsl(var(--chart-5))",
  },
};

export default function FinanzasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Reporte Financiero</h1>
          <p className="text-muted-foreground">
            Análisis de ingresos, costos y ganancias.
          </p>
        </div>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>Este Mes</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+15.2% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo de Bienes (COGS)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,873.45</div>
            <p className="text-xs text-muted-foreground">+5.1% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Bruta</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$32,358.44</div>
            <p className="text-xs text-muted-foreground">+21.3% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">71.5%</div>
            <p className="text-xs text-muted-foreground">+3.2pp vs mes anterior</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Evolución de Ingresos vs COGS</CardTitle>
            <CardDescription>Análisis de los últimos 7 meses.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString("es-ES", {month: "short"});
                        }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `$${Number(value) / 1000}k`}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                        dataKey="revenue"
                        type="natural"
                        fill="var(--color-revenue)"
                        fillOpacity={0.4}
                        stroke="var(--color-revenue)"
                    />
                    <Area
                        dataKey="cogs"
                        type="natural"
                        fill="var(--color-cogs)"
                        fillOpacity={0.4}
                        stroke="var(--color-cogs)"
                    />
                </AreaChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
