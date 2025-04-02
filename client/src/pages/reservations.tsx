import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Plus, Eye, Edit, Trash2, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ReservationForm from "@/components/forms/ReservationForm";
import CalendarView from "@/components/dashboard/CalendarView";
import { Client, Reservation, Wheelchair } from "@shared/schema";

export default function Reservations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch all reservations
  const { data: reservations, isLoading: isLoadingReservations } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"],
  });

  // Fetch all wheelchairs
  const { data: wheelchairs, isLoading: isLoadingWheelchairs } = useQuery<Wheelchair[]>({
    queryKey: ["/api/wheelchairs"],
  });

  // Fetch all clients
  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reservations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Reserva eliminada",
        description: "La reserva ha sido eliminada correctamente."
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la reserva: ${error}`,
        variant: "destructive"
      });
    }
  });

  const handleCreateReservation = () => {
    setSelectedReservation(null);
    setFormModalOpen(true);
  };

  const handleViewReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    toast({
      title: "Ver Reserva",
      description: `Detalles de la reserva ID: ${reservation.id}`
    });
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormModalOpen(true);
  };

  const handleDeleteReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedReservation) {
      deleteMutation.mutate(selectedReservation.id);
    }
  };

  const isLoading = isLoadingReservations || isLoadingWheelchairs || isLoadingClients;

  // Filter and process reservations
  const processedReservations = reservations
    ?.filter(reservation => {
      // Status filter
      if (statusFilter !== "all" && reservation.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (!searchQuery) return true;
      
      const client = clients?.find(c => c.id === reservation.clientId);
      const wheelchair = wheelchairs?.find(w => w.id === reservation.wheelchairId);
      
      const searchLower = searchQuery.toLowerCase();
      return (
        client?.firstName.toLowerCase().includes(searchLower) ||
        client?.lastName.toLowerCase().includes(searchLower) ||
        wheelchair?.model.toLowerCase().includes(searchLower) ||
        wheelchair?.brand.toLowerCase().includes(searchLower) ||
        format(new Date(reservation.startDate), 'dd/MM/yyyy').includes(searchLower) ||
        format(new Date(reservation.endDate), 'dd/MM/yyyy').includes(searchLower)
      );
    });

  const getClientById = (id: number) => {
    return clients?.find(client => client.id === id);
  };

  const getWheelchairById = (id: number) => {
    return wheelchairs?.find(wheelchair => wheelchair.id === id);
  };

  return (
    <>
      <Helmet>
        <title>Reservas | Sillas Admin</title>
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-800">Gestión de Reservas</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
            </div>
            <Button onClick={handleCreateReservation} className="bg-[#0f766e] hover:bg-[#0f5259]">
              <Plus className="h-5 w-5 mr-2" />
              Nueva Reserva
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Listado de Reservas</CardTitle>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      {statusFilter === "all" ? "Todos" : 
                       statusFilter === "active" ? "Activas" : 
                       statusFilter === "completed" ? "Completadas" : 
                       "Canceladas"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                      Activas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                      Completadas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                      Canceladas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex space-x-1 border rounded overflow-hidden">
                  <Button 
                    variant={viewMode === "table" ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("table")}
                    className={viewMode === "table" ? "bg-[#0f766e]" : ""}
                  >
                    Tabla
                  </Button>
                  <Button 
                    variant={viewMode === "calendar" ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("calendar")}
                    className={viewMode === "calendar" ? "bg-[#0f766e]" : ""}
                  >
                    Calendario
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f766e]"></div>
                </div>
              ) : viewMode === "table" ? (
                processedReservations && processedReservations.length > 0 ? (
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
                        {processedReservations.map((reservation) => {
                          const client = getClientById(reservation.clientId);
                          const wheelchair = getWheelchairById(reservation.wheelchairId);
                          return (
                            <TableRow key={reservation.id} className="hover:bg-slate-50">
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <span className="text-slate-500 font-medium">
                                      {client ? client.firstName[0] + client.lastName[0] : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-slate-900">
                                      {client ? `${client.firstName} ${client.lastName}` : 'Cliente desconocido'}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                      {client?.email || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium text-slate-900">
                                  {wheelchair?.model || 'N/A'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {wheelchair ? `Motor: ${wheelchair.motor}` : 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-500">
                                {format(new Date(reservation.startDate), 'dd/MM/yyyy', { locale: es })}
                              </TableCell>
                              <TableCell className="text-sm text-slate-500">
                                {format(new Date(reservation.endDate), 'dd/MM/yyyy', { locale: es })}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${reservation.status === 'active' ? 'bg-green-100 text-green-800' : 
                                    reservation.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-red-100 text-red-800'}`}>
                                  {reservation.status === 'active' ? 'Activa' : 
                                   reservation.status === 'completed' ? 'Completada' : 'Cancelada'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleViewReservation(reservation)}
                                >
                                  <Eye className="h-4 w-4 text-[#0f766e]" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditReservation(reservation)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteReservation(reservation)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-500">No hay reservas para mostrar.</p>
                  </div>
                )
              ) : (
                <div className="p-4">
                  <CalendarView 
                    currentDate={currentDate}
                    reservations={processedReservations || []}
                    wheelchairs={wheelchairs || []}
                    clients={clients || []}
                    isLoading={isLoading}
                    onDateChange={setCurrentDate}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Reservation Form Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <ReservationForm 
            reservation={selectedReservation}
            onClose={() => setFormModalOpen(false)}
            wheelchairs={wheelchairs || []}
            clients={clients || []}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la reserva del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
