// src/components/MiniDevTools/panels/LogsPanel.tsx
// Mëku Storybook Studio v2.1.0
// DevTools logging panel with filtering

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Trash2, 
  Search,
  CheckCircle
} from 'lucide-react';
import { useDevLogsStore, LogLevel } from '@/stores/devLogsStore';
import { cn } from '@/lib/utils';

const LEVEL_CONFIG: Record<LogLevel, { icon: React.ElementType; color: string; bgColor: string }> = {
  info: { 
    icon: Info, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/10 border-blue-500/20' 
  },
  warn: { 
    icon: AlertTriangle, 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/10 border-amber-500/20' 
  },
  error: { 
    icon: AlertCircle, 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/10 border-red-500/20' 
  },
};

export function LogsPanel() {
  const { logs, clearLogs, markAllRead, errorCount, warnCount } = useDevLogsStore();
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesFilter = filter === 'all' || log.level === filter;
      const matchesSearch = search === '' || 
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.source?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [logs, filter, search]);

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header with stats */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-foreground">Logs</h3>
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {errorCount} error{errorCount > 1 ? 's' : ''}
            </Badge>
          )}
          {warnCount > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
              {warnCount} warning{warnCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllRead}
            className="h-7 text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Mark Read
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearLogs}
            className="h-7 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-sm bg-background/50"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'error', 'warn', 'info'] as const).map((level) => (
            <Button
              key={level}
              variant={filter === level ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setFilter(level)}
            >
              {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Logs list */}
      <Card className="bg-card/50 border-border flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {logs.length === 0 ? 'No logs yet' : 'No matching logs'}
              </div>
            ) : (
              filteredLogs.map((log) => {
                const config = LEVEL_CONFIG[log.level];
                const Icon = config.icon;

                return (
                  <div
                    key={log.id}
                    className={cn(
                      'rounded-lg p-2 border text-sm',
                      config.bgColor,
                      !log.read && 'ring-1 ring-primary/30'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', config.color)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {log.source && (
                            <Badge variant="outline" className="text-xs py-0">
                              {log.source}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-foreground break-words">{log.message}</p>
                        {log.context && (
                          <pre className="mt-1 text-xs text-muted-foreground overflow-x-auto bg-background/50 p-1 rounded">
                            {typeof log.context === 'string' 
                              ? log.context 
                              : JSON.stringify(log.context, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
