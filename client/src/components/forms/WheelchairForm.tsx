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
import { type Wheelchair, wheelchairSchema } from "@shared/schema";
import { z } from "zod";

interface WheelchairFormProps {
  wheelchair?: Wheelchair | null;
  onClose: () => void;
}

export default function WheelchairForm({ wheelchair, onClose }: WheelchairFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!wheelchair;

  // Create form with validation
  const form = useForm<z.infer<typeof wheelchairSchema>>({
    resolver: zodResolver(wheelchairSchema),
    defaultValues: {
      model: wheelchair?.model || "",
      brand: wheelchair?.brand || "",
      year: wheelchair?.year || new Date().getFullYear(),
      motor: wheelchair?.motor || "",
      wheelSize: wheelchair?.wheelSize || "",
      lastService: wheelchair?.lastService ? new Date(wheelchair.lastService) : new Date(),
    },
  });

  // Submit mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof wheelchairSchema>) => {
      if (isEditing && wheelchair) {
        return apiRequest("PUT", `/api/wheelchairs/${wheelchair.id}`, values)
          .then(res => res.json());
      } else {
        return apiRequest("POST", "/api/wheelchairs", values)
          .then(res => res.json());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wheelchairs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: isEditing ? "Silla actualizada" : "Silla creada",
        description: isEditing 
          ? "La silla de ruedas ha sido actualizada correctamente."
          : "La silla de ruedas ha sido creada correctamente."
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? "actualizar" : "crear"} la silla de ruedas: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof wheelchairSchema>) => {
    mutation.mutate(values);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Silla de Ruedas" : "Nueva Silla de Ruedas"}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="XR-500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input placeholder="MobilityPlus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="2023" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motor</FormLabel>
                  <FormControl>
                    <Input placeholder="350W" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="wheelSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamaño de Rueda</FormLabel>
                  <FormControl>
                    <Input placeholder='12"' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Último Service</FormLabel>
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
                  ? "Actualizar Silla" 
                  : "Crear Silla"
              }
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
