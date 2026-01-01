import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Image, Clock, CheckCircle, XCircle, Pause } from 'lucide-react';
import { GenerationJob } from '@/types';
import { toast } from 'sonner';

interface GenerationQueueProps {
  jobs: GenerationJob[];
  onCancelJob?: (jobId: string) => void;
  onRetryJob?: (jobId: string) => void;
  onRemoveJob?: (jobId: string) => void;
}

export const GenerationQueue: React.FC<GenerationQueueProps> = ({
  jobs,
  onCancelJob,
  onRetryJob,
  onRemoveJob
}) => {
  const getStatusColor = (status: GenerationJob['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'generating': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'failed': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'canceled': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: GenerationJob['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'generating': return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'canceled': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const activeJobs = jobs.filter(job => job.status === 'pending' || job.status === 'generating');
  const completedJobs = jobs.filter(job => job.status === 'completed' || job.status === 'failed' || job.status === 'canceled');

  if (jobs.length === 0) {
    return (
      <Card className="bg-muted/20 border-dashed border-border">
        <CardContent className="text-center py-8">
          <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No generation jobs yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activeJobs.length > 0 && (
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-foreground">Active Generations</CardTitle>
            <CardDescription className="text-xs">
              {activeJobs.length} job{activeJobs.length !== 1 ? 's' : ''} in progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border">
                <div className="flex-shrink-0">
                  {getStatusIcon(job.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(job.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground truncate">
                    {job.prompt}
                  </p>
                  {job.status === 'generating' && (
                    <Progress value={75} className="h-1 mt-2" />
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {(job.status === 'pending' || job.status === 'generating') && onCancelJob && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onCancelJob(job.id);
                        toast.info('Generation canceled');
                      }}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {completedJobs.length > 0 && (
        <Card className="bg-background border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-foreground">Recent Results</CardTitle>
            <CardDescription className="text-xs">
              {completedJobs.length} completed job{completedJobs.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <div className="flex-shrink-0">
                  {job.status === 'completed' && job.imageUrl ? (
                    <img
                      src={job.imageUrl}
                      alt="Generated"
                      className="w-12 h-12 object-cover rounded border border-border"
                    />
                  ) : (
                    getStatusIcon(job.status)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(job.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground truncate">
                    {job.prompt}
                  </p>
                  {job.aspectRatio && (
                    <p className="text-xs text-muted-foreground">
                      {job.aspectRatio} • {job.outputFormat?.toUpperCase()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {job.status === 'failed' && onRetryJob && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetryJob(job.id)}
                      className="h-8 px-2 text-xs text-primary hover:text-primary-glow"
                    >
                      Retry
                    </Button>
                  )}
                  {onRemoveJob && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveJob(job.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};