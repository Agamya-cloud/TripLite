import "./global.css";

import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Itinerary from "./pages/Itinerary";
import TripLiteLayout from "./components/TripLiteLayout";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import {
  BudgetPage,
  ChecklistPage,
  DestinationsPage,
  ExpensesPage,
  SettingsPage,
  TripDetailPage,
  TripsPage,
} from "./pages/Management";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<TripLiteLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trips/:tripId" element={<TripDetailPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
