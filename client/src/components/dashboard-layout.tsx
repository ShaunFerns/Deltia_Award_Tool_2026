import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart3, 
  PieChart, 
  ArrowLeft,
  Layers,
  GraduationCap
} from "lucide-react";

interface DashboardLayoutProps {
  user: any;
  children: React.ReactNode;
  title?: string;
  subtitle?: string | React.ReactNode;
}

export function DashboardLayout({ user, children, title, subtitle }: DashboardLayoutProps) {
  const [location] = useLocation();

  const sidebarItems = [
    { 
      label: "Institutional Overview", 
      href: `/dashboard`,
      icon: LayoutDashboard,
      active: location === "/dashboard" || location === "/dashboard/"
    },
    {
      label: "All Programmes",
      href: `/dashboard/programmes`, 
      icon: Layers,
      active: location.startsWith("/dashboard/programmes")
    }
  ];

  return (
    <Layout user={user}>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/10 hidden md:flex flex-col shrink-0">
          <div className="p-6 border-b bg-background/50">
             <div className="flex items-center gap-2 text-primary font-bold text-lg mb-1">
                <BarChart3 className="w-5 h-5" />
                DELTA Analytics
             </div>
             <p className="text-xs text-muted-foreground">Institutional Performance</p>
          </div>
          
          <nav className="p-4 space-y-1 flex-1">
            {sidebarItems.map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  item.active 
                    ? "bg-primary/10 text-primary border-r-2 border-primary rounded-r-none" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t bg-background/50">
             <Link href="/" className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back to Home
             </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-background overflow-auto flex flex-col">
            {(title || subtitle) && (
                <div className="px-8 py-6 border-b bg-background/50 backdrop-blur sticky top-0 z-10">
                    {title && <h1 className="text-2xl font-bold font-serif text-primary">{title}</h1>}
                    {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="p-8 flex-1">
                {children}
            </div>
        </main>
      </div>
    </Layout>
  );
}
