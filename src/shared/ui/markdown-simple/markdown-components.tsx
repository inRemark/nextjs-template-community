import React from 'react';

// Markdown component definitions
export const MarkdownH1 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className="text-xl font-bold mb-3 text-foreground border-b pb-2" {...props}>
    {children}
  </h1>
);

export const MarkdownH2 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="text-lg font-semibold mb-2.5 mt-5 text-foreground" {...props}>
    {children}
  </h2>
);

export const MarkdownH3 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className="text-base font-semibold mb-2 mt-4 text-foreground" {...props}>
    {children}
  </h3>
);

export const MarkdownP = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="mb-3.5 text-foreground leading-relaxed" {...props}>
    {children}
  </p>
);

export const MarkdownUl = ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className="mb-3.5 ml-5 list-disc text-foreground" {...props}>
    {children}
  </ul>
);

export const MarkdownOl = ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
  <ol className="mb-3.5 ml-5 list-decimal text-foreground" {...props}>
    {children}
  </ol>
);

export const MarkdownLi = ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li className="mb-0.5 text-foreground leading-relaxed" {...props}>
    {children}
  </li>
);

export const MarkdownStrong = ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <strong className="font-semibold text-foreground" {...props}>
    {children}
  </strong>
);

export const MarkdownEm = ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <em className="italic text-foreground" {...props}>
    {children}
  </em>
);

export const MarkdownCode = ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <code className="bg-muted px-1.5 py-0.5 rounded text-[13px] font-mono text-foreground" {...props}>
    {children}
  </code>
);

export const MarkdownPre = ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
  <pre className="bg-muted p-3.5 rounded-lg overflow-x-auto mb-3.5 text-[13px]" {...props}>
    {children}
  </pre>
);

export const MarkdownBlockquote = ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
  <blockquote className="border-l-4 border-primary pl-3.5 italic text-muted-foreground mb-3.5 text-sm" {...props}>
    {children}
  </blockquote>
);

export const MarkdownTable = ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="overflow-x-auto mb-4">
    <table className="min-w-full border border-border rounded-lg" {...props}>
      {children}
    </table>
  </div>
);

export const MarkdownTh = ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className="border border-border px-4 py-2 bg-muted font-semibold text-left" {...props}>
    {children}
  </th>
);

export const MarkdownTd = ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className="border border-border px-4 py-2" {...props}>
    {children}
  </td>
);
