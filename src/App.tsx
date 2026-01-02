import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import GraphicNovelBuilder from "./pages/GraphicNovelBuilder";
import Assets from "./pages/Assets";  
import Settings from "./pages/Settings";
import Props from "./pages/Props";
import SavedPages from "./pages/SavedPages";
import Storybook from "./pages/Storybook";
import StoryDemo from "./pages/StoryDemo";
import Builder from "./pages/Builder";
import { MiniDevTools } from '@/components/MiniDevTools';
import About from '@/pages/About';

const queryClient = new QueryClient();

// Dynamic basename: Use env variable or detect from URL
// For GitHub Pages: /MeKu-Storybook-Builder
// For Lovable/local: /
const getBasename = () => {
  // Check if we're on GitHub Pages
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    return '/MeKu-Storybook-Builder';
  }
  // Check for Vite env variable (set during build)
  if (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/') {
    return import.meta.env.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  }
  return '';
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={getBasename()}>
          <Routes>
            {/* Public routes - no auth required */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            
            {/* Home - accessible to everyone */}
            <Route path="/" element={
              <Layout>
                <Index />
              </Layout>
            } />
            
            {/* Story Demo - public for showcasing */}
            <Route path="/story-demo" element={
              <Layout>
                <StoryDemo />
              </Layout>
            } />
            
            {/* Protected routes - require auth or dev bypass */}
            <Route path="/graphic-novel-builder" element={
              <ProtectedRoute>
                <Layout>
                  <GraphicNovelBuilder />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/builder" element={
              <ProtectedRoute>
                <Layout>
                  <Builder />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/assets" element={
              <ProtectedRoute>
                <Layout>
                  <Assets />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/props" element={
              <ProtectedRoute>
                <Layout>
                  <Props />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/saved-pages" element={
              <ProtectedRoute>
                <Layout>
                  <SavedPages />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/storybook/:id" element={
              <ProtectedRoute>
                <Layout>
                  <Storybook />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <MiniDevTools />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
