import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ProgrammeLayout } from "@/components/programme-layout";
import { useStore, PriorityTheme, ProgrammePriority } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Wand2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ProgrammeFutureFocusPage() {
  const [, params] = useRoute("/programmes/:id/future-focus");
  const [, setLocation] = useLocation();
  const { user, programmes, programmePriorities, saveProgrammeThemes, programmeThemes } = useStore();
  const programmeId = params?.id;
  const programme = programmes.find((p: any) => p.id === programmeId);

  const [themes, setThemes] = useState<PriorityTheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (programmeId) {
        // 1. Check if themes exist
        const existing = programmeThemes.filter((t: PriorityTheme) => t.programmeId === programmeId);
        
        if (existing.length > 0) {
            setThemes(existing);
        } else {
            // 2. Auto-generate themes from selected priorities
            const selected = programmePriorities.filter((p: ProgrammePriority) => p.programmeId === programmeId && p.selected);
            
            if (selected.length > 0) {
                // Mock logic: Create 1 theme if few items, or splitting logic (simplified for mock)
                const newThemes: PriorityTheme[] = [];
                
                // Simple grouping: 1 Theme per 3 items for demo variety
                const themeCount = Math.ceil(selected.length / 3);
                
                for(let i=0; i<themeCount; i++) {
                    const chunk = selected.slice(i*3, (i+1)*3);
                    newThemes.push({
                        id: crypto.randomUUID(),
                        programmeId,
                        title: i === 0 ? "Enhancing Assessment & Feedback" : "Curriculum Coherence & Student Support",
                        linkedPriorityIds: chunk.map((p: ProgrammePriority) => p.id),
                        rationale: "Based on the identified needs to improve " + chunk.map((p: ProgrammePriority) => p.text.substring(0, 20) + "...").join(", "),
                        createdAt: new Date().toISOString()
                    });
                }
                setThemes(newThemes);
            }
        }
        setLoading(false);
    }
  }, [programmeId, programmePriorities, programmeThemes]);

  const updateTheme = (id: string, field: keyof PriorityTheme, value: any) => {
      setThemes(prev => prev.map(t => 
          t.id === id ? { ...t, [field]: value } : t
      ));
  };

  const handleSave = () => {
      saveProgrammeThemes(themes);
      toast({
          title: "Themes Saved",
          description: "Your strategic themes have been defined.",
      });
      setLocation(`/programmes/${programmeId}/action-plan`);
  };

  const getLinkedText = (ids: string[]) => {
      return programmePriorities.filter((p: ProgrammePriority) => ids.includes(p.id)).map((p: ProgrammePriority) => p.text);
  };

  if (!programme || !programmeId) return <div>Programme not found</div>;

  return (
    <ProgrammeLayout user={user} programmeId={programmeId}>
      <div className="space-y-8 pb-20 max-w-4xl mx-auto">
        
        <div className="space-y-6">
           <div>
               <h1 className="text-3xl font-bold font-serif text-primary mb-3">Future Focus & Strategic Themes</h1>
               <p className="text-muted-foreground text-lg">
                 Synthesize your selected priorities into coherent strategic themes that define your programme's direction of travel.
               </p>
           </div>

           <Card className="bg-amber-50/50 border-amber-100">
               <CardContent className="pt-6 flex gap-4">
                   <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                   <div className="space-y-2 text-sm text-amber-900/80">
                       <p className="font-medium text-amber-900">Strategic Alignment</p>
                       <p>
                           We have automatically grouped your selected priorities into suggested themes below. 
                           Please review and refine each theme title and provide a <strong>Future Focus Statement</strong>—a clear, aspirational rationale explaining 
                           why this theme is critical and what success will look like.
                       </p>
                   </div>
               </CardContent>
           </Card>
        </div>

        <div className="space-y-8">
            {themes.map((theme, idx) => (
                <Card key={theme.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-primary bg-primary/10">Theme {idx + 1}</Badge>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Theme Title</Label>
                                <Input 
                                    value={theme.title} 
                                    onChange={(e) => updateTheme(theme.id, 'title', e.target.value)}
                                    className="font-semibold text-lg h-12"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Linked Areas for Improvement</Label>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {getLinkedText(theme.linkedPriorityIds).map((text, i) => (
                                    <li key={i}>{text}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <Label>Strategic Rationale (Future Focus Statement)</Label>
                            <Textarea 
                                value={theme.rationale} 
                                onChange={(e) => updateTheme(theme.id, 'rationale', e.target.value)}
                                className="min-h-[100px]"
                                placeholder="Explain why this theme is a priority and what you aim to achieve..."
                            />
                            <p className="text-xs text-muted-foreground">Write a clear 3-5 sentence statement summarizing the future direction for this theme.</p>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {themes.length === 0 && !loading && (
                <Card className="bg-muted/10 border-dashed">
                    <CardContent className="py-10 text-center text-muted-foreground">
                        <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-20" />
                        <p>No priorities selected. Please go back and select areas for improvement.</p>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10">
            <div className="max-w-4xl mx-auto flex items-center justify-end">
                <Button onClick={handleSave} disabled={themes.length === 0} size="lg" className="gap-2">
                    Create Action Plan <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>

      </div>
    </ProgrammeLayout>
  );
}
