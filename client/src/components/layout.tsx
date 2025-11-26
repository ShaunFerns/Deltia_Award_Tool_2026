import { Link, useLocation } from "wouter";
import { User, useStore } from "@/lib/data";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  user: User;
}

export function Layout({ children, user }: LayoutProps) {
  const [location] = useLocation();
  const { logout } = useStore();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-primary hover:opacity-90 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  Δ
                </div>
                <span>DELTA Award</span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
                {user.role === 'programme_chair' && (
                    <Link href="/my-programmes" className={cn("hover:text-primary transition-colors", location.startsWith('/my-programmes') || location.startsWith('/programmes') ? "text-primary font-bold" : "")}>
                        My Programmes
                    </Link>
                )}
                <Link href="/my-modules" className={cn("hover:text-primary transition-colors", location.startsWith('/my-modules') ? "text-primary font-bold" : "")}>
                      My Modules
                </Link>
                <Link href="/dashboard" className={cn("hover:text-primary transition-colors", location.startsWith('/dashboard') ? "text-primary font-bold" : "")}>
                      My Dashboards
                </Link>
             </div>
             <div className="h-4 w-px bg-border hidden md:block"></div>
             <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
                  <div className="h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{user.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive" 
                  onClick={() => logout()}
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
             </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:px-8 md:py-12 animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-6">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <p>DELTA Framework Self-Evaluation Tool &copy; {new Date().getFullYear()}</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/instructions" className="hover:text-primary transition-colors">Instructions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
