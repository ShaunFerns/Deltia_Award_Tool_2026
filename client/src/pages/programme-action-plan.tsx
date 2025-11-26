import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { ProgrammeLayout } from "@/components/programme-layout";
import { useStore, SmartGoal, PriorityTheme, ProgrammePriority } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar as CalendarIcon, Save, ArrowRight, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ProgrammeActionPlanPage() {
  const [, params] = useRoute("/programmes/:id/action-plan");
  const { user, programmes, programmeThemes, programmeGoals, programmePriorities, saveSmartGoals } = useStore();
  const programmeId = params?.id;
  const programme = programmes.find(p => p.id === programmeId);

  const [goals, setGoals] = useState<SmartGoal[]>([]);
  const [localThemes, setLocalThemes] = useState<PriorityTheme[]>([]);

  useEffect(() => {
    if (programmeId) {
        const themes = programmeThemes.filter(t => t.programmeId === programmeId);
        setLocalThemes(themes);

        const existingGoals = programmeGoals.filter(g => g.programmeId === programmeId);
        if (existingGoals.length > 0) {
            setGoals(existingGoals);
        } else {
            // Initialize one empty goal per theme
            const initials = themes.map(t => createEmptyGoal(t.id, programmeId));
            setGoals(initials);
        }
    }
  }, [programmeId, programmeThemes, programmeGoals]);

  const createEmptyGoal = (themeId: string, progId: string): SmartGoal => ({
      id: crypto.randomUUID(),
      themeId,
      programmeId: progId,
      specific: "",
      measurable: "",
      achievable: "",
      relevant: "",
      timeBound: "",
      partners: "",
      resources: "",
      risks: "",
      sustainability: "",
      startDate: "",
      endDate: "",
      createdAt: new Date().toISOString()
  });

  const addGoal = (themeId: string) => {
      if (!programmeId) return;
      setGoals([...goals, createEmptyGoal(themeId, programmeId)]);
  };

  const removeGoal = (goalId: string) => {
      setGoals(goals.filter(g => g.id !== goalId));
  };

  const updateGoal = (goalId: string, field: keyof SmartGoal, value: string) => {
      setGoals(prev => prev.map(g => 
          g.id === goalId ? { ...g, [field]: value } : g
      ));
  };

  const handleSave = () => {
      saveSmartGoals(goals);
      toast({
          title: "Action Plan Saved",
          description: "Your SMART goals have been updated.",
      });
  };

  const getLinkedPriorities = (theme: PriorityTheme) => {
      return programmePriorities.filter(p => theme.linkedPriorityIds.includes(p.id));
  };

  if (!programme || !programmeId) return <div>Programme not found</div>;

  return (
    <ProgrammeLayout user={user} programmeId={programmeId}>
      <div className="space-y-8 pb-20 max-w-5xl mx-auto">
        
        <div className="space-y-6">
           <div>
               <h1 className="text-3xl font-bold font-serif text-primary mb-3">Action Plan</h1>
               <p className="text-muted-foreground text-lg">
                 Operationalise your strategic themes into specific, measurable, and time-bound goals.
               </p>
           </div>

           <Card className="bg-green-50/50 border-green-100">
               <CardContent className="pt-6 flex gap-4">
                   <CalendarIcon className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                   <div className="space-y-2 text-sm text-green-900/80">
                       <p className="font-medium text-green-900">Planning Requirements</p>
                       <p>
                           For each goal, please complete the SMART criteria and resource planning sections. 
                           Ensure you identify clear start and end dates to populate the Gantt chart view. 
                           Consider sustainability: how will this enhancement be maintained as business-as-usual after the project phase?
                       </p>
                   </div>
               </CardContent>
           </Card>
        </div>

        <div className="space-y-10">
            {localThemes.map((theme, idx) => {
                const themeGoals = goals.filter(g => g.themeId === theme.id);
                const drivers = getLinkedPriorities(theme);
                
                return (
                    <div key={theme.id} className="space-y-4">
                        {/* Theme Header with Line of Sight */}
                        <div className="bg-white p-6 rounded-lg border border-l-4 border-l-primary shadow-sm space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-primary bg-primary/10 hover:bg-primary/20">Theme {idx + 1}</Badge>
                                    <h2 className="text-xl font-semibold text-primary">{theme.title}</h2>
                                </div>
                                <p className="text-muted-foreground italic pl-1 border-l-2 border-muted ml-1">"{theme.rationale}"</p>
                            </div>
                            
                            {/* Drivers / Traceability Block */}
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                                    <Target className="w-3 h-3" /> Connected Priorities (Line of Sight)
                                </div>
                                <ul className="space-y-1">
                                    {drivers.map(p => (
                                        <li key={p.id} className="text-sm text-slate-700 flex items-start gap-2">
                                            <span className="text-primary/60 mt-1">•</span>
                                            {p.text}
                                        </li>
                                    ))}
                                    {drivers.length === 0 && <li className="text-sm text-slate-400 italic">No specific priorities linked.</li>}
                                </ul>
                            </div>
                        </div>

                        <div className="grid gap-6 pl-4 border-l-2 border-dashed border-muted/50 ml-4">
                            {themeGoals.map((goal, gIdx) => (
                                <Card key={goal.id} className="relative">
                                    {/* Connector line visual */}
                                    <div className="absolute -left-[25px] top-8 w-4 h-0.5 bg-muted/50"></div>
                                    
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                    {gIdx + 1}
                                                </div>
                                                SMART Goal
                                            </CardTitle>
                                            {themeGoals.length > 1 && (
                                                <Button variant="ghost" size="sm" onClick={() => removeGoal(goal.id)} className="text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="single" collapsible className="w-full" defaultValue="smart">
                                            <AccordionItem value="smart">
                                                <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-2 rounded">SMART Definition</AccordionTrigger>
                                                <AccordionContent className="pt-4 px-2">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="md:col-span-2 space-y-2">
                                                            <Label>Specific (What exactly will you do?)</Label>
                                                            <Textarea 
                                                                value={goal.specific} 
                                                                onChange={(e) => updateGoal(goal.id, 'specific', e.target.value)}
                                                                placeholder="Define the goal clearly..."
                                                                className="min-h-[80px]"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Measurable (Metrics/KPIs)</Label>
                                                            <Input 
                                                                value={goal.measurable} 
                                                                onChange={(e) => updateGoal(goal.id, 'measurable', e.target.value)}
                                                                placeholder="How will you measure success?"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Achievable (Feasibility)</Label>
                                                            <Input 
                                                                value={goal.achievable} 
                                                                onChange={(e) => updateGoal(goal.id, 'achievable', e.target.value)}
                                                                placeholder="Is this realistic?"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Relevant (Strategic Fit)</Label>
                                                            <Input 
                                                                value={goal.relevant} 
                                                                onChange={(e) => updateGoal(goal.id, 'relevant', e.target.value)}
                                                                placeholder="Why is this important now?"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Time-bound (Deadline)</Label>
                                                            <Input 
                                                                value={goal.timeBound} 
                                                                onChange={(e) => updateGoal(goal.id, 'timeBound', e.target.value)}
                                                                placeholder="When will it be done?"
                                                            />
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="resources">
                                                <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-2 rounded">Resources & Planning</AccordionTrigger>
                                                <AccordionContent className="pt-4 px-2">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label>Partners & Stakeholders</Label>
                                                            <Input value={goal.partners} onChange={(e) => updateGoal(goal.id, 'partners', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Resources Needed</Label>
                                                            <Input value={goal.resources} onChange={(e) => updateGoal(goal.id, 'resources', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Risks & Mitigation</Label>
                                                            <Input value={goal.risks} onChange={(e) => updateGoal(goal.id, 'risks', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Sustainability / BAU Plan</Label>
                                                            <Input value={goal.sustainability} onChange={(e) => updateGoal(goal.id, 'sustainability', e.target.value)} />
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="timeline">
                                                <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-2 rounded">Timeline (Gantt Data)</AccordionTrigger>
                                                <AccordionContent className="pt-4 px-2">
                                                    <div className="flex gap-4 items-center">
                                                        <div className="space-y-2 flex-1">
                                                            <Label>Start Date</Label>
                                                            <div className="relative">
                                                                <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input 
                                                                    type="date" 
                                                                    className="pl-8"
                                                                    value={goal.startDate} 
                                                                    onChange={(e) => updateGoal(goal.id, 'startDate', e.target.value)} 
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 flex-1">
                                                            <Label>End Date</Label>
                                                            <div className="relative">
                                                                <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input 
                                                                    type="date" 
                                                                    className="pl-8"
                                                                    value={goal.endDate} 
                                                                    onChange={(e) => updateGoal(goal.id, 'endDate', e.target.value)} 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            ))}
                            
                            <Button variant="outline" onClick={() => addGoal(theme.id)} className="border-dashed w-full">
                                <Plus className="h-4 w-4 mr-2" /> Add Another Goal to this Theme
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10">
            <div className="max-w-5xl mx-auto flex items-center justify-end">
                <Button onClick={handleSave} size="lg" className="gap-2">
                    <Save className="h-4 w-4" /> Save Action Plan
                </Button>
            </div>
        </div>

      </div>
    </ProgrammeLayout>
  );
}
