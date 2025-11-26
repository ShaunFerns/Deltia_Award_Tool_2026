import { useStore, CATEGORIES, ModuleEvaluation } from "@/lib/data";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRoute, Link } from "wouter";
import { CheckCircle2, FileText, PieChart as PieIcon, ArrowLeft, AlertTriangle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, PieChart, Pie, Cell } from 'recharts';

export default function DashboardModulePage() {
  const [matchProg, paramsProg] = useRoute("/dashboard/programme/:pid/module/:mid");
  const [matchMod, paramsMod] = useRoute("/dashboard/module/:mid");
  
  const moduleId = matchProg ? paramsProg?.mid : paramsMod?.mid;
  const programmeId = matchProg ? paramsProg?.pid : undefined;

  const { user, programmes, evaluations, getProgrammeModules } = useStore();
  
  const programme = programmeId ? programmes.find((p: any) => p.id === programmeId) : undefined;
  
  // If we have a programme, try to find the module within it
  // If not, we might just be looking for the module itself (standalone or just not in programme context)
  const progModule = programmeId 
    ? getProgrammeModules(programmeId).find((pm: any) => pm.moduleId === moduleId)
    : { module: { name: 'Module Dashboard', code: '' } }; // Fallback if no programme context

  const evaluation = evaluations.find((e: ModuleEvaluation) => e.moduleId === moduleId); // Simplified lookup
  
  // If we strictly need programme context but don't have it, we might want to look it up from the module?
  // For now, let's handle the "No Programme" case gracefully
  
  if (!moduleId) return <div>Invalid Module ID</div>;

  // --- Data Prep ---
  
  // 1. Radar Data (This Module vs Max)
  const radarData = CATEGORIES.map((cat, idx) => {
      const key = Object.keys(evaluation?.categoryScores || {}).find(k => k === cat.id);
      const score = evaluation?.categoryScores?.[cat.id] || 0;
      return {
          subject: cat.label.split(' ')[0],
          fullSubject: cat.label,
          Score: score,
          fullMark: 10
      };
  });

  // 2. Assessment Data
  const assessments = evaluation?.metadata?.assessments || [];
  const assessmentData = assessments.map((a: any) => ({
      name: a.type,
      value: a.weight
  }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <DashboardLayout user={user} title={evaluation?.metadata?.moduleHeadline || 'Module Dashboard'} subtitle={programme ? `${programme.name}` : 'Module Evaluation'}>
        
        {/* Back Navigation */}
        <div className="mb-6">
            {programmeId ? (
                <Link href={`/dashboard/programme/${programmeId}`}>
                    <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="h-4 w-4" /> Back to {programme?.name} Dashboard
                    </Button>
                </Link>
            ) : (
                <Link href="/my-modules">
                    <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="h-4 w-4" /> Back to My Modules
                    </Button>
                </Link>
            )}
        </div>

        {!evaluation ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <h2 className="text-xl font-semibold">No Evaluation Data</h2>
                <p>This module has not been evaluated yet.</p>
            </div>
        ) : (
            <div className="space-y-8">
                
                {/* Quick Stats Row */}
                 <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Overall Score</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {((Object.values(evaluation.categoryScores) as number[]).reduce((a: number, b: number) => a + b, 0) / 5).toFixed(1)} <span className="text-sm text-muted-foreground font-normal">/ 10</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Student Feedback</CardTitle></CardHeader>
                         <CardContent>
                            <div className="text-2xl font-bold">
                                {evaluation.metadata?.studentFeedbackOverall || '-'} <span className="text-sm text-muted-foreground font-normal">/ 5</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Risk Level</CardTitle></CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-2">
                                 {evaluation.metadata?.moduleRiskLevel !== 'no_concern' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                 <Badge variant={evaluation.metadata?.moduleRiskLevel === 'no_concern' ? 'outline' : 'destructive'} className="capitalize">
                                    {evaluation.metadata?.moduleRiskLevel?.replace(/_/g, ' ') || 'Unknown'}
                                 </Badge>
                             </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Teaching Team</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold capitalize truncate">
                                {evaluation.metadata?.teachingTeamSize?.replace(/_/g, ' ') || '-'}
                            </div>
                        </CardContent>
                    </Card>
                 </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Radar Chart */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Module Profile</CardTitle>
                            <CardDescription>Performance across DELTA components (Score / 10)</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 10]} tickCount={6}/>
                                    <Radar name="Score" dataKey="Score" stroke="#78BE20" fill="#78BE20" fillOpacity={0.6} />
                                    <Legend />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Assessment Profile */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Assessment Profile</CardTitle>
                            <CardDescription>Weighting distribution</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            {assessments.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={assessmentData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({name, percent}: {name: string, percent: number}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {assessmentData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">No assessment data</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Breakdown with Indicators */}
                 <div className="space-y-4">
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Component & Indicator Analysis
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {CATEGORIES.map(cat => {
                            const score = evaluation.categoryScores[cat.id];
                            const level = evaluation.categoryLevels[cat.id];
                            const summary = evaluation.evidenceSummaries?.[cat.id];
                            
                            return (
                                <Card key={cat.id} className="border-l-4 overflow-hidden flex flex-col" style={{ borderLeftColor: score > 7 ? '#78BE20' : score > 3 ? '#3b82f6' : '#fbbf24' }}>
                                    <CardHeader className="pb-2 bg-muted/10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-sm font-bold">{cat.label}</CardTitle>
                                            </div>
                                            <Badge variant="outline" className="ml-2 shrink-0">{score}/10</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 flex-1 flex flex-col">
                                        {/* Indicator Breakdown */}
                                        <div className="space-y-3 mb-4">
                                            {cat.indicators.map(ind => {
                                                const indScore = evaluation.indicatorScores?.[ind.id] || 0; // 1-5
                                                // Scale 1-5 to width percentage
                                                const width = (indScore / 5) * 100;
                                                let color = 'bg-gray-200';
                                                if (indScore >= 4) color = 'bg-green-500';
                                                else if (indScore >= 3) color = 'bg-amber-400';
                                                else if (indScore > 0) color = 'bg-red-400';

                                                return (
                                                    <div key={ind.id}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="font-medium text-muted-foreground" title={ind.description}>{ind.label}</span>
                                                            <span className="font-bold">{indScore}/5</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div className={`h-full ${color} rounded-full`} style={{ width: `${width}%` }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-dashed">
                                            <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Evidence Summary</div>
                                            <div className="text-sm text-foreground/90 italic line-clamp-3">
                                                "{summary || 'No evidence summary provided.'}"
                                            </div>
                                            <div className="mt-2 flex justify-end">
                                                <Badge variant="secondary" className="text-[10px]">{level}</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                 </div>

                {/* Metadata & Assessment Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Strategy Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-3">
                                {evaluation.metadata?.assessments.map((a: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded border hover:bg-muted/30 transition-colors">
                                        <div>
                                            <div className="font-bold text-sm">{a.name}</div>
                                            <div className="text-xs text-muted-foreground capitalize">{a.type.replace(/_/g, ' ')} • Week {a.dueWeek}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-primary">{a.weight}%</div>
                                            <Badge variant="outline" className="text-[10px] h-5">{a.timingBand}</Badge>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Key Metadata Signals</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {evaluation.metadata?.udlIndicators && evaluation.metadata.udlIndicators.length > 0 && (
                                <div>
                                    <div className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider text-xs">UDL Features</div>
                                    <div className="flex flex-wrap gap-2">
                                        {evaluation.metadata.udlIndicators.map((i: string, idx: number) => <Badge key={idx} variant="secondary" className="capitalize">{i.replace(/_/g, ' ')}</Badge>)}
                                    </div>
                                </div>
                            )}
                            {evaluation.metadata?.teachingApproaches && evaluation.metadata.teachingApproaches.length > 0 && (
                                <div>
                                    <div className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider text-xs">Teaching Approach</div>
                                    <div className="flex flex-wrap gap-2">
                                        {evaluation.metadata.teachingApproaches.map((i: string, idx: number) => <Badge key={idx} variant="outline" className="capitalize">{i.replace(/_/g, ' ')}</Badge>)}
                                    </div>
                                </div>
                            )}
                            {evaluation.metadata?.digitalPractice && evaluation.metadata.digitalPractice.length > 0 && (
                                <div>
                                    <div className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider text-xs">Digital Practice</div>
                                    <div className="flex flex-wrap gap-2">
                                        {evaluation.metadata.digitalPractice.map((i: string, idx: number) => <Badge key={idx} variant="outline" className="border-blue-200 bg-blue-50 text-blue-800 capitalize">{i.replace(/_/g, ' ')}</Badge>)}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        )}

    </DashboardLayout>
  );
}
