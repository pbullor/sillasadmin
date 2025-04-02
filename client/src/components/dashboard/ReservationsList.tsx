import { TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Table, 
  TableBody 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ListFilter, Table as TableIcon, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Reservation, Wheelchair, Client } from "@shared/schema";

interface ReservationsListProps {
  reservations?: Reservation[];
  wheelchairs?: Wheelchair[];
  clients?: Client[];
  isLoading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  selectedView: "table" | "calendar";
  onChangeView: (view: "table" | "calendar") => void;
}

export default function ReservationsList({ 
  reservations, 
  wheelchairs, 
  clients, 
  isLoading, 
  onView, 
  onEdit, 
  selectedView,
  onChangeView
}: ReservationsListProps) {
  // Helper functions to get related data
  const getClientName = (clientId: number) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : "Cliente desconocido";
  };

  const getClientInitials = (clientId: number) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? `${client.firstName[0]}${client.lastName[0]}` : "??";
  };

  const getClientEmail = (clientId: number) => {
    const client = clients?.find(c => c.id === clientId);
    return client?.email || "N/A";
  };

  const getWheelchairModel = (wheelchairId: number) => {
    const wheelchair = wheelchairs?.find(w => w.id === wheelchairId);
    return wheelchair?.model || "Desconocido";
  };

  const getWheelchairMotor = (wheelchairId: number) => {
    const wheelchair = wheelchairs?.find(w => w.id === wheelchairId);
    return wheelchair?.motor || "N/A";
  };

  // Format reservation status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Activa
          </span>
        );
      case "completed":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Completada
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Próximo fin
          </span>
        );
    }
  };

  return (
    <Card className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 border-b border-slate-200 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-slate-900">Reservas Activas</h3>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="mr-2">
                <ListFilter className="h-4 w-4 mr-1" />
                Filtrar por
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Todas</DropdownMenuItem>
              <DropdownMenuItem>Este mes</DropdownMenuItem>
              <DropdownMenuItem>Próximas a vencer</DropdownMenuItem>
              <DropdownMenuItem>Por cliente</DropdownMenuItem>
              <DropdownMenuItem>Por silla</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={selectedView === "table" ? "bg-slate-100" : ""}
              onClick={() => onChangeView("table")}
              title="Vista de Tabla"
            >
              <TableIcon className="h-5 w-5 text-slate-700" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={selectedView === "calendar" ? "bg-slate-100" : ""}
              onClick={() => onChangeView("calendar")}
              title="Vista de Calendario"
            >
              <Calendar className="h-5 w-5 text-slate-700" />
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : reservations && reservations.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Silla</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.slice(0, 5).map((reservation) => (
                  <TableRow key={reservation.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-500 font-medium">
                            {getClientInitials(reservation.clientId)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {getClientName(reservation.clientId)}
                          </div>
                          <div className="text-sm text-slate-500">
                            {getClientEmail(reservation.clientId)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-900">
                        {getWheelchairModel(reservation.wheelchairId)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Motor: {getWheelchairMotor(reservation.wheelchairId)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(reservation.startDate), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(reservation.endDate), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {getStatusLabel(reservation.status)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        className="text-[#0f766e] hover:text-[#0f5259] mr-3"
                        onClick={() => onView(reservation.id)}
                      >
                        Ver
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-slate-600 hover:text-slate-900"
                        onClick={() => onEdit(reservation.id)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-500">No hay reservas activas para mostrar.</p>
          </div>
        )}
        
        {/* Pagination */}
        {reservations && reservations.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 text-right sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{Math.min(5, reservations.length)}</span> de <span className="font-medium">{reservations.length}</span> resultados
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button variant="outline" size="sm" className="rounded-l-md">Anterior</Button>
                  <Button variant="outline" size="sm" className="bg-[#0f766e] text-white">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm" className="rounded-r-md">Siguiente</Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
