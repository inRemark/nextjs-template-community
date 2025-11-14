import React from 'react';
import { cn } from '@shared/utils';

// Timeline
export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'default' | 'success' | 'warning' | 'error';
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

// Timeline
export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn("relative", className)}>
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      
      <div className="space-y-6">
        {items.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

interface TimelineItemProps {
  item: TimelineItem;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item }) => {
  const getTypeColor = (type: TimelineItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-500';
      case 'warning':
        return 'bg-yellow-500 border-yellow-500';
      case 'error':
        return 'bg-red-500 border-red-500';
      default:
        return 'bg-blue-500 border-blue-500';
    }
  };

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <div 
        className={cn(
          "absolute left-2 w-4 h-4 rounded-full border-2 -translate-x-1/2",
          getTypeColor(item.type)
        )}
      />

      {/* Timeline content */}
      <div className="bg-card border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <time className="text-sm text-muted-foreground">
            {item.timestamp.toLocaleDateString('zh-CN')}
          </time>
        </div>
        <p className="text-muted-foreground">{item.description}</p>
      </div>
    </div>
  );
};

// Data List
export const DataList: React.FC<{ 
  items: Array<{ id: string; label: string; value: string; }>;
  className?: string;
}> = ({ items, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {items.map(item => (
        <div key={item.id} className="flex justify-between py-2 border-b">
          <span className="font-medium">{item.label}</span>
          <span className="text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
};