// Usage: bun issues/.scripts/prune-worktree.ts <name>
// Remove the configured managed worktree for the issue name.
// Exit codes: 0=success, 1=error
import { execFileSync, spawnSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { branchForSlug, isOwnedIssueArtifactPath, normalizeRepoPath, readConfig, resolveIssueArtifactOwnership, type IssueArtifactOwnership } from "./lifecycle.ts";

interface PruneResult {
  name: string;
  path: string;
  branch: string;
  forced: boolean;
}

function execGit(root: string, args: string[], env: NodeJS.ProcessEnv = process.env): void {
  execFileSync("git", ["-C", root, ...args], { stdio: "ignore", env });
}

function gitText(root: string, args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

function porcelainPaths(porcelainZ: string): string[] {
  const entries = porcelainZ.split("\0").filter((entry) => entry.length > 0);
  const paths: string[] = [];
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const status = entry.slice(0, 2);
    paths.push(normalizeRepoPath(entry.slice(3)));
    if (status.includes("R") || status.includes("C")) {
      index++;
      paths.push(normalizeRepoPath(entries[index]));
    }
  }
  return paths;
}

export function dirtOutsideBoundary(porcelainZ: string, ownership: IssueArtifactOwnership): string[] {
  return porcelainPaths(porcelainZ).filter((repoPath) => !isOwnedIssueArtifactPath(ownership, repoPath));
}

export function removeManagedWorktree(execRoot: string, name: string): PruneResult {
  const config = readConfig(execRoot);
  const branch = branchForSlug(name, config);
  const dir = path.join(execRoot, config.worktree_root, name);
  const ownership = resolveIssueArtifactOwnership(execRoot, name);
  const porcelain = gitText(dir, ["status", "--porcelain", "-z"]);
  const outside = dirtOutsideBoundary(porcelain, ownership);
  if (outside.length > 0) {
    throw new Error(`Refusing to remove dirty worktree ${JSON.stringify({ name, path: dir.replace(/\\/g, "/"), branch, offendingPaths: outside })}`);
  }

  const args = porcelain.length === 0 ? ["worktree", "remove", dir] : ["worktree", "remove", "--force", dir];
  const result = spawnSync("git", ["-C", execRoot, ...args], { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`git worktree remove failed for worktree "${name}" at ${dir} on branch "${branch}"`);
  }
  return { name, path: dir.replace(/\\/g, "/"), branch, forced: porcelain.length > 0 };
}

function writeFixtureFile(root: string, repoPath: string, content: string): void {
  const absolutePath = path.join(root, repoPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf8");
}

function createFixtureRepo(): { root: string; created: string; env: NodeJS.ProcessEnv } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "issues-prune-"));
  const created = "2026-05-31T08:17:17+02:00";
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: "Fixture",
    GIT_AUTHOR_EMAIL: "fixture@example.com",
    GIT_COMMITTER_NAME: "Fixture",
    GIT_COMMITTER_EMAIL: "fixture@example.com",
    GIT_AUTHOR_DATE: created,
    GIT_COMMITTER_DATE: created
  };
  writeFixtureFile(root, "issues/config.yaml", [
    "issues_root: issues",
    "scripts_dir: issues/.scripts",
    "worktree_root: issues/worktrees",
    "branch_prefix: worktree-",
    "grounding: none",
    ""
  ].join("\n"));
  writeFixtureFile(root, "issues/open/sample/state.yaml", `slug: sample\nphase: I-ready\ncreated: '${created}'\n`);
  writeFixtureFile(root, "issues/open/other/state.yaml", `slug: other\nphase: I-ready\ncreated: '${created}'\n`);
  writeFixtureFile(root, "issues/open/series/state.yaml", `series: series\ncreated: '${created}'\nleaves:\n  leaf: { phase: I-ready, created: '${created}' }\n  sibling: { phase: I-ready, created: '${created}' }\n`);
  writeFixtureFile(root, "issues/open/series/SERIES.md", "# series\n\n| Order | Mode | Leaf | File |\n|---|---|---|---|\n| 01 | p | leaf | `01-leaf/01p-leaf/` |\n| 02 | p | sibling | `02-sibling/02p-sibling/` |\n");
  writeFixtureFile(root, "issues/open/series/01-leaf/01p-leaf/implementation/plan.md", "# Leaf plan\n");
  writeFixtureFile(root, "issues/open/series/02-sibling/02p-sibling/implementation/plan.md", "# Sibling plan\n");
  execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
  execGit(root, ["config", "user.name", "Fixture"]);
  execGit(root, ["config", "user.email", "fixture@example.com"]);
  execGit(root, ["add", "."]);
  execGit(root, ["commit", "-m", "fixture"], env);
  return { root, created, env };
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertThrows(callback: () => void, expectedMessage: string): void {
  try {
    callback();
  } catch (error) {
    assert(error instanceof Error && error.message.includes(expectedMessage), `Expected throw containing ${expectedMessage}`);
    return;
  }
  throw new Error(`Expected throw containing ${expectedMessage}`);
}

function runSelfTest(): void {
  const forceFixture = createFixtureRepo();
  const standaloneOwnership = resolveIssueArtifactOwnership(forceFixture.root, "sample");
  assert(dirtOutsideBoundary(" M issues/open/sample/state.yaml\0", standaloneOwnership).length === 0, "expected owned dirt to be accepted");
  assert(dirtOutsideBoundary(" M issues/open/sample-extra/state.yaml\0", standaloneOwnership).join("\n") === "issues/open/sample-extra/state.yaml", "expected segment-aware boundary match");
  execGit(forceFixture.root, ["worktree", "add", "-b", "worktree-sample", "issues/worktrees/sample", "HEAD"], forceFixture.env);
  writeFixtureFile(path.join(forceFixture.root, "issues", "worktrees", "sample"), "issues/open/sample/state.yaml", `slug: sample\nphase: C-ready\ncreated: '${forceFixture.created}'\n`);
  const forceResult = removeManagedWorktree(forceFixture.root, "sample");
  assert(forceResult.forced && !fs.existsSync(path.join(forceFixture.root, "issues", "worktrees", "sample")), "expected owned snapshot dirt to force-remove worktree");
  fs.rmSync(forceFixture.root, { recursive: true, force: true });

  const foreignFixture = createFixtureRepo();
  execGit(foreignFixture.root, ["worktree", "add", "-b", "worktree-sample", "issues/worktrees/sample", "HEAD"], foreignFixture.env);
  writeFixtureFile(path.join(foreignFixture.root, "issues", "worktrees", "sample"), "issues/open/other/state.yaml", `slug: other\nphase: C-ready\ncreated: '${foreignFixture.created}'\n`);
  assertThrows(() => removeManagedWorktree(foreignFixture.root, "sample"), "Refusing to remove dirty worktree");
  assert(fs.existsSync(path.join(foreignFixture.root, "issues", "worktrees", "sample")), "expected foreign dirt to leave worktree in place");
  fs.rmSync(foreignFixture.root, { recursive: true, force: true });

  const seriesForceFixture = createFixtureRepo();
  execGit(seriesForceFixture.root, ["worktree", "add", "-b", "worktree-leaf", "issues/worktrees/leaf", "HEAD"], seriesForceFixture.env);
  const seriesForceWorktree = path.join(seriesForceFixture.root, "issues", "worktrees", "leaf");
  writeFixtureFile(seriesForceWorktree, "issues/open/series/01-leaf/01p-leaf/implementation/plan.md", "# Changed leaf plan\n");
  writeFixtureFile(seriesForceWorktree, "issues/open/series/state.yaml", `series: series\ncreated: '${seriesForceFixture.created}'\nleaves:\n  leaf: { phase: C-ready, created: '${seriesForceFixture.created}' }\n  sibling: { phase: I-ready, created: '${seriesForceFixture.created}' }\n`);
  writeFixtureFile(seriesForceWorktree, "issues/open/series/SERIES.md", "# Changed series snapshot\n");
  const seriesForceResult = removeManagedWorktree(seriesForceFixture.root, "leaf");
  assert(seriesForceResult.forced && !fs.existsSync(seriesForceWorktree), "expected leaf-local and shared-file dirt to force-remove series worktree");
  fs.rmSync(seriesForceFixture.root, { recursive: true, force: true });

  const siblingDirtFixture = createFixtureRepo();
  execGit(siblingDirtFixture.root, ["worktree", "add", "-b", "worktree-leaf", "issues/worktrees/leaf", "HEAD"], siblingDirtFixture.env);
  const siblingDirtWorktree = path.join(siblingDirtFixture.root, "issues", "worktrees", "leaf");
  const siblingPath = "issues/open/series/02-sibling/02p-sibling/implementation/plan.md";
  writeFixtureFile(siblingDirtWorktree, siblingPath, "# Changed sibling plan\n");
  assertThrows(() => removeManagedWorktree(siblingDirtFixture.root, "leaf"), siblingPath);
  assert(fs.existsSync(siblingDirtWorktree), "expected sibling-leaf dirt to leave worktree in place");
  fs.rmSync(siblingDirtFixture.root, { recursive: true, force: true });

  console.log("prune-worktree: self-test ok");
}

function runCli(): void {
  const name = process.argv[2];
  if (name === "--self-test" && process.argv.length === 3) {
    runSelfTest();
    return;
  }
  if (!name || process.argv.length !== 3) {
    console.error("Usage: prune-worktree.ts <worktree-name>");
    process.exit(1);
  }

  const execRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  console.log(JSON.stringify(removeManagedWorktree(execRoot, name)));
}

if (require.main === module) {
  runCli();
}
