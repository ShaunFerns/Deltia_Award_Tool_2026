import { Layout } from "@/components/layout";
import { useStore } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Layers, Search, Target, Award, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const { user } = useStore();

  return (
    <Layout user={user}>
      <div className="mx-auto max-w-4xl space-y-8 pb-20">
        
        {/* Introduction */}
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-primary font-serif">About DELTA</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
                The DELTA Evaluation Tool supports programme teams and module owners in completing a structured, evidence-informed review aligned with the National Forum’s DELTA Framework.
            </p>
        </div>

        {/* Key Purpose Cards */}
        <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                        <Target className="h-5 w-5" /> Purpose
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-green-900/80 leading-relaxed">
                    The tool provides a guided digital workflow that mirrors the stages of a DELTA Award submission. It brings together module-level evaluation, programme-level reflection, priority setting, theme development, and action planning in one coherent environment. Its purpose is to make the DELTA process clear, manageable, and strategically meaningful for academic teams.
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" /> Design Philosophy
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                    The tool is designed to enable thoughtful, developmental reflection rather than procedural compliance. It helps programme teams demonstrate a clear line of sight from evidence to priorities, from priorities to themes, and from themes to actionable, sustainable enhancement work.
                </CardContent>
            </Card>
        </div>

        {/* Capabilities List */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Key Capabilities</h2>
            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardContent className="p-6">
                        <ul className="grid gap-4 md:grid-cols-2">
                           {[
                               "Complete module evaluations using structured evidence prompts",
                               "Build programme-level insights across all DELTA components",
                               "Review strengths and areas for improvement informed by rich module data",
                               "Identify and select coherent priorities for enhancement",
                               "Generate strategic themes that connect those priorities meaningfully",
                               "Create SMART goals and a fully aligned Action Plan",
                               "Explore programme coherence via interactive dashboards",
                               "Export a submission that reflects the structure and expectations of the DELTA Framework"
                           ].map((item, idx) => (
                               <li key={idx} className="flex items-start gap-3">
                                   <CheckCircle2 className="h-5 w-5 text-[#78BE20] shrink-0 mt-0.5" />
                                   <span className="text-slate-700">{item}</span>
                               </li>
                           ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Authorship */}
        <div className="bg-slate-100 p-8 rounded-xl text-center space-y-4">
            <h3 className="text-xl font-semibold">Authorship</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
                Developed by Shaun Ferns to support programme teams engaging with the DELTA Framework.
                <br />
                <span className="text-sm mt-2 block">2025</span>
            </p>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4 pt-2">
            <Link href="/instructions">
                <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" /> View Instructions
                </Button>
            </Link>
            <Link href="/">
                <Button className="gap-2">
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
            </Link>
        </div>

      </div>
    </Layout>
  );
}
