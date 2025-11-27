import { useState } from "react";
import { useStore, User } from "@/lib/data";
import { Link } from "wouter";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, ArrowLeft, Search, Shield, CheckCircle, XCircle, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminUsersListPage() {
  const { users, toggleUserActive, resetUserPassword } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((u: User) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = (id: string, currentStatus: boolean) => {
      toggleUserActive(id);
      toast({
          title: currentStatus ? "User Deactivated" : "User Activated",
          description: `User access has been ${currentStatus ? 'revoked' : 'restored'}.`
      });
  };

  const handleResetPassword = (id: string) => {
      if (confirm("Are you sure you want to reset this user's password?")) {
          const newPass = resetUserPassword(id);
          alert(`Password reset successfully.\n\nNew Password: ${newPass}\n\nPlease copy this now as it won't be shown again.`);
      }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
             <div className="flex items-center gap-2 mb-2">
                <Link href="/admin">
                    <Button variant="ghost" size="sm" className="pl-0 hover:pl-2 transition-all text-muted-foreground">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </Button>
                </Link>
             </div>
             <h1 className="text-3xl font-bold font-serif text-slate-900">User Management</h1>
             <p className="text-muted-foreground">View and manage user accounts and permissions.</p>
        </div>
        <Link href="/admin/users/create">
            <Button className="bg-[#78BE20] hover:bg-[#6aa81d]">
                <Plus className="mr-2 h-4 w-4" /> Create New User
            </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-lg border shadow-sm">
         <Search className="h-4 w-4 text-muted-foreground" />
         <Input 
            placeholder="Search by name, email or role..." 
            className="border-none shadow-none focus-visible:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                            No users found matching "{searchTerm}"
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredUsers.map((user: User) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                        {user.name.charAt(0)}
                                    </div>
                                    {user.name}
                                </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">
                                    {user.role?.replace(/_/g, ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {user.isActive ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-green-200">Active</Badge>
                                ) : (
                                    <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-red-200">Inactive</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <Link href={`/admin/users/${user.id}/edit`}>
                                            <DropdownMenuItem className="cursor-pointer">
                                                Edit Details
                                            </DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                                            <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleToggleActive(user.id, !!user.isActive)}>
                                            {user.isActive ? (
                                                <>
                                                <XCircle className="mr-2 h-4 w-4 text-red-500" /> Deactivate User
                                                </>
                                            ) : (
                                                <>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Activate User
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
