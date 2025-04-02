import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReservationForm from "@/components/forms/ReservationForm";
import { Wheelchair, AvailabilityResult } from "@shared/schema";

interface AvailabilityCheckProps {
  wheelchairs?: Wheelchair[];
  isLoading: boolean;
}

export default function AvailabilityCheck({ wheelchairs, isLoading }: AvailabilityCheckProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availabilityResult, setAvailabilityResult] = useState<AvailabilityResult | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedWheelchair, setSelectedWheelchair] = useState<Wheelchair | null>(null);
  const [searching, setSearching] = useState(false);

  const checkAvailabilityMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("GET", `/api/availability?startDate=${startDate}&endDate=${endDate}`)
        .then(res => res.json());
    },
    onSuccess: (data: AvailabilityResult) => {
      setAvailabilityResult(data);
      setSearching(false);
      if (data.availableWheelchairs.length === 0) {
        toast({
          title: "Sin disponibilidad",
          description: "No hay sillas disponibles para el período seleccionado.",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al verificar disponibilidad: ${error}`,
        variant: "destructive"
      });
      setSearching(false);
    }
  });

  const handleCheckAvailability = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Campos incompletos",
        description: "Por favor seleccione fechas de inicio y fin",
        variant: "destructive"
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      toast({
        title: "Fechas inválidas",
        description: "La fecha de fin debe ser posterior a la fecha de inicio",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    checkAvailabilityMutation.mutate();
  };

  const handleReserveWheelchair = (wheelchair: Wheelchair) => {
    setSelectedWheelchair(wheelchair);
    setFormModalOpen(true);
  };

  return (
    <>
      <Card className="bg-white shadow rounded-lg mb-6">
        <CardContent className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-900">Verificar Disponibilidad</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-slate-700">
                Fecha Desde
              </label>
              <Input
                type="date"
                id="dateFrom"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-slate-700">
                Fecha Hasta
              </label>
              <Input
                type="date"
                id="dateTo"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCheckAvailability} 
                className="bg-[#0f766e] hover:bg-[#0f5259]"
                disabled={searching}
              >
                {searching ? "Buscando..." : "Buscar Disponibilidad"}
              </Button>
            </div>
          </div>
          
          {(availabilityResult || searching) && (
            <div className="mt-6 bg-slate-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Resultados de Disponibilidad:</h4>
              
              {searching ? (
                <Skeleton className="h-20 w-full" />
              ) : availabilityResult && (
                <>
                  <p className="text-sm text-slate-600">
                    Se encontraron <span className="font-semibold text-[#0f766e]">
                      {availabilityResult.availableWheelchairs.length}
                    </span> sillas disponibles para el período{" "}
                    <span className="font-semibold">
                      {format(new Date(startDate), 'dd/MM/yyyy', { locale: es })}
                    </span> al{" "}
                    <span className="font-semibold">
                      {format(new Date(endDate), 'dd/MM/yyyy', { locale: es })}
                    </span>.
                  </p>
                  
                  {availabilityResult.availableWheelchairs.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {availabilityResult.availableWheelchairs.map((wheelchair) => (
                        <div 
                          key={wheelchair.id}
                          className="bg-white border border-slate-200 rounded-md shadow-sm p-3 flex justify-between items-center hover:shadow-md transition-shadow"
                        >
                          <div>
                            <h5 className="font-medium text-slate-800">{wheelchair.model}</h5>
                            <p className="text-xs text-slate-500">
                              Motor: {wheelchair.motor} • Rueda: {wheelchair.wheelSize}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="text-[#0f766e] text-sm font-medium"
                            onClick={() => handleReserveWheelchair(wheelchair)}
                          >
                            Reservar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservation Form Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <ReservationForm 
            onClose={() => setFormModalOpen(false)}
            wheelchairs={wheelchairs || []}
            preselectedWheelchair={selectedWheelchair}
            preselectedDateRange={startDate && endDate ? { startDate, endDate } : undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
