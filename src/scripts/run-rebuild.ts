import './deno-shim.ts';
import { ProjectionManager } from './projection-manager';

async function main() {
  console.log("Starting projection rebuild...");
  try {
    await ProjectionManager.rebuildAll();
    console.log("Rebuild complete!");
  } catch (error) {
    console.error("Rebuild failed:", error);
  }
}

main();
