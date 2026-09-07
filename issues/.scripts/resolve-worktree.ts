// Usage: bun issues/.scripts/resolve-worktree.ts <name>
// Validate the named managed worktree exists.
// Output (on success): JSON with { name, path, branch }
// Exit codes: 0=success, 1=error
import { execFileSync } from "child_process";
import { listManagedWorktrees, readConfig, resolveManagedWorktree } from "./lifecycle.ts";

const name = process.argv[2];
const execRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const config = readConfig(execRoot);

if (!name) {
  console.error("Usage: resolve-worktree.ts <worktree-name>");
  process.exit(1);
}

const match = resolveManagedWorktree(execRoot, config, name);

if (!match) {
  console.error(`Worktree "${name}" not found in git worktree list.`);
  const managed = listManagedWorktrees(execRoot, config);
  if (managed.length > 0) {
    console.error("Available:");
    for (const wt of managed) {
      console.error(`  ${wt.name}`);
    }
  }
  process.exit(1);
}

console.log(
  JSON.stringify({
    name: match.name,
    path: match.path,
    branch: match.branch,
  })
);
