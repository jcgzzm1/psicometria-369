import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminAssignments, AdminDashboard, AdminInstruments, AdminPeople, AdminPersonHistory } from "./pages/Admin";
import { AssessmentPage, CandidateHome, ResultReport } from "./pages/Evaluation";
import Home from "./pages/Home";

function AppRoutes() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/personas"} component={AdminPeople} />
      <Route path={"/admin/personas/:id"} component={AdminPersonHistory} />
      <Route path={"/admin/asignaciones"} component={AdminAssignments} />
      <Route path={"/admin/instrumentos"} component={AdminInstruments} />
      <Route path={"/mis-evaluaciones"} component={CandidateHome} />
      <Route path={"/evaluacion/:id"} component={AssessmentPage} />
      <Route path={"/resultados/:id"} component={ResultReport} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={import.meta.env.MODE === "pages" ? "/psicometria-369" : ""}>
            <AppRoutes />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

