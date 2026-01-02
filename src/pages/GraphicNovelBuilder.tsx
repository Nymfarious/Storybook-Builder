import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PageThumbnailTray } from '@/components/PageThumbnailTray';
import { CanvasArea, InspectorPanel, BuilderSidebar } from '@/components/builder';
import { Character, GeneratedImage, GenerationJob, SavedPage } from '@/types';
import { ReplicateService } from '@/services/replicate';
import { Node, SplitNode } from '@/types/nodes';
import { GridSettings } from '@/components/GridSettingsPanel';
import { RecentProject } from '@/components/RecentProjectsPanel';
import { 
  findNode,
  findParentNode,
  updateNode, 
  applyResize, 
  appendGeneratedLine, 
  storyPrompts,
  removeNode,
  replaceNode,
  duplicateNodeInParent,
  uid
} from '@/utils/nodeUtils';
import { splitLeafNode, splitSplitNode } from '@/components/PanelOperationsMenu';
import { PAGE_SIZES, getDefaultPreset, PageSizeKey } from '@/constants/pagePresets';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface PageInfo {
  id: string;
  name: string;
  hidden: boolean;
}

// ==============================================================================
// HISTORY HOOK - Fixes stale closure bug with undo/redo
// ==============================================================================
interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

function useHistory<T>(initialPresent: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newPresent: T | ((prev: T) => T)) => {
    setState(currentState => {
      const resolvedPresent = typeof newPresent === 'function' 
        ? (newPresent as (prev: T) => T)(currentState.present)
        : newPresent;
      
      return {
        past: [...currentState.past, currentState.present],
        present: resolvedPresent,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(currentState => {
      if (currentState.past.length === 0) return currentState;
      
      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, -1);
      
      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(currentState => {
      if (currentState.future.length === 0) return currentState;
      
      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);
      
      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setState({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    historyLength: state.past.length + 1 + state.future.length,
    historyIndex: state.past.length,
  };
}

const GraphicNovelBuilder = () => {
  // Use the new history hook instead of manual history management
  const {
    state: pages,
    set: setPages,
    undo: undoHistory,
    redo: redoHistory,
    reset: resetHistory,
    canUndo,
    canRedo,
    historyLength,
    historyIndex,
  } = useHistory<SplitNode[]>([getDefaultPreset()]);

  const [pageInfos, setPageInfos] = useState<PageInfo[]>([{ id: crypto.randomUUID(), name: 'Page 1', hidden: false }]);
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const replicateService = useRef<ReplicateService>(new ReplicateService());

  const [selectedPage, setSelectedPage] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [zoom, setZoom] = useState(0.62);
  const [outline, setOutline] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    gutter: 8,
    background: '#faf9f6',
    pageSize: 'A4' as PageSizeKey,
    orientation: 'portrait' as 'portrait' | 'landscape'
  });

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
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  
  const [savedPages, setSavedPages] = useState<SavedPage[]>([]);
  const [layerStates, setLayerStates] = useState<Record<string, { id: string; visible: boolean; locked: boolean; opacity: number }>>({});
  const [gridSettings, setGridSettings] = useState<GridSettings>({ show: false, size: 20, color: '#3b82f6', opacity: 0.3, snap: false });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Undo/Redo with toast notifications
  const undo = useCallback(() => {
    if (canUndo) {
      undoHistory();
      toast.success("Undone");
    }
  }, [canUndo, undoHistory]);

  const redo = useCallback(() => {
    if (canRedo) {
      redoHistory();
      toast.success("Redone");
    }
  }, [canRedo, redoHistory]);

  // ==============================================================================
  // FIT TO VIEWPORT - Calculates proper zoom to fit page in view
  // ==============================================================================
  const fitToViewport = useCallback(() => {
    if (!canvasContainerRef.current) {
      setZoom(0.62);
      return;
    }

    const container = canvasContainerRef.current;
    const containerWidth = container.clientWidth - 80;
    const containerHeight = container.clientHeight - 80;

    const { pageSize, orientation } = globalSettings;
    const safePageSize = pageSize && PAGE_SIZES[pageSize] ? pageSize : 'A4';
    const baseSize = PAGE_SIZES[safePageSize];
    const pageWidth = orientation === 'landscape' ? baseSize.height : baseSize.width;
    const pageHeight = orientation === 'landscape' ? baseSize.width : baseSize.height;

    const zoomToFitWidth = containerWidth / pageWidth;
    const zoomToFitHeight = containerHeight / pageHeight;
    const optimalZoom = Math.min(zoomToFitWidth, zoomToFitHeight, 1.5);
    const finalZoom = Math.max(0.1, Math.round(optimalZoom * 100) / 100);
    
    setZoom(finalZoom);
    toast.success(`Zoom: ${Math.round(finalZoom * 100)}%`);
  }, [globalSettings]);

  // Load/Save
  useEffect(() => {
    const saved = localStorage.getItem('graphic-novel-builder');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.pages) resetHistory(data.pages);
        setPageInfos(data.pageInfos || [{ id: crypto.randomUUID(), name: 'Page 1', hidden: false }]);
        setGlobalSettings({ gutter: 8, background: '#ffffff', pageSize: 'A4', orientation: 'portrait', ...data.settings });
        setCharacters(data.characters || []);
        setGeneratedImages(data.generatedImages || []);
        setSavedPages(data.savedPages || []);
        setProjectName(data.projectName || 'Untitled Project');
        if (data.gridSettings) setGridSettings(data.gridSettings);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
    const recentList = localStorage.getItem('gn-recent-projects');
    if (recentList) {
      try { setRecentProjects(JSON.parse(recentList)); } catch (error) {}
    }
  }, [resetHistory]);

  const saveProject = useCallback(() => {
    const projectId = localStorage.getItem('gn-current-project-id') || crypto.randomUUID();
    localStorage.setItem('gn-current-project-id', projectId);
    const data = { id: projectId, projectName, pages, pageInfos, settings: globalSettings, characters, generatedImages, savedPages, gridSettings, lastModified: new Date().toISOString() };
    localStorage.setItem('graphic-novel-builder', JSON.stringify(data));
    setLastSaved(new Date());
    toast.success('Project saved');
    setRecentProjects(prev => {
      const updated: RecentProject[] = [{ id: projectId, name: projectName, lastModified: new Date().toISOString(), pageCount: pages.length }, ...prev.filter(p => p.id !== projectId)].slice(0, 5);
      localStorage.setItem('gn-recent-projects', JSON.stringify(updated));
      return updated;
    });
  }, [pages, pageInfos, globalSettings, characters, generatedImages, savedPages, gridSettings, projectName]);

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('graphic-novel-builder', JSON.stringify({ projectName, pages, pageInfos, settings: globalSettings, characters, generatedImages, savedPages, gridSettings }));
      setLastSaved(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [pages, pageInfos, globalSettings, characters, generatedImages, savedPages, gridSettings, projectName]);

  const handleLoadRecentProject = useCallback((projectId: string) => {
    const projectData = localStorage.getItem(`gn-project-${projectId}`);
    if (projectData) {
      try {
        const data = JSON.parse(projectData);
        if (data.pages) resetHistory(data.pages);
        setPageInfos(data.pageInfos || [{ id: crypto.randomUUID(), name: 'Page 1', hidden: false }]);
        setGlobalSettings(data.settings || globalSettings);
        setCharacters(data.characters || []);
        setGeneratedImages(data.generatedImages || []);
        setSavedPages(data.savedPages || []);
        setProjectName(data.projectName || 'Untitled Project');
        if (data.gridSettings) setGridSettings(data.gridSettings);
        localStorage.setItem('gn-current-project-id', projectId);
      } catch (error) {
        toast.error('Failed to load project');
      }
    }
  }, [globalSettings, resetHistory]);

  const handleDeleteRecentProject = useCallback((projectId: string) => {
    localStorage.removeItem(`gn-project-${projectId}`);
    setRecentProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      localStorage.setItem('gn-recent-projects', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePage = useCallback((pageIndex: number, updater: (page: SplitNode) => SplitNode) => {
    setPages(prev => prev.map((page, i) => i === pageIndex ? updater(page) : page));
  }, [setPages]);

  const selectedNode = useMemo(() => {
    if (!selectedId || selectedPage >= pages.length) return null;
    return findNode(pages[selectedPage], selectedId);
  }, [pages, selectedPage, selectedId]);

  const parentNode = useMemo(() => {
    if (!selectedId || selectedPage >= pages.length) return null;
    return findParentNode(pages[selectedPage], selectedId);
  }, [pages, selectedPage, selectedId]);

  const handleSplitPanel = useCallback((direction: 'horizontal' | 'vertical', count: number) => {
    if (!selectedNode) return;
    const newNode = selectedNode.kind === 'leaf' ? splitLeafNode(selectedNode, direction, count) : splitSplitNode(selectedNode, direction, count);
    updatePage(selectedPage, prev => replaceNode(prev, selectedNode.id, newNode) as SplitNode);
    setSelectedId(newNode.children[0].id);
    toast.success(`Split into ${count} panels`);
  }, [selectedNode, selectedPage, updatePage]);

  const handleMergePanel = useCallback(() => {
    if (!selectedNode || !parentNode || parentNode.children.length <= 1) return;
    updatePage(selectedPage, prev => removeNode(prev, selectedNode.id) as SplitNode);
    setSelectedId('');
    toast.success('Panel merged');
  }, [selectedNode, parentNode, selectedPage, updatePage]);

  const handleDeletePanel = useCallback(() => {
    if (!selectedNode || !parentNode || parentNode.children.length <= 1) return;
    updatePage(selectedPage, prev => removeNode(prev, selectedNode.id) as SplitNode);
    setSelectedId('');
    toast.success('Panel deleted');
  }, [selectedNode, parentNode, selectedPage, updatePage]);

  const handleDuplicatePanel = useCallback(() => {
    if (!selectedNode || !parentNode) return;
    updatePage(selectedPage, prev => duplicateNodeInParent(prev, selectedNode.id) as SplitNode);
    toast.success('Panel duplicated');
  }, [selectedNode, parentNode, selectedPage, updatePage]);

  const handleTextPropsChange = useCallback((updates: Record<string, any>) => {
    if (!selectedNode || selectedNode.kind !== 'leaf') return;
    updatePage(selectedPage, prev => updateNode(prev, selectedNode.id, n => {
      if (n.kind !== 'leaf') return n;
      return { ...n, textProps: { ...n.textProps, ...updates } };
    }) as SplitNode);
  }, [selectedNode, selectedPage, updatePage]);

  const handleUpdateLayerState = useCallback((id: string, updates: Partial<{ visible: boolean; locked: boolean; opacity: number }>) => {
    setLayerStates(prev => ({ ...prev, [id]: { ...prev[id], id, visible: true, locked: false, opacity: 1, ...prev[id], ...updates } }));
  }, []);

  const addPage = useCallback(() => {
    const newPage = getDefaultPreset();
    setPages(prev => [...prev, newPage]);
    setPageInfos(prev => [...prev, { id: crypto.randomUUID(), name: `Page ${prev.length + 1}`, hidden: false }]);
    setSelectedPage(pages.length);
    setSelectedId('');
    toast.success('Page added');
  }, [pages.length, setPages]);

  const deletePage = useCallback((index: number) => {
    if (pages.length <= 1) { toast.error('Cannot delete the only page'); return; }
    setPages(prev => prev.filter((_, i) => i !== index));
    setPageInfos(prev => prev.filter((_, i) => i !== index));
    if (selectedPage >= index && selectedPage > 0) setSelectedPage(selectedPage - 1);
    setSelectedId('');
    toast.success('Page deleted');
  }, [pages.length, selectedPage, setPages]);

  const duplicatePage = useCallback((index: number) => {
    const pageToDuplicate = JSON.parse(JSON.stringify(pages[index]));
    const assignNewIds = (node: Node): Node => {
      const newId = crypto.randomUUID();
      if (node.kind === 'leaf') return { ...node, id: newId };
      return { ...node, id: newId, children: node.children.map(assignNewIds) };
    };
    const newPage = assignNewIds(pageToDuplicate) as SplitNode;
    setPages(prev => [...prev.slice(0, index + 1), newPage, ...prev.slice(index + 1)]);
    setPageInfos(prev => [...prev.slice(0, index + 1), { id: crypto.randomUUID(), name: `${prev[index].name} (copy)`, hidden: false }, ...prev.slice(index + 1)]);
    setSelectedPage(index + 1);
    toast.success('Page duplicated');
  }, [pages, setPages]);

  const applyPreset = useCallback((preset: SplitNode) => {
    updatePage(selectedPage, () => preset);
    setSelectedId('');
    toast.success('Preset applied');
  }, [selectedPage, updatePage]);

  const renamePage = useCallback((index: number, name: string) => {
    setPageInfos(prev => prev.map((info, i) => i === index ? { ...info, name } : info));
  }, []);

  const bulkRenamePage = useCallback((prefix: string) => {
    setPageInfos(prev => prev.map((info, i) => ({ ...info, name: `${prefix} ${i + 1}` })));
    toast.success('Pages renamed');
  }, []);

  const togglePageHidden = useCallback((index: number) => {
    setPageInfos(prev => prev.map((info, i) => i === index ? { ...info, hidden: !info.hidden } : info));
  }, []);

  const addCharacter = useCallback((data: Omit<Character, 'id' | 'createdAt'>) => {
    const newCharacter: Character = { ...data, id: crypto.randomUUID(), createdAt: new Date() };
    setCharacters(prev => [...prev, newCharacter]);
    toast.success(`Character "${data.name}" added`);
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    toast.success('Character deleted');
  }, []);

  const handleSavePage = useCallback((pageInfo: { title: string; description: string; imageUrl: string; pageData: any; id?: string }) => {
    if (pageInfo.id) {
      setSavedPages(prev => prev.map(p => p.id === pageInfo.id ? { ...p, ...pageInfo, updatedAt: new Date() } : p));
      toast.success('Page updated');
    } else {
      const newSavedPage: SavedPage = { ...pageInfo, id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() };
      setSavedPages(prev => [...prev, newSavedPage]);
      toast.success('Page saved');
    }
  }, []);

  const createCompositeImage = async (images: string[]): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const size = Math.ceil(Math.sqrt(images.length));
    const cellSize = 512;
    canvas.width = canvas.height = size * cellSize;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let loadedCount = 0;
    return new Promise(resolve => {
      images.forEach((src, i) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const x = (i % size) * cellSize;
          const y = Math.floor(i / size) * cellSize;
          ctx.drawImage(img, x, y, cellSize, cellSize);
          if (++loadedCount === images.length) resolve(canvas.toDataURL('image/png'));
        };
        img.src = src;
      });
    });
  };

  const onGenerateText = async () => {
    if (!selectedNode || selectedNode.kind !== "leaf") return;
    try {
      toast.info("Generating story text...");
      const { data, error } = await supabase.functions.invoke('generate-story-text', {
        body: { prompt: aiPrompt || "Continue the story", context: selectedNode.textProps.text, style: 'narration', tone: 'dramatic', length: 'medium' }
      });
      if (error) throw new Error(error.message);
      if (!data?.text) throw new Error("No text received");
      updatePage(selectedPage, prev => updateNode(prev, selectedNode.id, n => n.kind !== "leaf" ? n : { ...n, textProps: { ...n.textProps, text: appendGeneratedLine(n.textProps.text || "", data.text.trim()) } }) as SplitNode);
      toast.success("Text generated!");
    } catch (error) {
      const randomPrompt = storyPrompts[Math.floor(Math.random() * storyPrompts.length)];
      updatePage(selectedPage, prev => updateNode(prev, selectedNode.id, n => n.kind !== "leaf" ? n : { ...n, textProps: { ...n.textProps, text: appendGeneratedLine(n.textProps.text || "", randomPrompt) } }) as SplitNode);
    }
  };

  const onGenerateImage = async (characterId?: string) => {
    if (!selectedNode || selectedNode.kind !== "leaf" || !aiPrompt.trim()) {
      toast.error("Please select a leaf node and provide a prompt");
      return;
    }
    const character = characterId ? characters.find(c => c.id === characterId) : undefined;
    let inputImage = referenceImages.length > 0 ? (referenceImages.length === 1 ? referenceImages[0] : await createCompositeImage(referenceImages)) : referenceImageUrl.trim() || null;
    
    const generatedImage: GeneratedImage = { id: crypto.randomUUID(), characterId, characterName: character?.name, prompt: aiPrompt, seed: seed || undefined, imageUrl: '', useReference: !!inputImage, referenceImageUrl: inputImage || undefined, aspectRatio: aspectRatio as any, outputFormat: outputFormat as any, promptUpsampling, safetyTolerance, status: 'generating', createdAt: new Date() };
    setGeneratedImages(prev => [generatedImage, ...prev]);
    setIsGenerating(true);

    try {
      toast.info("Generating image...");
      const requestBody: any = { prompt: aiPrompt, aspect_ratio: aspectRatio, output_format: outputFormat, safety_tolerance: safetyTolerance, prompt_upsampling: promptUpsampling, seed: seed || undefined };
      if (inputImage) requestBody.input_image = inputImage;
      if (negativePrompt.trim()) requestBody.negative_prompt = negativePrompt.trim();
      
      const { data, error } = await supabase.functions.invoke('generate-image-novel', { body: requestBody });
      if (error || !data?.imageURL) throw new Error(error?.message || "No image URL received");
      
      updatePage(selectedPage, prev => updateNode(prev, selectedNode.id, n => n.kind !== "leaf" ? n : { ...n, contentType: "image", imageProps: { ...n.imageProps, url: data.imageURL } }) as SplitNode);
      setGeneratedImages(prev => prev.map(img => img.id === generatedImage.id ? { ...img, imageUrl: data.imageURL, status: 'completed' } : img));
      toast.success("Image generated!");
    } catch (error) {
      setGeneratedImages(prev => prev.map(img => img.id === generatedImage.id ? { ...img, status: 'failed' } : img));
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentPage = pages[selectedPage];
  const { gutter, pageSize, orientation } = globalSettings;
  const safePageSize = pageSize && PAGE_SIZES[pageSize] ? pageSize : 'A4';
  const baseSize = PAGE_SIZES[safePageSize];
  const pageWidth = orientation === 'landscape' ? baseSize.height : baseSize.width;
  const pageHeight = orientation === 'landscape' ? baseSize.width : baseSize.height;

  return (
    <TooltipProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="h-screen flex flex-col bg-background">
          <div className="flex-1 flex min-h-0">
            <ResizablePanelGroup direction="horizontal" className="w-full">
              <ResizablePanel defaultSize={25} minSize={20} maxSize={50}>
                <BuilderSidebar
                  pages={pages} selectedPage={selectedPage} zoom={zoom} outline={outline}
                  historyIndex={historyIndex} historyLength={historyLength}
                  globalSettings={globalSettings} gridSettings={gridSettings}
                  characters={characters} generatedImages={generatedImages} savedPages={savedPages}
                  recentProjects={recentProjects} lastSaved={lastSaved}
                  selectedNode={selectedNode} parentNode={parentNode} selectedId={selectedId} layerStates={layerStates}
                  pageRef={pageRef}
                  onAddPage={addPage} onDeletePage={deletePage} onDuplicatePage={duplicatePage}
                  onUndo={undo} onRedo={redo} onFitToViewport={fitToViewport}
                  onZoomIn={() => setZoom(z => Math.min(2, z * 1.2))} onZoomOut={() => setZoom(z => Math.max(0.1, z / 1.2))}
                  onOutlineChange={setOutline} onSettingsChange={setGlobalSettings} onGridSettingsChange={setGridSettings}
                  onApplyPreset={applyPreset} onAddCharacter={addCharacter} onDeleteCharacter={deleteCharacter}
                  onSavePage={handleSavePage} onSelectNode={setSelectedId}
                  onUpdateLayerState={handleUpdateLayerState} onReorderLayers={() => {}}
                  onLoadRecentProject={handleLoadRecentProject} onDeleteRecentProject={handleDeleteRecentProject}
                  onLoadCloudProject={(data) => { if (data.pages) resetHistory(data.pages); if (data.characters) setCharacters(data.characters); if (data.generatedImages) setGeneratedImages(data.generatedImages); }}
                  onSplitPanel={handleSplitPanel} onMergePanel={handleMergePanel}
                  onDeletePanel={handleDeletePanel} onDuplicatePanel={handleDuplicatePanel}
                  onTextPropsChange={handleTextPropsChange}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div ref={canvasContainerRef} className="h-full w-full">
                  <CanvasArea
                    ref={pageRef}
                    currentPage={currentPage}
                    selectedPage={selectedPage} selectedId={selectedId}
                    zoom={zoom} gutter={gutter} outline={outline}
                    pageWidth={pageWidth} pageHeight={pageHeight} pageBg={globalSettings.background}
                    pageRadius={8} gridSettings={gridSettings}
                    onZoomChange={setZoom} onSelectPage={setSelectedPage} onSelectId={setSelectedId}
                    onResize={(pageIdx, id, index, delta) => updatePage(pageIdx, prev => updateNode(prev, id, n => applyResize(n, index, delta)) as SplitNode)}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={50}>
                <InspectorPanel
                  selectedPage={selectedPage} selectedNode={selectedNode} characters={characters} isGenerating={isGenerating}
                  aiPrompt={aiPrompt} setAiPrompt={setAiPrompt} manualImageUrl={manualImageUrl} setManualImageUrl={setManualImageUrl}
                  negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt}
                  referenceImageUrl={referenceImageUrl} setReferenceImageUrl={setReferenceImageUrl}
                  referenceImages={referenceImages} setReferenceImages={setReferenceImages}
                  aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                  seed={seed} setSeed={setSeed} guidanceScale={guidanceScale} setGuidanceScale={setGuidanceScale}
                  inferenceSteps={inferenceSteps} setInferenceSteps={setInferenceSteps}
                  imageStrength={imageStrength} setImageStrength={setImageStrength}
                  outputFormat={outputFormat} setOutputFormat={setOutputFormat}
                  safetyTolerance={safetyTolerance} setSafetyTolerance={setSafetyTolerance}
                  promptUpsampling={promptUpsampling} setPromptUpsampling={setPromptUpsampling}
                  onNodeChange={(updater) => selectedNode && updatePage(selectedPage, prev => updateNode(prev, selectedNode.id, updater) as SplitNode)}
                  onGenerateText={onGenerateText} onGenerateImage={onGenerateImage}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          <PageThumbnailTray
            pages={pages} pageInfos={pageInfos} selectedPage={selectedPage}
            orientation={globalSettings.orientation}
            onSelectPage={(i) => { setSelectedPage(i); setSelectedId(""); }}
            onAddPage={addPage} onDeletePage={deletePage} onDuplicatePage={duplicatePage}
            onRenamePage={renamePage} onToggleHidden={togglePageHidden} onBulkRename={bulkRenamePage}
          />
        </div>
      </DndProvider>
    </TooltipProvider>
  );
};

export default GraphicNovelBuilder;
