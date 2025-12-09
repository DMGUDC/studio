
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { BarChart, Users, DollarSign, ClipboardList, Activity, ShoppingCart, Utensils } from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart as BarChartComponent, XAxis, YAxis } from "recharts";
import { useRestaurant } from "@/context/RestaurantContext";
import { useMemo } from "react";
import { isToday, getMonth, format } from "date-fns";
import { es } from "date-fns/locale";

const chartConfig = {
  ingresos: {
    label: "Ingresos",
    color: "hsl(var(--primary))",
  },
  gastos: {
    label: "Gastos",
    color: "hsl(var(--destructive))",
  },
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Entregado: "outline",
  Preparando: "secondary",
  Listo: "default",
  Pendiente: "destructive",
  Cancelado: "destructive",
};


export default function DashboardPage() {
  const { orders, financials } = useRestaurant();

  const dashboardStats = useMemo(() => {
    const todayRevenue = financials
      .filter(f => f.type === 'revenue' && isToday(f.date))
      .reduce((sum, item) => sum + item.amount, 0);

    const activeOrders = orders.filter(o => o.status === 'Pendiente' || o.status === 'Preparando');
    const pendingOrdersCount = activeOrders.filter(o => o.status === 'Pendiente').length;
    const preparingOrdersCount = activeOrders.filter(o => o.status === 'Preparando').length;

    const uniqueTables = new Set(activeOrders.map(o => o.table));
    const activeCustomers = uniqueTables.size; // A simplified proxy for active customers

    const recentOrders = orders.slice(0, 4);

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return { month: format(d, 'MMMM', { locale: es }), ingresos: 0, gastos: 0 };
      }).reverse();

    financials.forEach(record => {
      const monthIndex = getMonth(record.date);
      const currentMonth = getMonth(new Date());
      // This logic is a bit complex to handle year boundaries correctly
      const monthDiff = (currentMonth - monthIndex + 12) % 12;
      const recordYear = record.date.getFullYear();
      const currentYear = new Date().getFullYear();
      
      // Only include records from the last 6 months, considering year change
      if ((currentYear === recordYear && monthDiff < 6) || (currentYear - 1 === recordYear && monthDiff >= 6)) {
          const monthName = format(record.date, 'MMMM', { locale: es });
          const monthEntry = monthlyData.find(m => m.month === monthName);
          if (monthEntry) {
            if (record.type === 'revenue') {
              monthEntry.ingresos += record.amount;
            } else { // 'expense'
              monthEntry.gastos += record.amount;
            }
          }
      }
    });

    const dishRevenue: { [key: string]: number } = {};
    orders
      .filter(o => o.status === 'Entregado' || o.status === 'Cancelado')
      .forEach(o => {
        o.items.forEach(item => {
          dishRevenue[item.name] = (dishRevenue[item.name] || 0) + item.price * item.quantity;
        });
      });
    
    const topDishes = Object.entries(dishRevenue)
        .map(([name, totalRevenue]) => ({ name, totalRevenue }))
        .sort((a,b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);

    const recentExpenses = financials
        .filter(f => f.type === 'expense')
        .sort((a,b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);


    return {
      todayRevenue,
      activeCustomers,
      activeOrdersCount: activeOrders.length,
      pendingOrdersCount,
      preparingOrdersCount,
      recentOrders,
      chartData: monthlyData,
      topDishes,
      recentExpenses,
    };
  }, [orders, financials]);


  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales (Hoy)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardStats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Actualizado en tiempo real</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesas Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">Mesas con pedidos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos en Curso</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{dashboardStats.activeOrdersCount}</div>
            <p className="text-xs text-muted-foreground">
                {dashboardStats.pendingOrdersCount} pendientes, {dashboardStats.preparingOrdersCount} preparando
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad de Cocina</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">Eficiencia del último turno (demo)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Rendimiento Mensual</CardTitle>
            <CardDescription>
              Comparativa de ingresos y gastos de los últimos 6 meses.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChartComponent data={dashboardStats.chartData} accessibilityLayer>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1, 3)}
                />
                 <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => `$${Number(value)/1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                 <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={4} />
                <Bar dataKey="gastos" fill="var(--color-gastos)" radius={4} />
              </BarChartComponent>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Un vistazo a los últimos pedidos procesados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardStats.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.table}</TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant[order.status] || 'default'}
                        className={order.status === "Listo" ? "bg-green-500 text-white" : ""}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-muted-foreground"/>
                        <CardTitle>Platillos más vendidos</CardTitle>
                    </div>
                    <CardDescription>Top 5 platillos por ingresos generados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Platillo</TableHead>
                                <TableHead className="text-right">Ingresos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dashboardStats.topDishes.map(dish => (
                                <TableRow key={dish.name}>
                                    <TableCell className="font-medium">{dish.name}</TableCell>
                                    <TableCell className="text-right">${dish.totalRevenue.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground"/>
                        <CardTitle>Gastos Recientes</CardTitle>
                    </div>
                    <CardDescription>Últimos gastos registrados por reabastecimiento.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dashboardStats.recentExpenses.map(expense => (
                                <TableRow key={expense.id}>
                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                    <TableCell>{format(expense.date, 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-right text-destructive">-${expense.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    
