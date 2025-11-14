import { MarkdownRenderer } from '@/shared/ui/markdown-simple/markdown-renderer';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export default async function PrivacyPolicyPage() {
  const filePath = path.join(process.cwd(), 'docs/legal/privacy-policy.md');
  const markdownContent = await fs.readFile(filePath, 'utf8');

  return (
    <MarkdownRenderer
      title="Privacy Policy"
      description="Understand how AICoder collects, uses, and protects your personal information"
      content={markdownContent}
    />
  );
}
