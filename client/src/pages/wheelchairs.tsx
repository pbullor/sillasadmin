import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import WheelchairForm from "@/components/forms/WheelchairForm";
import { Wheelchair } from "@shared/schema";

export default function Wheelchairs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWheelchair, setSelectedWheelchair] = useState<Wheelchair | null>(null);

  // Fetch all wheelchairs
  const { data: wheelchairs, isLoading } = useQuery<Wheelchair[]>({
    queryKey: ["/api/wheelchairs"],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/wheelchairs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wheelchairs"] });
      toast({
        title: "Silla de ruedas eliminada",
        description: "La silla de ruedas ha sido eliminada correctamente."
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la silla de ruedas: ${error}`,
        variant: "destructive"
      });
    }
  });

  const handleCreateWheelchair = () => {
    setSelectedWheelchair(null);
    setFormModalOpen(true);
  };

  const handleEditWheelchair = (wheelchair: Wheelchair) => {
    setSelectedWheelchair(wheelchair);
    setFormModalOpen(true);
  };

  const handleDeleteWheelchair = (wheelchair: Wheelchair) => {
    setSelectedWheelchair(wheelchair);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedWheelchair) {
      deleteMutation.mutate(selectedWheelchair.id);
    }
  };

  // Filter wheelchairs based on search query
  const filteredWheelchairs = wheelchairs?.filter(wheelchair => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      wheelchair.model.toLowerCase().includes(searchLower) ||
      wheelchair.brand.toLowerCase().includes(searchLower) ||
      wheelchair.motor.toLowerCase().includes(searchLower) ||
      wheelchair.year.toString().includes(searchLower)
    );
  });

  return (
    <>
      <Helmet>
        <title>Inventario | Sillas Admin</title>
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-800">Inventario de Sillas</h1>
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
            <Button onClick={handleCreateWheelchair} className="bg-[#0f766e] hover:bg-[#0f5259]">
              <Plus className="h-5 w-5 mr-2" />
              Nueva Silla
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Listado de Sillas de Ruedas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f766e]"></div>
                </div>
              ) : filteredWheelchairs && filteredWheelchairs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Año</TableHead>
                        <TableHead>Motor</TableHead>
                        <TableHead>Tamaño de rueda</TableHead>
                        <TableHead>Alquileres</TableHead>
                        <TableHead>Último service</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWheelchairs.map((wheelchair) => (
                        <TableRow key={wheelchair.id}>
                          <TableCell className="font-medium">{wheelchair.model}</TableCell>
                          <TableCell>{wheelchair.brand}</TableCell>
                          <TableCell>{wheelchair.year}</TableCell>
                          <TableCell>{wheelchair.motor}</TableCell>
                          <TableCell>{wheelchair.wheelSize}</TableCell>
                          <TableCell>{wheelchair.rentalCount}</TableCell>
                          <TableCell>
                            {wheelchair.lastService ? format(new Date(wheelchair.lastService), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditWheelchair(wheelchair)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteWheelchair(wheelchair)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-500">No hay sillas de ruedas para mostrar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Wheelchair Form Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <WheelchairForm 
            wheelchair={selectedWheelchair}
            onClose={() => setFormModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la silla de ruedas
              {selectedWheelchair && ` "${selectedWheelchair.model}"`} del sistema.
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
