import { MarkdownRenderer } from '@/shared/ui/markdown-simple/markdown-renderer';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export default async function TermsOfServicePage() {
  const filePath = path.join(process.cwd(), 'docs/legal/terms-of-service.md');
  const markdownContent = await fs.readFile(filePath, 'utf8');

  return (
    <MarkdownRenderer
      title="Terms of Service"
      description="Understand the terms and conditions of using AICoder"
      content={markdownContent}
    />
  );
}
