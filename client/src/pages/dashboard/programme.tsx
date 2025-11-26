import { useStore, CATEGORIES, Category, PriorityTheme, SmartGoal, ProgrammePriority, getTimingBand, Indicator } from "@/lib/data";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRoute, Link } from "wouter";
import { ArrowRight, CheckCircle2, Circle, AlertCircle, Target, Layers, ArrowDown, Calendar, Clock, Zap, TrendingUp, AlertTriangle, List, GanttChartSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, AreaChart, Area } from 'recharts';

export default function DashboardProgrammePage() {
  const [, params] = useRoute("/dashboard/programme/:id");
  const programmeId = params?.id;
  const { user, programmes, evaluations, programmeTakingStocks, programmePriorities, programmeThemes, programmeGoals, getProgrammeModules } = useStore();
  
  const programme = programmes.find(p => p.id === programmeId);
  const modules = getProgrammeModules(programmeId || '');
  const takingStock = programmeTakingStocks.find(pts => pts.programmeId === programmeId);
  const priorities = programmePriorities.filter(p => p.programmeId === programmeId);
  const themes = programmeThemes.filter(t => t.programmeId === programmeId);
  const goals = programmeGoals.filter(g => g.programmeId === programmeId);
  
  if (!programme) return <div>Programme not found</div>;

  // --- Data Prep ---
  
  // 1. Radar Data (Rec vs Selected Levels)
  const radarData = CATEGORIES.map(cat => {
      const ts = takingStock?.[cat.id];
      const levelMap: Record<string, number> = { 'Developing': 1, 'Consolidating': 2, 'Leading': 3 };
      return {
          subject: cat.label.split(' ')[0],
          fullSubject: cat.label,
          Recommended: levelMap[ts?.recommendedLevel || 'Developing'],
          Selected: levelMap[ts?.selectedLevel || ts?.recommendedLevel || 'Developing'],
          fullMark: 3
      };
  });

  // 2. Traceability & Summary Table Data Construction
  const summaryTableData = goals.map(goal => {
      const theme = themes.find(t => t.id === goal.themeId);
      const linkedPriorities = priorities.filter(p => theme?.linkedPriorityIds.includes(p.id));
      
      // Deduplicate components and indicators
      const uniqueComponents = Array.from(new Set(linkedPriorities.map(p => CATEGORIES.find(c => c.id === p.componentId)?.label)));
      // Assuming indicators could be inferred or are generic for now (mock logic as indicators are not directly linked to priorities in simplified model yet, but requested)
      // We will list the "Drivers" (Improvement text) as proxies for indicators/specific issues
      const drivers = linkedPriorities.map(p => p.text);
      
      return {
          theme: theme?.title || 'Untitled Theme',
          goal: goal.specific,
          indicators: drivers.join("; "), // Using improvement text as proxy for "Indicator/Issue"
          components: uniqueComponents.join(", "),
          modules: goal.modulesImpacted || 'Program-wide',
          timeline: `${goal.startDate} - ${goal.endDate}`,
          successMeasure: goal.measurable,
          responsible: goal.responsibleRoles || 'Team',
          milestones: goal.milestones || 'None',
          dependencies: goal.dependencies || 'None'
      };
  });

  // 3. Gantt Chart Data Prep
  const ganttData = goals.map(g => {
      const start = new Date(g.startDate);
      const end = new Date(g.endDate);
      // Simple normalization for demo timeline (Sep-Jun)
      const startMonth = start.getMonth(); // 0-11
      const endMonth = end.getMonth();
      
      // Convert academic year months to 0-9 index (Sep=0, Jun=9)
      const getAcademicMonthIndex = (m: number) => {
          if (m >= 8) return m - 8; // Sep(8)->0, Dec(11)->3
          return m + 4; // Jan(0)->4, Jun(5)->9
      };

      return {
          id: g.id,
          name: g.specific, // Full name for tooltip
          shortName: g.specific.length > 40 ? g.specific.substring(0, 40) + "..." : g.specific,
          start: getAcademicMonthIndex(startMonth),
          duration: Math.max(1, getAcademicMonthIndex(endMonth) - getAcademicMonthIndex(startMonth)),
          themeId: g.themeId,
          responsible: g.responsibleRoles || 'Team',
          milestones: g.milestones,
          dependencies: g.dependencies
      };
  });

  // 4. Assessment Map Data Prep
  const weeks = Array.from({ length: 15 }, (_, i) => i + 1);
  const assessmentMapData = modules.map(pm => {
      const evaluation = evaluations.find(e => e.moduleId === pm.moduleId);
      const assessments = evaluation?.metadata?.assessments || [];
      
      return {
          moduleCode: pm.module?.code,
          moduleName: pm.module?.name,
          stage: pm.stage,
          semester: pm.semester,
          assessments: assessments.map(a => ({
              ...a,
              week: a.dueWeek // Ensure week is available
          }))
      };
  }).sort((a, b) => (a.stage || 0) - (b.stage || 0));

  // Overview Assessment Data
  const assessmentDistribution = assessmentMapData.flatMap(m => m.assessments).reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);
  
  const assessmentOverviewData = Object.entries(assessmentDistribution).map(([type, count]) => ({
      name: type.replace(/_/g, ' '),
      count
  })).sort((a, b) => b.count - a.count).slice(0, 5);


  // 5. Deep Insights: Indicator Heatmap Data
  // We need to flatten all indicators across all categories
  const allIndicators: { catId: Category; ind: Indicator }[] = CATEGORIES.flatMap(cat => 
      cat.indicators.map(ind => ({ catId: cat.id, ind }))
  );

  const heatmapData = modules.map(pm => {
      const evaluation = evaluations.find(e => e.moduleId === pm.moduleId);
      const scores = evaluation?.indicatorScores || {};
      
      return {
          moduleCode: pm.module?.code,
          moduleName: pm.module?.name,
          moduleId: pm.moduleId,
          scores: allIndicators.map(({ ind }) => ({
              id: ind.id,
              score: scores[ind.id] || 0 // 0-5 (assuming indicator score is 1-5)
          }))
      };
  });

  // 6. Deep Insights: Generated Alerts & Strengths
  const alerts: { type: 'strength' | 'weakness' | 'info', message: string, modules?: string[] }[] = [];
  
  // Check for consistent weakness in a specific indicator across all modules
  allIndicators.forEach(({ ind, catId }) => {
      const scores = heatmapData.map(m => m.scores.find(s => s.id === ind.id)?.score || 0);
      const avg = scores.reduce((a,b) => a+b, 0) / (scores.length || 1);
      
      if (avg < 2.5 && scores.length > 0) {
          alerts.push({
              type: 'weakness',
              message: `System-detected pattern for Taking Stock consideration: Low confidence in '${ind.label}' (Avg: ${avg.toFixed(1)}/5).`,
          });
      }
      if (avg > 4.2 && scores.length > 0) {
          alerts.push({
              type: 'strength',
              message: `System-detected pattern: Programme demonstrates leading practice in '${ind.label}'.`,
          });
      }
  });

  // Check for Stage Disparities
  const stage1Modules = modules.filter(m => m.stage === 1).map(m => m.moduleId);
  const stage4Modules = modules.filter(m => m.stage === 4).map(m => m.moduleId);
  
  if (stage1Modules.length > 0 && stage4Modules.length > 0) {
      const s1Avg = evaluations.filter(e => stage1Modules.includes(e.moduleId))
          .reduce((acc, e) => acc + Object.values(e.categoryScores).reduce((a,b)=>a+b,0), 0) / (stage1Modules.length * 5);
      const s4Avg = evaluations.filter(e => stage4Modules.includes(e.moduleId))
          .reduce((acc, e) => acc + Object.values(e.categoryScores).reduce((a,b)=>a+b,0), 0) / (stage4Modules.length * 5);
      
      if (s4Avg > s1Avg + 1) { // Significant growth
           alerts.push({
              type: 'info',
              message: `Clear trajectory of maturity growth from Stage 1 to Stage 4.`,
          });
      }
  }


  return (
    <DashboardLayout user={user} title={programme.name} subtitle={`${programme.code} • Programme Analytics`}>
        
        <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="flex-wrap h-auto gap-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights" className="gap-2"><Zap className="w-3 h-3 text-amber-500" /> Deep Insights</TabsTrigger>
                <TabsTrigger value="assessment-map">Assessment Map</TabsTrigger>
                <TabsTrigger value="taking-stock">Taking Stock</TabsTrigger>
                <TabsTrigger value="traceability">Action Plan & Gantt</TabsTrigger>
                <TabsTrigger value="modules">Module Details</TabsTrigger>
            </TabsList>

            {/* --- TAB 1: OVERVIEW --- */}
            <TabsContent value="overview" className="space-y-8">
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Modules</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{modules.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Priorities Selected</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{priorities.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Strategic Themes</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{themes.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Action Goals</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{goals.length}</div></CardContent>
                    </Card>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Maturity Profile</CardTitle>
                            <CardDescription>Self-evaluated levels across DELTA components</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 3]} tickCount={4} tickFormatter={(val) => {
                                        if (val === 1) return 'Dev';
                                        if (val === 2) return 'Con';
                                        if (val === 3) return 'Lead';
                                        return '';
                                    }}/>
                                    <Radar name="Recommended" dataKey="Recommended" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                                    <Radar name="Selected" dataKey="Selected" stroke="#78BE20" fill="#78BE20" fillOpacity={0.6} />
                                    <Legend />
                                    <Tooltip formatter={(val) => {
                                        if (val === 1) return 'Developing';
                                        if (val === 2) return 'Consolidating';
                                        if (val === 3) return 'Leading';
                                        return val;
                                    }}/>
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Assessment Load</CardTitle>
                            <CardDescription>Top assessment types across programme</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={assessmentOverviewData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="count" fill="#78BE20" radius={[0, 4, 4, 0]} barSize={30} label={{ position: 'right', fill: '#666' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            {/* --- TAB: DEEP INSIGHTS --- */}
            <TabsContent value="insights" className="space-y-8">
                {/* 1. Automated Insights */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <TrendingUp className="w-5 h-5" /> Key Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {alerts.filter(a => a.type === 'strength' || a.type === 'info').map((a, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                        {a.message}
                                    </li>
                                ))}
                                {alerts.filter(a => a.type === 'strength' || a.type === 'info').length === 0 && (
                                    <li className="text-sm text-muted-foreground">No specific patterns detected yet.</li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-800">
                                <AlertTriangle className="w-5 h-5" /> System-Detected Patterns
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 text-xs text-amber-800/70 italic">
                                These patterns are identified from module-level data to support your Taking Stock reflection.
                            </div>
                            <ul className="space-y-3">
                                {alerts.filter(a => a.type === 'weakness').map((a, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        {a.message}
                                    </li>
                                ))}
                                {alerts.filter(a => a.type === 'weakness').length === 0 && (
                                    <li className="text-sm text-muted-foreground">No systemic risks detected.</li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. Indicator Heatmap */}
                <Card>
                    <CardHeader>
                        <CardTitle>Indicator Performance Heatmap</CardTitle>
                        <CardDescription>Detailed breakdown of performance across all 15 DELTA indicators by module.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="min-w-[1000px]">
                                <div className="flex mb-2">
                                    <div className="w-[200px] shrink-0"></div>
                                    {CATEGORIES.map(cat => (
                                        <div key={cat.id} className="flex-1 text-center border-b pb-1 mx-1 font-bold text-xs text-primary uppercase tracking-wider">
                                            {cat.label}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex mb-4">
                                    <div className="w-[200px] shrink-0 font-bold text-xs text-muted-foreground uppercase tracking-wider pt-2">Module</div>
                                    {allIndicators.map((ind, i) => (
                                        <div key={i} className="w-[50px] text-center text-[10px] text-muted-foreground -rotate-45 origin-bottom-left translate-x-4 h-24 flex items-end pb-2" title={ind.ind.label}>
                                            <span className="truncate w-24 block">{ind.ind.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-1">
                                    {heatmapData.map(mod => (
                                        <div key={mod.moduleId} className="flex items-center hover:bg-muted/10 rounded transition-colors py-1">
                                            <div className="w-[200px] shrink-0 pr-4">
                                                <div className="font-bold text-xs truncate">{mod.moduleCode}</div>
                                                <div className="text-[10px] text-muted-foreground truncate">{mod.moduleName}</div>
                                            </div>
                                            <div className="flex flex-1 gap-1">
                                                {mod.scores.map((s, i) => {
                                                    // Scale 1-5 to Levels
                                                    let bg = 'bg-gray-100';
                                                    let text = 'text-gray-400';
                                                    let label = '-';
                                                    
                                                    if (s.score > 0) {
                                                        if (s.score <= 2) { 
                                                            bg = 'bg-red-100'; 
                                                            text = 'text-red-700';
                                                            label = 'D';
                                                        }
                                                        else if (s.score === 3) { 
                                                            bg = 'bg-amber-100'; 
                                                            text = 'text-amber-700'; 
                                                            label = 'C';
                                                        }
                                                        else { 
                                                            bg = 'bg-green-100'; 
                                                            text = 'text-green-700'; 
                                                            label = 'L';
                                                        }
                                                    }
                                                    
                                                    return (
                                                        <div 
                                                            key={i} 
                                                            className={`w-[50px] h-8 flex items-center justify-center text-xs font-bold rounded ${bg} ${text}`}
                                                            title={`Score: ${s.score}/5 (${label === 'D' ? 'Developing' : label === 'C' ? 'Consolidating' : 'Leading'})`}
                                                        >
                                                            {label}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><div className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-700 rounded text-[10px] font-bold">D</div> Developing</div>
                            <div className="flex items-center gap-1"><div className="w-6 h-6 flex items-center justify-center bg-amber-100 text-amber-700 rounded text-[10px] font-bold">C</div> Consolidating</div>
                            <div className="flex items-center gap-1"><div className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded text-[10px] font-bold">L</div> Leading</div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* --- TAB: ASSESSMENT MAP --- */}
            <TabsContent value="assessment-map" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Programme Assessment Schedule</CardTitle>
                        <CardDescription>Visualising assessment load and timing across all modules</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="min-w-[800px]">
                                {/* Header Row: Weeks */}
                                <div className="grid grid-cols-[200px_1fr] gap-4 mb-4 border-b pb-2">
                                    <div className="font-bold text-sm text-muted-foreground uppercase tracking-wider pt-2">Module</div>
                                    <div className="grid grid-cols-15 gap-1 text-center text-xs text-muted-foreground">
                                        {weeks.map(w => <div key={w}>W{w}</div>)}
                                    </div>
                                </div>

                                {/* Module Rows */}
                                <div className="space-y-6">
                                    {assessmentMapData.map((mod, idx) => (
                                        <div key={idx} className="grid grid-cols-[200px_1fr] gap-4 items-center group hover:bg-muted/20 p-2 rounded transition-colors">
                                            <div>
                                                <div className="font-bold text-sm text-primary">{mod.moduleCode}</div>
                                                <div className="text-xs text-muted-foreground truncate" title={mod.moduleName}>{mod.moduleName}</div>
                                                <Badge variant="outline" className="text-[10px] mt-1">Stage {mod.stage}</Badge>
                                            </div>
                                            <div className="grid grid-cols-15 gap-1 h-10 relative bg-muted/10 rounded">
                                                {/* Background Grid Lines */}
                                                {weeks.map(w => (
                                                    <div key={w} className="border-r border-white/50 h-full"></div>
                                                ))}
                                                
                                                {/* Assessment Markers */}
                                                {mod.assessments.map((assess, aIdx) => {
                                                    // Position calculation (1-based week to 0-based grid column)
                                                    const colStart = Math.max(1, Math.min(15, assess.week));
                                                    
                                                    return (
                                                        <div 
                                                            key={aIdx}
                                                            className="absolute top-1 bottom-1 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm hover:scale-110 transition-transform cursor-help z-10"
                                                            style={{
                                                                left: `${(colStart - 1) * (100/15)}%`,
                                                                width: `${100/15}%`,
                                                                backgroundColor: assess.weight > 40 ? '#dc2626' : assess.weight > 20 ? '#ea580c' : '#78BE20'
                                                            }}
                                                            title={`${assess.name} (${assess.weight}%) - Week ${assess.week}`}
                                                        >
                                                            {assess.weight}%
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-6 flex gap-4 justify-end text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#78BE20]"></div> Low Weight (&le;20%)</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#ea580c]"></div> Med Weight (21-40%)</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#dc2626]"></div> High Weight (&gt;40%)</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* --- TAB: TAKING STOCK --- */}
            <TabsContent value="taking-stock" className="space-y-6">
                 {CATEGORIES.map(cat => {
                     const data = takingStock?.[cat.id];
                     if (!data) return null;

                     return (
                         <Card key={cat.id}>
                             <CardHeader>
                                 <div className="flex justify-between items-center">
                                     <CardTitle>{cat.label}</CardTitle>
                                     <Badge variant="outline" className="text-lg px-3 py-1">{data.selectedLevel || data.recommendedLevel}</Badge>
                                 </div>
                             </CardHeader>
                             <CardContent>
                                 <div className="grid md:grid-cols-2 gap-6">
                                     <div>
                                         <h4 className="text-sm font-semibold mb-2 text-primary">Evidence Summary</h4>
                                         <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                             {data.evidenceSummary.map((e, i) => <li key={i}>{e}</li>)}
                                         </ul>
                                     </div>
                                     <div>
                                         <h4 className="text-sm font-semibold mb-2 text-primary">Identified Improvements</h4>
                                         <ul className="space-y-2">
                                             {data.improvements?.map(imp => (
                                                 <li key={imp.id} className="flex items-start gap-2 text-sm bg-muted/30 p-2 rounded">
                                                     {imp.selectedAsPriority ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5"/> : <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"/>}
                                                     <span>{imp.text}</span>
                                                 </li>
                                             )) || (
                                                 // Fallback for legacy
                                                 data.areasForDevelopment?.split('\n').map((l, i) => <li key={i} className="text-sm text-muted-foreground">{l}</li>)
                                             )}
                                         </ul>
                                     </div>
                                 </div>
                             </CardContent>
                         </Card>
                     );
                 })}
            </TabsContent>

            {/* --- TAB: TRACEABILITY & GANTT --- */}
            <TabsContent value="traceability" className="space-y-8">
                
                {/* 1. Action Plan Summary Matrix */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <List className="w-5 h-5" /> Action Plan Matrix
                        </CardTitle>
                        <CardDescription>Comprehensive view of strategic themes, goals, and impact.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-muted/20 text-muted-foreground uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="p-3 font-bold border-b">Theme</th>
                                        <th className="p-3 font-bold border-b">SMART Goal</th>
                                        <th className="p-3 font-bold border-b">Indicators / Drivers</th>
                                        <th className="p-3 font-bold border-b">Component</th>
                                        <th className="p-3 font-bold border-b">Impact</th>
                                        <th className="p-3 font-bold border-b">Timeline</th>
                                        <th className="p-3 font-bold border-b">Success Measure</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {summaryTableData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-muted/5">
                                            <td className="p-3 font-semibold text-primary align-top">{row.theme}</td>
                                            <td className="p-3 align-top max-w-[250px]">{row.goal}</td>
                                            <td className="p-3 text-xs text-muted-foreground align-top max-w-[200px]">{row.indicators}</td>
                                            <td className="p-3 text-xs whitespace-nowrap align-top">
                                                <Badge variant="outline">{row.components}</Badge>
                                            </td>
                                            <td className="p-3 text-xs align-top">{row.modules}</td>
                                            <td className="p-3 text-xs whitespace-nowrap align-top">{row.timeline}</td>
                                            <td className="p-3 text-xs italic text-muted-foreground align-top max-w-[200px]">{row.successMeasure}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Enhanced Gantt Chart Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GanttChartSquare className="w-5 h-5" /> Implementation Roadmap (Gantt)
                        </CardTitle>
                        <CardDescription>Timeline showing sequencing, milestones, and dependencies.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-4">
                            {/* Timeline Header */}
                            <div className="grid grid-cols-10 gap-1 mb-2 border-b pb-2">
                                {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
                                    <div key={m} className="text-center text-xs font-bold text-muted-foreground">{m}</div>
                                ))}
                            </div>
                            
                            {/* Timeline Rows */}
                            <div className="space-y-4 relative min-h-[200px]">
                                {/* Vertical Grid Lines */}
                                <div className="absolute inset-0 grid grid-cols-10 gap-1 pointer-events-none">
                                    {Array.from({length:10}).map((_,i) => (
                                        <div key={i} className="border-r border-muted/20 h-full"></div>
                                    ))}
                                </div>

                                {ganttData.map((item, idx) => (
                                    <div key={idx} className="relative py-1 group">
                                        <div className="flex justify-between text-xs mb-1 px-1 relative z-10 pointer-events-none">
                                            <span className="font-semibold text-primary truncate max-w-[200px]">{item.shortName}</span>
                                            <span className="text-muted-foreground text-[10px] italic">Owner: {item.responsible}</span>
                                        </div>
                                        <div className="h-6 relative">
                                            {/* Bar */}
                                            <div 
                                                className="absolute top-0 bottom-0 rounded bg-primary/90 shadow-sm hover:bg-primary transition-colors cursor-pointer flex items-center px-2 text-[10px] text-white whitespace-nowrap overflow-hidden z-10"
                                                style={{
                                                    left: `${item.start * 10}%`,
                                                    width: `${item.duration * 10}%`
                                                }}
                                                title={`Goal: ${item.name}\nDependencies: ${item.dependencies || 'None'}`}
                                            >
                                                {item.dependencies && <span className="mr-2 opacity-75 text-[9px] border border-white/30 px-1 rounded">Dep: {item.dependencies}</span>}
                                            </div>

                                            {/* Milestone Marker (Visual Approximation) */}
                                            {item.milestones && (
                                                <div 
                                                    className="absolute top-[-4px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-500 z-20"
                                                    style={{ left: `${(item.start + item.duration * 0.8) * 10}%` }}
                                                    title={`Milestone: ${item.milestones}`}
                                                ></div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {ganttData.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No SMART goals with dates defined yet.
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex gap-4 justify-end text-xs text-muted-foreground border-t pt-2">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/90"></div> Active Goal Duration</div>
                                <div className="flex items-center gap-2"><div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-amber-500"></div> Milestone Marker</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* --- TAB: MODULES --- */}
            <TabsContent value="modules" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {modules.map(pm => {
                        const evaluation = evaluations.find(e => e.moduleId === pm.moduleId); // Simplified lookup
                        return (
                            <Link key={pm.id} href={`/dashboard/programme/${programmeId}/module/${pm.moduleId}`}>
                                <Card className="hover:border-primary/50 cursor-pointer h-full">
                                    <CardHeader>
                                        <CardTitle className="text-base">{pm.module?.name}</CardTitle>
                                        <CardDescription>{pm.module?.code}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm text-muted-foreground">Stage {pm.stage}</span>
                                            {evaluation ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Evaluated</Badge>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </TabsContent>
        </Tabs>

    </DashboardLayout>
  );
}
