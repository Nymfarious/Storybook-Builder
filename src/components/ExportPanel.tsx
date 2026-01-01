import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, FileImage, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportPanelProps {
  pageRef: React.RefObject<HTMLDivElement>;
  pages: any[];
  selectedPage: number;
}

type ExportFormat = 'png' | 'pdf';
type QualityPreset = 'high' | 'good' | 'medium';
type ScaleOption = 1 | 2 | 3 | 4;

const QUALITY_PRESETS: Record<QualityPreset, number> = {
  high: 1.0,
  good: 0.8,
  medium: 0.6
};

export const ExportPanel = ({ pageRef, pages, selectedPage }: ExportPanelProps) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState<QualityPreset>('high');
  const [scale, setScale] = useState<ScaleOption>(2);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const capturePageAsCanvas = async (element: HTMLElement, exportScale: number): Promise<HTMLCanvasElement> => {
    return html2canvas(element, {
      scale: exportScale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });
  };

  const exportCurrentPagePNG = async () => {
    if (!pageRef.current) {
      toast.error('No page to export');
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      setProgress(30);
      const canvas = await capturePageAsCanvas(pageRef.current, scale);
      setProgress(70);
      
      const link = document.createElement('a');
      link.download = `page-${selectedPage + 1}.png`;
      link.href = canvas.toDataURL('image/png', QUALITY_PRESETS[quality]);
      link.click();
      
      setProgress(100);
      toast.success(`Page ${selectedPage + 1} exported as PNG`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export page');
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  const exportCurrentPagePDF = async () => {
    if (!pageRef.current) {
      toast.error('No page to export');
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      setProgress(30);
      const canvas = await capturePageAsCanvas(pageRef.current, scale);
      setProgress(60);

      const imgData = canvas.toDataURL('image/png', QUALITY_PRESETS[quality]);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      setProgress(90);
      
      pdf.save(`page-${selectedPage + 1}.pdf`);
      setProgress(100);
      toast.success(`Page ${selectedPage + 1} exported as PDF`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export page');
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  const exportAllPagesPDF = async () => {
    toast.info('Export all pages coming soon - requires page refs for all pages');
  };

  const handleExport = () => {
    if (format === 'png') {
      exportCurrentPagePNG();
    } else {
      exportCurrentPagePDF();
    }
  };

  const estimateFileSize = () => {
    const baseSize = format === 'png' ? 500 : 800; // KB base
    const qualityMultiplier = QUALITY_PRESETS[quality];
    const scaleMultiplier = scale * scale;
    const estimated = Math.round(baseSize * qualityMultiplier * scaleMultiplier);
    
    if (estimated > 1000) {
      return `~${(estimated / 1000).toFixed(1)} MB`;
    }
    return `~${estimated} KB`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" className="h-9 w-9">
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export</p>
          </TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Page
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Format</Label>
            <Tabs value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="png" className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  PNG
                </TabsTrigger>
                <TabsTrigger value="pdf" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Quality Selection */}
          <div className="space-y-3">
            <Label>Quality</Label>
            <Select value={quality} onValueChange={(v) => setQuality(v as QualityPreset)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (100%)</SelectItem>
                <SelectItem value="good">Good (80%)</SelectItem>
                <SelectItem value="medium">Medium (60%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scale Selection (PNG only) */}
          {format === 'png' && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Scale</Label>
                <span className="text-sm text-muted-foreground">{scale}x</span>
              </div>
              <Slider
                value={[scale]}
                onValueChange={([v]) => setScale(v as ScaleOption)}
                min={1}
                max={4}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1x (Standard)</span>
                <span>4x (Ultra HD)</span>
              </div>
            </div>
          )}

          {/* Estimated File Size */}
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Estimated size</span>
            <span className="text-sm font-medium">{estimateFileSize()}</span>
          </div>

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Exporting...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Export Buttons */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Page {selectedPage + 1}
                </>
              )}
            </Button>
            
            {format === 'pdf' && pages.length > 1 && (
              <Button 
                onClick={exportAllPagesPDF} 
                variant="outline"
                disabled={isExporting}
                className="w-full"
              >
                Export All Pages ({pages.length})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};