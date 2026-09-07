// Usage: bun issues/.scripts/merge-branch.ts <name>
// Merge worktree-<name> into the current branch (normally main).
// Detect merge type: fast-forward, merge-commit, or conflict.
// Output: JSON { type: "fast-forward" | "merge-commit" | "conflict", commits: number }
// Exit codes: 0=success (ff or merge-commit), 1=conflict, 2=error
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync } from "child_process";
import { spawnSync } from "child_process";
import { branchForSlug, isOwnedIssueArtifactPath, readConfig, resolveIssueArtifactOwnership, type IssueArtifactOwnership } from "./lifecycle.ts";

interface MergeResult {
  type: "fast-forward" | "merge-commit" | "conflict";
  commits: number;
}

class MergeError extends Error {}
class MergeConflictError extends Error {
  constructor(public readonly result: MergeResult) {
    super("Merge conflict");
  }
}

const name = process.argv[2];

function execGitText(root: string, args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
}

function isAncestor(root: string, ancestor: string, descendant: string): boolean {
  const result = spawnSync("git", ["-C", root, "merge-base", "--is-ancestor", ancestor, descendant], {
    stdio: ["ignore", "ignore", "ignore"],
  });
  return result.status === 0;
}

function branchExists(root: string, branch: string): boolean {
  const result = spawnSync("git", ["-C", root, "rev-parse", "--verify", branch], {
    stdio: ["ignore", "ignore", "ignore"],
  });
  return result.status === 0;
}

interface BranchIssueArtifactDeltas {
  own: string[];
  cross: string[];
}

// Branch issue artifacts may carry only this worktree's owned issue artifacts.
function branchIssueArtifactDeltas(root: string, branch: string, ownership: IssueArtifactOwnership): BranchIssueArtifactDeltas {
  const base = execGitText(root, ["merge-base", "HEAD", branch]);
  const raw = execGitText(root, ["diff", "--name-only", base, branch, "--", "issues/open/"]);
  const paths = raw.length === 0 ? [] : raw.split(/\r?\n/);
  return {
    own: paths.filter((repoPath) => isOwnedIssueArtifactPath(ownership, repoPath)),
    cross: paths.filter((repoPath) => !isOwnedIssueArtifactPath(ownership, repoPath))
  };
}

function mergeFailedWithConflict(result: ReturnType<typeof spawnSync>): boolean {
  return (
    result.stderr.includes("CONFLICT") ||
    result.stdout.includes("CONFLICT") ||
    result.stderr.includes("Automatic merge failed")
  );
}

function conflictedPaths(root: string): string[] {
  const raw = execGitText(root, ["diff", "--name-only", "--diff-filter=U"]);
  return raw.length === 0 ? [] : raw.split(/\r?\n/);
}

function restoreOwnIssueRoot(root: string, preMergeHead: string, ownership: IssueArtifactOwnership): void {
  for (const repoPath of [ownership.artifactRoot, ...ownership.sharedArtifactPaths]) {
    execGitText(root, ["rm", "-r", "--cached", "--ignore-unmatch", "--", repoPath]);
    fs.rmSync(path.join(root, repoPath), { recursive: true, force: true });
    execGitText(root, ["checkout", preMergeHead, "--", repoPath]);
  }
}

function mergeOwnIssueArtifactDeltas(execRoot: string, branch: string, ownership: IssueArtifactOwnership): MergeResult {
  const commitLog = execGitText(execRoot, ["log", `HEAD..${branch}`, "--oneline"]);
  const commits = commitLog ? commitLog.split("\n").length : 0;
  const preMergeHead = execGitText(execRoot, ["rev-parse", "HEAD"]);
  const result = spawnSync("git", ["-C", execRoot, "merge", branch, "--no-edit", "--no-ff", "--no-commit"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    if (!mergeFailedWithConflict(result)) {
      throw new MergeError(`Merge failed: ${result.stderr || result.stdout}`);
    }
    const conflicts = conflictedPaths(execRoot);
    if (!conflicts.every((repoPath) => isOwnedIssueArtifactPath(ownership, repoPath))) {
      execGitText(execRoot, ["merge", "--abort"]);
      throw new MergeConflictError({ type: "conflict", commits });
    }
  }

  restoreOwnIssueRoot(execRoot, preMergeHead, ownership);
  execGitText(execRoot, ["commit", "--no-edit"]);
  return { type: "merge-commit", commits };
}

function runMerge(execRoot: string, worktreeName: string): MergeResult {
  const config = readConfig(execRoot);
  const branch = branchForSlug(worktreeName, config);
  if (!branchExists(execRoot, branch)) {
    throw new MergeError(`Branch "${branch}" does not exist.`);
  }
  const ownership = resolveIssueArtifactOwnership(execRoot, worktreeName);

  const issueArtifactDeltas = branchIssueArtifactDeltas(execRoot, branch, ownership);
  if (issueArtifactDeltas.cross.length > 0) {
    throw new MergeError(`Branch "${branch}" carries cross-issue artifact deltas ${JSON.stringify({ paths: issueArtifactDeltas.cross, remedy: "move or author those issue artifacts from the primary checkout control root" })}`);
  }

  if (issueArtifactDeltas.own.length > 0) {
    return mergeOwnIssueArtifactDeltas(execRoot, branch, ownership);
  }

  const commitLog = execGitText(execRoot, ["log", `HEAD..${branch}`, "--oneline"]);
  const commits = commitLog ? commitLog.split("\n").length : 0;
  const mergeType = isAncestor(execRoot, branch, "HEAD") || isAncestor(execRoot, "HEAD", branch) ? "fast-forward" : "merge-commit";

  const result = spawnSync("git", ["-C", execRoot, "merge", branch, "--no-edit"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status === 0) {
    return { type: mergeType, commits };
  }

  if (mergeFailedWithConflict(result)) {
    throw new MergeConflictError({ type: "conflict", commits });
  }

  throw new MergeError(`Merge failed: ${result.stderr || result.stdout}`);
}

function writeFixtureFile(root: string, repoPath: string, content: string): void {
  const absolutePath = path.join(root, repoPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf8");
}

function createFixtureRepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "issues-merge-branch-"));
  writeFixtureFile(root, "issues/config.yaml", [
    "issues_root: issues",
    "scripts_dir: issues/.scripts",
    "worktree_root: issues/worktrees",
    "branch_prefix: worktree-",
    "grounding: none",
    ""
  ].join("\n"));
  writeFixtureFile(root, "issues/open/sample/state.yaml", "slug: sample\nphase: I-ready\ncreated: '2026-05-31T08:17:17+02:00'\n");
  writeFixtureFile(root, "issues/open/sample/implementation/plan.md", "# Plan\n\nControl-root plan.\n");
  writeFixtureFile(root, "issues/open/clean/state.yaml", "slug: clean\nphase: I-ready\ncreated: '2026-05-31T08:17:17+02:00'\n");
  writeFixtureFile(root, "issues/open/blocked/state.yaml", "slug: blocked\nphase: I-ready\ncreated: '2026-05-31T08:17:17+02:00'\n");
  writeFixtureFile(root, "issues/open/other/state.yaml", "slug: other\nphase: I-ready\ncreated: '2026-05-31T08:17:17+02:00'\n");
  writeFixtureFile(root, "issues/open/series/state.yaml", "series: series\ncreated: '2026-05-31T08:17:17+02:00'\nleaves:\n  leaf: { phase: I-ready, created: '2026-05-31T08:17:17+02:00' }\n  sibling: { phase: I-ready, created: '2026-05-31T08:17:17+02:00' }\n");
  writeFixtureFile(root, "issues/open/series/SERIES.md", "# series\n\n| Order | Mode | Leaf | File |\n|---|---|---|---|\n| 01 | p | leaf | `01-leaf/01p-leaf/` |\n| 02 | p | sibling | `02-sibling/02p-sibling/` |\n");
  writeFixtureFile(root, "issues/open/series/01-leaf/01p-leaf/implementation/plan.md", "# Leaf plan\n\nControl-root plan.\n");
  writeFixtureFile(root, "issues/open/series/02-sibling/02p-sibling/implementation/plan.md", "# Sibling plan\n");
  writeFixtureFile(root, "issues/open/series.md", "# Series seed\n");
  writeFixtureFile(root, "src/base.txt", "base\n");
  execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
  execGitText(root, ["config", "user.name", "Fixture"]);
  execGitText(root, ["config", "user.email", "fixture@example.com"]);
  execGitText(root, ["add", "."]);
  execGitText(root, ["commit", "-m", "fixture"]);
  return root;
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
  const cleanRoot = createFixtureRepo();
  const cleanBaseBranch = execGitText(cleanRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  execGitText(cleanRoot, ["checkout", "-b", "worktree-clean"]);
  writeFixtureFile(cleanRoot, "src/feature.txt", "feature\n");
  execGitText(cleanRoot, ["add", "src/feature.txt"]);
  execGitText(cleanRoot, ["commit", "-m", "feature"]);
  execGitText(cleanRoot, ["checkout", cleanBaseBranch]);
  const cleanResult = runMerge(cleanRoot, "clean");
  assert(cleanResult.type === "fast-forward" && cleanResult.commits === 1, "expected clean branch to merge");

  const ownRoot = createFixtureRepo();
  const ownBaseBranch = execGitText(ownRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const ownPreMergeHead = execGitText(ownRoot, ["rev-parse", "HEAD"]);
  execGitText(ownRoot, ["checkout", "-b", "worktree-sample"]);
  writeFixtureFile(ownRoot, "issues/open/sample/state.yaml", "slug: sample\nphase: C-ready\ncreated: '2026-05-31T08:17:17+02:00'\n");
  writeFixtureFile(ownRoot, "issues/open/sample/implementation/plan.md", "# Plan\n\nWorktree plan.\n");
  writeFixtureFile(ownRoot, "issues/open/sample/implementation/codex.md", "# Codex\n");
  execGitText(ownRoot, ["add", "issues/open/sample"]);
  execGitText(ownRoot, ["commit", "-m", "own artifacts"]);
  const ownBranchTip = execGitText(ownRoot, ["rev-parse", "HEAD"]);
  execGitText(ownRoot, ["checkout", ownBaseBranch]);
  const ownResult = runMerge(ownRoot, "sample");
  assert(ownResult.type === "merge-commit" && ownResult.commits === 1, "expected own artifacts to force a merge commit");
  assert(execGitText(ownRoot, ["rev-parse", "HEAD"]) !== ownBranchTip, "expected own artifact merge not to fast-forward");
  assert(isAncestor(ownRoot, ownBranchTip, "HEAD"), "expected own artifact branch to be merged");
  assert(execGitText(ownRoot, ["show", `${ownPreMergeHead}:issues/open/sample/state.yaml`]) === execGitText(ownRoot, ["show", "HEAD:issues/open/sample/state.yaml"]), "expected own state to keep control-root content");
  assert(execGitText(ownRoot, ["show", `${ownPreMergeHead}:issues/open/sample/implementation/plan.md`]) === execGitText(ownRoot, ["show", "HEAD:issues/open/sample/implementation/plan.md"]), "expected own plan to keep control-root content");
  assert(!fs.existsSync(path.join(ownRoot, "issues/open/sample/implementation/codex.md")), "expected branch-added own artifact to be discarded");

  const seriesRoot = createFixtureRepo();
  const seriesBaseBranch = execGitText(seriesRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const seriesPreMergeHead = execGitText(seriesRoot, ["rev-parse", "HEAD"]);
  execGitText(seriesRoot, ["checkout", "-b", "worktree-leaf"]);
  writeFixtureFile(seriesRoot, "issues/open/series/01-leaf/01p-leaf/implementation/plan.md", "# Leaf plan\n\nWorktree plan.\n");
  writeFixtureFile(seriesRoot, "issues/open/series/01-leaf/01p-leaf/implementation/codex.md", "# Codex\n");
  writeFixtureFile(seriesRoot, "issues/open/series/state.yaml", "series: series\ncreated: '2026-05-31T08:17:17+02:00'\nleaves:\n  leaf: { phase: C-ready, created: '2026-05-31T08:17:17+02:00' }\n  sibling: { phase: I-ready, created: '2026-05-31T08:17:17+02:00' }\n");
  writeFixtureFile(seriesRoot, "issues/open/series/SERIES.md", "# series worktree snapshot\n\n| Order | Mode | Leaf | File |\n|---|---|---|---|\n| 01 | p | leaf | `01-leaf/01p-leaf/` |\n| 02 | p | sibling | `02-sibling/02p-sibling/` |\n");
  execGitText(seriesRoot, ["add", "issues/open/series"]);
  execGitText(seriesRoot, ["commit", "-m", "series leaf artifacts"]);
  const seriesBranchTip = execGitText(seriesRoot, ["rev-parse", "HEAD"]);
  execGitText(seriesRoot, ["checkout", seriesBaseBranch]);
  const seriesResult = runMerge(seriesRoot, "leaf");
  assert(seriesResult.type === "merge-commit" && isAncestor(seriesRoot, seriesBranchTip, "HEAD"), "expected series leaf artifacts to merge without override");
  for (const repoPath of ["issues/open/series/01-leaf/01p-leaf/implementation/plan.md", "issues/open/series/state.yaml", "issues/open/series/SERIES.md"]) {
    assert(execGitText(seriesRoot, ["show", `${seriesPreMergeHead}:${repoPath}`]) === execGitText(seriesRoot, ["show", `HEAD:${repoPath}`]), `expected ${repoPath} to keep control-root content`);
  }
  assert(!fs.existsSync(path.join(seriesRoot, "issues/open/series/01-leaf/01p-leaf/implementation/codex.md")), "expected branch-added leaf artifact to be discarded");

  const foreignSeriesRoot = createFixtureRepo();
  const foreignSeriesBaseBranch = execGitText(foreignSeriesRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  execGitText(foreignSeriesRoot, ["checkout", "-b", "worktree-leaf"]);
  writeFixtureFile(foreignSeriesRoot, "issues/open/series/02-sibling/02p-sibling/implementation/plan.md", "# Changed sibling\n");
  writeFixtureFile(foreignSeriesRoot, "issues/open/other/state.yaml", "slug: other\nphase: C-ready\ncreated: '2026-05-31T08:17:17+02:00'\n");
  writeFixtureFile(foreignSeriesRoot, "issues/open/series.md", "# Changed series seed\n");
  writeFixtureFile(foreignSeriesRoot, "issues/open/series/01-leaf/01p-leaf-extra/state.yaml", "foreign\n");
  execGitText(foreignSeriesRoot, ["add", "issues/open"]);
  execGitText(foreignSeriesRoot, ["commit", "-m", "foreign artifacts"]);
  execGitText(foreignSeriesRoot, ["checkout", foreignSeriesBaseBranch]);
  for (const expectedPath of ["issues/open/series/02-sibling/02p-sibling/implementation/plan.md", "issues/open/other/state.yaml", "issues/open/series.md", "issues/open/series/01-leaf/01p-leaf-extra/state.yaml"]) {
    assertThrows(() => runMerge(foreignSeriesRoot, "leaf"), expectedPath);
  }

  const ownConflictRoot = createFixtureRepo();
  const ownConflictBaseBranch = execGitText(ownConflictRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  execGitText(ownConflictRoot, ["checkout", "-b", "worktree-leaf"]);
  writeFixtureFile(ownConflictRoot, "issues/open/series/01-leaf/01p-leaf/implementation/plan.md", "branch version\n");
  execGitText(ownConflictRoot, ["add", "."]);
  execGitText(ownConflictRoot, ["commit", "-m", "branch conflict"]);
  execGitText(ownConflictRoot, ["checkout", ownConflictBaseBranch]);
  writeFixtureFile(ownConflictRoot, "issues/open/series/01-leaf/01p-leaf/implementation/plan.md", "control version\n");
  execGitText(ownConflictRoot, ["add", "."]);
  execGitText(ownConflictRoot, ["commit", "-m", "control conflict"]);
  const ownConflictResult = runMerge(ownConflictRoot, "leaf");
  assert(ownConflictResult.type === "merge-commit" && fs.readFileSync(path.join(ownConflictRoot, "issues/open/series/01-leaf/01p-leaf/implementation/plan.md"), "utf8").trim() === "control version", "expected own-only conflict to keep control-root content");

  const mixedConflictRoot = createFixtureRepo();
  const mixedConflictBaseBranch = execGitText(mixedConflictRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  execGitText(mixedConflictRoot, ["checkout", "-b", "worktree-leaf"]);
  writeFixtureFile(mixedConflictRoot, "issues/open/series/01-leaf/01p-leaf/implementation/plan.md", "branch version\n");
  writeFixtureFile(mixedConflictRoot, "src/base.txt", "branch version\n");
  execGitText(mixedConflictRoot, ["add", "."]);
  execGitText(mixedConflictRoot, ["commit", "-m", "branch mixed conflict"]);
  execGitText(mixedConflictRoot, ["checkout", mixedConflictBaseBranch]);
  writeFixtureFile(mixedConflictRoot, "issues/open/series/01-leaf/01p-leaf/implementation/plan.md", "control version\n");
  writeFixtureFile(mixedConflictRoot, "src/base.txt", "control version\n");
  execGitText(mixedConflictRoot, ["add", "."]);
  execGitText(mixedConflictRoot, ["commit", "-m", "control mixed conflict"]);
  assertThrows(() => runMerge(mixedConflictRoot, "leaf"), "Merge conflict");
  assert(!fs.existsSync(path.join(mixedConflictRoot, ".git", "MERGE_HEAD")), "expected mixed conflict to abort the merge");

  const blockedRoot = createFixtureRepo();
  const blockedBaseBranch = execGitText(blockedRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  execGitText(blockedRoot, ["checkout", "-b", "worktree-blocked"]);
  writeFixtureFile(blockedRoot, "issues/open/sample/state.yaml", "slug: sample\nphase: C-ready\ncreated: '2026-05-31T08:17:17+02:00'\n");
  execGitText(blockedRoot, ["add", "issues/open/sample/state.yaml"]);
  execGitText(blockedRoot, ["commit", "-m", "state"]);
  execGitText(blockedRoot, ["checkout", blockedBaseBranch]);
  assertThrows(() => runMerge(blockedRoot, "blocked"), "cross-issue artifact deltas");
  assert(execGitText(blockedRoot, ["rev-parse", "--abbrev-ref", "HEAD"]) === blockedBaseBranch, "expected blocked merge to leave current branch unchanged");

  console.log("merge-branch: self-test ok");
}

if (process.argv.includes("--self-test")) {
  runSelfTest();
  process.exit(0);
}

if (!name || process.argv.length !== 3) {
  console.error("Usage: merge-branch.ts <worktree-name>");
  process.exit(2);
}

const execRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
try {
  console.log(JSON.stringify(runMerge(execRoot, name)));
} catch (error) {
  if (error instanceof MergeConflictError) {
    console.log(JSON.stringify(error.result));
    process.exit(1);
  }
  if (!(error instanceof MergeError)) throw error;
  console.error(error.message);
  process.exit(2);
}
