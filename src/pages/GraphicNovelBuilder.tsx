import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CharacterManager } from '@/components/CharacterManager';
import { Gallery } from '@/components/Gallery';
import { ImageHistory } from '@/components/ImageHistory';
import { ImagePickerModal } from '@/components/ImagePickerModal';
import { SpeechBubble, SpeechBubbleInspector } from '@/components/SpeechBubble';
import { ProjectManager } from '@/components/ProjectManager';
import { CloudProjectManager } from '@/components/CloudProjectManager';
import UserMenu from '@/components/UserMenu';
import { DraggableResizer } from '@/components/DraggableResizer';
import { EnhancedBatchGenerator } from '@/components/EnhancedBatchGenerator';
import { SavePageModal } from '@/components/SavePageModal';
import { TextGenerationControls } from '@/components/TextGenerationControls';
import { EnhancedLeafInspector } from '@/components/EnhancedLeafInspector';
import { Character, GeneratedImage, GenerationJob, SavedPage } from '@/types';
import { ReplicateService } from '@/services/replicate';
import { 
  LayoutGrid, 
  Plus, 
  Download, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Sparkles,
  Copy,
  Trash2,
  RotateCcw,
  FileText,
  Image,
  Settings,
  Palette,
  Type,
  Move,
  Square,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Monitor,
  Users,
  History,
  Images
} from 'lucide-react';

// Type definitions and utility functions
type Node = LeafNode | SplitNode;

interface LeafNode {
  kind: "leaf";
  id: string;
  contentType: "text" | "image";
  textProps: {
    text: string;
    fontSize: number;
    color: string;
    fontWeight: string;
    textAlign: "left" | "center" | "right" | "justify";
    fontFamily: string;
    lineHeight: number;
    letterSpacing: number;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    textShadow: string;
    textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
    wordSpacing: number;
    textBackground: string;
    textBackgroundOpacity: number;
    fontWeight100: number;
    textGradient: string;
  };
  imageProps: {
    url: string;
    objectFit: "cover" | "contain" | "fill";
    opacity: number;
    borderRadius: number;
  };
  backgroundProps: {
    color: string;
    opacity: number;
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface SplitNode {
  kind: "split";
  id: string;
  direction: "horizontal" | "vertical";
  sizes: number[];
  children: Node[];
}

const uid = () => crypto.randomUUID();

const appendGeneratedLine = (existing: string, newText: string) => {
  if (!existing.trim()) return newText;
  return existing + "\n\n" + newText;
};

const DEFAULT_LEAF = (): LeafNode => ({
  kind: "leaf",
  id: uid(),
  contentType: "text",
  textProps: {
    text: "",
    fontSize: 16,
    color: "#000000",
    fontWeight: "normal",
    textAlign: "left",
    fontFamily: "Arial, sans-serif",
    lineHeight: 1.4,
    letterSpacing: 0,
    italic: false,
    underline: false,
    strikethrough: false,
    textShadow: "none",
    textTransform: "none",
    wordSpacing: 0,
    textBackground: "transparent",
    textBackgroundOpacity: 0,
    fontWeight100: 400,
    textGradient: "",
  },
  imageProps: {
    url: "",
    objectFit: "cover",
    opacity: 1,
    borderRadius: 0,
  },
  backgroundProps: {
    color: "#ffffff",
    opacity: 1,
  },
  padding: {
    top: 12,
    right: 12,
    bottom: 12,
    left: 12,
  }
});

// Page size definitions (in pixels at 96 DPI)
const PAGE_SIZES = {
  'A4': { width: 794, height: 1123, name: 'A4 (210×297mm)' },
  'US Letter': { width: 816, height: 1056, name: 'US Letter (8.5×11")' },
  'US Legal': { width: 816, height: 1344, name: 'US Legal (8.5×14")' },
  'Square': { width: 800, height: 800, name: 'Square (800×800px)' },
  'Comic': { width: 675, height: 1050, name: 'Comic Book (6.75×10.5")' },
  'Manga': { width: 480, height: 700, name: 'Manga (B6 format)' }
};

const PRESETS: { name: string; category: string; root: SplitNode }[] = [
  // Basic Layouts
  {
    name: "Single Panel",
    category: "Basic",
    root: {
      kind: "split",
      id: uid(),
      direction: "horizontal",
      sizes: [1],
      children: [DEFAULT_LEAF()]
    }
  },
  {
    name: "Two Columns",
    category: "Basic",
    root: {
      kind: "split",
      id: uid(),
      direction: "horizontal",
      sizes: [0.5, 0.5],
      children: [DEFAULT_LEAF(), DEFAULT_LEAF()]
    }
  },
  {
    name: "Three Columns",
    category: "Basic",
    root: {
      kind: "split",
      id: uid(),
      direction: "horizontal",
      sizes: [0.33, 0.33, 0.34],
      children: [DEFAULT_LEAF(), DEFAULT_LEAF(), DEFAULT_LEAF()]
    }
  },
  {
    name: "Two Rows",
    category: "Basic",
    root: {
      kind: "split",
      id: uid(),
      direction: "vertical",
      sizes: [0.5, 0.5],
      children: [DEFAULT_LEAF(), DEFAULT_LEAF()]
    }
  },
  {
    name: "Three Rows",
    category: "Basic",
    root: {
      kind: "split",
      id: uid(),
      direction: "vertical",
      sizes: [0.33, 0.33, 0.34],
      children: [DEFAULT_LEAF(), DEFAULT_LEAF(), DEFAULT_LEAF()]
    }
  },
  {
    name: "Two by Two",
    category: "Basic",
    root: {
      kind: "split",
      id: uid(),
      direction: "vertical",
      sizes: [0.5, 0.5],
      children: [
        {
          kind: "split",
          id: uid(),
          direction: "horizontal",
          sizes: [0.5, 0.5],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF()]
        },
        {
          kind: "split",
          id: uid(),
          direction: "horizontal",
          sizes: [0.5, 0.5],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF()]
        }
      ]
    }
  },
  
  // Comic Layouts
  {
    name: "Hero Splash",
    category: "Comic",
    root: {
      kind: "split",
      id: uid(),
      direction: "horizontal",
      sizes: [1],
      children: [DEFAULT_LEAF()]
    }
  },
  {
    name: "Classic 6-Panel",
    category: "Comic",
    root: {
      kind: "split",
      id: uid(),
      direction: "vertical",
      sizes: [0.33, 0.33, 0.34],
      children: [
        {
          kind: "split",
          id: uid(),
          direction: "horizontal",
          sizes: [0.5, 0.5],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF()]
        },
        {
          kind: "split",
          id: uid(),
          direction: "horizontal",
          sizes: [0.5, 0.5],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF()]
        },
        {
          kind: "split",
          id: uid(),
          direction: "horizontal",
          sizes: [0.5, 0.5],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF()]
        }
      ]
    }
  },
  {
    name: "L-Shape Layout",
    category: "Comic",
    root: {
      kind: "split",
      id: uid(),
      direction: "horizontal",
      sizes: [0.6, 0.4],
      children: [
        DEFAULT_LEAF(),
        {
          kind: "split",
          id: uid(),
          direction: "vertical",
          sizes: [0.5, 0.5],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF()]
        }
      ]
    }
  },
  {
    name: "Vertical Strip",
    category: "Comic",
    root: {
      kind: "split",
      id: uid(),
      direction: "vertical",
      sizes: [0.2, 0.2, 0.2, 0.2, 0.2],
      children: [DEFAULT_LEAF(), DEFAULT_LEAF(), DEFAULT_LEAF(), DEFAULT_LEAF(), DEFAULT_LEAF()]
    }
  },
  {
    name: "Diagonal Split",
    category: "Comic", 
    root: {
      kind: "split",
      id: uid(),
      direction: "vertical",
      sizes: [0.3, 0.7],
      children: [
        DEFAULT_LEAF(),
        {
          kind: "split",
          id: uid(),
          direction: "horizontal",
          sizes: [0.7, 0.3],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF()]
        }
      ]
    }
  },
  {
    name: "Focus Panel",
    category: "Comic",
    root: {
      kind: "split",
      id: uid(),
      direction: "vertical",
      sizes: [0.7, 0.3],
      children: [
        DEFAULT_LEAF(),
        {
          kind: "split",
          id: uid(),
          direction: "horizontal",
          sizes: [0.33, 0.33, 0.34],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF(), DEFAULT_LEAF()]
        }
      ]
    }
  },

  // Magazine Layouts
  {
    name: "Article Layout",
    category: "Magazine",
    root: {
      kind: "split",
      id: uid(),
      direction: "horizontal",
      sizes: [0.35, 0.65],
      children: [
        DEFAULT_LEAF(), // Image column
        DEFAULT_LEAF()  // Text column
      ]
    }
  },
  {
    name: "Feature Spread",
    category: "Magazine",
    root: {
      kind: "split",
      id: uid(),
      direction: "vertical",
      sizes: [0.4, 0.6],
      children: [
        DEFAULT_LEAF(), // Large header image
        {
          kind: "split",
          id: uid(),
          direction: "horizontal",
          sizes: [0.5, 0.5],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF()] // Two text columns
        }
      ]
    }
  },
  {
    name: "Sidebar Layout",
    category: "Magazine",
    root: {
      kind: "split",
      id: uid(),
      direction: "horizontal",
      sizes: [0.75, 0.25],
      children: [
        {
          kind: "split",
          id: uid(),
          direction: "vertical",
          sizes: [0.4, 0.6],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF()]
        },
        DEFAULT_LEAF() // Sidebar
      ]
    }
  },
  {
    name: "Grid Gallery",
    category: "Magazine",
    root: {
      kind: "split",
      id: uid(),
      direction: "vertical",
      sizes: [0.5, 0.5],
      children: [
        {
          kind: "split",
          id: uid(),
          direction: "horizontal",
          sizes: [0.33, 0.33, 0.34],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF(), DEFAULT_LEAF()]
        },
        {
          kind: "split",
          id: uid(),
          direction: "horizontal",
          sizes: [0.33, 0.33, 0.34],
          children: [DEFAULT_LEAF(), DEFAULT_LEAF(), DEFAULT_LEAF()]
        }
      ]
    }
  }
];

const DEFAULT_PRESET = PRESETS[0].root;

const findNode = (root: Node, id: string): Node | null => {
  if (root.id === id) return root;
  if (root.kind === "split") {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
};

const updateNode = (root: Node, id: string, updater: (node: Node) => Node): Node => {
  if (root.id === id) return updater(root);
  if (root.kind === "split") {
    return {
      ...root,
      children: root.children.map(child => updateNode(child, id, updater))
    };
  }
  return root;
};

const applyResize = (node: Node, index: number, delta: number): Node => {
  if (node.kind !== "split") return node;
  const newSizes = [...node.sizes];
  const total = newSizes.reduce((sum, size) => sum + size, 0);
  const normalizedDelta = delta / total;
  
  newSizes[index] = Math.max(0.05, Math.min(0.95, newSizes[index] + normalizedDelta));
  if (index + 1 < newSizes.length) {
    newSizes[index + 1] = Math.max(0.05, Math.min(0.95, newSizes[index + 1] - normalizedDelta));
  }
  
  const newTotal = newSizes.reduce((sum, size) => sum + size, 0);
  const normalizedSizes = newSizes.map(size => size / newTotal);
  
  return { ...node, sizes: normalizedSizes };
};

const storyPrompts = [
  "A mysterious figure emerges from the shadows",
  "The hero discovers an ancient artifact",
  "An unexpected ally arrives at the crucial moment",
  "The villain reveals their true plan",
  "A dramatic chase begins through the city"
];

const GraphicNovelBuilder = () => {
  const [pages, setPages] = useState<SplitNode[]>([DEFAULT_PRESET]);
  const [history, setHistory] = useState<SplitNode[][]>([[DEFAULT_PRESET]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Character management
  const [characters, setCharacters] = useState<Character[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const replicateService = useRef<ReplicateService>(new ReplicateService());

  const [selectedPage, setSelectedPage] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [zoom, setZoom] = useState(0.5);
  const [outline, setOutline] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [globalSettings, setGlobalSettings] = useState({
    gutter: 8,
    background: '#ffffff',
    pageSize: 'A4' as keyof typeof PAGE_SIZES,
    orientation: 'portrait' as 'portrait' | 'landscape'
  });

  // AI generation settings
  const [aiPrompt, setAiPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [outputFormat, setOutputFormat] = useState<string>("png");
  const [safetyTolerance, setSafetyTolerance] = useState<number>(2);
  const [promptUpsampling, setPromptUpsampling] = useState<boolean>(true);
  const [seed, setSeed] = useState<number | null>(null);
  const [guidanceScale, setGuidanceScale] = useState<number>(7.5);
  const [inferenceSteps, setInferenceSteps] = useState<number>(4);
  const [imageStrength, setImageStrength] = useState<number>(0.8);
  
  // Text generation settings
  const [textGenerationStyle, setTextGenerationStyle] = useState<'dialogue' | 'narration' | 'description' | 'action'>('narration');
  const [textGenerationTone, setTextGenerationTone] = useState<'dramatic' | 'humorous' | 'mysterious' | 'romantic' | 'dark'>('dramatic');
  const [textGenerationLength, setTextGenerationLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  
  // Saved pages
  const [savedPages, setSavedPages] = useState<SavedPage[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Helper function to create composite image from multiple references
  const createCompositeImage = async (images: string[]): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      const gridSize = Math.ceil(Math.sqrt(images.length));
      canvas.width = 512 * gridSize;
      canvas.height = 512 * gridSize;
      
      let loadedCount = 0;
      
      images.forEach((imageSrc, index) => {
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const x = col * 512;
          const y = row * 512;
          
          ctx.drawImage(img, x, y, 512, 512);
          loadedCount++;
          
          if (loadedCount === images.length) {
            resolve(canvas.toDataURL('image/png'));
          }
        };
        img.src = imageSrc;
      });
    });
  };

  // History management
  const saveToHistory = useCallback((newPages: SplitNode[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newPages)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setPages(history[historyIndex - 1]);
      toast.success("Undone");
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setPages(history[historyIndex + 1]);
      toast.success("Redone");
    }
  }, [history, historyIndex]);

  const fitToViewport = useCallback(() => {
    setZoom(0.5);
    toast.success("Fit to viewport");
  }, []);

  const exportCanvas = useCallback(() => {
    toast.info("Export functionality would be implemented here");
  }, []);

  // Character management functions
  const addCharacter = useCallback((characterData: Omit<Character, 'id' | 'createdAt'>) => {
    const newCharacter: Character = {
      ...characterData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setCharacters(prev => [...prev, newCharacter]);
    toast.success(`Character "${newCharacter.name}" created successfully!`);
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    toast.success('Character deleted successfully!');
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('graphic-novel-builder');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPages(data.pages || [DEFAULT_PRESET]);
        setGlobalSettings({
          gutter: 8,
          background: '#ffffff',
          pageSize: 'A4' as keyof typeof PAGE_SIZES,
          orientation: 'portrait' as 'portrait' | 'landscape',
          ...data.settings
        });
        setCharacters(data.characters || []);
        setGeneratedImages(data.generatedImages || []);
        setSavedPages(data.savedPages || []);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const data = {
      pages,
      settings: globalSettings,
      characters,
      generatedImages,
      savedPages
    };
    localStorage.setItem('graphic-novel-builder', JSON.stringify(data));
  }, [pages, globalSettings, characters, generatedImages]);

  const updatePage = (pageIndex: number, updater: (page: SplitNode) => SplitNode) => {
    setPages(prev => {
      const newPages = prev.map((page, i) => i === pageIndex ? updater(page) : page);
      saveToHistory(newPages);
      return newPages;
    });
  };

  const selectedNode = useMemo(() => {
    if (!selectedId || selectedPage >= pages.length) return null;
    return findNode(pages[selectedPage], selectedId);
  }, [pages, selectedPage, selectedId]);

  const currentLeft = pages[spreadIndex];
  const currentRight = pages[spreadIndex + 1];
  
  const { gutter, pageSize, orientation } = globalSettings;
  const pageGap = 20;
  
  // Safety check to ensure pageSize exists in PAGE_SIZES
  const safePageSize = pageSize && PAGE_SIZES[pageSize] ? pageSize : 'A4';
  const baseSize = PAGE_SIZES[safePageSize];
  const pageWidth = orientation === 'landscape' ? baseSize.height : baseSize.width;
  const pageHeight = orientation === 'landscape' ? baseSize.width : baseSize.height;

  const canvasBg = "#1a1a1a";
  const pageBg = globalSettings.background;
  const pageRadius = 8;

  const onGenerateText = async () => {
    if (!selectedNode || selectedNode.kind !== "leaf") return;
    
    try {
      toast.info("Generating story text...");
      
      const { data, error } = await supabase.functions.invoke('generate-story-text', {
        body: {
          prompt: aiPrompt || "Continue the story",
          context: selectedNode.textProps.text,
          style: 'narration',
          tone: 'dramatic',
          length: 'medium',
          characters: selectedCharacters.length > 0 ? selectedCharacters.map(id => characters.find(c => c.id === id)?.name).filter(Boolean) : undefined
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to generate story text");
      }

      if (!data || !data.text) {
        throw new Error("No text received from generation service");
      }

      updatePage(selectedPage, prev => updateNode(prev, selectedNode.id, n => n.kind !== "leaf" ? n : ({
        ...n,
        textProps: {
          ...n.textProps,
          text: appendGeneratedLine(n.textProps.text || "", data.text.trim())
        }
      })) as SplitNode);
      
      toast.success("Story text generated successfully!");
      
    } catch (error) {
      console.error('Text generation error:', error);
      const message = error instanceof Error ? error.message : "Failed to generate text";
      toast.error(`Generation failed: ${message}`);
      
      // Fallback to random prompt
      const randomPrompt = storyPrompts[Math.floor(Math.random() * storyPrompts.length)];
      updatePage(selectedPage, prev => updateNode(prev, selectedNode.id, n => n.kind !== "leaf" ? n : ({
        ...n,
        textProps: {
          ...n.textProps,
          text: appendGeneratedLine(n.textProps.text || "", randomPrompt)
        }
      })) as SplitNode);
    }
  };

  // Enhanced AI image generation with character support
  const onGenerateImage = async (characterId?: string) => {
    if (!selectedNode || selectedNode.kind !== "leaf" || !aiPrompt.trim()) {
      toast.error("Please select a leaf node and provide a prompt");
      return;
    }

    const character = characterId ? characters.find(c => c.id === characterId) : undefined;
    const jobId = crypto.randomUUID();
    
    // Prepare reference image input
    let inputImage = null;
    if (referenceImages.length > 0) {
      inputImage = referenceImages.length === 1 
        ? referenceImages[0] 
        : await createCompositeImage(referenceImages);
    } else if (referenceImageUrl.trim()) {
      inputImage = referenceImageUrl.trim();
    }
    
    // Create generation job
    const generationJob: GenerationJob = {
      id: jobId,
      characterId,
      prompt: aiPrompt,
      seed: seed || undefined,
      useReference: !!inputImage,
      referenceImageUrl: inputImage || undefined,
      aspectRatio: aspectRatio as any,
      outputFormat: outputFormat as any,
      promptUpsampling,
      safetyTolerance,
      status: 'pending',
      createdAt: new Date()
    };

    // Create a new generated image entry
    const generatedImage: GeneratedImage = {
      id: crypto.randomUUID(),
      characterId,
      characterName: character?.name,
      prompt: aiPrompt,
      seed: seed || undefined,
      imageUrl: '',
      useReference: !!inputImage,
      referenceImageUrl: inputImage || undefined,
      aspectRatio: aspectRatio as any,
      outputFormat: outputFormat as any,
      promptUpsampling,
      safetyTolerance,
      status: 'generating',
      createdAt: new Date()
    };

    setGenerationJobs(prev => [generationJob, ...prev]);
    setGeneratedImages(prev => [generatedImage, ...prev]);
    setIsGenerating(true);

    try {
      toast.info("Generating AI image...");
      
      // Build request body with all parameters
      const requestBody: any = {
        prompt: aiPrompt,
        aspect_ratio: aspectRatio,
        output_format: outputFormat,
        safety_tolerance: safetyTolerance,
        prompt_upsampling: promptUpsampling,
        seed: seed || undefined
      };

      // Add optional parameters
      if (inputImage) {
        requestBody.input_image = inputImage;
      }
      
      if (negativePrompt.trim()) {
        requestBody.negative_prompt = negativePrompt.trim();
      }
      
      const { data, error } = await supabase.functions.invoke('generate-image-novel', {
        body: requestBody
      });

      if (error) {
        throw new Error(error.message || "Failed to call image generation service");
      }

      if (!data || !data.imageURL) {
        throw new Error("No image URL received from generation service");
      }

      // Update the node with the generated image
      updatePage(selectedPage, prev => updateNode(prev, selectedNode.id, n => n.kind !== "leaf" ? n : ({
        ...n, 
        contentType: "image", 
        imageProps: { ...n.imageProps, url: data.imageURL }
      })) as SplitNode);

      // Update the generated image and job with the result
      const completedImage: GeneratedImage = {
        ...generatedImage,
        imageUrl: data.imageURL,
        seed: data.seed,
        predictionId: data.predictionId,
        status: 'completed'
      };
      
      setGeneratedImages(prev => 
        prev.map(img => img.id === generatedImage.id ? completedImage : img)
      );

      setGenerationJobs(prev => 
        prev.map(job => job.id === jobId ? { 
          ...job, 
          status: 'completed' as const, 
          imageUrl: data.imageURL,
          predictionId: data.predictionId 
        } : job)
      );
      
      toast.success("AI image generated successfully!");
      
    } catch (error) {
      console.error('Image generation error:', error);
      const message = error instanceof Error ? error.message : "Failed to generate image";
      toast.error(`Generation failed: ${message}`);

      // Update failed states
      setGeneratedImages(prev => 
        prev.map(img => 
          img.id === generatedImage.id 
            ? { ...img, status: 'failed' as const }
            : img
        )
      );

      setGenerationJobs(prev => 
        prev.map(job => job.id === jobId ? { ...job, status: 'failed' as const } : job)
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const addPage = () => {
    setPages(prev => [...prev, DEFAULT_PRESET]);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) return;
    setPages(prev => prev.filter((_, i) => i !== index));
    if (selectedPage >= pages.length - 1) {
      setSelectedPage(Math.max(0, pages.length - 2));
    }
  };

  const duplicatePage = (index: number) => {
    setPages(prev => {
      const newPage = JSON.parse(JSON.stringify(prev[index]));
      return [...prev.slice(0, index + 1), newPage, ...prev.slice(index + 1)];
    });
  };

  const applyPreset = (preset: SplitNode) => {
    updatePage(selectedPage, () => JSON.parse(JSON.stringify(preset)));
    setSelectedId("");
  };

  const handleSavePage = (pageInfo: { title: string; description: string; imageUrl: string; pageData: any }) => {
    const newSavedPage: SavedPage = {
      id: crypto.randomUUID(),
      title: pageInfo.title,
      description: pageInfo.description,
      imageUrl: pageInfo.imageUrl,
      pageData: pageInfo.pageData,
      createdAt: new Date()
    };
    
    setSavedPages(prev => [newSavedPage, ...prev]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex bg-background">
      {/* Left Sidebar - Document Controls */}
      <div className="w-80 border-r border-border bg-card shadow-card overflow-y-auto">
        <div className="p-6">
          <Tabs defaultValue="builder" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="characters">
                <Users className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <Images className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              {/* Header with User Menu */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Graphic Novel Builder</h2>
                <UserMenu />
              </div>
              
              {/* Cloud Project Manager */}
              <CloudProjectManager
                currentProject={{
                  pages,
                  selectedPage,
                  zoom,
                  characters,
                  generatedImages
                }}
                onLoadProject={(data) => {
                  if (data.pages) setPages(data.pages);
                  if (data.selectedPage !== undefined) setSelectedPage(data.selectedPage);
                  if (data.zoom !== undefined) setZoom(data.zoom);
                  if (data.characters) setCharacters(data.characters);
                  if (data.generatedImages) setGeneratedImages(data.generatedImages);
                  if (data.savedPages) setSavedPages(data.savedPages);
                }}
                onSaveProject={() => {
                  // Auto-save functionality can be added here
                }}
              />
              
              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={addPage} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Page
                  </Button>
                  <Button onClick={() => deletePage(selectedPage)} size="sm" variant="outline" disabled={pages.length <= 1}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button onClick={undo} size="sm" variant="outline" disabled={historyIndex <= 0}>
                    <Undo className="h-4 w-4 mr-1" />
                    Undo
                  </Button>
                  <Button onClick={redo} size="sm" variant="outline" disabled={historyIndex >= history.length - 1}>
                    <Redo className="h-4 w-4 mr-1" />
                    Redo
                  </Button>
                  <Button onClick={fitToViewport} size="sm" variant="outline">
                    <Monitor className="h-4 w-4 mr-1" />
                    Fit View
                  </Button>
                  <SavePageModal
                    pageElement={pageRef.current}
                    pageData={pages[selectedPage]}
                    onSave={handleSavePage}
                  />
                  <Button onClick={exportCanvas} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Layout Presets */}
              {/* Page Settings */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Page Settings</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Page Size</Label>
                    <Select
                      value={globalSettings.pageSize}
                      onValueChange={(value: keyof typeof PAGE_SIZES) => 
                        setGlobalSettings(prev => ({ ...prev, pageSize: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAGE_SIZES).map(([key, size]) => (
                          <SelectItem key={key} value={key}>{size.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Orientation</Label>
                    <Select
                      value={globalSettings.orientation}
                      onValueChange={(value: 'portrait' | 'landscape') => 
                        setGlobalSettings(prev => ({ ...prev, orientation: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Layout Presets */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Layout Presets</h4>
                <Tabs defaultValue="Basic" className="space-y-2">
                  <TabsList className="grid w-full grid-cols-3 text-xs">
                    <TabsTrigger value="Basic">Basic</TabsTrigger>
                    <TabsTrigger value="Comic">Comic</TabsTrigger>
                    <TabsTrigger value="Magazine">Mag</TabsTrigger>
                  </TabsList>
                  
                  {['Basic', 'Comic', 'Magazine'].map(category => (
                    <TabsContent key={category} value={category} className="mt-2">
                      <div className="grid grid-cols-2 gap-2">
                        {PRESETS.filter(preset => preset.category === category).map((preset, i) => (
                          <Button
                            key={i}
                            onClick={() => applyPreset(preset.root)}
                            variant="outline"
                            size="sm"
                            className="h-auto p-2 text-xs"
                          >
                            <LayoutGrid className="h-3 w-3 mr-1" />
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* View Controls */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">View</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setZoom(z => Math.min(2, z * 1.2))} size="sm" variant="outline">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground flex-1 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button onClick={() => setZoom(z => Math.max(0.1, z / 1.2))} size="sm" variant="outline">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="outlines" 
                      checked={outline} 
                      onCheckedChange={(checked) => setOutline(!!checked)} 
                    />
                    <Label htmlFor="outlines" className="text-xs text-muted-foreground">
                      Show Outlines
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Pages</h4>
                <div className="grid grid-cols-4 gap-2">
                  {pages.map((_, i) => (
                    <Button
                      key={i} 
                      onClick={() => { 
                        setSelectedPage(i); 
                        setSpreadIndex(i % 2 === 0 ? i : i - 1); 
                        setSelectedId(""); 
                      }} 
                      variant={i === selectedPage ? "default" : "outline"}
                      size="sm"
                      className="aspect-[0.707] p-1 text-xs h-auto"
                      title={`Go to page ${i + 1}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="characters" className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Characters</h2>
                <p className="text-sm text-muted-foreground">Manage your character library</p>
              </div>
              <CharacterManager
                characters={characters}
                onAddCharacter={addCharacter}
                onDeleteCharacter={deleteCharacter}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Generation History</h2>
                <p className="text-sm text-muted-foreground">Track your AI generations</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <ImageHistory
                  images={generatedImages}
                  characters={characters}
                />
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Gallery</h2>
                <p className="text-sm text-muted-foreground">Browse images and saved pages</p>
              </div>
              
              <div className="space-y-4">
                {/* Saved Pages Section */}
                {savedPages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Saved Pages ({savedPages.length})</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {savedPages.map((page) => (
                        <div key={page.id} className="group relative">
                          <div className="aspect-[0.707] rounded border border-border overflow-hidden bg-muted">
                            <img
                              src={page.imageUrl}
                              alt={page.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="font-medium truncate">{page.title}</div>
                            {page.description && (
                              <div className="text-muted-foreground truncate">{page.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Images Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Generated Images ({generatedImages.length})</h3>
                  <div className="max-h-48 overflow-y-auto">
                    <Gallery
                      images={generatedImages}
                      characters={characters}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef} 
        className="min-h-0 overflow-hidden relative flex items-center justify-center flex-1" 
        style={{ background: canvasBg }}
      >
        <div 
          className="flex items-stretch shadow-2xl" 
          style={{ 
            gap: `${pageGap}px`,
            transform: `scale(${zoom})`,
            transformOrigin: "center"
          }}
        >
          {[currentLeft, currentRight].filter(Boolean).map((pageRoot, idx) => (
              <div 
              key={idx} 
              ref={selectedPage === (spreadIndex + idx) ? pageRef : undefined}
              className="relative" 
              style={{ 
                width: pageWidth, 
                height: pageHeight, 
                background: pageBg, 
                borderRadius: pageRadius 
              }}
              onClick={() => { 
                const i = spreadIndex + idx; 
                setSelectedPage(i); 
              }}
            >
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: pageRadius }}>
                <RenderNode
                  node={pageRoot as SplitNode}
                  gutter={gutter}
                  outline={outline}
                  selectedId={selectedPage === (spreadIndex + idx) ? selectedId : ""}
                  onSelect={(id) => { setSelectedPage(spreadIndex + idx); setSelectedId(id); }}
                  onResize={(id, index, delta) => updatePage(spreadIndex + idx, prev => updateNode(prev, id, n => applyResize(n, index, delta)) as SplitNode)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Inspector */}
      {showRight && (
        <div className="w-80 border-l border-border bg-card shadow-card overflow-y-auto">
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Inspector
              </h3>
              <p className="text-xs text-muted-foreground">
                Editing page {selectedPage + 1}
                {selectedNode && (
                  <span className="block mt-1">
                    Segment: <code className="text-muted-foreground">{selectedNode.id}</code>
                  </span>
                )}
              </p>
            </div>
            
            {!selectedNode && (
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Click a segment to edit its properties
                  </p>
                </CardContent>
              </Card>
            )}
            
            {selectedNode && selectedNode.kind === "leaf" && (
              <EnhancedLeafInspector 
                node={selectedNode} 
                onChange={(updater) => updatePage(selectedPage, prev => updateNode(prev, selectedNode.id, updater) as SplitNode)}
                onGenerateText={onGenerateText}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                characters={characters}
                onGenerateImage={onGenerateImage}
                isGenerating={isGenerating}
                manualImageUrl={manualImageUrl}
                setManualImageUrl={setManualImageUrl}
                negativePrompt={negativePrompt}
                setNegativePrompt={setNegativePrompt}
                referenceImageUrl={referenceImageUrl}
                setReferenceImageUrl={setReferenceImageUrl}
                referenceImages={referenceImages}
                setReferenceImages={setReferenceImages}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                seed={seed}
                setSeed={setSeed}
                guidanceScale={guidanceScale}
                setGuidanceScale={setGuidanceScale}
                inferenceSteps={inferenceSteps}
                setInferenceSteps={setInferenceSteps}
                imageStrength={imageStrength}
                setImageStrength={setImageStrength}
                outputFormat={outputFormat}
                setOutputFormat={setOutputFormat}
                safetyTolerance={safetyTolerance}
                setSafetyTolerance={setSafetyTolerance}
                promptUpsampling={promptUpsampling}
                setPromptUpsampling={setPromptUpsampling}
              />
            )}
            
            {selectedNode && selectedNode.kind === "split" && (
              <SplitInspector 
                node={selectedNode} 
                onChange={(updater) => updatePage(selectedPage, prev => updateNode(prev, selectedNode.id, updater) as SplitNode)} 
              />
            )}
          </div>
        </div>
      )}
      </div>
    </DndProvider>
  );
};

// Component implementations for RenderNode, LeafView, SplitView, etc.

interface RenderNodeProps {
  node: Node;
  gutter: number;
  outline: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onResize: (id: string, index: number, delta: number) => void;
}

const RenderNode: React.FC<RenderNodeProps> = ({ node, gutter, outline, selectedId, onSelect, onResize }) => {
  if (node.kind === "split") {
    return <SplitView node={node} gutter={gutter} outline={outline} selectedId={selectedId} onSelect={onSelect} onResize={onResize} />;
  } else {
    return <LeafView node={node} outline={outline} isSelected={selectedId === node.id} onSelect={onSelect} />;
  }
};

interface SplitViewProps {
  node: SplitNode;
  gutter: number;
  outline: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onResize: (id: string, index: number, delta: number) => void;
}

const SplitView: React.FC<SplitViewProps> = ({ node, gutter, outline, selectedId, onSelect, onResize }) => {
  const isHorizontal = node.direction === "horizontal";
  
  return (
    <div 
      className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} h-full w-full`}
      style={{ gap: gutter }}
    >
      {node.children.map((child, index) => (
        <div 
          key={child.id}
          className="relative"
          style={{
            [isHorizontal ? 'height' : 'width']: `${node.sizes[index] * 100}%`,
            minHeight: isHorizontal ? '20px' : undefined,
            minWidth: !isHorizontal ? '20px' : undefined,
          }}
        >
          <RenderNode
            node={child}
            gutter={gutter}
            outline={outline}
            selectedId={selectedId}
            onSelect={onSelect}
            onResize={onResize}
          />
        </div>
      ))}
    </div>
  );
};

interface LeafViewProps {
  node: LeafNode;
  outline: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const LeafView: React.FC<LeafViewProps> = ({ node, outline, isSelected, onSelect }) => {
  const { textProps, imageProps, backgroundProps, padding } = node;
  
  return (
    <div
      className={`
        h-full w-full cursor-pointer transition-all duration-200
        ${outline ? 'border-2 border-dashed border-gray-300' : ''}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      style={{
        backgroundColor: backgroundProps.color,
        opacity: backgroundProps.opacity,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
    >
      {node.contentType === "text" ? (
        <div
          className="h-full w-full flex items-start"
          style={{
            fontSize: textProps.fontSize,
            color: textProps.textGradient || textProps.color,
            fontWeight: textProps.fontWeight100 || textProps.fontWeight,
            textAlign: textProps.textAlign,
            fontFamily: textProps.fontFamily,
            lineHeight: textProps.lineHeight,
            letterSpacing: textProps.letterSpacing,
            fontStyle: textProps.italic ? 'italic' : 'normal',
            textDecoration: [
              textProps.underline && 'underline',
              textProps.strikethrough && 'line-through'
            ].filter(Boolean).join(' ') || 'none',
            textShadow: textProps.textShadow !== 'none' ? textProps.textShadow : undefined,
            textTransform: textProps.textTransform,
            wordSpacing: textProps.wordSpacing,
            background: textProps.textBackground !== 'transparent' ? 
              `${textProps.textBackground}${Math.round(textProps.textBackgroundOpacity * 255).toString(16).padStart(2, '0')}` : 
              undefined,
            backgroundImage: textProps.textGradient ? textProps.textGradient : undefined,
            WebkitBackgroundClip: textProps.textGradient ? 'text' : undefined,
            WebkitTextFillColor: textProps.textGradient ? 'transparent' : undefined,
          }}
        >
          <div className="whitespace-pre-wrap break-words">
            {textProps.text || <span className="text-gray-400 italic">Click to edit text...</span>}
          </div>
        </div>
      ) : (
        <div className="h-full w-full relative overflow-hidden">
          {imageProps.url ? (
            <img
              src={imageProps.url}
              alt="Content"
              className="w-full h-full"
              style={{
                objectFit: imageProps.objectFit,
                opacity: imageProps.opacity,
                borderRadius: imageProps.borderRadius,
              }}
            />
          ) : (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Image className="h-8 w-8" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Leaf Inspector with character integration
interface EnhancedLeafInspectorProps {
  node: LeafNode;
  onChange: (updater: (node: Node) => Node) => void;
  onGenerateText: () => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  characters: Character[];
  onGenerateImage: (characterId?: string) => void;
  isGenerating: boolean;
  // Advanced image controls
  manualImageUrl: string;
  setManualImageUrl: (url: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  referenceImageUrl: string;
  setReferenceImageUrl: (url: string) => void;
  referenceImages: string[];
  setReferenceImages: (images: string[]) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  seed: number | null;
  setSeed: (seed: number | null) => void;
  guidanceScale: number;
  setGuidanceScale: (scale: number) => void;
  inferenceSteps: number;
  setInferenceSteps: (steps: number) => void;
  imageStrength: number;
  setImageStrength: (strength: number) => void;
  outputFormat: string;
  setOutputFormat: (format: string) => void;
  safetyTolerance: number;
  setSafetyTolerance: (tolerance: number) => void;
  promptUpsampling: boolean;
  setPromptUpsampling: (upsampling: boolean) => void;
}

const EnhancedLeafInspector: React.FC<EnhancedLeafInspectorProps> = ({
  node,
  onChange,
  onGenerateText,
  aiPrompt,
  setAiPrompt,
  characters,
  onGenerateImage,
  isGenerating,
  manualImageUrl,
  setManualImageUrl,
  negativePrompt,
  setNegativePrompt,
  referenceImageUrl,
  setReferenceImageUrl,
  referenceImages,
  setReferenceImages,
  aspectRatio,
  setAspectRatio,
  seed,
  setSeed,
  guidanceScale,
  setGuidanceScale,
  inferenceSteps,
  setInferenceSteps,
  imageStrength,
  setImageStrength,
  outputFormat,
  setOutputFormat,
  safetyTolerance,
  setSafetyTolerance,
  promptUpsampling,
  setPromptUpsampling
}) => {
  const [referenceMode, setReferenceMode] = useState<"upload" | "url">("upload");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file && referenceImages.length < 5) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setReferenceImages([...referenceImages, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select
              value={node.contentType}
              onValueChange={(value: "text" | "image") => 
                onChange(n => ({ ...n, contentType: value } as LeafNode))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {node.contentType === "text" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Text Content</Label>
                <Textarea
                  value={node.textProps.text}
                  onChange={(e) => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      textProps: { ...n.textProps, text: e.target.value }
                    }) : n)
                  }
                  rows={4}
                  placeholder="Enter your text here..."
                />
              </div>
              
              {/* AI Text Generation Settings */}
              <div className="space-y-3 border border-border rounded-lg p-3">
                <Label className="text-sm font-medium">AI Text Generation</Label>
                
                <div className="space-y-2">
                  <Label className="text-xs">Generation Prompt</Label>
                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={2}
                    placeholder="Describe what text you want to generate..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Style</Label>
                    <Select value="narration" onValueChange={() => {}}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dialogue">Dialogue</SelectItem>
                        <SelectItem value="narration">Narration</SelectItem>
                        <SelectItem value="description">Description</SelectItem>
                        <SelectItem value="action">Action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Tone</Label>
                    <Select value="dramatic" onValueChange={() => {}}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dramatic">Dramatic</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                        <SelectItem value="mysterious">Mysterious</SelectItem>
                        <SelectItem value="romantic">Romantic</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Length</Label>
                  <Select value="medium" onValueChange={() => {}}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                      <SelectItem value="medium">Medium (2-4 sentences)</SelectItem>
                      <SelectItem value="long">Long (4-6 sentences)</SelectItem>
                    </SelectContent>
                    </Select>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dialogue">Dialogue</SelectItem>
                        <SelectItem value="narration">Narration</SelectItem>
                        <SelectItem value="description">Description</SelectItem>
                        <SelectItem value="action">Action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Tone</Label>
                    <Select value={textGenerationTone} onValueChange={(value: any) => setTextGenerationTone(value)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dramatic">Dramatic</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                        <SelectItem value="mysterious">Mysterious</SelectItem>
                        <SelectItem value="romantic">Romantic</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Length</Label>
                  <Select value={textGenerationLength} onValueChange={(value: any) => setTextGenerationLength(value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                      <SelectItem value="medium">Medium (2-4 sentences)</SelectItem>
                      <SelectItem value="long">Long (4-6 sentences)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={onGenerateText} size="sm" variant="outline" className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Story Text
                </Button>
              </div>
            </div>
          )}

          {node.contentType === "image" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Manual Image URL</Label>
                <Input
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="Paste image URL here..."
                />
                <Button 
                  onClick={() => {
                    if (manualImageUrl.trim()) {
                      onChange(n => n.kind === "leaf" ? ({
                        ...n,
                        imageProps: { ...n.imageProps, url: manualImageUrl }
                      }) : n);
                      setManualImageUrl("");
                      toast.success("Image URL applied!");
                    }
                  }}
                  disabled={!manualImageUrl.trim()}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Apply URL
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>AI Image Prompt</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  placeholder="Describe the image you want to generate..."
                />
              </div>

              <div className="space-y-2">
                <Label>Negative Prompt (Optional)</Label>
                <Textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  rows={2}
                  placeholder="What to avoid in the image..."
                />
              </div>

              {/* Enhanced Reference Images Section */}
              <div className="space-y-3 border border-border rounded-lg p-4">
                <Label className="text-sm font-medium">Reference Images</Label>
                <Tabs value={referenceMode} onValueChange={(value) => setReferenceMode(value as "upload" | "url")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Files</TabsTrigger>
                    <TabsTrigger value="url">Image URL</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Upload up to 5 reference images</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                    </div>
                    
                    {referenceImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {referenceImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Reference ${index + 1}`}
                              className="w-full h-20 object-cover rounded border border-border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeReferenceImage(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="url" className="space-y-2">
                    <Input
                      value={referenceImageUrl}
                      onChange={(e) => setReferenceImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    {referenceImageUrl && (
                      <div className="relative">
                        <img
                          src={referenceImageUrl}
                          alt="Reference preview"
                          className="w-full h-32 object-cover rounded border border-border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Advanced Generation Settings */}
              <details className="border border-border rounded-lg">
                <summary className="p-3 cursor-pointer font-medium hover:bg-muted/50">
                  Advanced Settings
                </summary>
                <div className="p-3 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Output Format</Label>
                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="jpg">JPG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Safety Tolerance</Label>
                      <Select value={safetyTolerance.toString()} onValueChange={(value) => setSafetyTolerance(parseInt(value))}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Strict</SelectItem>
                          <SelectItem value="2">Moderate</SelectItem>
                          <SelectItem value="3">Relaxed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Prompt Upsampling</Label>
                      <Switch
                        checked={promptUpsampling}
                        onCheckedChange={setPromptUpsampling}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Guidance Scale: {guidanceScale}</Label>
                    <Slider
                      value={[guidanceScale]}
                      onValueChange={([value]) => setGuidanceScale(value)}
                      min={1}
                      max={20}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Inference Steps: {inferenceSteps}</Label>
                    <Slider
                      value={[inferenceSteps]}
                      onValueChange={([value]) => setInferenceSteps(value)}
                      min={1}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Image Strength: {Math.round(imageStrength * 100)}%</Label>
                    <Slider
                      value={[imageStrength]}
                      onValueChange={([value]) => setImageStrength(value)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </details>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      <SelectItem value="4:3">Standard (4:3)</SelectItem>
                      <SelectItem value="3:2">Photo (3:2)</SelectItem>
                      <SelectItem value="21:9">Ultrawide (21:9)</SelectItem>
                      <SelectItem value="4:5">Portrait+ (4:5)</SelectItem>
                      <SelectItem value="5:4">Square+ (5:4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Seed (Optional)</Label>
                  <Input
                    type="number"
                    value={seed || ""}
                    onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Random"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Character (Optional)</Label>
                <Select onValueChange={(value) => onGenerateImage(value === "none" ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select character or generate without" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Character</SelectItem>
                    {characters.map(char => (
                      <SelectItem key={char.id} value={char.id}>{char.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={() => onGenerateImage()}
                disabled={!aiPrompt.trim() || isGenerating}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Typography Controls */}
      {node.contentType === "text" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Input
                  type="number"
                  value={node.textProps.fontSize}
                  onChange={(e) => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      textProps: { ...n.textProps, fontSize: parseInt(e.target.value) || 16 }
                    }) : n)
                  }
                  min={8}
                  max={72}
                />
              </div>
              <div className="space-y-2">
                <Label>Line Height</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={node.textProps.lineHeight}
                  onChange={(e) => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      textProps: { ...n.textProps, lineHeight: parseFloat(e.target.value) || 1.4 }
                    }) : n)
                  }
                  min={0.5}
                  max={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={node.textProps.fontFamily}
                onValueChange={(value) => 
                  onChange(n => n.kind === "leaf" ? ({
                    ...n,
                    textProps: { ...n.textProps, fontFamily: value }
                  }) : n)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                  <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                  <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                  <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                  <SelectItem value="'Comic Sans MS', cursive">Comic Sans MS</SelectItem>
                  <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                  <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                  <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                  <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                  <SelectItem value="'Oswald', sans-serif">Oswald</SelectItem>
                </SelectContent>
              </Select>
            </div>

              <div className="space-y-2">
                <Label>Text Alignment</Label>
                <Select
                  value={node.textProps.textAlign}
                  onValueChange={(value: "left" | "center" | "right" | "justify") => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      textProps: { ...n.textProps, textAlign: value }
                    }) : n)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="justify">Justify</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            {/* Text Style Toggles */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={node.textProps.fontWeight === "bold"}
                    onCheckedChange={(checked) => 
                      onChange(n => n.kind === "leaf" ? ({
                        ...n,
                        textProps: { ...n.textProps, fontWeight: checked ? "bold" : "normal" }
                      }) : n)
                    }
                  />
                  <Label className="text-xs">Bold</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={node.textProps.italic}
                    onCheckedChange={(checked) => 
                      onChange(n => n.kind === "leaf" ? ({
                        ...n,
                        textProps: { ...n.textProps, italic: checked }
                      }) : n)
                    }
                  />
                  <Label className="text-xs">Italic</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={node.textProps.underline}
                    onCheckedChange={(checked) => 
                      onChange(n => n.kind === "leaf" ? ({
                        ...n,
                        textProps: { ...n.textProps, underline: checked }
                      }) : n)
                    }
                  />
                  <Label className="text-xs">Underline</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={node.textProps.strikethrough}
                    onCheckedChange={(checked) => 
                      onChange(n => n.kind === "leaf" ? ({
                        ...n,
                        textProps: { ...n.textProps, strikethrough: checked }
                      }) : n)
                    }
                  />
                  <Label className="text-xs">Strike</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={node.textProps.color}
                onChange={(e) => 
                  onChange(n => n.kind === "leaf" ? ({
                    ...n,
                    textProps: { ...n.textProps, color: e.target.value }
                  }) : n)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Letter Spacing</Label>
              <Slider
                value={[node.textProps.letterSpacing]}
                onValueChange={([value]) => 
                  onChange(n => n.kind === "leaf" ? ({
                    ...n,
                    textProps: { ...n.textProps, letterSpacing: value }
                  }) : n)
                }
                min={-2}
                max={5}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-center">
                {node.textProps.letterSpacing}px
              </div>
            </div>

            {/* Enhanced Text Effects */}
            <div className="space-y-3 border border-border rounded-lg p-3">
              <Label className="text-sm font-medium">Text Effects</Label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Font Weight</Label>
                  <Slider
                    value={[node.textProps.fontWeight100]}
                    onValueChange={([value]) => 
                      onChange(n => n.kind === "leaf" ? ({
                        ...n,
                        textProps: { ...n.textProps, fontWeight100: value }
                      }) : n)
                    }
                    min={100}
                    max={900}
                    step={100}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {node.textProps.fontWeight100}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Word Spacing</Label>
                  <Slider
                    value={[node.textProps.wordSpacing]}
                    onValueChange={([value]) => 
                      onChange(n => n.kind === "leaf" ? ({
                        ...n,
                        textProps: { ...n.textProps, wordSpacing: value }
                      }) : n)
                    }
                    min={-5}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {node.textProps.wordSpacing}px
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Text Transform</Label>
                <Select
                  value={node.textProps.textTransform}
                  onValueChange={(value: "none" | "uppercase" | "lowercase" | "capitalize") => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      textProps: { ...n.textProps, textTransform: value }
                    }) : n)
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="uppercase">UPPERCASE</SelectItem>
                    <SelectItem value="lowercase">lowercase</SelectItem>
                    <SelectItem value="capitalize">Capitalize Each Word</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Text Shadow</Label>
                <Select
                  value={node.textProps.textShadow}
                  onValueChange={(value: string) => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      textProps: { ...n.textProps, textShadow: value }
                    }) : n)
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1px 1px 2px rgba(0,0,0,0.5)">Light Shadow</SelectItem>
                    <SelectItem value="2px 2px 4px rgba(0,0,0,0.7)">Medium Shadow</SelectItem>
                    <SelectItem value="3px 3px 6px rgba(0,0,0,0.8)">Heavy Shadow</SelectItem>
                    <SelectItem value="0 0 10px rgba(255,255,255,0.8)">White Glow</SelectItem>
                    <SelectItem value="0 0 10px rgba(0,0,255,0.8)">Blue Glow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Text Background</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={node.textProps.textBackground === 'transparent' ? '#ffffff' : node.textProps.textBackground}
                    onChange={(e) => 
                      onChange(n => n.kind === "leaf" ? ({
                        ...n,
                        textProps: { ...n.textProps, textBackground: e.target.value }
                      }) : n)
                    }
                    className="w-16 h-8"
                  />
                  <Slider
                    value={[node.textProps.textBackgroundOpacity]}
                    onValueChange={([value]) => 
                      onChange(n => n.kind === "leaf" ? ({
                        ...n,
                        textProps: { ...n.textProps, textBackgroundOpacity: value }
                      }) : n)
                    }
                    min={0}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Opacity: {Math.round(node.textProps.textBackgroundOpacity * 100)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Text Gradient (CSS)</Label>
                <Input
                  value={node.textProps.textGradient}
                  onChange={(e) => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      textProps: { ...n.textProps, textGradient: e.target.value }
                    }) : n)
                  }
                  placeholder="linear-gradient(45deg, #ff0000, #0000ff)"
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Controls */}
      {node.contentType === "image" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Image Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Object Fit</Label>
              <Select
                value={node.imageProps.objectFit}
                onValueChange={(value: "cover" | "contain" | "fill") => 
                  onChange(n => n.kind === "leaf" ? ({
                    ...n,
                    imageProps: { ...n.imageProps, objectFit: value }
                  }) : n)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="fill">Fill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Opacity</Label>
              <Slider
                value={[node.imageProps.opacity]}
                onValueChange={([value]) => 
                  onChange(n => n.kind === "leaf" ? ({
                    ...n,
                    imageProps: { ...n.imageProps, opacity: value }
                  }) : n)
                }
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-center">
                {Math.round(node.imageProps.opacity * 100)}%
              </div>
            </div>

            <div className="space-y-2">
              <Label>Border Radius</Label>
              <Slider
                value={[node.imageProps.borderRadius]}
                onValueChange={([value]) => 
                  onChange(n => n.kind === "leaf" ? ({
                    ...n,
                    imageProps: { ...n.imageProps, borderRadius: value }
                  }) : n)
                }
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-center">
                {node.imageProps.borderRadius}px
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segment Styling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Segment Styling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <Input
              type="color"
              value={node.backgroundProps.color}
              onChange={(e) => 
                onChange(n => n.kind === "leaf" ? ({
                  ...n,
                  backgroundProps: { ...n.backgroundProps, color: e.target.value }
                }) : n)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Background Opacity</Label>
            <Slider
              value={[node.backgroundProps.opacity]}
              onValueChange={([value]) => 
                onChange(n => n.kind === "leaf" ? ({
                  ...n,
                  backgroundProps: { ...n.backgroundProps, opacity: value }
                }) : n)
              }
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground text-center">
              {Math.round(node.backgroundProps.opacity * 100)}%
            </div>
          </div>

          <div className="space-y-3">
            <Label>Padding</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Top</Label>
                <Input
                  type="number"
                  value={node.padding.top}
                  onChange={(e) => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      padding: { ...n.padding, top: parseInt(e.target.value) || 0 }
                    }) : n)
                  }
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Right</Label>
                <Input
                  type="number"
                  value={node.padding.right}
                  onChange={(e) => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      padding: { ...n.padding, right: parseInt(e.target.value) || 0 }
                    }) : n)
                  }
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bottom</Label>
                <Input
                  type="number"
                  value={node.padding.bottom}
                  onChange={(e) => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      padding: { ...n.padding, bottom: parseInt(e.target.value) || 0 }
                    }) : n)
                  }
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Left</Label>
                <Input
                  type="number"
                  value={node.padding.left}
                  onChange={(e) => 
                    onChange(n => n.kind === "leaf" ? ({
                      ...n,
                      padding: { ...n.padding, left: parseInt(e.target.value) || 0 }
                    }) : n)
                  }
                  min={0}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// SplitInspector component
interface SplitInspectorProps {
  node: SplitNode;
  onChange: (updater: (node: Node) => Node) => void;
}

const SplitInspector: React.FC<SplitInspectorProps> = ({ node, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Layout Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Direction</Label>
          <Select
            value={node.direction}
            onValueChange={(value: "horizontal" | "vertical") => 
              onChange(n => ({ ...n, direction: value } as SplitNode))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 block">Child Sizes</Label>
          <div className="space-y-2">
            {node.sizes.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs w-16">Child {i + 1}:</span>
                <Slider
                  value={[s]}
                  onValueChange={([value]) => {
                    let val = Math.min(0.95, Math.max(0.05, value)); 
                    const rest = Math.max(0.05, 1 - val); 
                    const factor = rest / (1 - node.sizes[i]); 
                    const newSizes = node.sizes.map((v, idx) => idx === i ? val : Math.max(0.05, v * factor)); 
                    onChange(n => ({ ...n, sizes: newSizes } as SplitNode)); 
                  }}
                  min={0.05}
                  max={0.95}
                  step={0.01}
                  className="flex-1"
                />
                <span className="text-xs tabular-nums w-12 text-right">
                  {(s * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GraphicNovelBuilder;
