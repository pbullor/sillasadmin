import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Helmet } from "react-helmet";
import { 
  Search, 
  Plus, 
  ArrowLeft, 
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatsOverview from "@/components/dashboard/StatsOverview";
import AvailabilityCheck from "@/components/dashboard/AvailabilityCheck";
import ReservationsList from "@/components/dashboard/ReservationsList";
import CalendarView from "@/components/dashboard/CalendarView";
import ReservationForm from "@/components/forms/ReservationForm";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  type DashboardStats, 
  type Reservation, 
  type Wheelchair, 
  type Client 
} from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<"table" | "calendar">("table");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch active reservations
  const { data: activeReservations, isLoading: isLoadingReservations } = useQuery({
    queryKey: ["/api/reservations/active"],
  });

  // Fetch all wheelchairs
  const { data: wheelchairs, isLoading: isLoadingWheelchairs } = useQuery({
    queryKey: ["/api/wheelchairs"],
  });

  // Fetch all clients
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const handleCreateReservation = () => {
    setReservationModalOpen(true);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Sillas Admin</title>
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
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

      {/* Dashboard Content */}
      <main className="flex-1 relative">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {/* Quick Stats */}
          <StatsOverview stats={stats as DashboardStats} isLoading={isLoadingStats} />

          {/* Availability Check */}
          <AvailabilityCheck wheelchairs={wheelchairs as Wheelchair[]} isLoading={isLoadingWheelchairs} />

          {/* Current Reservations */}
          <ReservationsList 
            reservations={activeReservations as Reservation[]} 
            wheelchairs={wheelchairs as Wheelchair[]}
            clients={clients as Client[]}
            isLoading={isLoadingReservations} 
            onView={(id) => toast({ title: `Viewing reservation ${id}` })}
            onEdit={(id) => toast({ title: `Editing reservation ${id}` })}
            selectedView={selectedView}
            onChangeView={setSelectedView}
          />

          {/* Calendar View */}
          {selectedView === "calendar" && (
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 border-b border-slate-200 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-slate-900">Vista de Calendario</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="bg-slate-100 hover:bg-slate-200">Mes</Button>
                  <Button variant="ghost" size="sm">Semana</Button>
                  <Button variant="ghost" size="sm">Día</Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-slate-900">
                      {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h4>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handlePreviousMonth}
                      className="p-1 rounded hover:bg-slate-100"
                    >
                      <ArrowLeft className="h-5 w-5 text-slate-700" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleNextMonth}
                      className="p-1 rounded hover:bg-slate-100"
                    >
                      <ArrowRight className="h-5 w-5 text-slate-700" />
                    </Button>
                  </div>
                </div>

                <CalendarView 
                  currentDate={currentDate}
                  reservations={activeReservations as Reservation[]}
                  wheelchairs={wheelchairs as Wheelchair[]}
                  clients={clients as Client[]}
                  isLoading={isLoadingReservations || isLoadingWheelchairs || isLoadingClients}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reservation Modal */}
      <Dialog open={reservationModalOpen} onOpenChange={setReservationModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <ReservationForm 
            onClose={() => setReservationModalOpen(false)}
            wheelchairs={wheelchairs as Wheelchair[]}
            clients={clients as Client[]}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
