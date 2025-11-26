import { Layout } from "@/components/layout";
import { useStore } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CheckCircle2, BookOpen, LayoutDashboard, Target, FileText, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function InstructionsPage() {
  const { user } = useStore();

  return (
    <Layout user={user}>
      <div className="mx-auto max-w-5xl space-y-8 pb-20">
        
        <div className="space-y-4 border-b pb-6">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-primary font-serif">Instructions & Help</h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                A step-by-step guide to using the DELTA Evaluation Tool for module enhancement and programme review.
            </p>
        </div>

        <Tabs defaultValue="module" className="space-y-8">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto p-1 gap-2 bg-muted/50 rounded-lg">
                <TabsTrigger value="module" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium">
                    <BookOpen className="w-4 h-4 mr-2" /> Module Evaluation
                </TabsTrigger>
                <TabsTrigger value="programme" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Programme Review
                </TabsTrigger>
                <TabsTrigger value="action" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium">
                    <Target className="w-4 h-4 mr-2" /> Action Planning
                </TabsTrigger>
            </TabsList>

            {/* Module Evaluation Tab */}
            <TabsContent value="module" className="space-y-6 animate-fade-in">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Evaluating a Module</h2>
                        <p className="text-muted-foreground">
                            Module owners self-assess their modules against 15 indicators across the 5 DELTA dimensions.
                        </p>
                        
                        <div className="space-y-4">
                            {[
                                { step: 1, title: "Select Module", desc: "Go to 'My Modules' and choose a module to evaluate." },
                                { step: 2, title: "Rate Indicators", desc: "For each of the 5 dimensions, rate the 3 indicators on a scale of 1-5." },
                                { step: 3, title: "Provide Evidence", desc: "Upload files or add links/notes to support your self-evaluation rating." },
                                { step: 4, title: "Review Profile", desc: "Check the visualised radar chart to see your module's strengths and areas for development." }
                            ].map((s) => (
                                <div key={s.step} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                                        {s.step}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{s.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <Link href="/my-modules">
                            <Button className="mt-4">Go to My Modules <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </Link>
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-muted-foreground" /> Scoring Guide
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-white rounded border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-amber-600">Developing (1-2)</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Emerging practice. Awareness of the dimension but limited implementation or evidence.</p>
                            </div>
                            <div className="p-3 bg-white rounded border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-blue-600">Consolidating (3)</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Established practice. Good implementation with some evidence of effectiveness.</p>
                            </div>
                            <div className="p-3 bg-white rounded border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-green-600">Leading (4-5)</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Exemplary practice. Innovative implementation with strong evidence of impact and dissemination.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </TabsContent>

            {/* Programme Review Tab */}
            <TabsContent value="programme" className="space-y-6 animate-fade-in">
                 <div className="grid gap-6">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Taking Stock (Programme Level)</h2>
                        <p className="text-muted-foreground">
                            Programme Chairs synthesise module-level data to determine the overall maturity of the programme.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">1. Dashboard Review</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Use the Programme Dashboard to see aggregated data, heatmaps, and assessment timelines across all modules. Identify patterns of strength and weakness.
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">2. Determine Levels</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                In the 'Taking Stock' section, the system suggests a maturity level (Developing/Consolidating/Leading) based on data. You can override this with a rationale based on team consensus.
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">3. Identify Priorities</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Flag specific areas for improvement. These flagged items become the "Priorities" for your Action Plan.
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="flex justify-start">
                        <Link href="/my-programmes">
                             <Button variant="outline">View My Programmes</Button>
                        </Link>
                    </div>
                 </div>
            </TabsContent>

             {/* Action Planning Tab */}
             <TabsContent value="action" className="space-y-6 animate-fade-in">
                <div className="space-y-6">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold">Creating an Action Plan</h2>
                        <p className="text-muted-foreground mt-2">
                            Transform priorities into a structured, time-bound plan for enhancement.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">A</div>
                                <div>
                                    <h3 className="font-bold">Select Priorities</h3>
                                    <p className="text-sm text-muted-foreground">Choose which of the flagged areas you want to tackle in this cycle.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">B</div>
                                <div>
                                    <h3 className="font-bold">Define Themes (Future Focus)</h3>
                                    <p className="text-sm text-muted-foreground">Group related priorities into strategic themes (e.g., "Digital Transformation").</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">C</div>
                                <div>
                                    <h3 className="font-bold">Set SMART Goals</h3>
                                    <p className="text-sm text-muted-foreground">Create specific, measurable goals for each theme, assigning roles, timelines, and success measures.</p>
                                </div>
                            </div>
                        </div>
                        
                        <Card className="bg-slate-50 border-dashed">
                            <CardHeader>
                                <CardTitle className="text-base">Output: Gantt Chart</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    The system automatically generates a Gantt chart visualising your action plan timeline, dependencies, and milestones.
                                </p>
                                <div className="h-24 bg-white rounded border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                                    [Visualisation Preview]
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
             </TabsContent>

        </Tabs>

      </div>
    </Layout>
  );
}
