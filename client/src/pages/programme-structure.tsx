import { useState } from "react";
import { useRoute, Link } from "wouter";
import { ProgrammeLayout } from "@/components/programme-layout";
import { useStore, ProgrammeModule, TEST_USERS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, UserPlus, Trash2, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ProgrammeStructurePage() {
  const [, params] = useRoute("/programmes/:id/structure");
  const { 
      user, 
      programmes, 
      getProgrammeModules, 
      addModuleToProgramme, 
      updateModule,
      updateProgrammeModule,
      removeModuleFromProgramme, 
      assignModuleOwner 
  } = useStore();
  
  const programmeId = params?.id;
  const programme = programmes.find((p: any) => p.id === programmeId);
  
  const modules = programmeId ? getProgrammeModules(programmeId) : [];

  // State for "Add/Edit Module" Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null); // programmeModuleId
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null); // moduleId

  const [moduleFormData, setModuleFormData] = useState({
      code: '',
      name: '',
      stage: '1',
      semester: 'autumn',
      isCore: 'core',
      ownerEmail: '' // Only used for 'add' mode
  });

  // State for "Assign Owner" Dialog (Standalone)
  const [ownerModuleId, setOwnerModuleId] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState('');

  if (!programme || !programmeId) return <div>Programme not found</div>;

  // Handlers
  const openAddDialog = (stage: number) => {
      setDialogMode('add');
      setEditingId(null);
      setEditingModuleId(null);
      setModuleFormData({
          code: '',
          name: '',
          stage: stage.toString(),
          semester: 'autumn',
          isCore: 'core',
          ownerEmail: ''
      });
      setIsDialogOpen(true);
  };

  const openEditDialog = (pm: any) => {
      setDialogMode('edit');
      setEditingId(pm.id);
      setEditingModuleId(pm.moduleId);
      setModuleFormData({
          code: pm.module?.code || '',
          name: pm.module?.name || '',
          stage: pm.stage?.toString() || '1',
          semester: pm.semester || 'autumn',
          isCore: pm.isCore || 'core',
          ownerEmail: pm.owner?.email || '' 
      });
      setIsDialogOpen(true);
  };

  const handleSaveModule = () => {
      if (!moduleFormData.code || !moduleFormData.name) {
          toast({ title: "Error", description: "Code and Name are required", variant: "destructive" });
          return;
      }

      if (dialogMode === 'add') {
          const result = addModuleToProgramme(programme.id, {
              code: moduleFormData.code,
              name: moduleFormData.name
          }, {
              stage: parseInt(moduleFormData.stage),
              semester: moduleFormData.semester,
              isCore: moduleFormData.isCore as any
          });

          // If owner email provided, assign it
          if (moduleFormData.ownerEmail && result.moduleId) {
              const normalizedEmail = moduleFormData.ownerEmail.toLowerCase();
              const knownUser = TEST_USERS.find(u => u.email?.toLowerCase() === normalizedEmail);
              
              const userId = knownUser ? knownUser.id : (
                  normalizedEmail === user.email?.toLowerCase() ? user.id : 'u_other'
              );
              assignModuleOwner(result.moduleId, userId);
          }

          toast({ title: "Module Added", description: "New module added to programme structure." });

      } else if (dialogMode === 'edit' && editingId && editingModuleId) {
          // Update Module Details
          updateModule(editingModuleId, {
              code: moduleFormData.code,
              name: moduleFormData.name
          });
          
          // Update Structure Details
          updateProgrammeModule(editingId, {
              stage: parseInt(moduleFormData.stage),
              semester: moduleFormData.semester,
              isCore: moduleFormData.isCore as any
          });

          // Update Owner if email provided
          if (moduleFormData.ownerEmail) {
              const normalizedEmail = moduleFormData.ownerEmail.toLowerCase();
              // Check against known test users first
              const knownUser = TEST_USERS.find(u => u.email?.toLowerCase() === normalizedEmail);
              
              const userId = knownUser ? knownUser.id : (
                  normalizedEmail === user.email?.toLowerCase() ? user.id : 'u_other'
              );
              
              assignModuleOwner(editingModuleId, userId);
          }

          toast({ title: "Module Updated", description: "Module details saved." });
      }

      setIsDialogOpen(false);
  };

  const handleAssignOwner = () => {
      if (!ownerModuleId || !ownerEmail) return;
      
      const normalizedEmail = ownerEmail.toLowerCase();
      const knownUser = TEST_USERS.find(u => u.email?.toLowerCase() === normalizedEmail);
      
      const userId = knownUser ? knownUser.id : (
          normalizedEmail === user.email?.toLowerCase() ? user.id : 'u_other'
      );
      
      assignModuleOwner(ownerModuleId, userId);
      setOwnerModuleId(null);
      setOwnerEmail('');
      toast({ title: "Owner Assigned", description: `Module owner updated.` });
  };

  // Group modules by stage
  const modulesByStage = modules.reduce((acc: any, m: any) => {
      const stage = m.stage || 0;
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(m);
      return acc;
  }, {} as Record<number, typeof modules>);

  return (
    <ProgrammeLayout user={user} programmeId={programmeId}>
      <div className="space-y-8 pb-20">
        
        {/* Header */}
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold font-serif text-primary">Structure & Modules</h1>
                <p className="text-muted-foreground mt-1">Manage the modules and stages for {programme.name}.</p>
            </div>
        </div>

        {/* Structure Content */}
        <div className="space-y-8">
            {[1, 2, 3, 4].map(stage => {
                const stageModules = modulesByStage[stage] || [];
                if (stageModules.length === 0 && stage > Math.max(...Object.keys(modulesByStage).map(Number), 1)) return null;

                return (
                    <Card key={stage}>
                        <CardHeader className="pb-2 border-b bg-muted/5">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Stage {stage}</CardTitle>
                                <Button size="sm" variant="ghost" onClick={() => openAddDialog(stage)}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Module
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Semester</TableHead>
                                        <TableHead className="w-[100px]">Type</TableHead>
                                        <TableHead className="w-[120px]">Code</TableHead>
                                        <TableHead>Module Name</TableHead>
                                        <TableHead className="w-[200px]">Owner</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stageModules.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                                                No modules in Stage {stage}.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        stageModules.map((pm: any) => (
                                            <TableRow key={pm.id}>
                                                <TableCell className="capitalize">{pm.semester?.replace('_', ' ')}</TableCell>
                                                <TableCell>
                                                    <Badge variant={pm.isCore === 'core' ? 'default' : 'secondary'} className="capitalize text-[10px]">
                                                        {pm.isCore}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{pm.module?.code}</TableCell>
                                                <TableCell className="font-medium">{pm.module?.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 group">
                                                        <span className={`text-sm ${!pm.owner ? 'text-muted-foreground italic' : ''}`}>
                                                            {pm.owner ? (
                                                                <>
                                                                    {pm.owner.name}
                                                                    {pm.owner.id === user.id && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                                                                </>
                                                            ) : 'No owner'}
                                                        </span>
                                                        
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => setOwnerModuleId(pm.module?.id || null)}>
                                                                    <UserPlus className="h-3 w-3" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Assign Module Owner</DialogTitle>
                                                                    <CardDescription>Assign a single owner for {pm.module?.name}</CardDescription>
                                                                </DialogHeader>
                                                                <div className="py-4 space-y-4">
                                                                    <div className="space-y-2">
                                                                        <Label>Owner Email</Label>
                                                                        <Input 
                                                                            placeholder="e.g. lecturer@university.ac.uk" 
                                                                            value={ownerEmail}
                                                                            onChange={(e) => setOwnerEmail(e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button onClick={handleAssignOwner}>Assign Owner</Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right space-x-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(pm)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive" onClick={() => removeModuleFromProgramme(pm.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
            })}

            <div className="flex justify-end pt-4">
                <Link href={`/programmes/${programmeId}/profile`}>
                    <Button size="lg" className="w-full sm:w-auto">
                        Continue to Programme Profile
                    </Button>
                </Link>
            </div>
        </div>

        {/* Add/Edit Module Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{dialogMode === 'add' ? `Add Module to Stage ${moduleFormData.stage}` : 'Edit Module Details'}</DialogTitle>
                    <CardDescription>
                        {dialogMode === 'add' 
                            ? "Add a new or existing module to the programme structure." 
                            : "Update module details and structure settings."}
                    </CardDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Module Code</Label>
                            <Input 
                                value={moduleFormData.code} 
                                onChange={(e) => setModuleFormData(prev => ({ ...prev, code: e.target.value }))}
                                placeholder="e.g. DMED1005" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                             <Select 
                                value={moduleFormData.isCore} 
                                onValueChange={(val) => setModuleFormData(prev => ({ ...prev, isCore: val }))}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="core">Core</SelectItem>
                                    <SelectItem value="elective">Elective</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Module Name</Label>
                        <Input 
                            value={moduleFormData.name} 
                            onChange={(e) => setModuleFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Advanced Digital Media" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select 
                                value={moduleFormData.semester} 
                                onValueChange={(val) => setModuleFormData(prev => ({ ...prev, semester: val }))}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="autumn">Autumn</SelectItem>
                                    <SelectItem value="spring">Spring</SelectItem>
                                    <SelectItem value="year_long">Year Long</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Stage</Label>
                            <Select 
                                value={moduleFormData.stage} 
                                onValueChange={(val) => setModuleFormData(prev => ({ ...prev, stage: val }))}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Stage 1</SelectItem>
                                    <SelectItem value="2">Stage 2</SelectItem>
                                    <SelectItem value="3">Stage 3</SelectItem>
                                    <SelectItem value="4">Stage 4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Owner Allocation - Available in Add and Edit Mode */}
                    <div className="pt-2 border-t mt-2">
                        <div className="space-y-2">
                            <Label>Module Owner (Optional)</Label>
                            <Input 
                                placeholder="Enter email address to assign owner..." 
                                value={moduleFormData.ownerEmail}
                                onChange={(e) => setModuleFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">
                                {dialogMode === 'add' 
                                    ? "If provided, this user will be assigned as the module lead immediately."
                                    : "Enter a new email to re-assign the module owner."}
                            </p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveModule}>
                        {dialogMode === 'add' ? 'Add Module' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
    </ProgrammeLayout>
  );
}
