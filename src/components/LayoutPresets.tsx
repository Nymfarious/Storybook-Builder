import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface LayoutPreset {
  id: string;
  name: string;
  category: 'comic' | 'manga' | 'webtoon' | 'magazine' | 'novel';
  description: string;
  layout: number[][];
  aspectRatio?: string;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  // Traditional Comic Layouts
  { id: 'single', name: 'Single Panel', category: 'comic', description: 'Full page single panel for dramatic scenes', layout: [[100]], aspectRatio: '4:5' },
  { id: 'two-panel', name: 'Two Panel', category: 'comic', description: 'Simple two panel layout', layout: [[50, 50]], aspectRatio: '4:5' },
  { id: 'three-panel', name: 'Three Panel Strip', category: 'comic', description: 'Classic comic strip layout', layout: [[33, 33, 34]], aspectRatio: '16:9' },
  { id: 'four-panel', name: 'Four Panel Grid', category: 'comic', description: 'Even four panel grid', layout: [[50, 50], [50, 50]], aspectRatio: '1:1' },
  { id: 'six-panel', name: 'Six Panel Grid', category: 'comic', description: 'Traditional six panel comic page', layout: [[33, 33, 34], [33, 33, 34]], aspectRatio: '4:5' },
  { id: 'nine-panel', name: 'Nine Panel Grid', category: 'comic', description: 'Detailed nine panel storytelling', layout: [[33, 33, 34], [33, 33, 34], [33, 33, 34]], aspectRatio: '4:5' },
  
  // Advanced Comic Layouts
  { id: 'L-shape', name: 'L-Shape Layout', category: 'comic', description: 'Dynamic L-shaped panel arrangement', layout: [[70, 30], [70, 30], [100]], aspectRatio: '4:5' },
  { id: 'splash-focus', name: 'Splash Focus', category: 'comic', description: 'Large splash panel with smaller accent panels', layout: [[100], [25, 25, 25, 25]], aspectRatio: '4:5' },
  { id: 'action-sequence', name: 'Action Sequence', category: 'comic', description: 'Vertical panels for action flow', layout: [[20], [20], [20], [20], [20]], aspectRatio: '3:4' },
  { id: 'dialogue-heavy', name: 'Dialogue Heavy', category: 'comic', description: 'Multiple small panels for conversation', layout: [[50, 50], [33, 33, 34], [50, 50]], aspectRatio: '4:5' },
  
  // Manga Layouts
  { id: 'manga-standard', name: 'Standard Manga', category: 'manga', description: 'Traditional manga panel flow', layout: [[40, 60], [100], [30, 70]], aspectRatio: '3:4' },
  { id: 'manga-action', name: 'Manga Action', category: 'manga', description: 'Dynamic manga action layout', layout: [[100], [33, 33, 34], [60, 40]], aspectRatio: '3:4' },
  { id: 'manga-emotion', name: 'Manga Emotion', category: 'manga', description: 'Close-up emotional beats', layout: [[50, 50], [100], [25, 25, 25, 25]], aspectRatio: '3:4' },
  { id: 'four-koma', name: 'Four-Koma', category: 'manga', description: 'Traditional four-panel manga strip', layout: [[100], [100], [100], [100]], aspectRatio: '2:3' },
  
  // Webtoon Layouts
  { id: 'webtoon-scroll', name: 'Webtoon Scroll', category: 'webtoon', description: 'Vertical scrolling webtoon format', layout: [[100], [100], [100], [100], [100], [100]], aspectRatio: '9:16' },
  { id: 'webtoon-wide', name: 'Webtoon Wide', category: 'webtoon', description: 'Wide cinematic webtoon panels', layout: [[100], [50, 50], [100], [33, 33, 34]], aspectRatio: '9:16' },
  { id: 'webtoon-chat', name: 'Webtoon Chat', category: 'webtoon', description: 'Chat/messaging style layout', layout: [[80], [60], [90], [70], [85]], aspectRatio: '9:16' },
  
  // Magazine/Article Layouts
  { id: 'magazine-feature', name: 'Feature Article', category: 'magazine', description: 'Magazine feature layout with hero image', layout: [[100], [60, 40], [40, 60]], aspectRatio: '4:5' },
  { id: 'magazine-interview', name: 'Interview Layout', category: 'magazine', description: 'Question and answer format', layout: [[50, 50], [100], [33, 33, 34], [100]], aspectRatio: '4:5' },
  { id: 'photo-spread', name: 'Photo Spread', category: 'magazine', description: 'Photo-heavy magazine spread', layout: [[33, 67], [50, 25, 25], [100]], aspectRatio: '16:9' },
  
  // Graphic Novel Layouts
  { id: 'chapter-opener', name: 'Chapter Opener', category: 'novel', description: 'Dramatic chapter opening layout', layout: [[100], [25, 75]], aspectRatio: '4:5' },
  { id: 'montage', name: 'Montage Layout', category: 'novel', description: 'Time passage or memory sequence', layout: [[20, 20, 20, 20, 20], [40, 60], [100]], aspectRatio: '4:5' },
  { id: 'narrative-flow', name: 'Narrative Flow', category: 'novel', description: 'Story-driven panel progression', layout: [[30, 70], [100], [50, 50], [80, 20]], aspectRatio: '4:5' },
  
  // Mobile Optimized
  { id: 'mobile-vertical', name: 'Mobile Vertical', category: 'comic', description: 'Mobile-friendly vertical layout', layout: [[100], [100], [50, 50], [100]], aspectRatio: '9:16' },
  { id: 'mobile-square', name: 'Mobile Square', category: 'comic', description: 'Square format for social media', layout: [[50, 50], [100], [50, 50]], aspectRatio: '1:1' },
  
  // Creative/Experimental
  { id: 'circular-flow', name: 'Circular Flow', category: 'comic', description: 'Experimental circular panel arrangement', layout: [[25, 50, 25], [100], [33, 33, 34]], aspectRatio: '1:1' },
  { id: 'diagonal-split', name: 'Diagonal Split', category: 'comic', description: 'Dynamic diagonal panel divisions', layout: [[60, 40], [40, 60], [100]], aspectRatio: '4:5' },
  { id: 'nested-panels', name: 'Nested Panels', category: 'comic', description: 'Panels within panels for complex storytelling', layout: [[100], [20, 60, 20], [50, 50]], aspectRatio: '4:5' },
];

interface LayoutPresetsProps {
  onSelectLayout: (layout: number[][]) => void;
  selectedLayoutId?: string;
}

export const LayoutPresets = ({ onSelectLayout, selectedLayoutId }: LayoutPresetsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('comic');

  const categories = [
    { id: 'comic', name: 'Comic', count: LAYOUT_PRESETS.filter(p => p.category === 'comic').length },
    { id: 'manga', name: 'Manga', count: LAYOUT_PRESETS.filter(p => p.category === 'manga').length },
    { id: 'webtoon', name: 'Webtoon', count: LAYOUT_PRESETS.filter(p => p.category === 'webtoon').length },
    { id: 'magazine', name: 'Magazine', count: LAYOUT_PRESETS.filter(p => p.category === 'magazine').length },
    { id: 'novel', name: 'Novel', count: LAYOUT_PRESETS.filter(p => p.category === 'novel').length },
  ];

  const filteredPresets = LAYOUT_PRESETS.filter(preset => preset.category === selectedCategory);

  const renderLayoutPreview = (layout: number[][]) => {
    return (
      <div className="w-full h-16 bg-muted rounded border-2 border-border p-1 flex flex-col gap-0.5">
        {layout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-0.5 flex-1">
            {row.map((width, colIndex) => (
              <div
                key={colIndex}
                className="bg-primary/20 rounded-sm"
                style={{ flex: `0 0 ${width}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Layout Presets</CardTitle>
        <CardDescription>
          Choose from {LAYOUT_PRESETS.length} professional layout templates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <ScrollArea className="h-64">
                <div className="grid grid-cols-2 gap-3 p-2">
                  {filteredPresets.map((preset) => (
                    <Card
                      key={preset.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedLayoutId === preset.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => onSelectLayout(preset.layout)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          {renderLayoutPreview(preset.layout)}
                          <div>
                            <h4 className="font-medium text-sm">{preset.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {preset.description}
                            </p>
                            {preset.aspectRatio && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {preset.aspectRatio}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};