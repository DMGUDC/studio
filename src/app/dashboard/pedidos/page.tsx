import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Divide, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const orders = [
  {
    id: "ORD001",
    table: "Mesa 5",
    waiter: "Carlos",
    status: "Entregado",
    total: 42.5,
    timestamp: "hace 5 minutos",
  },
  {
    id: "ORD002",
    table: "Mesa 2",
    waiter: "Ana",
    status: "Preparando",
    total: 89.9,
    timestamp: "hace 12 minutos",
  },
  {
    id: "ORD003",
    table: "Terraza 1",
    waiter: "Carlos",
    status: "Listo",
    total: 12.0,
    timestamp: "hace 20 minutos",
  },
  {
    id: "ORD004",
    table: "Mesa 8",
    waiter: "Sofia",
    status: "Pendiente",
    total: 30.0,
    timestamp: "hace 22 minutos",
  },
  {
    id: "ORD005",
    table: "Mesa 3",
    waiter: "Ana",
    status: "Entregado",
    total: 55.75,
    timestamp: "hace 1 hora",
  },
  {
    id: "ORD006",
    table: "Mesa 5",
    waiter: "Carlos",
    status: "Cancelado",
    total: 25.0,
    timestamp: "hace 2 horas",
  },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Entregado: "outline",
  Preparando: "secondary",
  Listo: "default",
  Pendiente: "destructive",
  Cancelado: "destructive",
};

const statusColor: { [key:string]: string} = {
    Listo: "bg-green-500 hover:bg-green-600 text-white",
}

export default function PedidosPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>Gestión de Pedidos</CardTitle>
                <CardDescription>
                Visualiza y gestiona todos los pedidos del restaurante.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Input placeholder="Buscar pedido..." className="max-w-xs" />
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Pedido
                </Button>
            </div>
        </div>

      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido ID</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead>Mesero</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creación</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.table}</TableCell>
                <TableCell>{order.waiter}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status]} className={cn(statusColor[order.status])}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.timestamp}</TableCell>
                <TableCell className="text-right">
                  ${order.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Divide className="mr-2 h-4 w-4" />
                        Dividir Cuenta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
