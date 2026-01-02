# Dual Deployment: Lovable + GitHub Pages

This guide explains how to deploy Meku Storybook Builder to both Lovable's platform AND GitHub Pages simultaneously.

## The Challenge

Lovable and GitHub Pages have different base URL requirements:
- **Lovable**: Uses root path `/`
- **GitHub Pages**: Uses repo name path `/MeKu-Storybook-Builder/`

## Solution: Build Mode Configuration

The `vite.config.ts` is configured to use different base paths based on the build mode:

```typescript
const base = mode === 'ghpages' 
  ? '/MeKu-Storybook-Builder/' 
  : '/';
```

## Build Commands

| Command | Output | Use For |
|---------|--------|---------|
| `npm run build` | `/dist` with base `/` | Lovable deployment |
| `npm run build:ghpages` | `/dist` with base `/MeKu-Storybook-Builder/` | GitHub Pages |

## Deployment Workflows

### For Lovable
Just push to your repo - Lovable handles the build automatically using `npm run build`.

### For GitHub Pages

#### Option 1: Manual Deploy
```bash
npm run build:ghpages
# Then deploy the /dist folder to gh-pages branch
```

#### Option 2: GitHub Actions (Recommended)
The `.github/workflows/static.yml` file handles automatic deployment when you push to main.

Make sure your workflow uses the ghpages build:
```yaml
- name: Build
  run: npm run build:ghpages
```

## GitHub Pages Setup

1. Go to your repo **Settings** → **Pages**
2. Set **Source** to "GitHub Actions" (or "Deploy from a branch" if using gh-pages branch)
3. Your site will be available at `https://[username].github.io/MeKu-Storybook-Builder/`

## Testing Locally

```bash
# Test Lovable build
npm run build && npm run preview

# Test GitHub Pages build  
npm run build:ghpages && npm run preview
```

## Important Notes

### Router Configuration
The app uses client-side routing with `react-router-dom`. The `404.html` and SPA redirect script in `index.html` handle this for GitHub Pages.

### Asset Paths
Always use:
- The `@/` alias for imports: `import { Button } from '@/components/ui/button'`
- Relative paths or public folder for static assets

Avoid absolute paths starting with `/` in your code.

### Environment Variables
Create separate `.env` files if needed:
- `.env` - For local development
- `.env.production` - For Lovable builds
- `.env.ghpages` - For GitHub Pages builds (if needed)

## Troubleshooting

### Blank page on GitHub Pages?
- Check that `vite.config.ts` has the correct base path for ghpages mode
- Verify the build command used `--mode ghpages`
- Check browser console for 404 errors on assets

### Routes not working on GitHub Pages?
- Ensure `public/404.html` exists and redirects to `index.html`
- Verify the SPA script is in `index.html`

### Assets not loading?
- Make sure you're not using absolute `/` paths in your code
- Check that the base path matches your repo name exactly (case-sensitive)
