import fs from 'fs';
import path from 'path';
import { Permission, PERMISSION_METADATA, AUTHORIZATION_FRAMEWORK_VERSION } from '../src/auth/registry/permissions';
import { ADMIN_ROUTES } from '../src/auth/registry/routes';
import { SIDEBAR_CONFIG } from '../src/auth/registry/sidebar';
import { DASHBOARD_WIDGETS } from '../src/auth/registry/widgets';
import { ACTION_REGISTRY } from '../src/auth/registry/actions';
import { ACTION_BEHAVIOR_REGISTRY } from '../src/auth/registry/actionBehavior';

let hasErrors = false;

function reportError(msg: string) {
  console.error(`❌ [ERROR] ${msg}`);
  hasErrors = true;
}

function checkUnique(items: string[], context: string) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item)) {
      reportError(`Duplicate ID found in ${context}: ${item}`);
    }
    seen.add(item);
  }
}

// Check 0: Version Consistency
const certPath = path.join(process.cwd(), 'docs', 'AUTHORIZATION_CERTIFICATION.md');
if (fs.existsSync(certPath)) {
  const certContent = fs.readFileSync(certPath, 'utf8');
  if (!certContent.includes(`Framework Version**: ${AUTHORIZATION_FRAMEWORK_VERSION}`)) {
    reportError(`Framework Version mismatch! permissions.ts claims ${AUTHORIZATION_FRAMEWORK_VERSION} but AUTHORIZATION_CERTIFICATION.md does not match.`);
  }
} else {
  reportError('AUTHORIZATION_CERTIFICATION.md not found');
}

// Check 1: Route Registry
const routePaths = ADMIN_ROUTES.map(r => r.path);
checkUnique(routePaths, 'Admin Routes (Paths)');

ADMIN_ROUTES.forEach(route => {
  if (route.path === undefined || !route.requiredPermission || !route.component) {
    reportError(`Route is missing mandatory metadata: ${JSON.stringify(route)}`);
  }
  if (!Object.values(Permission).includes(route.requiredPermission)) {
    reportError(`Route '${route.path}' uses invalid permission: ${route.requiredPermission}`);
  }
});

// Check 2: Sidebar Registry
const sidebarIds: string[] = [];
const sidebarRoutes: string[] = [];
SIDEBAR_CONFIG.forEach(section => {
  sidebarIds.push(section.id);
  section.items.forEach(item => {
    sidebarIds.push(item.id);
    sidebarRoutes.push(item.href.replace('/admin', '').replace(/^\//, ''));
    if (!item.id || !item.label || !item.href || !item.requiredPermission || !item.icon) {
      reportError(`Sidebar item is missing mandatory metadata: ${item.id}`);
    }
    if (!Object.values(Permission).includes(item.requiredPermission)) {
      reportError(`Sidebar item '${item.id}' uses invalid permission: ${item.requiredPermission}`);
    }
  });
});
checkUnique(sidebarIds, 'Sidebar (IDs)');

// Cross-registry: sidebar routes must exist in routes
sidebarRoutes.forEach(sr => {
  if (sr !== '' && !routePaths.includes(sr) && !routePaths.some(rp => sr.startsWith(rp.split('/')[0]))) {
    reportError(`Sidebar links to route '${sr}' which is not in Route Registry`);
  }
});

// Check 3: Widget Registry
const widgetIds = DASHBOARD_WIDGETS.map(w => w.id);
checkUnique(widgetIds, 'Dashboard Widgets (IDs)');
DASHBOARD_WIDGETS.forEach(w => {
  if (!w.id || !w.component || !w.requiredPermission) {
    reportError(`Widget is missing mandatory metadata: ${w.id}`);
  }
  if (!Object.values(Permission).includes(w.requiredPermission)) {
    reportError(`Widget '${w.id}' uses invalid permission: ${w.requiredPermission}`);
  }
});

// Check 4: Action Registry
const actionIds = Object.keys(ACTION_REGISTRY);
checkUnique(actionIds, 'Action Registry (IDs)');
Object.values(ACTION_REGISTRY).forEach(action => {
  if (!action.id || !action.requiredPermission) {
    reportError(`Action is missing mandatory metadata: ${action.id}`);
  }
  if (!Object.values(Permission).includes(action.requiredPermission)) {
    reportError(`Action '${action.id}' uses invalid permission: ${action.requiredPermission}`);
  }
});

// Check 5: Action Behavior Registry
const behaviorIds = Object.keys(ACTION_BEHAVIOR_REGISTRY);
behaviorIds.forEach(id => {
  if (!ACTION_REGISTRY[id]) {
    reportError(`ActionBehavior defined for '${id}' but it does not exist in ACTION_REGISTRY`);
  }
});

// Check 6: Permission Metadata
Object.values(Permission).forEach(p => {
  const meta = PERMISSION_METADATA[p];
  if (!meta) {
    reportError(`Permission '${p}' has no entry in PERMISSION_METADATA`);
  } else if (!meta.name || !meta.description || !meta.module) {
    reportError(`Permission '${p}' is missing mandatory metadata (name, description, or module)`);
  }
});

// Permission Coverage Report
console.log('\n--- Permission Coverage Report ---');
const coverage: Record<string, { routes: string[], sidebar: string[], widgets: string[], actions: string[] }> = {};
Object.values(Permission).forEach(p => {
  coverage[p] = { routes: [], sidebar: [], widgets: [], actions: [] };
});

ADMIN_ROUTES.forEach(r => { coverage[r.requiredPermission]?.routes.push(r.path); });
SIDEBAR_CONFIG.forEach(s => s.items.forEach(i => coverage[i.requiredPermission]?.sidebar.push(i.id)));
DASHBOARD_WIDGETS.forEach(w => { coverage[w.requiredPermission]?.widgets.push(w.id); });
Object.values(ACTION_REGISTRY).forEach(a => { coverage[a.requiredPermission]?.actions.push(a.id); });

let orphans = 0;
for (const [perm, usages] of Object.entries(coverage)) {
  const totalUses = usages.routes.length + usages.sidebar.length + usages.widgets.length + usages.actions.length;
  console.log(`\n${perm}:`);
  if (totalUses === 0) {
    console.log(`  ⚠️ ORPHAN`);
    orphans++;
  } else {
    if (usages.routes.length > 0) console.log(`  Routes:\n    ${usages.routes.join('\n    ')}`);
    if (usages.sidebar.length > 0) console.log(`  Sidebar:\n    ${usages.sidebar.join('\n    ')}`);
    if (usages.widgets.length > 0) console.log(`  Widgets:\n    ${usages.widgets.join('\n    ')}`);
    if (usages.actions.length > 0) console.log(`  Actions:\n    ${usages.actions.join('\n    ')}`);
  }
}

console.log(`\nTotal Permissions: ${Object.keys(coverage).length}`);
console.log(`Orphaned Permissions: ${orphans}`);

if (hasErrors) {
  console.error('\n❌ Architecture Verification Failed!');
  process.exit(1);
} else {
  console.log('\n✅ Architecture Verification Passed!');
}
