import fs from 'fs';
import path from 'path';

const REGISTRY_DIR = path.join(process.cwd(), 'src/auth/registry');

// Allowed dependencies: [file] can import [allowedFiles]
const ALLOWED_IMPORTS: Record<string, string[]> = {
  'permissions.ts': [],
  'sidebar.ts': ['permissions'],
  'routes.ts': ['permissions'],
  'widgets.tsx': ['permissions'],
  'actions.ts': ['permissions'],
  'actionBehavior.ts': ['actions'],
};

let hasErrors = false;

function verifyImmutability() {
  const files = fs.readdirSync(REGISTRY_DIR);

  files.forEach(file => {
    if (!ALLOWED_IMPORTS[file]) return;

    const content = fs.readFileSync(path.join(REGISTRY_DIR, file), 'utf8');
    const importRegex = /import\s+.*?\s+from\s+['"]\.\/([^'"]+)['"]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importedFile = match[1];
      if (!ALLOWED_IMPORTS[file].includes(importedFile)) {
        console.error(`❌ [ERROR] Circular/Forbidden Dependency: '${file}' illegally imports '${importedFile}'`);
        hasErrors = true;
      }
    }
  });

  if (hasErrors) {
    console.error('\n❌ Registry Immutability Verification Failed!');
    process.exit(1);
  } else {
    console.log('✅ Registry Immutability Verification Passed! No circular imports found.');
  }
}

verifyImmutability();
