import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ProgrammeLayout } from "@/components/programme-layout";
import { useStore, Category, CATEGORIES, ProgrammePriority, TakingStockImprovement } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ListFilter, CheckCircle2, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ProgrammePrioritiesPage() {
  const [, params] = useRoute("/programmes/:id/priorities");
  const [, setLocation] = useLocation();
  const { user, programmes, programmeTakingStocks, programmePriorities, saveProgrammePriorities, saveProgrammeTakingStock } = useStore();
  const programmeId = params?.id;
  const programme = programmes.find(p => p.id === programmeId);
  const academicYear = "2024-25";

  const [priorities, setPriorities] = useState<ProgrammePriority[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (programmeId) {
        // We construct the view by merging Taking Stock improvements with existing priority selections
        const takingStock = programmeTakingStocks.find(pts => pts.programmeId === programmeId && pts.academicYear === academicYear);
        const existingPriorities = programmePriorities.filter(p => p.programmeId === programmeId);
        
        const combinedList: ProgrammePriority[] = [];

        if (takingStock) {
            CATEGORIES.forEach(cat => {
                const categoryData = takingStock[cat.id];
                
                // Source 1: New structured improvements list
                if (categoryData?.improvements && categoryData.improvements.length > 0) {
                    categoryData.improvements.forEach(imp => {
                        // Check if this specific improvement ID was already selected/saved in priorities
                        const existing = existingPriorities.find(p => p.text === imp.text && p.componentId === cat.id); // Match by text if ID differs, or ID? 
                        // Ideally match by ID, but legacy priorities might have different IDs.
                        // Let's use text match for robustness if IDs changed, or ID match.
                        const isSelected = existing ? existing.selected : imp.selectedAsPriority;

                        combinedList.push({
                            id: imp.id, // Keep the ID from Taking Stock for continuity
                            programmeId,
                            componentId: cat.id,
                            text: imp.text,
                            selected: isSelected,
                            generatedBy: imp.generatedBy,
                            createdAt: imp.createdAt
                        });
                    });
                } 
                // Source 2: Fallback to legacy string area if list is empty
                else if (categoryData?.areasForDevelopment) {
                    const lines = categoryData.areasForDevelopment.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    lines.forEach(line => {
                        const cleanText = line.replace(/^[-•*]\s*/, '');
                        if (cleanText.length > 5) {
                             // Check existing
                             const existing = existingPriorities.find(p => p.text === cleanText && p.componentId === cat.id);
                             combinedList.push({
                                id: existing?.id || crypto.randomUUID(),
                                programmeId,
                                componentId: cat.id,
                                text: cleanText,
                                selected: existing ? existing.selected : false,
                                generatedBy: 'user', // Legacy text assumed user
                                createdAt: new Date().toISOString()
                            });
                        }
                    });
                }
            });
        } else if (existingPriorities.length > 0) {
            // Fallback if no taking stock data found but priorities exist (edge case)
            combinedList.push(...existingPriorities);
        }

        setPriorities(combinedList);
        setLoading(false);
    }
  }, [programmeId, programmeTakingStocks, programmePriorities]);

  const togglePriority = (id: string) => {
      setPriorities(prev => prev.map(p => 
          p.id === id ? { ...p, selected: !p.selected } : p
      ));
  };

  const handleSave = () => {
      if (!programmeId) return;

      // 1. Save to ProgrammePriorities (for next pages)
      saveProgrammePriorities(priorities);

      // 2. Sync back to TakingStock (update selectedAsPriority flags)
      const takingStock = programmeTakingStocks.find(pts => pts.programmeId === programmeId && pts.academicYear === academicYear);
      if (takingStock) {
          const updatedTakingStock = { ...takingStock };
          let hasUpdates = false;

          CATEGORIES.forEach(cat => {
              const catData = updatedTakingStock[cat.id];
              if (catData?.improvements) {
                  const newImprovements = catData.improvements.map(imp => {
                      const matchingPriority = priorities.find(p => p.id === imp.id);
                      if (matchingPriority && matchingPriority.selected !== imp.selectedAsPriority) {
                          hasUpdates = true;
                          return { ...imp, selectedAsPriority: matchingPriority.selected };
                      }
                      return imp;
                  });
                  
                  if (hasUpdates) {
                      catData.improvements = newImprovements;
                  }
              }
          });

          if (hasUpdates) {
              saveProgrammeTakingStock(updatedTakingStock);
          }
      }

      toast({
          title: "Priorities Saved",
          description: "Your selections have been recorded.",
      });
      setLocation(`/programmes/${programmeId}/future-focus`);
  };

  if (!programme || !programmeId) return <div>Programme not found</div>;

  const selectedCount = priorities.filter(p => p.selected).length;

  return (
    <ProgrammeLayout user={user} programmeId={programmeId}>
      <div className="space-y-8 pb-20 max-w-4xl mx-auto">
        
        <div className="space-y-6">
           <div>
               <h1 className="text-3xl font-bold font-serif text-primary mb-3">Priority Selection</h1>
               <p className="text-muted-foreground text-lg">
                 Refine your focus by selecting the most critical areas for development to carry forward into your strategic planning.
               </p>
           </div>

           <Card className="bg-blue-50/50 border-blue-100">
               <CardContent className="pt-6 flex gap-4">
                   <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                   <div className="space-y-2 text-sm text-blue-900/80">
                       <p className="font-medium text-blue-900">Selection Guidance</p>
                       <p>
                           The list below aggregates all "Areas for Improvement" identified during the Taking Stock phase. 
                           Please select only those items (typically 3-5) that will be the primary focus of your enhancement work for the coming academic cycle.
                           Unselected items will be retained in the record but will not feature in the Action Plan.
                       </p>
                   </div>
               </CardContent>
           </Card>
        </div>

        <div className="grid gap-6">
            {CATEGORIES.map(cat => {
                const catPriorities = priorities.filter(p => p.componentId === cat.id);
                if (catPriorities.length === 0) return null;

                return (
                    <Card key={cat.id}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-primary flex items-center gap-2">
                                <span className="bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    {CATEGORIES.findIndex(c => c.id === cat.id) + 1}
                                </span>
                                {cat.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {catPriorities.map(p => (
                                <div key={p.id} className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${p.selected ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'}`}>
                                    <Checkbox 
                                        checked={p.selected}
                                        onCheckedChange={() => togglePriority(p.id)}
                                        id={p.id}
                                        className="mt-1"
                                    />
                                    <div className="space-y-1 flex-1">
                                        <label 
                                            htmlFor={p.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {p.text}
                                        </label>
                                        {p.generatedBy === 'system' && (
                                            <Badge variant="outline" className="text-[10px] h-5 ml-2 opacity-60 font-normal">Data-Suggested</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );
            })}

            {priorities.length === 0 && !loading && (
                <Card className="bg-muted/10 border-dashed">
                    <CardContent className="py-10 text-center text-muted-foreground">
                        <ListFilter className="h-10 w-10 mx-auto mb-4 opacity-20" />
                        <p>No specific areas for development were found in your Taking Stock inputs.</p>
                        <p className="text-sm mt-2">Please complete the Taking Stock assessment first.</p>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">{selectedCount}</span> items selected
                </div>
                <Button onClick={handleSave} disabled={selectedCount === 0} size="lg" className="gap-2">
                    Generate Themes <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>

      </div>
    </ProgrammeLayout>
  );
}
