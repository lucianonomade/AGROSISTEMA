import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Reports from "./pages/Reports";
import PDV from "./pages/PDV";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import BarcodeTest from "./pages/BarcodeTest";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
          <Route path="/add-product" element={<ProtectedRoute><Layout><AddProduct /></Layout></ProtectedRoute>} />
          <Route path="/edit-product/:id" element={<ProtectedRoute><Layout><AddProduct /></Layout></ProtectedRoute>} />
          <Route path="/pdv" element={<ProtectedRoute><Layout><PDV /></Layout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
          <Route path="/barcode-test" element={<ProtectedRoute><Layout><BarcodeTest /></Layout></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
