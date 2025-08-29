import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import UserMenu from '@/components/UserMenu';
import { Plus, Package, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Prop {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  tags: string[];
  createdAt: Date;
}

const Props = () => {
  const [props, setProps] = useState<Prop[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    tags: ''
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a prop name');
      return;
    }

    const newProp: Prop = {
      id: crypto.randomUUID(),
      name: formData.name,
      category: formData.category || 'General',
      description: formData.description,
      imageUrl: '',
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date()
    };

    setProps(prev => [...prev, newProp]);
    setFormData({ name: '', category: '', description: '', tags: '' });
    setIsCreating(false);
    toast.success(`Prop "${newProp.name}" created successfully!`);
  }, [formData]);

  const deleteProp = useCallback((id: string) => {
    setProps(prev => prev.filter(p => p.id !== id));
    toast.success('Prop deleted successfully!');
  }, []);

  const categories = Array.from(new Set(props.map(p => p.category)));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Props & Objects
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your collection of objects, weapons, vehicles, and other props
            </p>
          </div>
          <UserMenu />
        </div>

        <div className="mb-6">
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Prop
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Prop</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Prop Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Magic Sword, Vintage Car"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Weapons, Vehicles, Furniture"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the prop's appearance, materials, special features..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="medieval, fantasy, glowing, ornate (comma-separated)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reference Images</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Click to upload reference images</p>
                    <p className="text-xs text-muted-foreground mt-1">Support for PNG, JPG, WebP (max 5MB each)</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Prop</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Props Grid */}
        <div className="space-y-6">
          {categories.length > 0 && categories.map(category => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {props.filter(prop => prop.category === category).map(prop => (
                  <Card key={prop.id} className="relative group">
                    <CardContent className="p-4">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteProp(prop.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                        {prop.imageUrl ? (
                          <img
                            src={prop.imageUrl}
                            alt={prop.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      <h3 className="font-semibold mb-2">{prop.name}</h3>
                      
                      {prop.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {prop.description}
                        </p>
                      )}

                      {prop.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {prop.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {props.length === 0 && !isCreating && (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Props Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your prop library by adding objects, weapons, vehicles, and other items.
                </p>
                <Button onClick={() => setIsCreating(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Prop
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Props;