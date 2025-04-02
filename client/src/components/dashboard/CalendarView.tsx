import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Client, Reservation, Wheelchair } from "@shared/schema";

interface CalendarViewProps {
  currentDate: Date;
  reservations: Reservation[];
  wheelchairs: Wheelchair[];
  clients: Client[];
  isLoading: boolean;
  onDateChange?: (date: Date) => void;
}

export default function CalendarView({ 
  currentDate, 
  reservations, 
  wheelchairs, 
  clients, 
  isLoading,
  onDateChange
}: CalendarViewProps) {
  const [monthDate, setMonthDate] = useState(currentDate);

  // Navigate to previous month
  const handlePreviousMonth = () => {
    const newDate = subMonths(monthDate, 1);
    setMonthDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  // Navigate to next month
  const handleNextMonth = () => {
    const newDate = addMonths(monthDate, 1);
    setMonthDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  // Get client name by id
  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName.charAt(0)}.` : "Cliente desconocido";
  };

  // Get calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = monthStart.getDay();
    
    // Add days from previous month to fill the first row
    const previousMonthDays = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDay = new Date(monthStart);
      prevDay.setDate(prevDay.getDate() - (firstDayOfWeek - i));
      previousMonthDays.push(prevDay);
    }
    
    // Add days from next month to complete the last row
    const lastDayOfWeek = monthEnd.getDay();
    const nextMonthDays = [];
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const nextDay = new Date(monthEnd);
      nextDay.setDate(nextDay.getDate() + i);
      nextMonthDays.push(nextDay);
    }
    
    return [...previousMonthDays, ...daysInMonth, ...nextMonthDays];
  }, [monthDate]);

  // Get reservations for a specific day
  const getDayReservations = (day: Date) => {
    return reservations.filter(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      return isWithinInterval(day, { start: startDate, end: endDate }) || 
             isSameDay(day, startDate) || 
             isSameDay(day, endDate);
    });
  };

  // Render a reservation item in the calendar
  const renderReservationItem = (reservation: Reservation, day: Date) => {
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);
    const isStartDay = isSameDay(day, startDate);
    const isEndDay = isSameDay(day, endDate);
    
    let bgColor = "bg-green-100 text-green-800";
    let label = getClientName(reservation.clientId);
    
    if (isEndDay) {
      bgColor = "bg-amber-100 text-amber-800";
      label = `Fin: ${getClientName(reservation.clientId)}`;
    }
    
    if (reservation.status === "completed") {
      bgColor = "bg-blue-100 text-blue-800";
    } else if (reservation.status === "cancelled") {
      bgColor = "bg-red-100 text-red-800";
    }
    
    return (
      <div 
        key={`${reservation.id}-${isStartDay ? 'start' : 'end'}`}
        className={`${bgColor} text-xs p-1 rounded mb-1 truncate`}
        title={`${getClientName(reservation.clientId)} - ${wheelchairs.find(w => w.id === reservation.wheelchairId)?.model || 'Silla desconocida'}`}
      >
        {label}
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        <div className="font-medium text-slate-700 pb-2">Dom</div>
        <div className="font-medium text-slate-700 pb-2">Lun</div>
        <div className="font-medium text-slate-700 pb-2">Mar</div>
        <div className="font-medium text-slate-700 pb-2">Mié</div>
        <div className="font-medium text-slate-700 pb-2">Jue</div>
        <div className="font-medium text-slate-700 pb-2">Vie</div>
        <div className="font-medium text-slate-700 pb-2">Sáb</div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {calendarDays.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, monthDate);
          const isTodays = isToday(day);
          const dayReservations = getDayReservations(day);
          
          return (
            <div 
              key={i} 
              className={cn(
                "border border-slate-200 rounded min-h-[100px] p-1 calendar-day", 
                !isCurrentMonth && "text-slate-400",
                isTodays && "bg-slate-50 border-[#0f766e]",
              )}
            >
              <div className={cn(
                "mb-1 text-right", 
                isTodays && "font-bold text-[#0f766e]"
              )}>
                {format(day, 'd')}
              </div>
              
              <div className="overflow-y-auto max-h-[80px]">
                {dayReservations.map(reservation => 
                  renderReservationItem(reservation, day)
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 border border-green-800 rounded mr-2"></div>
          <span>Reserva activa</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-100 border border-amber-800 rounded mr-2"></div>
          <span>Finalización</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 border border-blue-800 rounded mr-2"></div>
          <span>Completada</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 border border-red-800 rounded mr-2"></div>
          <span>Cancelada</span>
        </div>
      </div>
    </>
  );
}
