import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YAML_PATH = path.join(__dirname, '../authorization/permissions.yaml');
const TS_PATH = path.join(__dirname, '../src/auth/permissions.ts');
const MD_PATH = path.join(__dirname, '../authorization/permissions.md');

// Load YAML
const fileContents = fs.readFileSync(YAML_PATH, 'utf8');
const data = yaml.load(fileContents);
const permissions = data.permissions;

// --- 1. Generate TypeScript ---
let tsContent = `// =============================================================================
// TECH AMBIANCE STUDIOHQ — ENTERPRISE PERMISSION SYSTEM
// =============================================================================
//
// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// 
// This file is generated from \`authorization/permissions.yaml\`.
// Run \`node scripts/generate_permissions.js\` to update.
//
// =============================================================================

export const Permission = {
`;

const modules = new Set();
const metadataRecord = [];

permissions.forEach(p => {
  modules.add(p.module);
  const keyName = p.id.replace(':', '_').toUpperCase();
  tsContent += `  ${keyName}: '${p.id}',\n`;
  
  metadataRecord.push(`  '${p.id}': { id: '${p.id}', name: '${p.name}', description: '${p.description.replace(/'/g, "\\'")}', module: '${p.module}'${p.dangerous ? ', dangerous: true' : ''} },`);
});

tsContent += `} as const;\n\n`;

tsContent += `export type PermissionId = typeof Permission[keyof typeof Permission];\n\n`;

const modulesList = Array.from(modules).map(m => `'${m}'`).join(' | ');
tsContent += `export interface PermissionMetadata {
  id: PermissionId;
  name: string;
  description: string;
  module: ${modulesList};
  dangerous?: boolean;
}

export const PERMISSION_METADATA: Record<PermissionId, PermissionMetadata> = {
${metadataRecord.join('\n')}
};

// =========================================================================
// End of auto-generated file
// =========================================================================
`;

fs.writeFileSync(TS_PATH, tsContent);
console.log('✅ Generated src/auth/permissions.ts');

// --- 2. Generate Markdown ---
let mdContent = `# StudioHQ Permissions Dictionary\n\n`;
mdContent += `> **Auto-generated from \`authorization/permissions.yaml\`**\n\n`;

modules.forEach(module => {
  mdContent += `## ${module}\n\n`;
  mdContent += `| ID | Name | Description | Dangerous |\n`;
  mdContent += `|---|---|---|---|\n`;
  
  const modPerms = permissions.filter(p => p.module === module);
  modPerms.forEach(p => {
    mdContent += `| \`${p.id}\` | ${p.name} | ${p.description} | ${p.dangerous ? '⚠️ Yes' : 'No'} |\n`;
  });
  mdContent += `\n`;
});

fs.writeFileSync(MD_PATH, mdContent);
console.log('✅ Generated authorization/permissions.md');
