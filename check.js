const fs = require('fs');
const { execSync } = require('child_process');

console.log('--- 1. Checking JS Syntax (app.js & i18n.js) ---');
try {
  execSync('node -c app.js', { stdio: 'inherit' });
  execSync('node -c i18n.js', { stdio: 'inherit' });
  console.log('PASS: app.js and i18n.js syntax are 100% valid.');
} catch (err) {
  console.error('FAIL: Syntax check failed!');
  process.exit(1);
}

console.log('\n--- 2. Checking HTML Tag Balance ---');
const html = fs.readFileSync('index.html', 'utf8');
const tagsToCheck = ['div', 'section', 'nav', 'aside', 'main', 'header', 'form', 'table', 'tbody', 'thead', 'button', 'select'];
let tagMismatch = false;

for (const tag of tagsToCheck) {
  const openRegex = new RegExp(`<${tag}(\\s+[^>]*)?>`, 'gi');
  const closeRegex = new RegExp(`</${tag}>`, 'gi');
  const opens = (html.match(openRegex) || []).length;
  const closes = (html.match(closeRegex) || []).length;
  if (opens !== closes) {
    console.error(`FAIL: Tag <${tag}> mismatch: ${opens} opened, ${closes} closed!`);
    tagMismatch = true;
  }
}
if (!tagMismatch) {
  console.log('PASS: All structural HTML tags are perfectly balanced.');
} else {
  process.exit(1);
}

console.log('\n--- 3. Checking i18n Key Coverage ---');
const vm = require('vm');
const sandbox = { window: {}, document: { querySelectorAll: () => [] } };
vm.createContext(sandbox);
const TRANSLATIONS = vm.runInContext(fs.readFileSync('i18n.js', 'utf8') + '\n;TRANSLATIONS;', sandbox);

const keys = Array.from(html.matchAll(/data-i18n="([^"]+)"/g)).map(m => m[1]);
const uniqueKeys = Array.from(new Set(keys));
console.log(`Found ${uniqueKeys.length} unique data-i18n keys in index.html.`);

let missingAny = false;
for (const lang of ['mr', 'hi', 'en']) {
  const missing = uniqueKeys.filter(k => !TRANSLATIONS[lang] || !TRANSLATIONS[lang][k]);
  if (missing.length > 0) {
    console.error(`FAIL: Language '${lang}' missing keys:`, missing);
    missingAny = true;
  } else {
    console.log(`PASS: Language '${lang}' covers 100% of keys.`);
  }
}

if (missingAny) {
  process.exit(1);
}

console.log('\n=======================================');
console.log('ALL HEALTH CHECKS PASSED SUCCESSFULLY! 🚀');
console.log('=======================================');
