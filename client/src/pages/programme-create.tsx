import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { ProgrammeLayout } from "@/components/programme-layout";
import { useStore, Programme } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function ProgrammeCreatePage() {
  const [match, params] = useRoute("/programmes/:id/edit-meta");
  const isEditMode = !!match;
  const [, setLocation] = useLocation();
  const { user, programmes, addProgramme, updateProgramme } = useStore();

  const [formData, setFormData] = useState<Partial<Programme>>({
    code: '',
    name: '',
    school: '',
    faculty: '',
    disciplineArea: '',
    nfqLevel: '',
    mode: ''
  });

  useEffect(() => {
    if (isEditMode && params?.id) {
      const prog = programmes.find(p => p.id === params.id);
      if (prog) {
        setFormData(prog);
      }
    }
  }, [isEditMode, params?.id, programmes]);

  const handleChange = (key: keyof Programme, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide at least a Programme Code and Name.",
        variant: "destructive"
      });
      return;
    }

    if (isEditMode && params?.id) {
      updateProgramme(params.id, formData);
      toast({ title: "Programme Updated", description: "Metadata saved successfully." });
      setLocation(`/programmes/${params.id}/structure`);
    } else {
      const newProg = addProgramme(formData as any);
      toast({ title: "Programme Created", description: "New programme added successfully." });
      setLocation(`/programmes/${newProg.id}/structure`);
    }
  };

  const content = (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div>
           <h1 className="text-3xl font-bold font-serif text-primary">
             {isEditMode ? 'Programme Details' : 'Create New Programme'}
           </h1>
           <p className="text-muted-foreground mt-1">
             {isEditMode ? 'Update the core metadata for this programme.' : 'Set up a new programme structure.'}
           </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Programme Metadata</CardTitle>
              <CardDescription>Basic information about the programme.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Programme Code *</Label>
                  <Input 
                    id="code" 
                    placeholder="e.g. BA-DMED-4" 
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nfq">NFQ Level</Label>
                  <Input 
                    id="nfq" 
                    placeholder="e.g. Level 8" 
                    value={formData.nfqLevel}
                    onChange={(e) => handleChange('nfqLevel', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Programme Name *</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. BA (Hons) in Digital Media" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input 
                    id="school" 
                    placeholder="e.g. School of Creative Arts" 
                    value={formData.school}
                    onChange={(e) => handleChange('school', e.target.value)}
                  />
                </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Input 
                    id="faculty" 
                    placeholder="e.g. Arts & Humanities" 
                    value={formData.faculty}
                    onChange={(e) => handleChange('faculty', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discipline">Discipline Area</Label>
                  <Input 
                    id="discipline" 
                    placeholder="e.g. Media" 
                    value={formData.disciplineArea}
                    onChange={(e) => handleChange('disciplineArea', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="mode">Delivery Mode</Label>
                  <Select 
                    value={formData.mode} 
                    onValueChange={(val) => handleChange('mode', val)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select mode..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Blended">Blended</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
              </div>

            </CardContent>
            <CardFooter className="flex justify-between bg-muted/10 py-4">
               <Button variant="ghost" type="button" onClick={() => window.history.back()}>Cancel</Button>
               <Button type="submit">{isEditMode ? 'Save & Next' : 'Create Programme'}</Button>
            </CardFooter>
          </form>
        </Card>
    </div>
  );

  if (isEditMode && params?.id) {
      return (
          <ProgrammeLayout user={user} programmeId={params.id}>
              {content}
          </ProgrammeLayout>
      );
  }

  return (
    <Layout user={user}>
      <div className="mx-auto max-w-2xl space-y-8">
          {content}
      </div>
    </Layout>
  );
}
