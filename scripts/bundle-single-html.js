import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const publicDir = path.resolve('public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Match css link
const cssMatches = [...html.matchAll(/<link[^>]+href="\/assets\/([^"]+\.css)"[^>]*>/g)];
for (const match of cssMatches) {
  const cssFile = path.join(distDir, 'assets', match[1]);
  if (fs.existsSync(cssFile)) {
    const cssContent = fs.readFileSync(cssFile, 'utf8');
    html = html.replace(match[0], `<style>\n${cssContent}\n</style>`);
  }
}

// Match js script
const jsMatches = [...html.matchAll(/<script[^>]+src="\/assets\/([^"]+\.js)"[^>]*><\/script>/g)];
for (const match of jsMatches) {
  const jsFile = path.join(distDir, 'assets', match[1]);
  if (fs.existsSync(jsFile)) {
    const jsContent = fs.readFileSync(jsFile, 'utf8');
    // Escape any closing script tag inside the JS if any
    const safeJs = jsContent.replace(/<\/script>/gi, '<\\/script>');
    html = html.replace(match[0], `<script type="module">\n${safeJs}\n</script>`);
  }
}

// Save standalone HTML
const distTarget = path.join(distDir, 'Humanoid_Simulator_v1.0.html');
const publicTarget = path.join(publicDir, 'Humanoid_Simulator_v1.0.html');

fs.writeFileSync(distTarget, html, 'utf8');
fs.writeFileSync(publicTarget, html, 'utf8');

const sizeMb = (fs.statSync(publicTarget).size / (1024 * 1024)).toFixed(2);
console.log(`Successfully generated standalone HTML: ${publicTarget} (${sizeMb} MB)`);
