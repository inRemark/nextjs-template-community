import { MarkdownRenderer } from '@/shared/ui/markdown-simple/markdown-renderer';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export default async function CookiePolicyPage() {
  const filePath = path.join(process.cwd(), 'docs/legal/cookie-policy.md');
  const markdownContent = await fs.readFile(filePath, 'utf8');

  return (
    <MarkdownRenderer
      title="Cookie Policy"
      description="Understand how AICoder uses cookies and similar technologies"
      content={markdownContent}
    />
  );
}
