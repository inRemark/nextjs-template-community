import React from "react";

interface PageContentProps {
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  children: React.ReactNode;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full'
};

export const PageContent: React.FC<PageContentProps> = ({
  title,
  description,
  maxWidth = 'xl',
  children,
  className = ""
}) => {
  return (
    <div className={`bg-background min-h-full ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 py-6`}>
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
            )}
            {description && (
              <p className="text-xl text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};