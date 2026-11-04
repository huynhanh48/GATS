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

const files = walk('./src/app/admin');
// Also add some specific components outside admin
files.push('./src/components/Breadcrumbs/Breadcrumb.tsx');
files.push('./src/components/Layouts/video-upload-hud.tsx');
files.push('./src/components/Auth/Signin/index.tsx');
files.push('./src/components/Auth/Signup/index.tsx');
files.push('./src/app/(without-layout)/auth/sign-in/page.tsx');
files.push('./src/app/(without-layout)/auth/sign-up/page.tsx');

let count = 0;
files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace router.push("/...") with router.push("/admin/...")
  content = content.replace(/router\.push\("(\/(?!admin)[^"]*)"\)/g, 'router.push("/admin$1")');
  
  // Replace router.push(`/...`) with router.push(`/admin/...`)
  content = content.replace(/router\.push\(`(\/(?!admin)[^`]*?)`\)/g, 'router.push(`/admin$1`)');
  
  // Replace revalidatePath("/...") with revalidatePath("/admin/...")
  content = content.replace(/revalidatePath\("(\/(?!admin)[^"]*)"\)/g, 'revalidatePath("/admin$1")');
  
  // Replace revalidatePath(`/...`) with revalidatePath(`/admin/...`)
  content = content.replace(/revalidatePath\(`(\/(?!admin)[^`]*?)`\)/g, 'revalidatePath(`/admin$1`)');

  // Replace href="/" or href="/video" etc
  // We need to be careful with href="/" to only change specific ones
  // We'll replace href="/" with href="/admin"
  if (file.includes('Breadcrumb.tsx') || file.includes('chats-card.tsx') || file.includes('sign-in/page.tsx') || file.includes('sign-up/page.tsx')) {
    content = content.replace(/href="\/"/g, 'href="/admin"');
  }

  // In video-upload-hud.tsx
  if (file.includes('video-upload-hud.tsx')) {
    content = content.replace(/href="\/video"/g, 'href="/admin/video"');
  }
  
  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log('Updated ' + file);
  }
});
console.log('Total files updated: ' + count);
