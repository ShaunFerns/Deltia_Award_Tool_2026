import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useStore } from "@/lib/data";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MyProgrammesPage() {
  const { user, getMyProgrammes } = useStore();
  const programmes = getMyProgrammes();

  return (
    <Layout user={user}>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-primary">My Programmes</h1>
            <p className="text-muted-foreground mt-1">Programmes you manage as Chair or Coordinator</p>
          </div>
          <Link href="/programmes/create" className={buttonVariants({ className: "gap-2" })}>
              <Plus className="h-4 w-4" /> Create New Programme
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Programmes</CardTitle>
            <CardDescription>Manage structure, modules, and owners.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programme Code</TableHead>
                  <TableHead>Programme Name</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programmes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      You don't have any programmes yet. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  programmes.map((prog) => (
                    <TableRow key={prog.id}>
                      <TableCell className="font-mono font-medium">{prog.code}</TableCell>
                      <TableCell>{prog.name}</TableCell>
                      <TableCell>{prog.faculty || '—'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link 
                          href={`/programmes/${prog.id}/structure`}
                          className={buttonVariants({ size: "sm" })}
                        >
                            Manage <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                        <Link 
                          href={`/programmes/${prog.id}/profile`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                            Profile
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
