// Usage: bun issues/.scripts/create-worktree.ts <name>
// Create the configured managed worktree for the issue name.
// Exit codes: 0=success, 1=error
import { execFileSync, spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { branchForSlug, readConfig } from "./lifecycle.ts";

interface WorktreeEntry {
  path: string;
  branch: string;
}

const name = process.argv[2];
if (!name || process.argv.length !== 3) {
  console.error("Usage: create-worktree.ts <worktree-name>");
  process.exit(1);
}

const execRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const config = readConfig(execRoot);
const branch = branchForSlug(name, config);
const dir = path.join(execRoot, config.worktree_root, name);

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/").replace(/\/$/, "");
}

function branchName(ref: string): string {
  return ref.replace("refs/heads/", "");
}

function parseWorktrees(raw: string): WorktreeEntry[] {
  const entries: WorktreeEntry[] = [];
  let current: { path?: string; branch?: string } = {};

  for (const line of raw.split("\n")) {
    if (line.startsWith("worktree ")) {
      current = { path: line.slice("worktree ".length).trim() };
    } else if (line.startsWith("branch ")) {
      current.branch = line.slice("branch ".length).trim();
    } else if (line === "") {
      if (current.path && current.branch) {
        entries.push({ path: current.path, branch: current.branch });
      }
      current = {};
    }
  }

  if (current.path && current.branch) {
    entries.push({ path: current.path, branch: current.branch });
  }

  return entries;
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function gitSucceeds(args: string[]): boolean {
  return spawnSync("git", args, { stdio: ["ignore", "ignore", "ignore"] }).status === 0;
}

function runGit(args: string[]): void {
  const result = spawnSync("git", args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed for worktree "${name}" at ${dir} on branch "${branch}"`);
  }
}

const normalizedDir = normalizePath(path.resolve(dir));
const entries = parseWorktrees(execFileSync("git", ["worktree", "list", "--porcelain"], { encoding: "utf8" }));
const exact = entries.find((entry) => normalizePath(path.resolve(entry.path)) === normalizedDir && branchName(entry.branch) === branch);
if (exact !== undefined) {
  console.log(JSON.stringify({ name, path: normalizePath(path.relative(execRoot, exact.path)), branch }));
  process.exit(0);
}

const pathConflict = entries.find((entry) => normalizePath(path.resolve(entry.path)) === normalizedDir);
if (pathConflict !== undefined) {
  fail(`Worktree path conflict for "${name}": expected ${dir} on branch ${branch}, found branch ${branchName(pathConflict.branch)}.`);
}

const branchConflict = entries.find((entry) => branchName(entry.branch) === branch);
if (branchConflict !== undefined) {
  fail(`Worktree branch conflict for "${name}": expected ${branch} at ${dir}, found at ${branchConflict.path}.`);
}

fs.mkdirSync(path.dirname(dir), { recursive: true });
if (gitSucceeds(["rev-parse", "--verify", `refs/heads/${branch}`])) {
  runGit(["worktree", "add", dir, branch]);
} else {
  runGit(["worktree", "add", "-b", branch, dir, "HEAD"]);
}

console.log(JSON.stringify({ name, path: normalizePath(path.relative(execRoot, dir)), branch }));
