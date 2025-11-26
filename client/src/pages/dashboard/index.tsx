import { useStore, CATEGORIES, ModuleEvaluation } from "@/lib/data";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { ArrowRight, BookOpen, GraduationCap, Layers, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, programmes, evaluations, programmeTakingStocks, programmeThemes } = useStore();

  // --- Aggregations ---

  // 1. Participation Stats
  const totalProgrammes = programmes.length;
  const totalModulesEvaluated = evaluations.length;
  const totalThemes = programmeThemes.length;
  
  // 2. Component Performance (Avg Scores)
  const componentStats = CATEGORIES.map(cat => {
      const catScores = evaluations.flatMap((e: ModuleEvaluation) => {
          // Calculate score for this category from answers
          // Logic borrowed from taking stock synthesis
          const relevantAnswers = Object.entries(e.answers)
             .filter(([key]) => key.startsWith(`${CATEGORIES.findIndex(c => c.id === cat.id)}_`))
             .map(([, val]) => val);
          
          if (relevantAnswers.length === 0) return [];
          return [relevantAnswers.reduce((a, b) => a + b, 0) / relevantAnswers.length];
      }).flat();

      const avg = catScores.length > 0 
        ? catScores.reduce((a: number, b: number) => a + b, 0) / catScores.length 
        : 0;

      return {
          name: cat.label.split(' ')[0], // Short label
          fullName: cat.label,
          score: parseFloat(avg.toFixed(1)),
          color: '#78BE20' // Delta Green
      };
  });

  // 3. Maturity Levels (from Taking Stock)
  const levelCounts = { Developing: 0, Consolidating: 0, Leading: 0 };
  programmeTakingStocks.forEach((pts: any) => {
      CATEGORIES.forEach(cat => {
          const lvl = pts[cat.id]?.selectedLevel || pts[cat.id]?.recommendedLevel;
          if (lvl && levelCounts[lvl as keyof typeof levelCounts] !== undefined) {
              levelCounts[lvl as keyof typeof levelCounts]++;
          }
      });
  });
  
  const levelData = [
      { name: 'Developing', value: levelCounts.Developing, color: '#fbbf24' },
      { name: 'Consolidating', value: levelCounts.Consolidating, color: '#3b82f6' },
      { name: 'Leading', value: levelCounts.Leading, color: '#78BE20' }
  ].filter(d => d.value > 0);

  const { seedDemoData } = useStore();

  if (programmes.length === 0) {
    return (
        <DashboardLayout user={user} title="Institutional Overview" subtitle="Welcome to DELTA Analytics">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed rounded-xl bg-muted/10">
                <Layers className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-primary mb-2">No Data Available</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                    It looks like there are no programmes or evaluations in the system yet. 
                    Would you like to load the demonstration dataset to explore the dashboard features?
                </p>
                <Button size="lg" onClick={() => seedDemoData()} className="gap-2">
                    <BookOpen className="w-4 h-4" /> Load Demo Data
                </Button>
            </div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} title="Institutional Overview" subtitle="High-level insights across all DELTA submissions">
        
        {/* Top Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Programmes</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalProgrammes}</div>
                    <p className="text-xs text-muted-foreground">Engaged with DELTA</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Modules Evaluated</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalModulesEvaluated}</div>
                    <p className="text-xs text-muted-foreground">Across all stages</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Strategic Themes</CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalThemes}</div>
                    <p className="text-xs text-muted-foreground">Identified for action</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Maturity</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Consolidating</div>
                    <p className="text-xs text-muted-foreground">Dominant level</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
            
            {/* Chart 1: Component Performance */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Performance by Component</CardTitle>
                    <CardDescription>Average self-evaluation scores (1-5) across all modules</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={componentStats} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" domain={[0, 5]} hide />
                            <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                            />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={32}>
                                {componentStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 2: Maturity Distribution */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Programme Maturity Profile</CardTitle>
                    <CardDescription>Distribution of 'Taking Stock' levels across components</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={levelData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {levelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </div>

        {/* Recent Activity / Programmes List Link */}
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Programme Submissions</h2>
                {user.role === 'programme_chair' && (
                    <Link href="/dashboard/programmes">
                        <Button variant="outline" className="gap-2">
                            View All Programmes <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                )}
            </div>
            
            {user.role === 'programme_chair' ? (
                <div className="grid gap-4 md:grid-cols-3">
                    {programmes.slice(0, 3).map(prog => (
                        <Link key={prog.id} href={`/dashboard/programme/${prog.id}`}>
                            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg text-primary">{prog.name}</CardTitle>
                                    <CardDescription>{prog.code}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <BookOpen className="w-4 h-4" />
                                        {evaluations.filter((e: ModuleEvaluation) => {
                                            // Mock logic to find evaluations for this programme
                                            // In real app, need better relational mapping or helper
                                            return true; // Placeholder
                                        }).length} Modules
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-muted/5 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center h-40 text-center p-6">
                            <Layers className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                As a Module Lead, you have access to your specific module dashboards. 
                                Programme-level analytics are available to Programme Chairs.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>

    </DashboardLayout>
  );
}
