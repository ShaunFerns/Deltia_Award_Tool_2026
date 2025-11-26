import { useStore } from "@/lib/data";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, BookOpen, Users } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function DashboardProgrammesListPage() {
  const { user, programmes } = useStore();
  const [search, setSearch] = useState("");

  const filtered = programmes.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout user={user} title="All Programmes" subtitle="Select a programme to view detailed analytics">
        
        <div className="mb-6">
            <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search programmes..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(prog => (
                <Link key={prog.id} href={`/dashboard/programme/${prog.id}`}>
                    <Card className="hover:border-primary/50 transition-all cursor-pointer h-full hover:shadow-md group">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg text-primary group-hover:underline decoration-2 underline-offset-4">{prog.name}</CardTitle>
                                    <CardDescription className="mt-1 font-mono text-xs bg-muted inline-block px-1 py-0.5 rounded">{prog.code}</CardDescription>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>View Data</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>Team View</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>

        {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No programmes found matching "{search}"
            </div>
        )}

    </DashboardLayout>
  );
}
