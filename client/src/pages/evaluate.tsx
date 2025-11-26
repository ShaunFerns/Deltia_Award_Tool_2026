import { useState, useEffect } from 'react';
import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useStore, CATEGORIES, QUESTIONS, calculateScore, getLevel, ModuleEvaluation, Artefact, ArtefactType, ModuleMetadata, ModuleAssessment, getTimingBand } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Check, FileText, Link as LinkIcon, StickyNote, Info, Plus, Trash2, Upload, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Metadata Constants (Internal Values & Labels)
const MODULE_TYPES = [
  { id: 'core', label: 'Core module' },
  { id: 'elective', label: 'Elective module' },
  { id: 'capstone', label: 'Capstone / final-year project module' },
  { id: 'lab', label: 'Laboratory / practical module' },
  { id: 'studio', label: 'Studio / creative practice module' },
  { id: 'work_based', label: 'Work-based / placement module' },
  { id: 'project_based', label: 'Project-based module' },
  { id: 'online_hybrid', label: 'Online / hybrid / blended module' },
  { id: 'large_cohort', label: 'Large-cohort module (>100 learners)' },
];

const TEACHING_TEAM_SIZE = [
  { id: 'sole', label: 'Sole-taught' },
  { id: 'small_team_2_3', label: 'Team of 2–3' },
  { id: 'medium_team_4_6', label: 'Team of 4–6' },
  { id: 'large_team_7_plus', label: 'Team of 7+' },
];

const COHORT_CHARACTERISTICS = [
  { id: 'first_year', label: 'First-year transition cohort' },
  { id: 'mixed_level', label: 'Mixed-level cohort' },
  { id: 'mature', label: 'Mostly mature learners' },
  { id: 'high_diversity', label: 'High diversity (e.g. international / multiple access routes)' },
  { id: 'psrb', label: 'Subject to professional / statutory / regulatory body (PSRB) requirements' },
  { id: 'high_repeat_rate', label: 'Historically high repeat / failure rate' },
];

const ASSESSMENT_TYPE_OPTIONS = [
  { id: 'exam', label: 'Exam' },
  { id: 'mcq', label: 'MCQ / Test' },
  { id: 'essay', label: 'Essay' },
  { id: 'report', label: 'Report' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'practical', label: 'Practical / Lab' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'group_project', label: 'Group project' },
  { id: 'reflective', label: 'Reflective task' },
  { id: 'work_based', label: 'Work-based assessment' },
  { id: 'creative', label: 'Creative / studio output' },
  { id: 'other', label: 'Other' },
];

const UDL_INDICATORS = [
  { id: 'udl_engagement', label: 'Multiple means of engagement (e.g. varied ways to participate)' },
  { id: 'udl_representation', label: 'Multiple means of representation (e.g. content in different formats)' },
  { id: 'udl_expression', label: 'Multiple means of action and expression (e.g. choice of how to demonstrate learning)' },
  { id: 'flexible_participation', label: 'Flexible participation or pacing options' },
  { id: 'alternative_assessments', label: 'Alternative assessments or routes to demonstrate learning' },
  { id: 'accessibility_checks', label: 'Accessibility checks on materials (e.g. captions, contrast)' },
];

const DIGITAL_PRACTICE = [
  { id: 'vle_template', label: 'VLE / LMS site structured according to template/good practice' },
  { id: 'video_resources', label: 'Recorded video or audio resources used for learning' },
  { id: 'live_online_teaching', label: 'Live online teaching sessions (webinars, virtual classes)' },
  { id: 'digital_collaboration', label: 'Digital collaboration tools (e.g. Teams, shared documents)' },
  { id: 'ai_literacy', label: 'Explicit development of learners’ AI / digital literacy' },
  { id: 'learning_analytics', label: 'Use of learning analytics or data to adjust teaching' },
];

const STUDENT_FEEDBACK_VOLUME = [
  { id: 'minimal_0_10', label: '0–10 responses' },
  { id: 'moderate_11_30', label: '11–30 responses' },
  { id: 'high_31_70', label: '31–70 responses' },
  { id: 'very_high_70_plus', label: 'More than 70 responses' },
];

const MODULE_RISK_LEVEL = [
  { id: 'no_concern', label: 'No particular concerns' },
  { id: 'some_concern', label: 'Some concerns' },
  { id: 'significant_concern', label: 'Significant concerns' },
];

const MODULE_RISK_REASONS = [
  { id: 'workload', label: 'Workload / volume of assessment' },
  { id: 'high_failure', label: 'High failure or withdrawal rates' },
  { id: 'assessment_design', label: 'Assessment design or fairness' },
  { id: 'delivery_format', label: 'Delivery format or scheduling' },
  { id: 'psrb_pressure', label: 'PSRB / regulatory pressures' },
  { id: 'resources_space', label: 'Resources or space' },
  { id: 'other_structural', label: 'Other structural/organisational constraints' },
];

const TEACHING_HOURS = [
    { id: '1_2', label: '1–2 hours' },
    { id: '3_4', label: '3–4 hours' },
    { id: '5_6', label: '5–6 hours' },
    { id: '7_plus', label: '7 or more hours' },
];

const MARKING_HOURS = [
    { id: '<10', label: 'Less than 10 hours' },
    { id: '10_20', label: '10–20 hours' },
    { id: '20_40', label: '20–40 hours' },
    { id: '40_plus', label: 'More than 40 hours' },
];

const ACADEMIC_YEARS = [
    "2024–25",
    "2025–26",
    "2026–27",
    "2027–28"
];


export default function EvaluatePage() {
  const [, params] = useRoute("/evaluate/:id");
  const [, setLocation] = useLocation();
  const { user, modules, getEvaluation, saveEvaluation } = useStore();
  const moduleId = params?.id;
  
  const module = modules.find((m: any) => m.id === moduleId);
  
  // State for Academic Year
  const [academicYear, setAcademicYear] = useState("2024–25");

  // Fetch evaluation based on Module ID AND Academic Year
  // We use a side effect to update the form when academicYear changes or initial load
  const existingEvaluation = moduleId ? getEvaluation(moduleId, academicYear) : undefined;

  // State
  // -1 indicates Metadata Section, 0-4 are DELTA categories
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  
  // Evaluation State
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [evidenceSummaries, setEvidenceSummaries] = useState<Record<string, string>>({});
  const [artefacts, setArtefacts] = useState<Record<string, Artefact>>({});
  const [moduleHeadline, setModuleHeadline] = useState("");
  
  // Metadata State
  const [metadata, setMetadata] = useState<ModuleMetadata>({
    moduleTypes: [],
    teachingTeamSize: '',
    cohortCharacteristics: [],
    assessments: [],
    udlIndicators: [],
    digitalPractice: [],
    studentFeedbackOverall: 0,
    studentFeedbackVolume: '',
    moduleRiskLevel: '',
    moduleRiskReasons: [],
    teachingHoursBand: '',
    markingHoursBand: ''
  });

  // Initialize with existing answers if available
  useEffect(() => {
    if (existingEvaluation) {
      setAnswers(existingEvaluation.answers);
      setEvidenceSummaries(existingEvaluation.evidenceSummaries as any || {});
      setArtefacts(existingEvaluation.artefacts as any || {});
      setModuleHeadline(existingEvaluation.moduleHeadline || "");
      if (existingEvaluation.metadata) {
          // Check for migration from old metadata (if assessments array is missing)
          const loadedMetadata = existingEvaluation.metadata;
          if (!loadedMetadata.assessments) {
             loadedMetadata.assessments = [];
          }
          setMetadata(loadedMetadata);
      }
    } else {
      // Reset form if no evaluation exists for this year (clean slate)
      // Optional: You could choose to carry over metadata from previous years here if desired
      setAnswers({});
      setEvidenceSummaries({});
      setArtefacts({});
      setModuleHeadline("");
      setMetadata({
        moduleTypes: [],
        teachingTeamSize: '',
        cohortCharacteristics: [],
        assessments: [],
        udlIndicators: [],
        digitalPractice: [],
        studentFeedbackOverall: 0,
        studentFeedbackVolume: '',
        moduleRiskLevel: '',
        moduleRiskReasons: [],
        teachingHoursBand: '',
        markingHoursBand: ''
      });
    }
  }, [existingEvaluation, academicYear]); // Re-run when year changes

  if (!module) {
    return <div>Module not found</div>;
  }

  // Step Helpers
  const isMetadataStep = currentStepIndex === -1;
  const currentCategoryIndex = isMetadataStep ? 0 : currentStepIndex;
  const currentCategory = CATEGORIES[currentCategoryIndex];
  const currentQuestions = isMetadataStep ? [] : QUESTIONS[currentCategory.id];
  const isLastStep = currentStepIndex === CATEGORIES.length - 1;
  
  const totalSteps = CATEGORIES.length + 1; // +1 for Metadata
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  // --- Handlers for DELTA Evaluation ---
  const getAnswerKey = (catIndex: number, qIndex: number) => `${catIndex}_${qIndex}`;
  
  const handleAnswer = (qIndex: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [getAnswerKey(currentCategoryIndex, qIndex)]: value
    }));
  };

  const handleEvidenceSummary = (text: string) => {
    setEvidenceSummaries(prev => ({
      ...prev,
      [currentCategory.id]: text
    }));
  };

  const handleArtefactType = (type: ArtefactType) => {
    setArtefacts(prev => ({
      ...prev,
      [currentCategory.id]: { type, content: prev[currentCategory.id]?.content || '' }
    }));
  };

  const handleArtefactContent = (content: string) => {
    setArtefacts(prev => ({
      ...prev,
      [currentCategory.id]: { type: prev[currentCategory.id]?.type || 'file', content }
    }));
  };

  // --- Handlers for Metadata ---
  const handleMetadataChange = (key: keyof ModuleMetadata, value: any) => {
      setMetadata(prev => ({ ...prev, [key]: value }));
  };

  const toggleMetadataList = (key: keyof ModuleMetadata, item: string) => {
      setMetadata(prev => {
          const list = (prev[key] as string[]) || [];
          if (list.includes(item)) {
              return { ...prev, [key]: list.filter(i => i !== item) };
          }
          return { ...prev, [key]: [...list, item] };
      });
  };

  // --- Assessment Table Handlers ---
  const addAssessment = () => {
      const newAssessment: ModuleAssessment = {
          id: crypto.randomUUID(),
          name: '',
          type: 'exam',
          weight: 0,
          dueWeek: 15, // Defaults to end of semester
          shared: 'no',
          timingBand: 'late'
      };
      setMetadata(prev => ({
          ...prev,
          assessments: [...prev.assessments, newAssessment]
      }));
  };

  const removeAssessment = (id: string) => {
      setMetadata(prev => ({
          ...prev,
          assessments: prev.assessments.filter(a => a.id !== id)
      }));
  };

  const updateAssessment = (id: string, field: keyof ModuleAssessment, value: any) => {
      setMetadata(prev => ({
          ...prev,
          assessments: prev.assessments.map(a => {
              if (a.id !== id) return a;
              const updated = { ...a, [field]: value };
              // Auto-derive timing band
              if (field === 'dueWeek') {
                  updated.timingBand = getTimingBand(value as number);
              }
              return updated;
          })
      }));
  };

  // --- Navigation ---

  const isStepComplete = () => {
    if (isMetadataStep) {
        // Allow proceeding even if not all metadata is filled (for prototype usability)
        return true;
    }
    // Only require the Likert questions for "complete" status to move forward
    return currentQuestions.every((_, idx) => answers[getAnswerKey(currentCategoryIndex, idx)] !== undefined);
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > -1) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    // 1. Filter Invalid Assessment Rows (Safety)
    const validAssessments = metadata.assessments.filter(a => a.name.trim() !== '' && a.type.trim() !== '');
    
    // 2. Weight Validation
    const totalWeight = validAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);
    let weightWarning = null;
    
    if (validAssessments.length > 0) {
        if (totalWeight < 95 || totalWeight > 105) {
             weightWarning = "The total assessment weighting does not sum to approximately 100%. Please review the weights.";
        }
    } else {
        // Optional: Warn if no assessments at all
        // weightWarning = "No summative assessments have been listed for this module."; 
    }

    // 3. Due Week Validation
    const missingDueWeek = validAssessments.some(a => !a.dueWeek || a.dueWeek < 1 || a.dueWeek > 15);
    
    // Clean up metadata before saving
    const cleanedMetadata = {
        ...metadata,
        assessments: validAssessments.map(a => ({
            ...a,
            // Ensure valid due week or null
            dueWeek: (a.dueWeek && a.dueWeek >= 1 && a.dueWeek <= 15) ? a.dueWeek : 1, // Defaulting to 1 if invalid/missing for safety in this prototype, or could use null if type allowed
            timingBand: (a.dueWeek && a.dueWeek >= 1 && a.dueWeek <= 15) ? getTimingBand(a.dueWeek) : 'early' // Default fallback
        }))
    };


    // Calculate scores
    const categoryScores: any = {};
    const categoryLevels: any = {};

    CATEGORIES.forEach((cat, idx) => {
      const catAnswers = QUESTIONS[cat.id].map((_, qIdx) => answers[getAnswerKey(idx, qIdx)] || 0);
      const score = calculateScore(catAnswers);
      categoryScores[cat.id] = score;
      categoryLevels[cat.id] = getLevel(score);
    });

    const evaluation: ModuleEvaluation = {
      // Preserve ID if editing an existing one
      id: existingEvaluation?.id,
      userId: user!.id,
      moduleId: module.id,
      academicYear: academicYear, // Use selected academic year
      answers,
      categoryScores,
      categoryLevels,
      evidenceSummaries,
      artefacts,
      moduleHeadline,
      metadata: cleanedMetadata,
      completedAt: new Date().toISOString()
    };

    saveEvaluation(evaluation);
    
    // Show appropriate toasts
    if (weightWarning) {
         toast({
            title: "Evaluation Saved (with Warnings)",
            description: weightWarning,
            variant: "destructive"
        });
    } else if (missingDueWeek) {
         toast({
            title: "Evaluation Saved",
            description: "Some assessments do not have a valid due week. This may affect programme mapping.",
            variant: "default" // or a warning variant if available
        });
    } else {
        toast({
            title: "Evaluation Saved",
            description: `Your module evaluation for ${academicYear} has been successfully recorded.`,
        });
    }
    
    setLocation(`/dashboard/${module.id}`);
  };


  return (
    <Layout user={user!}>
      <div className="mx-auto max-w-4xl space-y-8 pb-20">
        
        {/* Header Context */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <span>{module.code}</span>
             <span>•</span>
             <span>{module.programme}</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">{module.name}</h1>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span>
                {isMetadataStep ? "Module Context" : `Step ${currentCategoryIndex + 1} of ${CATEGORIES.length}`}
            </span>
            <span>{Math.round(progress)}% Completed</span>
          </div>
          <Progress value={progress + (isStepComplete() ? (100/totalSteps) : 0)} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="border-t-4 border-t-primary shadow-lg">
          
          {isMetadataStep ? (
            // --- METADATA FORM ---
            <>
                <CardHeader className="pb-6 border-b border-border/40 bg-muted/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                                <Info className="h-4 w-4"/>
                            </div>
                            <CardTitle className="text-xl md:text-2xl font-serif">Module Metadata & Context</CardTitle>
                        </div>
                        
                        {/* ACADEMIC YEAR SELECTOR */}
                        <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Academic Year:</Label>
                            <Select value={academicYear} onValueChange={setAcademicYear}>
                                <SelectTrigger className="w-[140px] bg-background border-primary/30">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACADEMIC_YEARS.map(year => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <CardDescription className="text-base ml-11">
                        Please provide some context about this module. This information helps in understanding the evaluation scores.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                    
                    {/* 4.1 Module Type */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">How would you describe the type of this module?</Label>
                        <div className="grid sm:grid-cols-2 gap-2">
                            {MODULE_TYPES.map((type) => (
                                <div key={type.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`type-${type.id}`} 
                                        checked={metadata.moduleTypes.includes(type.id)}
                                        onCheckedChange={() => toggleMetadataList('moduleTypes', type.id)}
                                    />
                                    <Label htmlFor={`type-${type.id}`} className="font-normal cursor-pointer">{type.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4.2 Teaching Team Size */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">How is this module taught in terms of teaching team size?</Label>
                        <RadioGroup value={metadata.teachingTeamSize} onValueChange={(val) => handleMetadataChange('teachingTeamSize', val)}>
                            {TEACHING_TEAM_SIZE.map((opt) => (
                                <div key={opt.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={opt.id} id={`team-${opt.id}`} />
                                    <Label htmlFor={`team-${opt.id}`} className="font-normal cursor-pointer">{opt.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                     {/* 4.3 Cohort Characteristics */}
                     <div className="space-y-3">
                        <Label className="text-base font-semibold">Which of the following best describe the main cohort(s)?</Label>
                        <div className="grid gap-2">
                            {COHORT_CHARACTERISTICS.map((c) => (
                                <div key={c.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`cohort-${c.id}`}
                                        checked={metadata.cohortCharacteristics.includes(c.id)}
                                        onCheckedChange={() => toggleMetadataList('cohortCharacteristics', c.id)}
                                    />
                                    <Label htmlFor={`cohort-${c.id}`} className="font-normal cursor-pointer">{c.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-border/60" />

                    {/* NEW: 4.4 - 4.6 REPLACED BY MODULE ASSESSMENTS TABLE */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-base font-semibold">Summative assessments in this module</Label>
                            <p className="text-sm text-muted-foreground">
                                List each summative assessment for this module (typically 2–3 items). Include the weight and approximate due week in the semester. This will be used later to map assessment load across the programme.
                            </p>
                            <p className="text-xs text-muted-foreground italic mt-1">
                                Example: “Project 1: Case Study Report”, Type: Report, Weight: 40%, Due week: 7
                            </p>
                        </div>

                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[250px]">Assessment Name</TableHead>
                                        <TableHead className="w-[150px]">Type</TableHead>
                                        <TableHead className="w-[80px]">Weight</TableHead>
                                        <TableHead className="w-[100px]">Due Week</TableHead>
                                        <TableHead className="w-[180px]">Shared?</TableHead>
                                        <TableHead className="w-[40px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {metadata.assessments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                No assessments added yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        metadata.assessments.map((assessment) => (
                                            <TableRow key={assessment.id} className="items-start align-top">
                                                <TableCell>
                                                    <Input 
                                                        placeholder="e.g. Project 1: Portfolio" 
                                                        value={assessment.name}
                                                        onChange={(e) => updateAssessment(assessment.id, 'name', e.target.value)}
                                                        className="h-9"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select 
                                                        value={assessment.type}
                                                        onValueChange={(val) => updateAssessment(assessment.id, 'type', val)}
                                                    >
                                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {ASSESSMENT_TYPE_OPTIONS.map(opt => (
                                                                <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="relative">
                                                        <Input 
                                                            type="number"
                                                            value={assessment.weight || ''}
                                                            onChange={(e) => updateAssessment(assessment.id, 'weight', parseInt(e.target.value))}
                                                            className="h-9 pr-6"
                                                        />
                                                        <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Select 
                                                        value={assessment.dueWeek.toString()}
                                                        onValueChange={(val) => updateAssessment(assessment.id, 'dueWeek', parseInt(val))}
                                                    >
                                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({length: 15}, (_, i) => i + 1).map(week => (
                                                                <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                     <div className="space-y-2">
                                                         <RadioGroup 
                                                            value={assessment.shared}
                                                            onValueChange={(val) => updateAssessment(assessment.id, 'shared', val)}
                                                            className="flex gap-2"
                                                         >
                                                             <div className="flex items-center space-x-1">
                                                                 <RadioGroupItem value="no" id={`sh-no-${assessment.id}`} />
                                                                 <Label htmlFor={`sh-no-${assessment.id}`} className="text-xs font-normal">No</Label>
                                                             </div>
                                                             <div className="flex items-center space-x-1">
                                                                 <RadioGroupItem value="yes" id={`sh-yes-${assessment.id}`} />
                                                                 <Label htmlFor={`sh-yes-${assessment.id}`} className="text-xs font-normal">Yes</Label>
                                                             </div>
                                                         </RadioGroup>
                                                         {assessment.shared === 'yes' && (
                                                             <Input 
                                                                placeholder="Module code(s)..." 
                                                                className="h-8 text-xs"
                                                                value={assessment.sharedWith || ''}
                                                                onChange={(e) => updateAssessment(assessment.id, 'sharedWith', e.target.value)}
                                                             />
                                                         )}
                                                     </div>
                                                     
                                                     <div className="mt-2 pt-2 border-t border-border/50">
                                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Evidence (Optional)</Label>
                                                        <div className="flex gap-1 mb-1">
                                                            <div className="relative">
                                                                <input
                                                                    type="file"
                                                                    id={`file-upload-${assessment.id}`}
                                                                    className="hidden"
                                                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            if (file.size > 5 * 1024 * 1024) {
                                                                                toast({
                                                                                    title: "File too large",
                                                                                    description: "File must be smaller than 5 MB.",
                                                                                    variant: "destructive"
                                                                                });
                                                                                e.target.value = ''; // clear input
                                                                                return;
                                                                            }
                                                                            // In a real app, upload here. For mock:
                                                                            updateAssessment(assessment.id, 'evidenceType', 'file');
                                                                            // We can't really store the file object in local storage easily, 
                                                                            // so we mock it by storing the name
                                                                            updateAssessment(assessment.id, 'evidenceContent', file.name); 
                                                                        }
                                                                    }}
                                                                />
                                                                <Button 
                                                                    variant={assessment.evidenceType === 'file' ? 'secondary' : 'ghost'} 
                                                                    size="icon" 
                                                                    className="h-6 w-6"
                                                                    title="Upload File"
                                                                    onClick={() => document.getElementById('file-upload-' + assessment.id)?.click()}
                                                                >
                                                                    <Upload className="h-3 w-3" />
                                                                </Button>
                                                            </div>

                                                            <Button 
                                                                variant={assessment.evidenceType === 'link' ? 'secondary' : 'ghost'} 
                                                                size="icon" 
                                                                className="h-6 w-6"
                                                                title="Link"
                                                                onClick={() => updateAssessment(assessment.id, 'evidenceType', 'link')}
                                                            >
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Button>
                                                            <Button 
                                                                variant={assessment.evidenceType === 'note' ? 'secondary' : 'ghost'} 
                                                                size="icon" 
                                                                className="h-6 w-6"
                                                                title="Note"
                                                                onClick={() => updateAssessment(assessment.id, 'evidenceType', 'note')}
                                                            >
                                                                <StickyNote className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        
                                                        {assessment.evidenceType === 'file' && (
                                                            <div className="text-xs border border-dashed px-2 py-1 rounded bg-muted/30 text-muted-foreground flex items-center justify-between">
                                                                <span className="truncate max-w-[120px]">{assessment.evidenceContent || 'No file selected'}</span>
                                                                {assessment.evidenceContent && <Check className="h-3 w-3 text-green-500 ml-1"/>}
                                                            </div>
                                                        )}
                                                        {assessment.evidenceType === 'link' && (
                                                            <Input 
                                                                placeholder="https://..." 
                                                                className="h-7 text-xs"
                                                                value={assessment.evidenceContent || ''}
                                                                onChange={(e) => updateAssessment(assessment.id, 'evidenceContent', e.target.value)}
                                                            />
                                                        )}
                                                        {assessment.evidenceType === 'note' && (
                                                            <Textarea 
                                                                placeholder="Note..." 
                                                                className="h-12 text-xs resize-none"
                                                                value={assessment.evidenceContent || ''}
                                                                onChange={(e) => updateAssessment(assessment.id, 'evidenceContent', e.target.value)}
                                                            />
                                                        )}
                                                     </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removeAssessment(assessment.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            <div className="bg-muted/20 p-2 border-t flex justify-center">
                                <Button variant="outline" size="sm" onClick={addAssessment} className="text-primary gap-2">
                                    <Plus className="h-4 w-4" /> Add another assessment
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/60" />

                    {/* 4.7 UDL & 4.8 Digital Practice */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Inclusive / UDL Practices Used</Label>
                            <div className="grid gap-2">
                                {UDL_INDICATORS.map((u) => (
                                    <div key={u.id} className="flex items-start space-x-2">
                                        <Checkbox 
                                            id={`udl-${u.id}`}
                                            className="mt-0.5"
                                            checked={metadata.udlIndicators.includes(u.id)}
                                            onCheckedChange={() => toggleMetadataList('udlIndicators', u.id)}
                                        />
                                        <Label htmlFor={`udl-${u.id}`} className="font-normal cursor-pointer text-sm leading-tight">{u.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Digital Practices Used</Label>
                            <div className="grid gap-2">
                                {DIGITAL_PRACTICE.map((d) => (
                                    <div key={d.id} className="flex items-start space-x-2">
                                        <Checkbox 
                                            id={`dig-${d.id}`}
                                            className="mt-0.5"
                                            checked={metadata.digitalPractice.includes(d.id)}
                                            onCheckedChange={() => toggleMetadataList('digitalPractice', d.id)}
                                        />
                                        <Label htmlFor={`dig-${d.id}`} className="font-normal cursor-pointer text-sm leading-tight">{d.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                     <div className="border-t border-border/60" />

                     {/* 4.9 Student Feedback */}
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Overall Feedback Tone (Recent)</Label>
                            <Select 
                                value={metadata.studentFeedbackOverall.toString()} 
                                onValueChange={(val) => handleMetadataChange('studentFeedbackOverall', parseInt(val))}
                            >
                                <SelectTrigger><SelectValue placeholder="Select tone..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 - Very negative</SelectItem>
                                    <SelectItem value="2">2 - Mixed / somewhat negative</SelectItem>
                                    <SelectItem value="3">3 - Mostly positive with some concerns</SelectItem>
                                    <SelectItem value="4">4 - Very positive</SelectItem>
                                    <SelectItem value="5">5 - Exceptionally positive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Response Volume</Label>
                             <Select 
                                value={metadata.studentFeedbackVolume} 
                                onValueChange={(val) => handleMetadataChange('studentFeedbackVolume', val)}
                            >
                                <SelectTrigger><SelectValue placeholder="Select volume..." /></SelectTrigger>
                                <SelectContent>
                                    {STUDENT_FEEDBACK_VOLUME.map(v => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                     </div>

                     {/* 4.10 Module Risk */}
                     <div className="space-y-4 bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                        <Label className="text-base font-semibold">Does this module currently require particular attention?</Label>
                        <RadioGroup value={metadata.moduleRiskLevel} onValueChange={(val) => handleMetadataChange('moduleRiskLevel', val)} className="flex flex-col gap-2">
                            {MODULE_RISK_LEVEL.map((r) => (
                                <div key={r.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={r.id} id={`risk-${r.id}`} />
                                    <Label htmlFor={`risk-${r.id}`} className="font-normal cursor-pointer">{r.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>

                        {(metadata.moduleRiskLevel === 'some_concern' || metadata.moduleRiskLevel === 'significant_concern') && (
                            <div className="pt-2 pl-6 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-sm font-semibold mb-2 block">Main areas of concern:</Label>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    {MODULE_RISK_REASONS.map((r) => (
                                        <div key={r.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`reason-${r.id}`}
                                                checked={metadata.moduleRiskReasons.includes(r.id)}
                                                onCheckedChange={() => toggleMetadataList('moduleRiskReasons', r.id)}
                                            />
                                            <Label htmlFor={`reason-${r.id}`} className="font-normal cursor-pointer text-sm">{r.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                     </div>

                     {/* 4.11 Workload (Optional) */}
                     <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div>
                             <Label className="font-medium mb-2 block">Avg. Direct Teaching Hours / Week</Label>
                             <Select 
                                value={metadata.teachingHoursBand || ''} 
                                onValueChange={(val) => handleMetadataChange('teachingHoursBand', val)}
                            >
                                <SelectTrigger><SelectValue placeholder="Select hours..." /></SelectTrigger>
                                <SelectContent>
                                    {TEACHING_HOURS.map(h => <SelectItem key={h.id} value={h.id}>{h.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                             <Label className="font-medium mb-2 block">Marking/Grading Hours per Delivery</Label>
                             <Select 
                                value={metadata.markingHoursBand || ''} 
                                onValueChange={(val) => handleMetadataChange('markingHoursBand', val)}
                            >
                                <SelectTrigger><SelectValue placeholder="Select hours..." /></SelectTrigger>
                                <SelectContent>
                                    {MARKING_HOURS.map(h => <SelectItem key={h.id} value={h.id}>{h.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                     </div>

                </CardContent>
            </>
          ) : (
            // --- DELTA EVALUATION FORM ---
            <>
                <CardHeader className="pb-6 border-b border-border/40 bg-muted/10">
                    <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {currentCategoryIndex + 1}
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-serif">{currentCategory.label}</CardTitle>
                    </div>
                    <CardDescription className="text-base ml-11">
                    {currentCategory.description}
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-8 space-y-10">
                    {/* Likert Questions */}
                    {currentQuestions.map((question, qIndex) => (
                    <div key={qIndex} className="space-y-4">
                        <Label className="text-base font-medium leading-relaxed block">
                        {qIndex + 1}. {question.text}
                        </Label>
                        
                        <RadioGroup 
                        value={answers[getAnswerKey(currentCategoryIndex, qIndex)]?.toString()}
                        onValueChange={(val) => handleAnswer(qIndex, parseInt(val))}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4"
                        >
                        {[1, 2, 3, 4, 5].map((val) => (
                            <Label
                            key={val}
                            htmlFor={`q${qIndex}-${val}`}
                            className={`
                                relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all hover:bg-muted/50
                                ${answers[getAnswerKey(currentCategoryIndex, qIndex)] === val 
                                ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary ring-offset-2' 
                                : 'border-muted bg-background hover:border-primary/50'}
                            `}
                            >
                            <RadioGroupItem value={val.toString()} id={`q${qIndex}-${val}`} className="sr-only" />
                            <span className="text-xl font-bold">{val}</span>
                            <span className="text-[10px] uppercase tracking-wider font-medium text-center text-muted-foreground line-clamp-2 h-8 flex items-center">
                                {val === 1 && "Not at all"}
                                {val === 2 && "Slightly"}
                                {val === 3 && "Somewhat"}
                                {val === 4 && "Great Extent"}
                                {val === 5 && "Very Great Extent"}
                            </span>
                            </Label>
                        ))}
                        </RadioGroup>
                    </div>
                    ))}

                    <div className="border-t border-border/60" />

                    {/* Evidence / Artefacts */}
                    <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Evidence Summary
                        </Label>
                        <p className="text-sm text-muted-foreground">
                        Briefly describe the evidence you would use to support your self-evaluation for this dimension.
                        </p>
                        <Textarea 
                        placeholder="e.g. Module handbook, VLE statistics, student feedback, exam board minutes..."
                        value={evidenceSummaries[currentCategory.id] || ''}
                        onChange={(e) => handleEvidenceSummary(e.target.value)}
                        className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-lg font-semibold flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-primary" />
                        Key Artefact (Optional)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                        Attach or link one key artefact that best demonstrates your practice in this area.
                        </p>
                        
                        <div className="flex gap-4 pt-2">
                        <Button 
                            variant={artefacts[currentCategory.id]?.type === 'file' ? 'default' : 'outline'}
                            onClick={() => handleArtefactType('file')}
                            className="gap-2"
                        >
                            <Upload className="h-4 w-4" /> Upload File
                        </Button>
                        <Button 
                            variant={artefacts[currentCategory.id]?.type === 'link' ? 'default' : 'outline'}
                            onClick={() => handleArtefactType('link')}
                            className="gap-2"
                        >
                            <ExternalLink className="h-4 w-4" /> Link
                        </Button>
                        <Button 
                            variant={artefacts[currentCategory.id]?.type === 'note' ? 'default' : 'outline'}
                            onClick={() => handleArtefactType('note')}
                            className="gap-2"
                        >
                            <StickyNote className="h-4 w-4" /> Note
                        </Button>
                        </div>

                        <div className="pt-2">
                        {artefacts[currentCategory.id]?.type === 'file' && (
                            <div className="flex items-center gap-4 p-4 border border-dashed rounded-lg bg-muted/30">
                                <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Mock File Upload</p>
                                    <p className="text-xs text-muted-foreground">File upload simulation enabled</p>
                                </div>
                                <Button variant="secondary" size="sm" onClick={() => handleArtefactContent("mock_file.pdf")}>
                                    Select File
                                </Button>
                            </div>
                        )}
                        {artefacts[currentCategory.id]?.type === 'link' && (
                            <Input 
                                placeholder="https://..." 
                                value={artefacts[currentCategory.id]?.content || ''}
                                onChange={(e) => handleArtefactContent(e.target.value)}
                            />
                        )}
                        {artefacts[currentCategory.id]?.type === 'note' && (
                            <Input 
                                placeholder="E.g. See folder X on the shared drive..." 
                                value={artefacts[currentCategory.id]?.content || ''}
                                onChange={(e) => handleArtefactContent(e.target.value)}
                            />
                        )}
                        </div>
                    </div>
                    </div>

                    {/* Module Headline - ONLY ON LAST STEP */}
                    {isLastStep && (
                    <>
                        <div className="border-t border-border/60 my-8" />
                        <div className="space-y-6 bg-primary/5 p-6 rounded-lg border border-primary/10">
                        <h3 className="text-lg font-serif font-bold text-primary">Module Headline</h3>
                        <div className="space-y-3">
                            <Label htmlFor="module-headline" className="text-base font-medium">
                            Summary Statement
                            </Label>
                            <Input 
                            id="module-headline"
                            placeholder="In one sentence, what does this module contribute to the programme’s teaching and learning enhancement story?"
                            value={moduleHeadline}
                            onChange={(e) => setModuleHeadline(e.target.value)}
                            className="bg-background text-lg h-12"
                            />
                            <p className="text-xs text-muted-foreground">This will appear at the top of your module dashboard.</p>
                        </div>
                        </div>
                    </>
                    )}
                </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between border-t border-border/40 bg-muted/10 py-6">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStepIndex === -1} // Only disable if we are at the very first step (Metadata)
              className="w-32"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <Button 
              onClick={handleNext} 
              disabled={!isStepComplete()}
              className="w-32"
            >
              {isLastStep ? (
                <>Finish <Check className="ml-2 h-4 w-4" /></>
              ) : (
                <>Next <ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>

      </div>
    </Layout>
  );
}
