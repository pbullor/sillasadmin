import { useState } from "react";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { type Reservation, type Wheelchair, type Client, reservationSchema } from "@shared/schema";
import { z } from "zod";

interface ReservationFormProps {
  reservation?: Reservation | null;
  wheelchairs: Wheelchair[];
  clients?: Client[];
  preselectedWheelchair?: Wheelchair | null;
  preselectedDateRange?: { startDate: string; endDate: string };
  onClose: () => void;
}

export default function ReservationForm({ 
  reservation, 
  wheelchairs, 
  clients = [], 
  preselectedWheelchair, 
  preselectedDateRange,
  onClose 
}: ReservationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!reservation;
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Extended schema with validations
  const formSchema = reservationSchema.extend({
    startDate: z.coerce.date()
      .refine(date => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "La fecha de inicio debe ser hoy o posterior"
      }),
    endDate: z.coerce.date(),
    status: z.string().optional(),
  }).refine(data => data.endDate > data.startDate, {
    message: "La fecha de finalización debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  });

  // Create form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: reservation?.clientId || 0,
      wheelchairId: reservation?.wheelchairId || preselectedWheelchair?.id || 0,
      startDate: reservation?.startDate 
        ? new Date(reservation.startDate) 
        : preselectedDateRange?.startDate 
          ? new Date(preselectedDateRange.startDate) 
          : new Date(),
      endDate: reservation?.endDate 
        ? new Date(reservation.endDate) 
        : preselectedDateRange?.endDate 
          ? new Date(preselectedDateRange.endDate) 
          : new Date(new Date().setDate(new Date().getDate() + 7)),
      notes: reservation?.notes || "",
      status: reservation?.status || "active",
    },
  });

  // Watch form values for availability check
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const selectedWheelchairId = form.watch("wheelchairId");

  // Check availability of a wheelchair for the selected dates
  const checkAvailability = async (wheelchairId: number) => {
    if (!wheelchairId || !startDate || !endDate) {
      return true; // No need to check if any value is missing
    }

    setIsCheckingAvailability(true);
    try {
      const formattedStartDate = startDate instanceof Date 
        ? startDate.toISOString().split('T')[0] 
        : startDate;
      
      const formattedEndDate = endDate instanceof Date 
        ? endDate.toISOString().split('T')[0] 
        : endDate;

      const response = await fetch(
        `/api/availability?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }
      
      const data = await response.json();
      
      // If we're editing, the current reservation should be excluded from the check
      if (isEditing && reservation && reservation.wheelchairId === wheelchairId) {
        return true;
      }
      
      // Check if the wheelchair is available
      return data.availableWheelchairs.some((w: Wheelchair) => w.id === wheelchairId);
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Submit mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Check availability before creating/updating
      const isAvailable = await checkAvailability(values.wheelchairId);
      
      if (!isAvailable && values.status === 'active') {
        throw new Error("La silla de ruedas no está disponible para las fechas seleccionadas");
      }
      
      if (isEditing && reservation) {
        return apiRequest("PUT", `/api/reservations/${reservation.id}`, values)
          .then(res => res.json());
      } else {
        return apiRequest("POST", "/api/reservations", values)
          .then(res => res.json());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: isEditing ? "Reserva actualizada" : "Reserva creada",
        description: isEditing 
          ? "La reserva ha sido actualizada correctamente."
          : "La reserva ha sido creada correctamente."
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? "actualizar" : "crear"} la reserva: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  // Get client full name
  const getClientFullName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : '';
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Reserva" : "Nueva Reserva"}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value ? field.value.toString() : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.firstName} {client.lastName} - DNI: {client.dni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="wheelchairId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Silla de Ruedas</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value ? field.value.toString() : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar silla" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {wheelchairs.map((wheelchair) => (
                      <SelectItem key={wheelchair.id} value={wheelchair.id.toString()}>
                        {wheelchair.model} - {wheelchair.brand} - Motor: {wheelchair.motor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Inicio</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : field.value}
                      onChange={e => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Fin</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : field.value}
                      onChange={e => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isEditing && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas Adicionales</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Información adicional sobre la reserva..."
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={mutation.isPending || isCheckingAvailability}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#0f766e] hover:bg-[#0f5259]"
              disabled={mutation.isPending || isCheckingAvailability}
            >
              {mutation.isPending || isCheckingAvailability
                ? "Guardando..." 
                : isEditing 
                  ? "Actualizar Reserva" 
                  : "Crear Reserva"
              }
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
