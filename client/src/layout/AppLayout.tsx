import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Menu, 
  X
} from "lucide-react";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems = [
    { icon: <Home size={24} />, title: "Dashboard", href: "/" },
    { icon: <Calendar size={24} />, title: "Reservas", href: "/reservations" },
    { icon: <Users size={24} />, title: "Clientes", href: "/clients" },
    { icon: <FileText size={24} />, title: "Inventario", href: "/wheelchairs" }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-[#0f766e] text-white">
          <div className="flex items-center justify-center h-16 border-b border-[#14b8a6]">
            <h1 className="text-xl font-bold">Sillas Admin</h1>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    location === item.href
                      ? "bg-[#14b8a6]"
                      : "text-white hover:bg-[#14b8a6]"
                  }`}
                >
                  <div className="mr-4">{item.icon}</div>
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-[#14b8a6] p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-[#14b8a6] flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Administrador</p>
                  <p className="text-xs font-medium text-[#14b8a6] group-hover:text-white">
                    Admin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-[#0f766e] text-white w-full fixed top-0 z-10 flex items-center h-16 px-4">
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#14b8a6] focus:outline-none focus:ring-2 focus:ring-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-xl font-bold ml-4">Sillas Admin</h1>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#0f766e] text-white flex flex-col">
            <div className="flex items-center justify-between h-16 border-b border-[#14b8a6] px-4">
              <h1 className="text-xl font-bold">Sillas Admin</h1>
              <button
                className="p-2 rounded-md text-white hover:bg-[#14b8a6]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto py-4">
              <nav className="px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      location === item.href
                        ? "bg-[#14b8a6]"
                        : "text-white hover:bg-[#14b8a6]"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="mr-4">{item.icon}</div>
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto md:pl-0 pt-16 md:pt-0">
        {children}
      </div>
    </div>
  );
}
