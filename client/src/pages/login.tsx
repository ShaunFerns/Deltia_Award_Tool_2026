import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStore, DEMO_MODE, TEST_USERS } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, User, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [location, setLocation] = useLocation();
  const { login, user, seedDemoData } = useStore();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (login(username, password)) {
        // If in demo mode, ensure data is seeded on first login
        if (DEMO_MODE) {
            seedDemoData();
        }
        setLocation("/");
    } else {
        setError("Invalid username or password");
    }
  };

  // Helper to fill form for demo
  const fillDemo = (u: string, p: string) => {
      setUsername(u);
      setPassword(p);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Left Column: Information */}
      <div className="md:flex-[3] p-8 md:p-16 flex flex-col justify-center bg-slate-100/50 border-r border-slate-200">
        <div className="max-w-2xl mx-auto space-y-8">
           <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 bg-[#78BE20] rounded-lg flex items-center justify-center shadow-md">
                 <span className="text-white font-bold text-2xl">δ</span>
              </div>
              <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900">DELTA Award</h1>
           </div>
           
           <div className="space-y-4">
             <h2 className="text-2xl font-bold text-slate-800">DELTA Award Evaluation Tool</h2>
             <p className="text-lg text-slate-600 leading-relaxed">
               A structured, evidence-informed system to support programme teams in preparing DELTA Award submissions. 
               This tool guides you from programme profiling and module evaluation through Taking Stock, future planning, 
               and Action Plan development, aligned with the DELTA Framework.
             </p>
           </div>

           <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 uppercase tracking-wide text-sm">Key Features</h3>
              <ul className="space-y-3">
                {[
                  "Programme and team profile",
                  "Module evidence and evaluation",
                  "Taking Stock across the five DELTA components",
                  "System-suggested rubric levels with team override",
                  "SMART Action Plan builder and export"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-[#78BE20]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
           </div>

           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-semibold text-slate-900 mb-2">Audience Statement</h4>
              <p className="text-slate-600">
                Designed for programme teams, teaching and learning units, and institutional leaders who wish to 
                document and enhance practice in line with DELTA expectations.
              </p>
           </div>
           
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="md:flex-[2] p-4 md:p-12 flex flex-col justify-center items-center bg-white">
        <div className="w-full max-w-md space-y-6">
           
           <div className="text-center md:hidden mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
              <p className="text-muted-foreground">Access your DELTA dashboard</p>
           </div>

           <Card className="border-slate-200 shadow-xl w-full">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="username" 
                        placeholder="Enter username" 
                        className="pl-9"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Enter password" 
                        className="pl-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-[#78BE20] hover:bg-[#6aa81d] text-white font-semibold">
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
              
              {DEMO_MODE && (
                  <CardFooter className="flex flex-col items-start bg-slate-50/50 border-t p-6 gap-4">
                      <div className="w-full space-y-3">
                          <h4 className="text-sm font-semibold text-slate-900">Demo Accounts</h4>
                          <div className="grid gap-2">
                              {TEST_USERS.filter(u => u.role !== 'admin').map((u, idx) => (
                                  <div 
                                    key={idx} 
                                    className="text-xs p-3 rounded border bg-white hover:border-[#78BE20] hover:shadow-sm cursor-pointer transition-all group"
                                    onClick={() => fillDemo(u.username, u.password)}
                                  >
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="font-medium text-slate-700">{u.name}</span>
                                          <span className="text-[#78BE20] opacity-0 group-hover:opacity-100 transition-opacity font-bold">Click to fill</span>
                                      </div>
                                      <div className="text-slate-500 font-mono">User: {u.username}</div>
                                      <div className="text-slate-500 font-mono">Pass: {u.password}</div>
                                  </div>
                              ))}
                          </div>
                          
                          {/* Admin Login Helper */}
                          <div className="pt-2 border-t w-full">
                             <div 
                                className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer flex justify-between items-center"
                                onClick={() => fillDemo("admin", "admin")}
                             >
                                <span>Admin Access</span>
                                <span className="font-mono opacity-50">admin / admin</span>
                             </div>
                          </div>
                      </div>
                  </CardFooter>
              )}
           </Card>
           
           <div className="text-center text-xs text-muted-foreground">
               <p>&copy; {new Date().getFullYear()} DELTA Framework Evaluation Tool</p>
           </div>
        </div>
      </div>
    </div>
  );
}
