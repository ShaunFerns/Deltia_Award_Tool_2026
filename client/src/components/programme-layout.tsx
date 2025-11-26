import { useRoute, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useStore } from "@/lib/data";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Target, 
  TrendingUp, 
  ClipboardList, 
  ChevronLeft 
} from "lucide-react";

interface ProgrammeLayoutProps {
  user: any;
  programmeId: string;
  children: React.ReactNode;
}

export function ProgrammeLayout({ user, programmeId, children }: ProgrammeLayoutProps) {
  const { programmes } = useStore();
  const programme = programmes.find(p => p.id === programmeId);
  const [location] = useRoute("/programmes/:id/:page*");
  
  // Helper to check active state - simple check if current path contains the href
  // Since wouter useRoute returns match for pattern, we can check window location or useLocation
  // simpler: check if the href matches the end of the current window location hash/pathname
  const currentPath = window.location.pathname;
  
  if (!programme) {
     return <Layout user={user}><div>Programme not found</div></Layout>;
  }

  const sidebarItems = [
    { 
      label: "Programme Details", 
      href: `/programmes/${programmeId}/edit-meta`,
      icon: Settings,
      active: currentPath.includes(`/programmes/${programmeId}/edit-meta`)
    },
    { 
      label: "Structure & Modules", 
      href: `/programmes/${programmeId}/structure`,
      icon: LayoutDashboard,
      active: currentPath.includes(`/programmes/${programmeId}/structure`)
    },
    { 
      label: "Programme & Team Profile", 
      href: `/programmes/${programmeId}/profile`,
      icon: Users,
      active: currentPath.includes(`/programmes/${programmeId}/profile`)
    },
    { 
      label: "Taking Stock", 
      href: `/programmes/${programmeId}/taking-stock`,
      icon: ClipboardList,
      disabled: false,
      active: currentPath.includes(`/programmes/${programmeId}/taking-stock`)
    },
    { 
      label: "Priority Selection", 
      href: `/programmes/${programmeId}/priorities`,
      icon: Target,
      disabled: false,
      active: currentPath.includes(`/programmes/${programmeId}/priorities`)
    },
    { 
      label: "Future Focus", 
      href: `/programmes/${programmeId}/future-focus`,
      icon: Target,
      disabled: false,
      active: currentPath.includes(`/programmes/${programmeId}/future-focus`)
    },
    { 
      label: "Action Plan", 
      href: `/programmes/${programmeId}/action-plan`,
      icon: TrendingUp,
      disabled: false,
      active: currentPath.includes(`/programmes/${programmeId}/action-plan`)
    }
  ];

  return (
    <Layout user={user}>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/10 hidden md:flex flex-col shrink-0">
          <div className="p-6 border-b bg-background/50">
             <div className="font-mono text-xs text-muted-foreground mb-1">{programme.code}</div>
             <h2 className="font-bold leading-tight text-primary">{programme.name}</h2>
          </div>
          
          <nav className="p-4 space-y-1 flex-1">
            {sidebarItems.map((item, i) => (
              <Link 
                key={i} 
                href={item.disabled ? '#' : item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  item.active 
                    ? "bg-primary/10 text-primary border-r-2 border-primary rounded-r-none" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
                )}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t bg-background/50">
             <Link href="/my-programmes" className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="h-3 w-3 mr-1" />
                Back to My Programmes
             </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-background overflow-auto">
            {children}
        </main>
      </div>
    </Layout>
  );
}
