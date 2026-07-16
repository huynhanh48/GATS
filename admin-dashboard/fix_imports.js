const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

let count = 0;
files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace import paths that use @/app/(with-layout)/...
  content = content.replace(/@\/app\/\(with-layout\)/g, '@/app/admin');
  
  // Replace relative paths going up to (with-layout) just in case
  content = content.replace(/\/\(with-layout\)\//g, '/admin/');

  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log('Updated imports in ' + file);
  }
});
console.log('Total files updated: ' + count);
