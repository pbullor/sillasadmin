import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Plus, Edit, Trash2, Search, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import ClientForm from "@/components/forms/ClientForm";
import { Client } from "@shared/schema";

export default function Clients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Fetch all clients
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente."
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el cliente: ${error}`,
        variant: "destructive"
      });
    }
  });

  const handleCreateClient = () => {
    setSelectedClient(null);
    setFormModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setFormModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedClient) {
      deleteMutation.mutate(selectedClient.id);
    }
  };

  // Filter clients based on search query
  const filteredClients = clients?.filter(client => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(searchLower) ||
      client.lastName.toLowerCase().includes(searchLower) ||
      client.dni.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.toLowerCase().includes(searchLower) ||
      client.city.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <Helmet>
        <title>Clientes | Sillas Admin</title>
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-800">Gestión de Clientes</h1>
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
            <Button onClick={handleCreateClient} className="bg-[#0f766e] hover:bg-[#0f5259]">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Listado de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f766e]"></div>
                </div>
              ) : filteredClients && filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClients.map((client) => (
                    <Card key={client.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <span className="text-slate-500 font-medium">
                                {client.firstName[0]}{client.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{client.firstName} {client.lastName}</h3>
                              <p className="text-sm text-slate-600">DNI: {client.dni}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditClient(client)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteClient(client)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-slate-400" />
                            <span className="text-slate-600">{client.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-slate-400" />
                            <span className="text-slate-600">{client.phone}</span>
                          </div>
                          <div className="text-sm text-slate-600">
                            <span className="block">{client.address}</span>
                            <span>{client.city}, {client.country}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Registrado: {format(new Date(client.registerDate), 'dd/MM/yyyy', { locale: es })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-500">No hay clientes para mostrar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Client Form Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <ClientForm 
            client={selectedClient}
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
              Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente
              {selectedClient && ` ${selectedClient.firstName} ${selectedClient.lastName}`} del sistema.
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
