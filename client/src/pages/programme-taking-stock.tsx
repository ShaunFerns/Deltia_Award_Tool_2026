import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { ProgrammeLayout } from "@/components/programme-layout";
import { useStore, Category, CATEGORIES, QUESTIONS, Level, TakingStockCategoryData, ModuleEvaluation, TakingStockImprovement } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Save, CheckCircle2, AlertCircle, Info, Wand2, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const LEVELS: Level[] = ['Developing', 'Consolidating', 'Leading'];

const COMPONENT_ID_MAP: Record<Category, number> = {
    strategy_capacity: 1,
    evidence_based: 2,
    design_of_learning: 3,
    teaching_practice: 4,
    assessment: 5
};

export default function ProgrammeTakingStockPage() {
  const [, params] = useRoute("/programmes/:id/taking-stock");
  const { user, programmes, saveProgrammeTakingStock, getProgrammeModules, getEvaluation, programmeTakingStocks } = useStore();
  const programmeId = params?.id;
  const programme = programmes.find(p => p.id === programmeId);
  const academicYear = "2024-25"; // Hardcoded for prototype

  const [activeStep, setActiveStep] = useState<number>(0); // 0 = Landing, 1-5 = Categories
  const [data, setData] = useState<Record<Category, TakingStockCategoryData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [activeCategoryForSuggestions, setActiveCategoryForSuggestions] = useState<Category | null>(null);

  // Helper to calculate component specific stats
  const getComponentStats = (category: Category): any => {
      if (!programmeId) return null;
      const progModules = getProgrammeModules(programmeId);
      const moduleData = progModules
          .map(pm => getEvaluation(pm.moduleId, academicYear))
          .filter((e): e is ModuleEvaluation => !!e);
      
      const total = moduleData.length;
      
      if (category === 'strategy_capacity') {
          return {
              total,
              policies: moduleData.filter(e => e.metadata?.policiesInfluencing && e.metadata.policiesInfluencing.length > 10 && !e.metadata.policiesInfluencing.includes("Standard university T&L policy")).length,
              external: moduleData.filter(e => e.metadata?.externalRequirements && e.metadata.externalRequirements.length > 5).length,
              staffDev: moduleData.filter(e => e.metadata?.staffDevelopmentInfluence && e.metadata.staffDevelopmentInfluence.length > 5).length,
              partnership: moduleData.filter(e => e.metadata?.studentPartnership && e.metadata.studentPartnership.length > 5 && !e.metadata.studentPartnership.includes("Standard feedback loop")).length
          };
      }
      if (category === 'evidence_based') {
          return {
              total,
              evidenceSources: moduleData.filter(e => e.metadata?.evidenceSources && e.metadata.evidenceSources.length > 1).length,
              redesigned: moduleData.filter(e => e.metadata?.changesLast3Years && e.metadata.changesLast3Years.toLowerCase().includes("redesign")).length,
              feedbackAction: moduleData.filter(e => e.metadata?.studentFeedbackSummary && e.metadata.studentFeedbackSummary.length > 10).length,
          };
      }
      if (category === 'design_of_learning') {
          return {
              total,
              udl: moduleData.filter(e => e.metadata?.udlIndicators && e.metadata.udlIndicators.length > 0).length,
              curriculumLinks: moduleData.filter(e => e.metadata?.curriculumConnections && e.metadata.curriculumConnections.length > 5).length,
              vle: moduleData.filter(e => e.metadata?.learningEnvironmentUse && e.metadata.learningEnvironmentUse.includes("Active use")).length,
          };
      }
      if (category === 'teaching_practice') {
          return {
              total,
              activeLearning: moduleData.filter(e => e.metadata?.teachingApproaches && (e.metadata.teachingApproaches.includes('pbl') || e.metadata.teachingApproaches.includes('studio'))).length,
              digital: moduleData.filter(e => e.metadata?.digitalPractice && e.metadata.digitalPractice.length > 1).length,
              transition: moduleData.filter(e => e.metadata?.transitionSupport && e.metadata.transitionSupport.length > 5).length,
          };
      }
      if (category === 'assessment') {
          const allAssessments = moduleData.flatMap(e => e.metadata?.assessments || []);
          const totalAssessments = allAssessments.length;
          const summative = allAssessments.filter(a => a.weight > 0);
          const formative = allAssessments.filter(a => a.weight === 0 || a.type === 'formative');
          
          // Timing analysis
          const weeks: Record<number, number> = {};
          summative.forEach(a => {
              weeks[a.dueWeek] = (weeks[a.dueWeek] || 0) + 1;
          });
          
          const clustering = Object.entries(weeks)
              .filter(([_, count]) => count >= 3)
              .map(([week]) => parseInt(week));
              
          const earlyFormative = moduleData.filter(e => 
              e.metadata?.assessments?.some(a => (a.weight === 0 || a.type === 'formative') && a.dueWeek <= 4)
          ).length;
          
          const firstSummativeWeeks = moduleData
              .map(e => e.metadata?.assessments?.filter(a => a.weight > 0).sort((a, b) => a.dueWeek - b.dueWeek)[0]?.dueWeek)
              .filter((w): w is number => w !== undefined);
              
          const avgFirstSummative = firstSummativeWeeks.length > 0 
              ? Math.round(firstSummativeWeeks.reduce((a, b) => a + b, 0) / firstSummativeWeeks.length)
              : 0;

          return {
              total,
              authentic: moduleData.filter(e => e.metadata?.authenticAssessmentRationale && e.metadata.authenticAssessmentRationale.length > 20 && !e.metadata.authenticAssessmentRationale.includes("Traditional")).length,
              varied: moduleData.filter(e => e.metadata?.assessments && e.metadata.assessments.some(a => a.type !== 'exam')).length,
              feedback: moduleData.filter(e => e.metadata?.feedbackPractices && e.metadata.feedbackPractices.includes("Audio")).length,
              peer: moduleData.filter(e => e.metadata?.selfPeerAssessment).length,
              timing: {
                  totalSummative: summative.length,
                  clustering,
                  earlyFormative,
                  avgFirstSummative,
                  distribution: weeks
              }
          };
      }

      return { total };
  };

  const generateImprovementSuggestions = (category: Category): string[] => {
      const stats = getComponentStats(category);
      const improvements: string[] = [];
      
      if (!stats) return [];

      if (category === 'strategy_capacity' && 'policies' in stats) {
          const { total, policies, external, staffDev, partnership } = stats;
          if (partnership === 0) {
              improvements.push("Limited evidence of students engaged as partners in programme-level decision-making.");
          }
          if (total > 0 && external < total / 2) {
              improvements.push("External/professional body requirements could be made more explicit in curriculum design.");
          }
          if (staffDev === 0) {
              improvements.push("Opportunity to more explicitly link staff CPD activities to module enhancements.");
          }
      } else if (category === 'evidence_based' && 'evidenceSources' in stats) {
          const { total, evidenceSources, redesigned } = stats;
          if (evidenceSources < total * 0.3) improvements.push("Broaden the range of evidence sources used beyond standard module surveys.");
          if (redesigned === 0) improvements.push("Consider periodic reviews based on longitudinal data.");
      } else if (category === 'design_of_learning' && 'udl' in stats) {
          const { total, udl, vle } = stats;
          if (udl < total * 0.2) improvements.push("Embed UDL principles more systematically across the programme.");
          if (vle < total * 0.3) improvements.push("Increase active use of digital learning environments for student engagement.");
      } else if (category === 'teaching_practice' && 'activeLearning' in stats) {
          const { total, activeLearning, transition } = stats;
          if (activeLearning < total * 0.2) improvements.push("Scope to increase the use of active and inquiry-based learning approaches.");
          if (transition === 0) improvements.push("Develop more explicit scaffolding for student transitions (entry/progression).");
      } else if (category === 'assessment' && 'timing' in stats) {
          const { total, varied, feedback, timing } = stats;
          if (varied < total * 0.5) improvements.push("Diversify assessment methods to include more authentic/performance-based tasks.");
          if (timing.clustering.length > 0) improvements.push(`Address assessment clustering in weeks: ${timing.clustering.join(', ')}.`);
          if (timing.earlyFormative < total * 0.5) improvements.push("Introduce more early low-stakes formative assessment in the first 4 weeks.");
          if (feedback < total * 0.2) improvements.push("Expand use of varied feedback formats (e.g., audio/video) to improve engagement.");
      }
      
      // Default fallback
      if (improvements.length === 0) {
          improvements.push("Review alignment with key DELTA indicators for this component.");
      }

      return improvements;
  };

  // Helper to synthesize module data
  const synthesizeModuleData = (category: Category): { level: Level, evidence: string[], strengths: string[] } => {
      if (!programmeId) return { level: 'Developing', evidence: [], strengths: [] };

      const progModules = getProgrammeModules(programmeId);
      
      // Get evaluations with module names
      const moduleData = progModules
          .map(pm => ({
              evaluation: getEvaluation(pm.moduleId, academicYear),
              moduleName: pm.module?.name || 'Unknown Module'
          }))
          .filter((item): item is { evaluation: ModuleEvaluation, moduleName: string } => !!item.evaluation);
      
      if (moduleData.length === 0) {
          return {
              level: 'Developing',
              evidence: ["No module evaluations submitted yet for this academic year."],
              strengths: []
          };
      }

      // Identify relevant questions for this component
      const targetComponentId = COMPONENT_ID_MAP[category];
      const relevantQuestions: { text: string, catIndex: number, qIndex: number }[] = [];
      
      CATEGORIES.forEach((cat, catIndex) => {
          QUESTIONS[cat.id].forEach((q, qIndex) => {
              if (q.components.includes(targetComponentId)) {
                  relevantQuestions.push({ text: q.text, catIndex, qIndex });
              }
          });
      });

      // Aggregate scores
      let totalScore = 0;
      let answerCount = 0;
      const questionStats: Record<string, { sum: number, count: number }> = {};

      // --- Rich Evidence Synthesis ---
      const evidencePoints: string[] = [];
      const strengths: string[] = [];

      // Count of modules meeting criteria
      let highQualityCount = 0;
      let specificEvidenceCount = 0; // Generic counter for relevant metadata flags
      const totalModules = moduleData.length;

      moduleData.forEach(({ evaluation, moduleName }) => {
          const meta = evaluation.metadata;

          // Likert Scores Processing
          relevantQuestions.forEach(q => {
              const key = `${q.catIndex}_${q.qIndex}`;
              const val = evaluation.answers[key];
              if (val) {
                  totalScore += val;
                  answerCount++;
                  
                  if (!questionStats[q.text]) {
                      questionStats[q.text] = { sum: 0, count: 0 };
                  }
                  questionStats[q.text].sum += val;
                  questionStats[q.text].count++;
              }
          });

          // Metadata Processing per Category (Same as before)
          if (category === 'strategy_capacity') {
               if (meta?.policiesInfluencing && meta.policiesInfluencing.length > 10) {
                   specificEvidenceCount++;
                   if (evidencePoints.length < 2 && meta.policiesInfluencing !== "Standard university T&L policy.") {
                       evidencePoints.push(`${moduleName}: "${meta.policiesInfluencing}"`);
                   }
               }
               if (meta?.externalRequirements) {
                   evidencePoints.push(`${moduleName}: Driven by ${meta.externalRequirements}`);
               }
          }

          if (category === 'evidence_based') {
              if (meta?.evidenceSources && meta.evidenceSources.length > 1) {
                  specificEvidenceCount++;
              }
              if (meta?.changesLast3Years && meta.changesLast3Years.includes("redesign")) {
                   evidencePoints.push(`${moduleName}: Major redesign based on evidence.`);
              }
          }

          if (category === 'design_of_learning') {
              if (meta?.udlIndicators && meta.udlIndicators.length > 0) {
                  specificEvidenceCount++;
              }
              if (meta?.curriculumConnections) {
                  evidencePoints.push(`${moduleName} connects explicitly to other stages.`);
              }
          }

          if (category === 'teaching_practice') {
              if (meta?.teachingApproaches && (meta.teachingApproaches.includes('pbl') || meta.teachingApproaches.includes('studio'))) {
                  specificEvidenceCount++;
                  evidencePoints.push(`${moduleName} uses active learning (PBL/Studio).`);
              }
          }

          if (category === 'assessment') {
              if (meta?.assessments?.some(a => a.type !== 'exam')) {
                   specificEvidenceCount++;
              }
              if (meta?.authenticAssessmentRationale && meta.authenticAssessmentRationale.length > 20 && !meta.authenticAssessmentRationale.includes("Traditional")) {
                  evidencePoints.push(`${moduleName}: "${meta.authenticAssessmentRationale}"`);
              }
          }
          
          const summary = evaluation.evidenceSummaries?.[category];
          if (summary) {
              strengths.push(`${moduleName}: "${summary}"`);
          }
      });

      const avgScore = answerCount > 0 ? totalScore / answerCount : 0;
      
      const evidenceRatio = totalModules > 0 ? specificEvidenceCount / totalModules : 0;
      
      let recommendedLevel: Level = 'Developing';
      
      if (evidenceRatio > 0.75 || avgScore >= 4.0) {
          recommendedLevel = 'Leading';
      } else if (evidenceRatio > 0.4 || avgScore >= 3.0) {
          recommendedLevel = 'Consolidating';
      }

      const evidence = [
          `Based on ${moduleData.length} evaluated modules.`,
          `Average component score: ${avgScore.toFixed(1)} / 5.0`,
          `${specificEvidenceCount} modules (${Math.round(evidenceRatio * 100)}%) show specific evidence for this component.`
      ];
      
      const uniquePoints = Array.from(new Set(evidencePoints)).slice(0, 4);
      uniquePoints.forEach(p => evidence.push(p));

      return { level: recommendedLevel, evidence, strengths };
  };

  useEffect(() => {
    if (programmeId) {
      const stored = programmeTakingStocks.find(pts => pts.programmeId === programmeId && pts.academicYear === academicYear);
      
      // Calculate fresh synthesis
      const synthesis = {
          strategy_capacity: synthesizeModuleData('strategy_capacity'),
          evidence_based: synthesizeModuleData('evidence_based'),
          design_of_learning: synthesizeModuleData('design_of_learning'),
          teaching_practice: synthesizeModuleData('teaching_practice'),
          assessment: synthesizeModuleData('assessment'),
      };

      if (stored) {
        // Merge stored user inputs with fresh synthesis
        const updatedData: any = { ...stored };
        
        CATEGORIES.forEach(cat => {
            const catData = updatedData[cat.id];
            if (catData) {
                // Update synthesis
                catData.recommendedLevel = synthesis[cat.id].level;
                catData.evidenceSummary = synthesis[cat.id].evidence;

                // Migration: If improvements array is missing but areasForDevelopment has text
                if ((!catData.improvements || catData.improvements.length === 0) && catData.areasForDevelopment) {
                    const lines = catData.areasForDevelopment.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
                    catData.improvements = lines.map((line: string) => ({
                        id: crypto.randomUUID(),
                        componentId: cat.id,
                        text: line.replace(/^[-•*]\s*/, ''),
                        generatedBy: 'user', // Assume user origin for legacy text
                        selectedAsPriority: false,
                        createdAt: new Date().toISOString()
                    }));
                } else if (!catData.improvements) {
                     // Initialize empty if missing
                     catData.improvements = [];
                     // Auto-generate on first load if truly empty?
                     const suggestions = generateImprovementSuggestions(cat.id);
                     catData.improvements = suggestions.map((text: string) => ({
                        id: crypto.randomUUID(),
                        componentId: cat.id,
                        text,
                        generatedBy: 'system',
                        selectedAsPriority: false,
                        createdAt: new Date().toISOString()
                     }));
                }
            }
        });
        
        setData(updatedData as Record<Category, TakingStockCategoryData>);

      } else {
        // Initialize new
        setData({
            strategy_capacity: createCategoryData(synthesis.strategy_capacity.level, synthesis.strategy_capacity.evidence, 'strategy_capacity'),
            evidence_based: createCategoryData(synthesis.evidence_based.level, synthesis.evidence_based.evidence, 'evidence_based'),
            design_of_learning: createCategoryData(synthesis.design_of_learning.level, synthesis.design_of_learning.evidence, 'design_of_learning'),
            teaching_practice: createCategoryData(synthesis.teaching_practice.level, synthesis.teaching_practice.evidence, 'teaching_practice'),
            assessment: createCategoryData(synthesis.assessment.level, synthesis.assessment.evidence, 'assessment'),
        });
      }
      setLoading(false);
    }
  }, [programmeId, programmeTakingStocks]);

  const createCategoryData = (recommendation: Level, evidence: string[], category: Category): TakingStockCategoryData => {
      const suggestions = generateImprovementSuggestions(category);
      return {
        recommendedLevel: recommendation,
        selectedLevel: '', 
        rationaleOverride: '',
        evidenceSummary: evidence,
        whatWeDoWell: '',
        areasForDevelopment: '',
        improvements: suggestions.map(text => ({
            id: crypto.randomUUID(),
            componentId: category,
            text,
            generatedBy: 'system',
            selectedAsPriority: false,
            createdAt: new Date().toISOString()
        })),
        updatedAt: new Date().toISOString()
      };
  };

  const handleSave = () => {
    if (!programmeId || !data) return;

    // Sync improvements text back to areasForDevelopment string for backward compat
    const syncData = { ...data };
    CATEGORIES.forEach(cat => {
        if (syncData[cat.id]?.improvements) {
             syncData[cat.id].areasForDevelopment = syncData[cat.id].improvements
                .map(i => `• ${i.text}`)
                .join('\n');
        }
    });

    saveProgrammeTakingStock({
        id: '', 
        programmeId,
        academicYear,
        ...syncData,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString() 
    });
    
    toast({
        title: "Progress Saved",
        description: "Your taking stock assessment has been saved.",
    });
  };

  const handleNext = () => {
    handleSave();
    if (activeStep < CATEGORIES.length) {
        setActiveStep(activeStep + 1);
        window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
        setActiveStep(activeStep - 1);
        window.scrollTo(0, 0);
    }
  };

  const updateCategoryData = (category: Category, field: keyof TakingStockCategoryData, value: any) => {
      if (!data) return;
      setData({
          ...data,
          [category]: {
              ...data[category],
              [field]: value,
              updatedAt: new Date().toISOString()
          }
      });
  };

  // --- Improvement List Actions ---

  const addImprovement = (category: Category) => {
      if (!data) return;
      const newImprovement: TakingStockImprovement = {
          id: crypto.randomUUID(),
          componentId: category,
          text: "",
          generatedBy: 'user',
          selectedAsPriority: false,
          createdAt: new Date().toISOString()
      };
      
      setData({
          ...data,
          [category]: {
              ...data[category],
              improvements: [...(data[category].improvements || []), newImprovement],
              updatedAt: new Date().toISOString()
          }
      });
  };

  const updateImprovement = (category: Category, id: string, text: string) => {
      if (!data) return;
      const updatedImprovements = data[category].improvements.map(imp => 
          imp.id === id ? { ...imp, text } : imp
      );
      
      setData({
          ...data,
          [category]: {
              ...data[category],
              improvements: updatedImprovements,
              updatedAt: new Date().toISOString()
          }
      });
  };

  const deleteImprovement = (category: Category, id: string) => {
      if (!data) return;
      const updatedImprovements = data[category].improvements.filter(imp => imp.id !== id);
      
      setData({
          ...data,
          [category]: {
              ...data[category],
              improvements: updatedImprovements,
              updatedAt: new Date().toISOString()
          }
      });
  };

  const openRegenerateDialog = (category: Category) => {
      const suggestions = generateImprovementSuggestions(category);
      // Filter out ones that are already in the list (fuzzy match or exact)
      const existingTexts = data?.[category].improvements.map(i => i.text) || [];
      const newSuggestions = suggestions.filter(s => !existingTexts.includes(s));
      
      setCurrentSuggestions(newSuggestions);
      setSelectedSuggestions([]);
      setActiveCategoryForSuggestions(category);
      setSuggestionDialogOpen(true);
  };

  const confirmAddSuggestions = () => {
      if (!activeCategoryForSuggestions || !data) return;
      
      const newItems = selectedSuggestions.map(text => ({
          id: crypto.randomUUID(),
          componentId: activeCategoryForSuggestions,
          text,
          generatedBy: 'system' as const,
          selectedAsPriority: false,
          createdAt: new Date().toISOString()
      }));
      
      setData({
          ...data,
          [activeCategoryForSuggestions]: {
              ...data[activeCategoryForSuggestions],
              improvements: [...(data[activeCategoryForSuggestions].improvements || []), ...newItems],
              updatedAt: new Date().toISOString()
          }
      });
      
      setSuggestionDialogOpen(false);
  };

  const insertStarter = (category: Category, field: 'whatWeDoWell' | 'areasForDevelopment') => {
      // Legacy support for "whatWeDoWell" or if user wants to replace text in other fields
      if (!data) return;
      
      if (field === 'whatWeDoWell') {
           let textToInsert = "";
           const stats = getComponentStats(category);
           // Reuse the logic from before for strengths
           if (stats && 'policies' in stats) { // Strategy
               const { total, policies, partnership, staffDev } = stats;
                const strengths = [];
                if (total > 0 && policies / total >= 0.6) strengths.push("A significant proportion of modules explicitly reference institutional or national policies.");
                if (partnership > 0) strengths.push("Some modules actively involve students as partners.");
                if (staffDev > 0) strengths.push(`Staff development has directly influenced the design of ${staffDev} modules.`);
                textToInsert = strengths.join(" ");
           } 
           // ... (simplified for brevity, assuming we only need this for What We Do Well)
           
           updateCategoryData(category, field, textToInsert);
      }
  };

  if (loading || !data) return <ProgrammeLayout user={user} programmeId={programmeId || ''}><div>Loading...</div></ProgrammeLayout>;

  if (activeStep === 0) {
    return (
      <ProgrammeLayout user={user} programmeId={programmeId || ''}>
        <div className="max-w-3xl mx-auto py-12 space-y-8">
            <div className="text-center space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-serif text-primary">Taking Stock</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Conduct a data-informed self-evaluation of your programme against the five dimensions of the DELTA Framework.
                </p>
            </div>

            <Card className="bg-white border-l-4 border-l-primary shadow-sm">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <Info className="w-6 h-6 text-primary mt-1 shrink-0" />
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg text-primary">Process Guidance</h3>
                            <div className="space-y-2 text-muted-foreground">
                                <p>
                                    This tool aggregates data from all {getProgrammeModules(programmeId || '').length} modules in your programme to provide an evidence-based snapshot for each component.
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Review the <strong>Evidence Snapshot</strong> and the system-generated <strong>Recommended Level</strong>.</li>
                                    <li>Confirm or adjust the level based on your professional judgement.</li>
                                    <li>Articulate key <strong>Strengths</strong> and specific <strong>Areas for Improvement</strong>.</li>
                                </ul>
                                <p className="text-sm italic pt-2">
                                    Your inputs here will directly inform the Priority Selection and Action Planning stages.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
                <Button size="lg" onClick={() => setActiveStep(1)} className="gap-2">
                    Start Assessment <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
      </ProgrammeLayout>
    );
  }

  const category = CATEGORIES[activeStep - 1];
  const catData = data[category.id];
  const isLastStep = activeStep === CATEGORIES.length;

  return (
    <ProgrammeLayout user={user} programmeId={programmeId || ''}>
      <div className="pb-24 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Component {activeStep} of 5</div>
                <h1 className="text-3xl font-bold font-serif text-primary">{category.label}</h1>
            </div>
            <div className="flex gap-2">
                {CATEGORIES.map((c, i) => (
                    <div 
                        key={c.id} 
                        className={`w-3 h-3 rounded-full ${i + 1 === activeStep ? 'bg-primary' : i + 1 < activeStep ? 'bg-primary/40' : 'bg-muted'}`} 
                    />
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Evidence & Level */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader className="bg-muted/20 pb-4">
                        <CardTitle className="text-lg">Evidence Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {catData.evidenceSummary.map((point, i) => (
                            <div key={i} className="flex gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                <span className="text-muted-foreground">{point}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Self-Evaluation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Recommended Level</Label>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-base py-1 px-3 border-primary/50 text-primary font-medium">
                                    {catData.recommendedLevel}
                                </Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 text-[10px]">Data-Driven</Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Selected Level</Label>
                            <Select 
                                value={catData.selectedLevel || catData.recommendedLevel} 
                                onValueChange={(v) => updateCategoryData(category.id, 'selectedLevel', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEVELS.map(l => (
                                        <SelectItem key={l} value={l}>{l}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {(catData.selectedLevel && catData.selectedLevel !== catData.recommendedLevel) && (
                            <div className="space-y-2">
                                <Label>Rationale for Override</Label>
                                <Textarea 
                                    placeholder="Why does this differ from the recommendation?"
                                    value={catData.rationaleOverride}
                                    onChange={(e) => updateCategoryData(category.id, 'rationaleOverride', e.target.value)}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Reflection */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Reflection & Planning</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        
                        {/* Strengths Section (Textarea) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">What are we doing well?</Label>
                                <Button variant="ghost" size="sm" onClick={() => insertStarter(category.id, 'whatWeDoWell')} className="text-xs text-muted-foreground hover:text-primary">
                                    <Wand2 className="w-3 h-3 mr-1" /> Auto-draft
                                </Button>
                            </div>
                            <Textarea 
                                className="min-h-[120px]"
                                placeholder="Highlight key strengths..."
                                value={catData.whatWeDoWell}
                                onChange={(e) => updateCategoryData(category.id, 'whatWeDoWell', e.target.value)}
                            />
                        </div>

                        {/* Areas for Improvement Section (Dynamic List) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Areas for Improvement</Label>
                                <Button variant="ghost" size="sm" onClick={() => openRegenerateDialog(category.id)} className="text-xs text-muted-foreground hover:text-primary">
                                    <RefreshCw className="w-3 h-3 mr-1" /> Regenerate Suggestions
                                </Button>
                            </div>
                            
                            <div className="space-y-3">
                                {catData.improvements?.map((imp) => (
                                    <div key={imp.id} className="flex gap-2 items-start group">
                                        <Input 
                                            value={imp.text}
                                            onChange={(e) => updateImprovement(category.id, imp.id, e.target.value)}
                                            className="flex-1"
                                            placeholder="Describe area for improvement..."
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => deleteImprovement(category.id, imp.id)}
                                            className="text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                
                                <Button variant="outline" size="sm" onClick={() => addImprovement(category.id)} className="w-full border-dashed text-muted-foreground hover:text-primary">
                                    <Plus className="w-4 h-4 mr-2" /> Add Area
                                </Button>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Navigation Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <Button variant="outline" onClick={handleBack} disabled={activeStep === 0}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" /> Save Progress
                    </Button>
                    <Button onClick={handleNext}>
                        {isLastStep ? 'Complete Assessment' : 'Next Component'} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>

        <Dialog open={suggestionDialogOpen} onOpenChange={setSuggestionDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Suggested Improvements</DialogTitle>
                    <DialogDescription>
                        Based on your module data, consider adding these areas for improvement.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                    {currentSuggestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No new suggestions found based on current data.</p>
                    ) : (
                        currentSuggestions.map((s, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                                <Checkbox 
                                    checked={selectedSuggestions.includes(s)}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSelectedSuggestions([...selectedSuggestions, s]);
                                        else setSelectedSuggestions(selectedSuggestions.filter(item => item !== s));
                                    }}
                                    id={`sugg-${i}`}
                                />
                                <Label htmlFor={`sugg-${i}`} className="text-sm font-normal leading-snug cursor-pointer">
                                    {s}
                                </Label>
                            </div>
                        ))
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSuggestionDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmAddSuggestions} disabled={selectedSuggestions.length === 0}>
                        Add Selected
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
    </ProgrammeLayout>
  );
}
