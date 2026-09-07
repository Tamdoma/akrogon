// Usage: bun issues/.scripts/auto-commit-if-dirty.ts <name> --message <finalize-message>
// Check whether the worktree has uncommitted changes. If dirty, stage safe paths and commit.
// Output: reports what happened (clean / auto-committed N files)
// Exit codes: 0=success, 1=error
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync } from "child_process";
import { normalizeRepoPath, readConfig } from "./lifecycle.ts";

class AutoCommitError extends Error {}

function parsePorcelainPaths(raw: string): string[] {
  const parts = raw.split("\0").filter((part) => part.length > 0);
  const paths: string[] = [];
  for (let index = 0; index < parts.length; index += 1) {
    const entry = parts[index];
    const status = entry.slice(0, 2);
    paths.push(normalizeRepoPath(entry.slice(3)));
    if (status.includes("R") || status.includes("C")) {
      index += 1;
      paths.push(normalizeRepoPath(parts[index]));
    }
  }
  return Array.from(new Set(paths));
}

function isIssueLifecyclePath(repoPath: string): boolean {
  return repoPath === "issues/open" || repoPath.startsWith("issues/open/");
}

function execGitText(root: string, args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
}

function writeFixtureFile(root: string, repoPath: string, content: string): void {
  const absolutePath = path.join(root, repoPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf8");
}

function createFixtureRepo(): { root: string; worktreePath: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "issues-auto-commit-"));
  writeFixtureFile(root, "issues/config.yaml", [
    "issues_root: issues",
    "scripts_dir: issues/.scripts",
    "worktree_root: issues/worktrees",
    "branch_prefix: worktree-",
    "grounding: none",
    ""
  ].join("\n"));
  writeFixtureFile(root, "issues/open/sample/state.yaml", "slug: sample\nphase: I-ready\ncreated: '2026-05-31T08:17:17+02:00'\n");
  execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
  execGitText(root, ["config", "user.name", "Fixture"]);
  execGitText(root, ["config", "user.email", "fixture@example.com"]);
  execGitText(root, ["add", "."]);
  execGitText(root, ["commit", "-m", "fixture"]);
  execGitText(root, ["worktree", "add", "-b", "worktree-sample", "issues/worktrees/sample", "HEAD"]);
  return { root, worktreePath: path.join(root, "issues", "worktrees", "sample") };
}

function runAutoCommit(execRoot: string, name: string, commitMessage: string): string {
  const config = readConfig(execRoot);
  const worktreePath = path.join(execRoot, config.worktree_root, name);
  if (!fs.existsSync(worktreePath)) {
    throw new AutoCommitError(`Worktree not found at ${worktreePath}`);
  }

  execGitText(worktreePath, ["rev-parse", "--git-dir"]);
  const status = execFileSync("git", ["-C", worktreePath, "status", "--porcelain=v1", "-z"], { encoding: "utf8" });
  const dirtyPaths = parsePorcelainPaths(status);
  if (dirtyPaths.length === 0) {
    return "Worktree is clean - no uncommitted changes.";
  }

  const eligiblePaths = dirtyPaths.filter((repoPath) => !isIssueLifecyclePath(repoPath));
  const skippedIssuePaths = dirtyPaths.filter(isIssueLifecyclePath);
  const skippedReport = skippedIssuePaths.length === 0
    ? ""
    : ` Skipped ${skippedIssuePaths.length} issue-folder path(s): ${JSON.stringify(skippedIssuePaths)}.`;

  if (eligiblePaths.length === 0) {
    return `No eligible deliverable paths to auto-commit in ${worktreePath.replace(/\\/g, "/")}.${skippedReport}`;
  }

  execFileSync("git", ["-C", worktreePath, "add", "--", ...eligiblePaths], { stdio: "inherit" });
  execFileSync("git", ["-C", worktreePath, "commit", "-m", commitMessage], { stdio: "inherit" });
  return `Auto-committed ${eligiblePaths.length} file(s) in ${worktreePath.replace(/\\/g, "/")}.${skippedReport}`;
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function runSelfTest(): void {
  const cleanFixture = createFixtureRepo();
  assert(runAutoCommit(cleanFixture.root, "sample", "clean").includes("clean"), "expected clean worktree report");

  const implementationFixture = createFixtureRepo();
  writeFixtureFile(implementationFixture.worktreePath, "src/feature.txt", "feature\n");
  assert(runAutoCommit(implementationFixture.root, "sample", "commit feature").includes("Auto-committed 1 file"), "expected implementation change to commit");
  assert(execGitText(implementationFixture.worktreePath, ["status", "--short"]).length === 0, "expected implementation worktree to be clean after commit");

  const ownDirtFixture = createFixtureRepo();
  writeFixtureFile(ownDirtFixture.worktreePath, "src/feature.txt", "feature\n");
  writeFixtureFile(ownDirtFixture.worktreePath, "issues/open/sample/implementation/plan.md", "worktree plan\n");
  const ownDirtReport = runAutoCommit(ownDirtFixture.root, "sample", "commit feature");
  assert(ownDirtReport.includes("Auto-committed 1 file"), "expected eligible implementation change to commit with own issue dirt present");
  assert(ownDirtReport.includes("Skipped 1 issue-folder path"), "expected own issue dirt to be reported as skipped");
  assert(execGitText(ownDirtFixture.worktreePath, ["show", "--name-only", "--format=", "HEAD"]).includes("src/feature.txt"), "expected committed deliverable path");
  assert(execGitText(ownDirtFixture.worktreePath, ["status", "--short"]).includes("issues/open/sample/implementation"), "expected skipped own issue path to remain dirty");

  const crossIssueDirtFixture = createFixtureRepo();
  writeFixtureFile(crossIssueDirtFixture.worktreePath, "src/feature.txt", "feature\n");
  writeFixtureFile(crossIssueDirtFixture.worktreePath, "issues/open/other/implementation/plan.md", "other issue plan\n");
  const crossIssueDirtReport = runAutoCommit(crossIssueDirtFixture.root, "sample", "commit feature");
  assert(crossIssueDirtReport.includes("Auto-committed 1 file"), "expected eligible implementation change to commit with cross-issue dirt present");
  assert(crossIssueDirtReport.includes("Skipped 1 issue-folder path"), "expected cross-issue dirt to be reported as skipped");
  assert(execGitText(crossIssueDirtFixture.worktreePath, ["show", "--name-only", "--format=", "HEAD"]).includes("src/feature.txt"), "expected committed deliverable path with cross-issue dirt present");

  const onlyIssueDirtFixture = createFixtureRepo();
  const beforeOnlyIssueDirt = execGitText(onlyIssueDirtFixture.worktreePath, ["rev-parse", "HEAD"]);
  writeFixtureFile(onlyIssueDirtFixture.worktreePath, "issues/open/sample/implementation/plan.md", "worktree plan\n");
  const onlyIssueDirtReport = runAutoCommit(onlyIssueDirtFixture.root, "sample", "commit issue plan");
  const afterOnlyIssueDirt = execGitText(onlyIssueDirtFixture.worktreePath, ["rev-parse", "HEAD"]);
  assert(onlyIssueDirtReport.includes("No eligible deliverable paths"), "expected issue-only dirt to skip commit");
  assert(onlyIssueDirtReport.includes("Skipped 1 issue-folder path"), "expected issue-only dirt to be reported as skipped");
  assert(beforeOnlyIssueDirt === afterOnlyIssueDirt, "expected issue-only dirt to leave branch tip unchanged");

  // Boundary-spanning renames are an unsupported finalize input; ordinary issue-folder dirt is skipped without rename reconciliation.

  console.log("auto-commit-if-dirty: self-test ok");
}

if (process.argv.includes("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const name = process.argv[2];
const messageFlag = process.argv[3];
const commitMessage = process.argv[4];
if (!name || messageFlag !== "--message" || !commitMessage || process.argv.length !== 5) {
  console.error("Usage: auto-commit-if-dirty.ts <worktree-name> --message <finalize-message>");
  process.exit(1);
}

const execRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
try {
  console.log(runAutoCommit(execRoot, name, commitMessage));
} catch (error) {
  if (!(error instanceof AutoCommitError)) throw error;
  console.error(error.message);
  process.exit(1);
}
