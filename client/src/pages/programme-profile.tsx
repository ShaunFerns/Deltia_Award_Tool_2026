import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { ProgrammeLayout } from "@/components/programme-layout";
import { useStore, ProgrammeProfile, ProgrammeTeamMember } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Wand2, Users, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LEVELS_TAUGHT = ["Level 6", "Level 7", "Level 8", "Level 9", "Apprenticeship", "Other"];
const PROGRAMME_VARIANTS = ["Full-time", "Part-time", "Apprenticeship", "Work-based", "Online", "Blended"];
const TEAM_ROLES = ["Programme Chair", "Year Tutor", "Module Lead", "Industry Partner", "Administrator", "Student Rep", "Other"];

const ACADEMIC_YEARS = ["2024-25", "2025-26", "2026-27", "2027-28"];

export default function ProgrammeProfilePage() {
  const [match, params] = useRoute("/programmes/:id/profile");
  const [, setLocation] = useLocation();
  const { user, programmes, getProgrammeProfile, saveProgrammeProfile, getProgrammeTeamMembers, saveProgrammeTeamMembers, getProgrammeModules } = useStore();
  
  const programmeId = params?.id;
  const programme = programmes.find(p => p.id === programmeId);
  const modules = programmeId ? getProgrammeModules(programmeId) : [];
  
  // Academic Year State (Default to 2024-25 for MVP)
  const [academicYear, setAcademicYear] = useState("2024-25");

  // Form State
  const [profileData, setProfileData] = useState<Partial<ProgrammeProfile>>({
      programmeRationale: '',
      annualIntake: 0,
      totalEnrolmentAcrossStages: 0,
      levelsTaught: [],
      programmeVariants: [],
      teamCollaborationSummary: '',
      studentInvolvement: ''
  });

  const [teamMembers, setTeamMembers] = useState<Partial<ProgrammeTeamMember>[]>([]);
  const [otherLevelText, setOtherLevelText] = useState("");

  // Load Data
  useEffect(() => {
      if (programmeId && academicYear) {
          const existingProfile = getProgrammeProfile(programmeId, academicYear);
          if (existingProfile) {
              setProfileData(existingProfile);
              // Check for "Other" level
              const levels = existingProfile.levelsTaught || [];
              const otherLevel = levels.find(l => !LEVELS_TAUGHT.includes(l) && l !== "Other");
              if (otherLevel) {
                   // If we have a custom level, set it as "Other" + text
                   setOtherLevelText(otherLevel);
                   // Ensure UI shows "Other" as checked
                   if (!levels.includes("Other")) {
                       setProfileData(prev => ({...prev, levelsTaught: [...levels, "Other"]}));
                   }
              } else if (levels.includes("Other")) {
                   // If just "Other" is checked without text, or maybe stored as "Other: ..."
                   const otherEntry = levels.find(l => l.startsWith("Other: "));
                   if (otherEntry) {
                       setOtherLevelText(otherEntry.replace("Other: ", ""));
                   }
              }
          } else {
              // Reset if no profile found for this year
              setProfileData({
                  programmeRationale: '',
                  annualIntake: 0,
                  totalEnrolmentAcrossStages: 0,
                  levelsTaught: [],
                  programmeVariants: [],
                  teamCollaborationSummary: '',
                  studentInvolvement: ''
              });
              setOtherLevelText("");
          }

          const existingMembers = getProgrammeTeamMembers(programmeId, academicYear);
          if (existingMembers.length > 0) {
              setTeamMembers(existingMembers);
          } else {
              // Default empty row
              setTeamMembers([{ id: crypto.randomUUID(), name: '', role: '', email: '', contributionFocus: '' }]);
          }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programmeId, academicYear]);


  if (!programme || !programmeId) return <div>Programme not found</div>;

  // Handlers
  const handleProfileChange = (key: keyof ProgrammeProfile, value: any) => {
      setProfileData(prev => ({ ...prev, [key]: value }));
  };

  const toggleCheckbox = (list: string[], item: string, key: 'levelsTaught' | 'programmeVariants') => {
      let newList = [...list];
      if (newList.includes(item)) {
          newList = newList.filter(i => i !== item);
          if (item === "Other" && key === 'levelsTaught') {
              setOtherLevelText("");
          }
      } else {
          newList.push(item);
      }
      handleProfileChange(key, newList);
  };

  const handleTeamChange = (index: number, field: keyof ProgrammeTeamMember, value: string) => {
      const newMembers = [...teamMembers];
      newMembers[index] = { ...newMembers[index], [field]: value };
      setTeamMembers(newMembers);
  };

  const addTeamMember = () => {
      setTeamMembers([...teamMembers, { id: crypto.randomUUID(), name: '', role: '', email: '', contributionFocus: '' }]);
  };

  const removeTeamMember = (index: number) => {
      const newMembers = teamMembers.filter((_, i) => i !== index);
      setTeamMembers(newMembers);
  };

  const insertStarter = (field: 'programmeRationale' | 'teamCollaborationSummary' | 'studentInvolvement') => {
      const starters = {
          programmeRationale: "This programme is characterised by its commitment to...",
          teamCollaborationSummary: "The programme team works collaboratively through regular...",
          studentInvolvement: "Students have contributed to this application by participating in..."
      };
      handleProfileChange(field, (profileData[field] || '') + starters[field]);
  };

  const handleSave = (redirect: boolean = false) => {
      if (!programmeId) return;

      // Prepare data for save
      let levelsToSave = [...(profileData.levelsTaught || [])];
      
      // Handle "Other" text
      if (levelsToSave.includes("Other") && otherLevelText.trim()) {
          // Replace generic "Other" with specific text or keep structure
          // Ideally we want to check "Other" box when loading if matches our pattern
          // Let's store as "Other: [text]" in the array? Or just the text?
          // If we just store the text, we lose the "Other" category distinction if it matches a standard level (unlikely)
          // Let's store "Other: [text]" 
          levelsToSave = levelsToSave.filter(l => l !== "Other");
          levelsToSave.push(`Other: ${otherLevelText}`);
      }

      // Save Profile
      saveProgrammeProfile({
          ...profileData,
          id: profileData.id || crypto.randomUUID(),
          programmeId,
          academicYear,
          levelsTaught: levelsToSave,
          programmeVariants: profileData.programmeVariants || [],
          createdAt: profileData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
      } as ProgrammeProfile);

      // Save Team Members (filter out empty names)
      const validMembers = teamMembers.filter(m => m.name && m.name.trim() !== '') as ProgrammeTeamMember[];
      saveProgrammeTeamMembers(programmeId, academicYear, validMembers);

      toast({ 
          title: "Profile Saved", 
          description: `Programme & Team Profile for ${academicYear} saved successfully.` 
      });

      if (redirect) {
          setLocation(`/programmes/${programmeId}/taking-stock`);
      }
  };

  return (
    <ProgrammeLayout user={user} programmeId={programmeId}>
      <div className="mx-auto max-w-5xl space-y-8 pb-20">
        
        {/* Header */}
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-primary">Programme & Team Profile</h1>
                    <p className="text-muted-foreground mt-1">Define the context and team structure for the DELTA application.</p>
                </div>

                <div className="flex items-center gap-2">
                     <Select value={academicYear} onValueChange={setAcademicYear}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Academic Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {ACADEMIC_YEARS.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => handleSave(false)} className="gap-2">
                        <Save className="h-4 w-4" /> Save
                    </Button>
                </div>
            </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_250px]">
            <div className="space-y-8">
                
                {/* Section 1: Rationale */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            1. Programme Rationale
                        </CardTitle>
                        <CardDescription>
                            Briefly explain why this programme team is applying for the DELTA Award. 
                            What makes this programme distinctive?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Textarea 
                                value={profileData.programmeRationale}
                                onChange={(e) => handleProfileChange('programmeRationale', e.target.value)}
                                className="min-h-[150px] pr-24"
                                placeholder="Enter rationale..."
                            />
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="absolute top-2 right-2 text-xs text-primary hover:bg-primary/10"
                                onClick={() => insertStarter('programmeRationale')}
                            >
                                <Wand2 className="h-3 w-3 mr-1" /> Starter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Footprint */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            2. Programme Footprint
                        </CardTitle>
                        <CardDescription>Key metrics and delivery characteristics.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Annual Intake (approx)</Label>
                                <Input 
                                    type="number" 
                                    value={profileData.annualIntake || ''}
                                    onChange={(e) => handleProfileChange('annualIntake', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Enrolment (all stages)</Label>
                                <Input 
                                    type="number" 
                                    value={profileData.totalEnrolmentAcrossStages || ''}
                                    onChange={(e) => handleProfileChange('totalEnrolmentAcrossStages', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Levels Taught</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {LEVELS_TAUGHT.map(level => (
                                    <div key={level} className="flex flex-col space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`level-${level}`} 
                                                checked={profileData.levelsTaught?.includes(level)}
                                                onCheckedChange={() => toggleCheckbox(profileData.levelsTaught || [], level, 'levelsTaught')}
                                            />
                                            <label htmlFor={`level-${level}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                {level}
                                            </label>
                                        </div>
                                        {level === "Other" && profileData.levelsTaught?.includes("Other") && (
                                            <div className="ml-6">
                                                <Input 
                                                    placeholder="Please specify..." 
                                                    value={otherLevelText}
                                                    onChange={(e) => setOtherLevelText(e.target.value)}
                                                    className="h-8 text-sm mt-1 w-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Programme Variants</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {PROGRAMME_VARIANTS.map(variant => (
                                    <div key={variant} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`variant-${variant}`} 
                                            checked={profileData.programmeVariants?.includes(variant)}
                                            onCheckedChange={() => toggleCheckbox(profileData.programmeVariants || [], variant, 'programmeVariants')}
                                        />
                                        <label htmlFor={`variant-${variant}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                            {variant}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Team Members */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            3. Programme Team Members
                        </CardTitle>
                        <CardDescription>List all key staff contributing to the DELTA application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[25%]">Name</TableHead>
                                    <TableHead className="w-[20%]">Role</TableHead>
                                    <TableHead className="w-[25%]">Email</TableHead>
                                    <TableHead className="w-[25%]">Focus</TableHead>
                                    <TableHead className="w-[5%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teamMembers.map((member, index) => (
                                    <TableRow key={member.id || index}>
                                        <TableCell>
                                            <Input 
                                                value={member.name} 
                                                onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                                                placeholder="Name"
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Select 
                                                value={member.role} 
                                                onValueChange={(val) => handleTeamChange(index, 'role', val)}
                                            >
                                                <SelectTrigger className="h-8"><SelectValue placeholder="Role" /></SelectTrigger>
                                                <SelectContent>
                                                    {TEAM_ROLES.map(role => (
                                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                value={member.email || ''} 
                                                onChange={(e) => handleTeamChange(index, 'email', e.target.value)}
                                                placeholder="Email"
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                value={member.contributionFocus || ''} 
                                                onChange={(e) => handleTeamChange(index, 'contributionFocus', e.target.value)}
                                                placeholder="e.g. Assessment"
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive" onClick={() => removeTeamMember(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button variant="outline" size="sm" onClick={addTeamMember} className="w-full border-dashed">
                            <Plus className="h-4 w-4 mr-2" /> Add Team Member
                        </Button>
                    </CardContent>
                </Card>

                {/* Section 4 & 5: Collaboration & Involvement */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            4. Team Collaboration & Student Involvement
                        </CardTitle>
                        <CardDescription>Describe how the team works together and how students are involved.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2">
                            <Label>Team Collaboration Summary</Label>
                            <div className="relative">
                                <Textarea 
                                    value={profileData.teamCollaborationSummary}
                                    onChange={(e) => handleProfileChange('teamCollaborationSummary', e.target.value)}
                                    className="min-h-[120px]"
                                    placeholder="Describe collaboration..."
                                />
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute top-2 right-2 text-xs text-primary hover:bg-primary/10"
                                    onClick={() => insertStarter('teamCollaborationSummary')}
                                >
                                    <Wand2 className="h-3 w-3 mr-1" /> Starter
                                </Button>
                            </div>
                        </div>

                         <div className="space-y-2">
                            <Label>Student Involvement</Label>
                            <div className="relative">
                                <Textarea 
                                    value={profileData.studentInvolvement}
                                    onChange={(e) => handleProfileChange('studentInvolvement', e.target.value)}
                                    className="min-h-[120px]"
                                    placeholder="Briefly outline involvement..."
                                />
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute top-2 right-2 text-xs text-primary hover:bg-primary/10"
                                    onClick={() => insertStarter('studentInvolvement')}
                                >
                                    <Wand2 className="h-3 w-3 mr-1" /> Starter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button size="lg" onClick={() => handleSave(true)} className="w-full sm:w-auto">
                        Save & Next Step
                    </Button>
                </div>

            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <Card className="bg-muted/30 border-none shadow-none sticky top-24">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Programme Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-2xl font-bold text-primary">{modules.length}</div>
                            <div className="text-xs text-muted-foreground">Modules in Structure</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary">{teamMembers.length}</div>
                            <div className="text-xs text-muted-foreground">Team Members Listed</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </ProgrammeLayout>
  );
}
