// src/pages/About.tsx
// Mëku Storybook Studio v2.1.0

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Heart, 
  Github, 
  Mail, 
  BookOpen, 
  Palette, 
  Sparkles,
  Users,
  Code,
  ExternalLink
} from 'lucide-react';
import { APP_VERSION, APP_NAME, APP_CODENAME, BUILD_DATE, VERSION_HISTORY } from '@/lib/version';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Badge variant="outline" className="text-xs">
            v{APP_VERSION}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-6 shadow-lg shadow-purple-500/25">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {APP_NAME}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Collaborative Story Creation Platform
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              v{APP_VERSION}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              "{APP_CODENAME}"
            </Badge>
          </div>
        </div>

        {/* About the App */}
        <Card className="bg-card/50 border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              About {APP_NAME}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Mëku Storybook Studio is a creative platform designed for authors, illustrators, 
              and families who want to bring stories to life. Whether you're crafting a children's 
              picture book, an interactive comic, or a branching adventure tale, Mëku provides 
              the tools to create, collaborate, and publish.
            </p>
            <p>
              Part of the <strong className="text-foreground">AppVerse</strong> ecosystem, 
              Mëku integrates modern AI capabilities for image generation, voice narration, 
              and story development assistance—while keeping the human creator at the center 
              of every story.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Palette className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-sm">Create</h4>
                  <p className="text-xs">AI-assisted illustration and character consistency</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Users className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-sm">Collaborate</h4>
                  <p className="text-xs">Up to 3 creators working together in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <BookOpen className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-sm">Publish</h4>
                  <p className="text-xs">Export to multiple formats including PDF and video</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creator Bio */}
        <Card className="bg-card/50 border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              Created By
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  S
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Shannon</h3>
                  <p className="text-sm text-muted-foreground">Creator & Developer</p>
                </div>
                <p className="text-muted-foreground">
                  Senior Technical Writer by profession, storyteller by passion. With over six years 
                  of experience translating complex systems into clear documentation, Shannon brings 
                  that same clarity to creative tools. Mëku was born from a desire to make story 
                  creation accessible and joyful—for families, educators, and dreamers alike.
                </p>
                <p className="text-muted-foreground">
                  When not building apps or writing documentation, Shannon can be found crafting 
                  children's stories, exploring the intersection of AI and creativity, and 
                  collaborating with an ever-growing team of AI assistants (Claude, GPT, and Gemini) 
                  to push the boundaries of what's possible.
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="https://github.com/Nymfarious" target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version History */}
        <Card className="bg-card/50 border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-400" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {VERSION_HISTORY.map((release, index) => (
                <div key={release.version} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                    {index < VERSION_HISTORY.length - 1 && (
                      <div className="w-px h-full bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-medium text-foreground">v{release.version}</span>
                      <Badge variant="outline" className="text-xs">{release.name}</Badge>
                      <span className="text-xs text-muted-foreground">{release.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{release.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card className="bg-card/50 border-border mb-8">
          <CardHeader>
            <CardTitle>Built With</CardTitle>
            <CardDescription>The technologies powering Mëku</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                'React', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui',
                'Zustand', 'Supabase', 'Replicate', 'Google Gemini', 'Lucide Icons'
              ].map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
          <p className="mb-2">
            {APP_NAME} is part of the <strong>AppVerse</strong> ecosystem
          </p>
          <p>
            Made with <Heart className="h-3 w-3 inline text-red-400" /> and a lot of coffee
          </p>
          <p className="mt-2 text-xs">
            Build {BUILD_DATE} • v{APP_VERSION}
          </p>
        </div>
      </main>
    </div>
  );
}
