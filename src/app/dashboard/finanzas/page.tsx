
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, CircleDollarSign, Percent } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useRestaurant } from "@/context/RestaurantContext";
import { FinancialRecord } from "@/lib/types";
import { startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, eachDayOfInterval, format, subMonths, subWeeks, subYears, eachWeekOfInterval, eachMonthOfInterval, lastDayOfWeek, lastDayOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const [range, setRange] = useState("this_month");
  const { financials } = useRestaurant();

  const {
    totalRevenue,
    totalCogs,
    grossProfit,
    profitMargin,
    revenueChange,
    cogsChange,
    profitChange,
    marginChange,
    chartData,
  } = useMemo(() => {
    const now = new Date();
    let startDate: Date, endDate: Date;
    let prevStartDate: Date, prevEndDate: Date;
    let intervalType: 'day' | 'week' | 'month' = 'day';

    switch(range) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            prevStartDate = subWeeks(startDate, 1); // Compare to same day last week
            prevEndDate = subWeeks(endDate, 1);
            intervalType = 'day';
            break;
        case 'this_week':
            startDate = startOfWeek(now, { weekStartsOn: 1 });
            endDate = endOfWeek(now, { weekStartsOn: 1 });
            prevStartDate = subWeeks(startDate, 1);
            prevEndDate = subWeeks(endDate, 1);
            intervalType = 'day';
            break;
        case 'this_year':
            startDate = startOfYear(now);
            endDate = endOfYear(now);
            prevStartDate = subYears(startDate, 1);
            prevEndDate = subYears(endDate, 1);
            intervalType = 'month';
            break;
        case 'this_month':
        default:
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            prevStartDate = subMonths(startDate, 1);
            prevEndDate = subMonths(endDate, 1);
            intervalType = 'day';
            break;
    }

    const filterByDate = (data: FinancialRecord[], start: Date, end: Date) =>
        data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= start && itemDate <= end;
        });
    
    const sumAmount = (records: FinancialRecord[]) => records.reduce((sum, item) => sum + item.amount, 0);

    const currentPeriodRevenueRecords = filterByDate(financials, startDate, endDate).filter(f => f.type === 'revenue');
    const previousPeriodRevenueRecords = filterByDate(financials, prevStartDate, prevEndDate).filter(f => f.type === 'revenue');
    
    const totalRevenue = sumAmount(currentPeriodRevenueRecords);
    const prevTotalRevenue = sumAmount(previousPeriodRevenueRecords);

    // Dummy COGS and changes for now
    const totalCogs = totalRevenue * 0.35; // Example
    const prevTotalCogs = prevTotalRevenue * 0.38; // Example

    const grossProfit = totalRevenue - totalCogs;
    const prevGrossProfit = prevTotalRevenue - prevTotalCogs;

    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const prevProfitMargin = prevTotalRevenue > 0 ? (prevGrossProfit / prevTotalRevenue) * 100 : 0;

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };
    
    const revenueChange = calculateChange(totalRevenue, prevTotalRevenue);
    const cogsChange = calculateChange(totalCogs, prevTotalCogs);
    const profitChange = calculateChange(grossProfit, prevGrossProfit);
    const marginChange = profitMargin - prevProfitMargin;

    let chartData: { date: string, revenue: number, cogs: number }[] = [];

    if (intervalType === 'day') {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        chartData = days.map(day => {
            const dayStart = new Date(day).setHours(0,0,0,0);
            const dayEnd = new Date(day).setHours(23,59,59,999);
            const dailyRevenue = filterByDate(financials, new Date(dayStart), new Date(dayEnd))
                .filter(f => f.type === 'revenue')
                .reduce((sum, item) => sum + item.amount, 0);
            
            return {
                date: format(day, 'yyyy-MM-dd'),
                revenue: dailyRevenue,
                cogs: dailyRevenue * 0.35, // Example COGS
            };
        });
    } else if (intervalType === 'month') {
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        chartData = months.map(monthStart => {
            const monthEnd = lastDayOfMonth(monthStart);
            const monthlyRevenue = filterByDate(financials, monthStart, monthEnd)
                .filter(f => f.type === 'revenue')
                .reduce((sum, item) => sum + item.amount, 0);
            
            return {
                date: format(monthStart, 'yyyy-MM-dd'),
                revenue: monthlyRevenue,
                cogs: monthlyRevenue * 0.35, // Example COGS
            };
        });
    }


    return {
        totalRevenue,
        totalCogs,
        grossProfit,
        profitMargin,
        revenueChange,
        cogsChange,
        profitChange,
        marginChange,
        chartData
    };
}, [range, financials]);


const formatChange = (change: number) => {
    if (change === 0 || !isFinite(change)) return "0.0%";
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
}

const formatMarginChange = (change: number) => {
    if (change === 0 || !isFinite(change)) return "0.0pp";
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}pp`;
}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Reporte Financiero</h1>
          <p className="text-muted-foreground">
            Análisis de ingresos, costos y ganancias.
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Seleccionar Rango" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="this_week">Esta Semana</SelectItem>
                <SelectItem value="this_month">Este Mes</SelectItem>
                <SelectItem value="this_year">Este Año</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{formatChange(revenueChange)} vs periodo anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo de Bienes (COGS)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCogs.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{formatChange(cogsChange)} vs periodo anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Bruta</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${grossProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{formatChange(profitChange)} vs periodo anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{formatMarginChange(marginChange)} vs periodo anterior</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Evolución de Ingresos vs COGS</CardTitle>
            <CardDescription>Análisis del período seleccionado.</CardDescription>
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
                            // Adjust date because of timezone issues with chart
                            const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
                            const formatStyle = range === 'this_year' ? 'MMM' : 'dd/MMM';
                            return format(adjustedDate, formatStyle, { locale: es });
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
                        stackId="a"
                    />
                    <Area
                        dataKey="cogs"
                        type="natural"
                        fill="var(--color-cogs)"
                        fillOpacity={0.4}
                        stroke="var(--color-cogs)"
                        stackId="a"
                    />
                </AreaChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

    