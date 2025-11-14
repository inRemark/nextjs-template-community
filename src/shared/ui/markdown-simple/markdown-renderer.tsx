import React from 'react';
import { Card, CardContent } from '@shared/ui/card';
import { PortalLayout } from '@shared/layout/portal-layout';
import { PageContent } from '@/shared/layout/portal-page-content';
import { MarkdownContent } from './markdown-content';

interface MarkdownRendererProps {
  readonly title: string;
  readonly description?: string;
  readonly content: string;
}

export function MarkdownRenderer({ title, description, content }: MarkdownRendererProps) {
  return (
    <PortalLayout>
      <PageContent maxWidth="xl">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            {description && (
              <p className="text-muted-foreground text-lg">{description}</p>
            )}
          </div>
          
          <Card>
            <CardContent className="p-8">
              <MarkdownContent content={content} />
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PortalLayout>
  );
}
