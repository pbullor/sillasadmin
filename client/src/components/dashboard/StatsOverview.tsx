import { Check, Clock, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type DashboardStats } from "@shared/schema";

interface StatsOverviewProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export default function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  const statItems = [
    {
      title: "Sillas Disponibles",
      value: stats ? `${stats.availableWheelchairs} de ${stats.totalWheelchairs}` : "0",
      icon: <Check className="h-6 w-6 text-white" />,
      bgColor: "bg-[#14b8a6]"
    },
    {
      title: "Reservas Activas",
      value: stats?.activeReservations.toString() || "0",
      icon: <Clock className="h-6 w-6 text-white" />,
      bgColor: "bg-[#f59e0b]"
    },
    {
      title: "Total Clientes",
      value: stats?.totalClients.toString() || "0",
      icon: <Users className="h-6 w-6 text-white" />,
      bgColor: "bg-[#1e40af]"
    },
    {
      title: "Utilización",
      value: stats ? `${Math.round((1 - stats.availableWheelchairs / stats.totalWheelchairs) * 100)}%` : "0%",
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      bgColor: "bg-emerald-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className="bg-white overflow-hidden shadow">
          <CardContent className="p-0">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${item.bgColor} rounded-md p-3`}>
                  {item.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      {item.title}
                    </dt>
                    <dd>
                      {isLoading ? (
                        <Skeleton className="h-6 w-16" />
                      ) : (
                        <div className="text-lg font-semibold text-slate-900">
                          {item.value}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
