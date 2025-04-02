import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import Wheelchairs from "@/pages/wheelchairs";
import Clients from "@/pages/clients";
import Reservations from "@/pages/reservations";
import NotFound from "@/pages/not-found";
import AppLayout from "@/layout/AppLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/wheelchairs" component={Wheelchairs} />
      <Route path="/clients" component={Clients} />
      <Route path="/reservations" component={Reservations} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
