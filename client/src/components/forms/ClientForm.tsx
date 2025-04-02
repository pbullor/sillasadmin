import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { type Client, clientSchema } from "@shared/schema";
import { z } from "zod";

interface ClientFormProps {
  client?: Client | null;
  onClose: () => void;
}

export default function ClientForm({ client, onClose }: ClientFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!client;

  // Create form with validation
  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: client?.firstName || "",
      lastName: client?.lastName || "",
      dni: client?.dni || "",
      address: client?.address || "",
      phone: client?.phone || "",
      email: client?.email || "",
      registerDate: client?.registerDate ? new Date(client.registerDate) : new Date(),
      city: client?.city || "",
      country: client?.country || "",
    },
  });

  // Submit mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof clientSchema>) => {
      if (isEditing && client) {
        return apiRequest("PUT", `/api/clients/${client.id}`, values)
          .then(res => res.json());
      } else {
        return apiRequest("POST", "/api/clients", values)
          .then(res => res.json());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: isEditing ? "Cliente actualizado" : "Cliente creado",
        description: isEditing 
          ? "El cliente ha sido actualizado correctamente."
          : "El cliente ha sido creado correctamente."
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? "actualizar" : "crear"} el cliente: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof clientSchema>) => {
    // Si es un nuevo cliente, la fecha de registro siempre es ahora
    // Si es una edición, mantenemos la fecha existente
    const submitValues = {
      ...values,
      registerDate: isEditing ? values.registerDate : new Date()
    };
    mutation.mutate(submitValues);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Dominguez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+54 11 1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Av. Rivadavia 1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input placeholder="Buenos Aires" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input placeholder="Argentina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

{/* La fecha de registro se establece automáticamente */}

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#0f766e] hover:bg-[#0f5259]"
              disabled={mutation.isPending}
            >
              {mutation.isPending 
                ? "Guardando..." 
                : isEditing 
                  ? "Actualizar Cliente" 
                  : "Crear Cliente"
              }
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
