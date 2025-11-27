import { useState, useEffect } from "react";
import { useStore, User } from "@/lib/data";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminUserFormPage() {
  const [match, params] = useRoute("/admin/users/:id/edit");
  const isEditMode = !!match;
  const userId = params?.id;
  
  const [, setLocation] = useLocation();
  const { users, addUser, updateUser } = useStore();

  const [formData, setFormData] = useState({
      name: '',
      email: '',
      role: 'viewer',
      isActive: true,
      password: '',
      confirmPassword: ''
  });

  useEffect(() => {
      if (isEditMode && userId) {
          const user = users.find((u: User) => u.id === userId);
          if (user) {
              setFormData(prev => ({
                  ...prev,
                  name: user.name,
                  email: user.email || '',
                  role: user.role || 'viewer',
                  isActive: user.isActive ?? true
              }));
          }
      }
  }, [isEditMode, userId, users]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name || !formData.email) {
          toast({ title: "Validation Error", description: "Name and Email are required.", variant: "destructive" });
          return;
      }

      if (!isEditMode) {
          // Create Mode Validation
          if (!formData.password) {
              toast({ title: "Validation Error", description: "Password is required for new users.", variant: "destructive" });
              return;
          }
          if (formData.password !== formData.confirmPassword) {
              toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" });
              return;
          }
          
          // Check email uniqueness
          if (users.some((u: User) => u.email?.toLowerCase() === formData.email.toLowerCase())) {
              toast({ title: "Error", description: "Email already exists.", variant: "destructive" });
              return;
          }

          addUser({
              name: formData.name,
              email: formData.email,
              role: formData.role,
              isActive: formData.isActive,
              password: formData.password
          });

          toast({ title: "User Created", description: `${formData.name} has been added.` });
      } else {
          // Edit Mode
          if (userId) {
              updateUser(userId, {
                  name: formData.name,
                  email: formData.email,
                  role: formData.role,
                  isActive: formData.isActive
              });
              toast({ title: "User Updated", description: "User details saved successfully." });
          }
      }

      setLocation("/admin/users");
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
       <div className="mb-6">
            <Link href="/admin/users">
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all text-muted-foreground">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Users
                </Button>
            </Link>
       </div>

       <Card>
           <CardHeader>
               <CardTitle>{isEditMode ? 'Edit User' : 'Create New User'}</CardTitle>
               <CardDescription>
                   {isEditMode ? 'Update user details and permissions.' : 'Add a new user to the system.'}
               </CardDescription>
           </CardHeader>
           <form onSubmit={handleSubmit}>
               <CardContent className="space-y-6">
                   
                   <div className="space-y-2">
                       <Label htmlFor="name">Full Name</Label>
                       <Input 
                          id="name" 
                          value={formData.name} 
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. Dr. Jane Doe"
                       />
                   </div>

                   <div className="space-y-2">
                       <Label htmlFor="email">Email Address</Label>
                       <Input 
                          id="email" 
                          type="email"
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="e.g. jane.doe@uni.ac.uk"
                       />
                   </div>

                   <div className="space-y-2">
                       <Label htmlFor="role">Role</Label>
                       <Select 
                          value={formData.role} 
                          onValueChange={(val) => setFormData({...formData, role: val})}
                       >
                           <SelectTrigger>
                               <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="programme_chair">Programme Chair</SelectItem>
                               <SelectItem value="module_lead">Module Lead</SelectItem>
                               <SelectItem value="module_owner">Module Owner</SelectItem>
                               <SelectItem value="admin">Administrator</SelectItem>
                               <SelectItem value="viewer">Viewer</SelectItem>
                           </SelectContent>
                       </Select>
                   </div>

                   <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Active Account</Label>
                            <CardDescription>
                                Allow this user to log in to the system.
                            </CardDescription>
                        </div>
                        <Switch 
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                        />
                   </div>

                   {!isEditMode && (
                       <div className="grid gap-4 pt-4 border-t">
                           <div className="space-y-2">
                               <Label htmlFor="password">Password</Label>
                               <Input 
                                  id="password" 
                                  type="password"
                                  value={formData.password}
                                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                               />
                           </div>
                           <div className="space-y-2">
                               <Label htmlFor="confirmPassword">Confirm Password</Label>
                               <Input 
                                  id="confirmPassword" 
                                  type="password"
                                  value={formData.confirmPassword}
                                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                               />
                           </div>
                       </div>
                   )}

               </CardContent>
               <CardFooter className="flex justify-between bg-slate-50 p-6">
                   <Link href="/admin/users">
                       <Button variant="ghost" type="button">Cancel</Button>
                   </Link>
                   <Button type="submit" className="bg-[#78BE20] hover:bg-[#6aa81d]">
                       <Save className="mr-2 h-4 w-4" /> 
                       {isEditMode ? 'Save Changes' : 'Create User'}
                   </Button>
               </CardFooter>
           </form>
       </Card>
    </div>
  );
}
