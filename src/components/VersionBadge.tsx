// src/components/VersionBadge.tsx
// Mëku Storybook Studio v2.1.0
// Non-intrusive version display for footer or corner placement

import React from 'react';
import { Link } from 'react-router-dom';
import { APP_VERSION, APP_CODENAME } from '@/lib/version';
import { cn } from '@/lib/utils';

interface VersionBadgeProps {
  variant?: 'minimal' | 'full' | 'corner';
  className?: string;
  linkToAbout?: boolean;
}

export function VersionBadge({ 
  variant = 'minimal', 
  className,
  linkToAbout = true 
}: VersionBadgeProps) {
  const content = (
    <>
      {variant === 'minimal' && (
        <span className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          v{APP_VERSION}
        </span>
      )}
      
      {variant === 'full' && (
        <span className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          v{APP_VERSION} <span className="hidden sm:inline">"{APP_CODENAME}"</span>
        </span>
      )}
      
      {variant === 'corner' && (
        <div className="fixed bottom-4 right-4 z-40">
          <span className="px-2 py-1 text-xs rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground/70 hover:text-muted-foreground hover:border-border transition-all">
            v{APP_VERSION}
          </span>
        </div>
      )}
    </>
  );

  if (linkToAbout && variant !== 'corner') {
    return (
      <Link to="/about" className={cn('inline-block', className)}>
        {content}
      </Link>
    );
  }

  if (linkToAbout && variant === 'corner') {
    return (
      <Link to="/about" className={className}>
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}

export default VersionBadge;
