import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export interface MarkdownFile<T = Record<string, any>> {
  slug: string;
  frontmatter: T;
  content: string;
}

/**
 * reads and parses a single Markdown file
 */
export async function loadMarkdownFile<T = Record<string, any>>(
  filePath: string
): Promise<MarkdownFile<T>> {
  const content = await fs.readFile(filePath, 'utf8');
  const { data, content: markdownContent } = matter(content);
  
  const slug = path.basename(filePath, '.md');
  
  return {
    slug,
    frontmatter: data as T,
    content: markdownContent,
  };
}

/**
 * get all Markdown files in a directory
 */
export async function loadMarkdownFiles<T = Record<string, any>>(
  dirPath: string,
  recursive = false
): Promise<MarkdownFile<T>[]> {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const markdownFiles: MarkdownFile<T>[] = [];

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory() && recursive) {
        const subFiles = await loadMarkdownFiles<T>(fullPath, recursive);
        markdownFiles.push(...subFiles);
      } else if (file.isFile() && file.name.endsWith('.md')) {
        const mdFile = await loadMarkdownFile<T>(fullPath);
        markdownFiles.push(mdFile);
      }
    }

    return markdownFiles;
  } catch {
    // if directory does not exist or other error, return empty array
    return [];
  }
}

/**
 * checks if a file exists at the given path
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
