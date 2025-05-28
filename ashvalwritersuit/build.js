
const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

const outDir = 'dist';

async function build() {
  console.log('Starting frontend build...');

  // Clean previous build
  try {
    await fs.emptyDir(outDir);
    console.log(`Cleaned ${outDir} directory.`);
  } catch (e) {
    console.error(`Error cleaning ${outDir}:`, e);
    process.exit(1);
  }

  // Copy index.html to dist
  try {
    await fs.copy('index.html', path.join(outDir, 'index.html'));
    console.log(`Copied index.html to ${outDir}.`);
  } catch (e) {
    console.error('Error copying index.html:', e);
    process.exit(1);
  }

  // Copy metadata.json to dist
  try {
    await fs.copy('metadata.json', path.join(outDir, 'metadata.json'));
    console.log(`Copied metadata.json to ${outDir}.`);
  } catch (e) {
    console.error('Error copying metadata.json:', e);
    process.exit(1);
  }

  // Modify the copied index.html to point to index.js
  try {
    const indexPath = path.join(outDir, 'index.html');
    let htmlContent = await fs.readFile(indexPath, 'utf8');
    htmlContent = htmlContent.replace(
      '<script type="module" src="/index.tsx"></script>',
      '<script type="module" src="/index.js"></script>'
    );
    await fs.writeFile(indexPath, htmlContent, 'utf8');
    console.log(`Updated script path in ${indexPath} to /index.js.`);
  } catch (e) {
    console.error('Error updating script path in dist/index.html:', e);
    process.exit(1);
  }

  // Build index.tsx
  try {
    const result = await esbuild.build({
      entryPoints: ['index.tsx'],
      bundle: true,
      outfile: path.join(outDir, 'index.js'),
      minify: true,
      sourcemap: 'external', // 'inline' or false for smaller production builds
      platform: 'browser',
      format: 'esm', // Ensure ES Module output for script type="module"
      jsx: 'automatic', // Use automatic JSX runtime
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        // Add other loaders if necessary (e.g., .css, .svg)
      },
      define: {
        // Ensure process.env.NODE_ENV is set for React's production optimizations
        'process.env.NODE_ENV': '"production"',
        // Define REACT_APP_BACKEND_API_URL if it's set in the build environment
        // This allows configuring the backend URL at build time.
        'process.env.REACT_APP_BACKEND_API_URL': JSON.stringify(process.env.REACT_APP_BACKEND_API_URL || ''),
        // Inject API_KEY for frontend Gemini API calls
        'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
      },
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'lucide-react',
        '@google/genai'
      ],
      // Splitting can be enabled for larger apps, but for now, a single bundle is simpler.
      // splitting: true,
      // chunkNames: 'chunks/[name]-[hash]',

      // To handle React 19's ESM.sh imports correctly, ensure esbuild can resolve them.
      // If there are issues, specific configurations for shims or resolving might be needed.
    });

    if (result.errors.length > 0) {
      console.error('Frontend build failed with errors:', result.errors);
      process.exit(1);
    }
    if (result.warnings.length > 0) {
      console.warn('Frontend build has warnings:', result.warnings);
    }

    console.log('Frontend build successful!');
    console.log(`Output directory: ${path.resolve(outDir)}`);

  } catch (e) {
    console.error('Frontend build failed:', e);
    process.exit(1);
  }
}

build();
