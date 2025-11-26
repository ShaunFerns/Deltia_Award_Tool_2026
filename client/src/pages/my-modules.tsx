import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useStore } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, ArrowRight, LayoutDashboard, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function MyModulesPage() {
  const { user, getMyModules, getEvaluation } = useStore();
  const modules = getMyModules();

  // Calculate stats
  const totalModules = modules.length;
  const evaluations = modules.map(m => getEvaluation(m.id));
  const completed = evaluations.filter(e => e && e.completedAt).length; // Assuming existence means started/completed for now
  // In a real app, we'd check a specific status field. For now, existence = in progress/done.
  // Let's refine: The mock data doesn't strictly have 'status', but we can infer.
  // Let's just count 'Evaluations Started'
  const started = evaluations.filter(e => !!e).length;
  const notStarted = totalModules - started;

  return (
    <Layout user={user}>
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-primary flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8" />
              Module Owner Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Overview of your assigned modules and evaluation progress.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalModules}</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evaluations Active</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{started}</div>
              <p className="text-xs text-muted-foreground">In progress or completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Action</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notStarted}</div>
              <p className="text-xs text-muted-foreground">Not yet started</p>
            </CardContent>
          </Card>
        </div>

        {/* Modules List */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Your Modules</CardTitle>
            <CardDescription>Manage and evaluate your assigned modules.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Module Name</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 opacity-20" />
                        <p>You don't have any assigned modules yet.</p>
                        <p className="text-sm">Contact a Programme Chair to be assigned to a module.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  modules.map((mod) => {
                    const evaluation = getEvaluation(mod.id);
                    const isStarted = !!evaluation;
                    
                    return (
                      <TableRow key={mod.id} className="group">
                        <TableCell className="font-mono font-medium">{mod.code}</TableCell>
                        <TableCell className="font-medium text-base">{mod.name}</TableCell>
                        <TableCell>
                           {mod.programmeName ? (
                               <Badge variant="outline" className="font-normal text-xs">
                                   {mod.programmeName}
                               </Badge>
                           ) : (
                               <span className="text-muted-foreground text-sm">—</span>
                           )}
                        </TableCell>
                        <TableCell>
                          {isStarted ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Not Started
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={isStarted && mod.programmeId ? `/dashboard/programme/${mod.programmeId}/module/${mod.id}` : `/evaluate/${mod.id}`}>
                            <Button 
                              size="sm" 
                              variant={isStarted ? "secondary" : "default"}
                              className="gap-2 min-w-[140px]"
                            >
                              {isStarted ? (
                                <>
                                  <LayoutDashboard className="h-4 w-4" /> View Dashboard
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-4 w-4" /> Start Evaluation
                                </>
                              )}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
