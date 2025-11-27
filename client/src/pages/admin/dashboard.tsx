import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStore, User } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCog, Activity } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, users } = useStore();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'admin') return null;

  // Calculate Stats
  const totalUsers = users.length;
  const admins = users.filter((u: User) => u.role === 'admin').length;
  const chairs = users.filter((u: User) => u.role === 'programme_chair').length;
  const owners = users.filter((u: User) => u.role === 'module_owner' || u.role === 'module_lead').length;
  const viewers = users.filter((u: User) => !['admin', 'programme_chair', 'module_owner', 'module_lead'].includes(u.role || '')).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage users and system access.</p>
        </div>
        <Link href="/admin/users">
            <Button>
                <UserCog className="mr-2 h-4 w-4" /> Manage Users
            </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programme Chairs</CardTitle>
            <Shield className="h-4 w-4 text-[#78BE20]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chairs}</div>
            <p className="text-xs text-muted-foreground">Programme management access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Module Leads</CardTitle>
            <UserCog className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{owners}</div>
            <p className="text-xs text-muted-foreground">Module level access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Admins</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins}</div>
            <p className="text-xs text-muted-foreground">Full system control</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
           <Link href="/admin/users/create">
              <Button variant="outline" className="h-24 w-32 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  Create User
              </Button>
           </Link>
           <Link href="/admin/users">
              <Button variant="outline" className="h-24 w-32 flex flex-col gap-2">
                  <Shield className="h-6 w-6" />
                  Manage Roles
              </Button>
           </Link>
        </CardContent>
      </Card>
    </div>
  );
}
