const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const componentsDir = path.join(projectRoot, 'src', 'components');
const pagesDir = path.join(projectRoot, 'src', 'pages');

function walk(dir) {
  const files = [];
  (function _walk(d) {
    if (!fs.existsSync(d)) return files;
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) _walk(p);
      else if (stat.isFile() && /\.js$/.test(p)) files.push(p);
    }
  })(dir);
  return files;
}

const compFiles = walk(componentsDir);
const compNames = compFiles.map(f => path.relative(componentsDir, f).replace(/\\/g, '/').replace(/\.js$/, ''));

const pageFiles = walk(pagesDir);

const pageContents = pageFiles.map(p => ({ path: path.relative(projectRoot, p), txt: fs.readFileSync(p, 'utf8') }));

const usage = {};
for (const comp of compNames) usage[comp] = [];

for (const { path: pagePath, txt } of pageContents) {
  for (const comp of compNames) {
    // match import path that references components folder
    const pathRegex = new RegExp(`from\\s+['"\`].*(components|/components|\\.\\./components|\\.\\/components)[/\\\\]${escapeRegExp(comp)}(?:\\.js)?['"\`]`, 'i');
    // match import by identifier (e.g., "import Header from '...';" or "import { Header } from '...';")
    const id = path.basename(comp);
    const importNameRegex = new RegExp(`import\\s+(?:.+\\b${escapeRegExp(id)}\\b.+)from`, 'm');
    // match JSX usage as fallback
    const jsxRegex = new RegExp(`<${escapeRegExp(id)}(?:\\s|>)`);
    if (pathRegex.test(txt) || importNameRegex.test(txt) || jsxRegex.test(txt)) {
      usage[comp].push(pagePath);
    }
  }
}

function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

const used = Object.entries(usage).filter(([, pages]) => pages.length).sort((a,b) => a[0].localeCompare(b[0]));
const unused = Object.entries(usage).filter(([, pages]) => pages.length === 0).map(([k]) => k).sort();

console.log('Pages scanned:', pageFiles.length);
console.log('Components scanned:', compNames.length);
console.log('\\nUsed components and pages:');
for (const [comp, pages] of used) {
  console.log(`- ${comp}:`);
  for (const p of Array.from(new Set(pages))) console.log(`    - ${p}`);
}
console.log('\\nUnused components:');
for (const u of unused) console.log(`- ${u}`);