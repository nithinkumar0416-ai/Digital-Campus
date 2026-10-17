const fs = require('fs');
const path = require('path');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  let errors = 0;
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== '.system_generated') {
        errors += checkDir(full);
      }
    } else if (f.endsWith('.html')) {
      const content = fs.readFileSync(full, 'utf8');
      const hrefMatches = content.matchAll(/(?:href|src)=["']([^"'#?]+)["']/g);
      for (const m of hrefMatches) {
        const link = m[1];
        if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('data:') || link.startsWith('javascript:')) continue;
        const target = path.resolve(dir, link);
        if (!fs.existsSync(target)) {
          console.error(`[BROKEN] in ${path.relative('.', full)} -> ${link}`);
          errors++;
        }
      }
    }
  }
  return errors;
}

const errs = checkDir('.');
console.log('Validation finished. Total broken references: ' + errs);
if (errs === 0) {
  console.log('ALL HTML LINKS AND ASSETS VERIFIED 100% OK!');
}
