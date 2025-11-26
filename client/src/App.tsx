import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore, StoreProvider } from "@/lib/data";
import NotFound from "@/pages/not-found";

// Pages
import LoginPage from "@/pages/login";
import HomePage from "@/pages/home";
import EvaluatePage from "@/pages/evaluate";
import DashboardPage from "@/pages/dashboard";
import DashboardProgrammesListPage from "@/pages/dashboard/programmes-list";
import DashboardProgrammePage from "@/pages/dashboard/programme";
import DashboardModulePage from "@/pages/dashboard/module";
import MyProgrammesPage from "@/pages/my-programmes";
import ProgrammeCreatePage from "@/pages/programme-create";
import ProgrammeStructurePage from "@/pages/programme-structure";
import ProgrammeProfilePage from "@/pages/programme-profile";
import ProgrammeTakingStockPage from "@/pages/programme-taking-stock";
import ProgrammePrioritiesPage from "@/pages/programme-priorities";
import ProgrammeFutureFocusPage from "@/pages/programme-future-focus";
import ProgrammeActionPlanPage from "@/pages/programme-action-plan";
import MyModulesPage from "@/pages/my-modules";
import AboutPage from "@/pages/about";
import InstructionsPage from "@/pages/instructions";

function ProtectedRoute({ component: Component, ...props }: any) {
  const { user } = useStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  if (!user) return null;

  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      <Route path="/">
        {(params) => <ProtectedRoute component={HomePage} {...params} />}
      </Route>
      
      <Route path="/evaluate/:id">
        {(params) => <ProtectedRoute component={EvaluatePage} {...params} />}
      </Route>
      
      {/* Dashboard Routes */}
      <Route path="/dashboard">
        {(params) => <ProtectedRoute component={DashboardPage} {...params} />}
      </Route>
      <Route path="/dashboard/programmes">
        {(params) => <ProtectedRoute component={DashboardProgrammesListPage} {...params} />}
      </Route>
      <Route path="/dashboard/programme/:id">
        {(params) => <ProtectedRoute component={DashboardProgrammePage} {...params} />}
      </Route>
      <Route path="/dashboard/programme/:pid/module/:mid">
        {(params) => <ProtectedRoute component={DashboardModulePage} {...params} />}
      </Route>
      
      {/* Programme Chair Routes */}
      <Route path="/my-programmes">
        {(params) => <ProtectedRoute component={MyProgrammesPage} {...params} />}
      </Route>
      
      <Route path="/programmes/create">
        {(params) => <ProtectedRoute component={ProgrammeCreatePage} {...params} />}
      </Route>
      
      <Route path="/programmes/:id/edit-meta">
        {(params) => <ProtectedRoute component={ProgrammeCreatePage} {...params} />}
      </Route>
      
      <Route path="/programmes/:id/structure">
        {(params) => <ProtectedRoute component={ProgrammeStructurePage} {...params} />}
      </Route>
      
      <Route path="/programmes/:id/profile">
        {(params) => <ProtectedRoute component={ProgrammeProfilePage} {...params} />}
      </Route>
      
      <Route path="/programmes/:id/taking-stock">
        {(params) => <ProtectedRoute component={ProgrammeTakingStockPage} {...params} />}
      </Route>
      
      <Route path="/programmes/:id/priorities">
        {(params) => <ProtectedRoute component={ProgrammePrioritiesPage} {...params} />}
      </Route>

      <Route path="/programmes/:id/future-focus">
        {(params) => <ProtectedRoute component={ProgrammeFutureFocusPage} {...params} />}
      </Route>

      <Route path="/programmes/:id/action-plan">
        {(params) => <ProtectedRoute component={ProgrammeActionPlanPage} {...params} />}
      </Route>

      {/* Module Owner Routes */}
      <Route path="/my-modules">
        {(params) => <ProtectedRoute component={MyModulesPage} {...params} />}
      </Route>

      {/* Info Routes */}
      <Route path="/about">
        {(params) => <ProtectedRoute component={AboutPage} {...params} />}
      </Route>
      <Route path="/instructions">
        {(params) => <ProtectedRoute component={InstructionsPage} {...params} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;
