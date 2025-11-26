import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useStore, Module, Programme } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, CheckCircle2, CircleDashed, LayoutDashboard, Plus } from "lucide-react";

export default function HomePage() {
  const { user, getMyModules, getMyProgrammes, getEvaluation } = useStore();

  const myModules = getMyModules();
  const myProgrammes = getMyProgrammes();

  const getFirstName = (fullName: string) => {
    const parts = fullName.split(' ');
    // If first part looks like a title (ends in dot or matches common titles), skip it
    if (parts.length > 1 && (parts[0].endsWith('.') || ['Dr', 'Prof', 'Mr', 'Ms', 'Mrs'].includes(parts[0]))) {
      return parts[1];
    }
    return parts[0];
  };

  return (
    <Layout user={user}>
      <div className="mx-auto max-w-6xl space-y-8 pb-20">
        
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-primary font-serif">
            Welcome back, {getFirstName(user.name)}
          </h1>
          <p className="text-muted-foreground text-lg max-w-4xl leading-relaxed">
            Welcome to your DELTA Evaluation Workspace.
            This tool guides you through module evaluation, programme reflection, priority-setting, theme development, and Action Plan creation, all aligned with the DELTA Framework.
            <br className="hidden md:block" /> 
            Select a module or programme to continue your enhancement work.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8 md:grid-cols-2">
            
            {/* Module Owner Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        My Modules
                        <Badge variant="secondary" className="ml-2">{myModules.length}</Badge>
                    </h2>
                    <Link href="/my-modules">
                        <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    {myModules.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <BookOpen className="h-8 w-8 mb-2 opacity-20" />
                                <p>No modules assigned yet.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        myModules.slice(0, 3).map((module: Module) => {
                            const evaluation = getEvaluation(module.id);
                            const isCompleted = !!evaluation;
                            
                            return (
                              <Card key={module.id} className="group relative overflow-hidden border-muted/60 transition-all hover:shadow-md hover:border-primary/20">
                                <div className={`absolute top-0 left-0 h-1 w-full ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                                
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between">
                                    <Badge variant="outline" className="bg-background font-mono text-xs text-muted-foreground">
                                      {module.code}
                                    </Badge>
                                    {isCompleted ? (
                                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Completed
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-muted/50 text-muted-foreground gap-1">
                                        <CircleDashed className="h-3 w-3" /> Not Started
                                      </Badge>
                                    )}
                                  </div>
                                  <CardTitle className="line-clamp-2 text-xl font-serif leading-tight mt-2 group-hover:text-primary transition-colors">
                                    {module.name}
                                  </CardTitle>
                                  <CardDescription className="line-clamp-1">
                                    {module.programmeName || 'No Programme Assigned'}
                                  </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="pb-3">
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Module Owner</span>
                                  </div>
                                </CardContent>
                          
                                <CardFooter className="pt-3 border-t border-border/40 bg-muted/20">
                                  <Link href={`/evaluate/${module.id}`}>
                                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all" variant={isCompleted ? "outline" : "default"}>
                                      {isCompleted ? 'Edit Evaluation' : 'Evaluate Module'}
                                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                  </Link>
                                </CardFooter>
                              </Card>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Programme Chair Section - Only visible to Programme Chairs */}
            {user.role === 'programme_chair' && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                        My Programmes
                        <Badge variant="secondary" className="ml-2">{myProgrammes.length}</Badge>
                    </h2>
                    <div className="flex items-center gap-2">
                        <Link href="/programmes/create">
                            <Button variant="outline" size="sm" className="h-8">
                                <Plus className="h-3 w-3 mr-1" /> New
                            </Button>
                        </Link>
                        <Link href="/my-programmes">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6">
                    {myProgrammes.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <LayoutDashboard className="h-8 w-8 mb-2 opacity-20" />
                                <p>No programmes managed.</p>
                                <Link href="/programmes/create">
                                    <Button variant="link" className="mt-2">Create Programme</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        myProgrammes.slice(0, 3).map((prog: Programme) => (
                            <Card key={prog.id} className="group relative overflow-hidden border-muted/60 transition-all hover:shadow-md hover:border-primary/20">
                                <div className="absolute top-0 left-0 h-1 w-full bg-primary/40" />
                                
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <Badge variant="outline" className="bg-background font-mono text-xs text-muted-foreground">
                                            {prog.code}
                                        </Badge>
                                    </div>
                                    <CardTitle className="line-clamp-2 text-xl font-serif leading-tight mt-2 group-hover:text-primary transition-colors">
                                        {prog.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-1">
                                        {prog.school || 'No School Assigned'}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="pb-3">
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Programme Chair</span>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-3 border-t border-border/40 bg-muted/20 gap-2">
                                    <Link href={`/programmes/${prog.id}/structure`}>
                                        <Button size="sm" variant="outline" className="flex-1 group-hover:border-primary/50 transition-all">Structure</Button>
                                    </Link>
                                    <Link href={`/programmes/${prog.id}/profile`}>
                                        <Button size="sm" variant="outline" className="flex-1 group-hover:border-primary/50 transition-all">Profile</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
            )}

        </div>

      </div>
    </Layout>
  );
}
