import fs from 'fs';
import path from 'path';

const dir = 'supabase/functions/outbox-processor/portal';

function processDir(d) {
  const files = fs.readdirSync(d);
  for (const f of files) {
    const fullPath = path.join(d, f);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace supabase import
      content = content.replace(/import \{ supabase \} from '.*?lib\/supabase';/g, `import { createClient } from "@supabase/supabase-js";\nconst supabaseUrl = Deno.env.get("SUPABASE_URL") || "";\nconst supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";\nconst supabase = createClient(supabaseUrl, supabaseServiceKey);`);
      
      // Replace local imports to add .ts
      content = content.replace(/from '(\.\/.*?)'/g, (match, p1) => {
        if (!p1.endsWith('.ts') && !p1.endsWith('.tsx')) {
          return `from '${p1}.ts'`;
        }
        return match;
      });
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(dir);
console.log('Fixed Deno imports');
