
"use client";

import { useMemo } from "react";
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
import { DollarSign, ShoppingCart, Calendar } from "lucide-react";
import { useRestaurant } from "@/context/RestaurantContext";
import { format, isThisMonth } from "date-fns";
import { es } from "date-fns/locale";

export default function FacturacionPage() {
  const { financials } = useRestaurant();

  const billingData = useMemo(() => {
    const thisMonthExpenses = financials.filter(
      (f) => f.type === "expense" && isThisMonth(f.date)
    );

    const totalThisMonth = thisMonthExpenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    return {
      thisMonthExpenses,
      totalThisMonth,
    };
  }, [financials]);

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold font-headline">Facturación y Gastos</h1>
            <p className="text-muted-foreground">
                Resumen de los gastos de inventario para el mes actual.
            </p>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Gastos (Mes Actual)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -${billingData.totalThisMonth.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Basado en las compras de inventario.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Detalle de Gastos del Mes</CardTitle>
          </div>
          <CardDescription>
            Lista de todas las compras de inventario realizadas este mes.
          </CardDescription>
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
              {billingData.thisMonthExpenses.length > 0 ? (
                billingData.thisMonthExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      {format(expense.date, "PPP", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      -${expense.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No se han registrado gastos este mes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
