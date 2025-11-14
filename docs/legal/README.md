# Legal Documents

This directory contains legal documentation for the application in Markdown format.

## Files

- `privacy-policy.md` - Privacy Policy
- `cookie-policy.md` - Cookie Policy  
- `terms-of-service.md` - Terms of Service

## Usage

These Markdown files are read at runtime by the Next.js server and rendered on the corresponding pages:

- `/[locale]/about/privacy` → `privacy-policy.md`
- `/[locale]/about/cookies` → `cookie-policy.md`
- `/[locale]/about/terms` → `terms-of-service.md`

## Editing

To update legal content:

1. Edit the corresponding `.md` file in this directory
2. Save the file
3. Changes will be reflected immediately (no rebuild required in development)
4. For production, redeploy the application

## File Format

Files use standard Markdown syntax with support for:

- Headings
- Lists
- Bold/Italic text
- Links
- Code blocks
- Tables
- And more via `remark-gfm` and `rehype-highlight`

## Deployment

Ensure this `docs/` directory is included in your deployment:

### Docker

```dockerfile
COPY docs/ /app/docs/
```

### Vercel/Netlify

These platforms automatically include all project files.

### Manual Deployment

Make sure to copy the entire `docs/` folder to your production server.
