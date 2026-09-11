# akrogon audit — verified defects

Date: 2026-09-11
Subject: `/home/ivan/Work/infra/akrogon` at `9d64342` (working tree dirty, see "Repo state during the audit")
Method: mechanical read of `issues/chart`, `issues/open|closed|parked`, `skills/`, `plugin/`, `src/`, `tests/`, config and docs; execution of the declared checks; probe fixtures in `/tmp` driving the real CLI against real git and a stand-in `herdr`; read-only queries against the real `herdr 0.9.0`, `gh 2.100.0`, `bun 1.4.0`, `git 2.55.0`.
Constraint honoured: no writes to the repository, no code changes, no cleanup. All probes live in `/tmp/probe/*`.

Baseline checks in the audited tree:

```
bun test            44 pass, 0 fail, 492 assertions, 8 files
bun run typecheck   exit 0
bun run format      exit 0, no file changed (idempotent)
skills/broadcast-issue: bun test scripts/discord-send.test.ts   9 pass, 0 fail
```

Severity: **high** = breaks the loop, hangs it, or loses work with no error; **medium** = a pass fails, misleads an agent, or wedges one repository; **low** = wrong prose/paths, no execution damage.

Everything below was reproduced. Nothing here is a design opinion. Where a finding duplicates an issue already open on GitHub it is marked with the number, but each entry stands on its own evidence.

---

## 1. Summary

| # | Sev | Location | Defect |
| --- | --- | --- | --- |
| A1 | high | `src/state.ts:96-103` | A leaf directly under `issues/open/<slug>` deadlocks `next`/`phase` forever, and wedges every other repository (the documented layout) |
| A2 | high | `src/next.ts:230` | A pane whose `agent_session` is absent silently stops the loop: no prompt, no retry, no error, exit 0 |
| A3 | high | `src/next.ts:330-336`, `367-372` | `next --all` deletes the worktree, then dies on `git branch -d`; the whole sweep (and startup dispatch) is lost, branch orphaned |
| A4 | high | `src/phase.ts:65`, `src/pull.ts:188` | A failed GitHub source closure is unrecoverable: the folder moves first, the worktree is needed afterwards, later attempts silently do nothing |
| A5 | medium | `src/next.ts:317`, `133-143` | One malformed record or one dangling `blocked-by` stops dispatch for every leaf, and (via `activeCount`) for every repository |
| A6 | medium | `src/phase.ts:53-57`, `src/log.ts:10` | A log-diagnostic failure turns a committed phase move into exit 1, with a raw ENOENT instead of a structured error |
| A7 | medium | `src/phase.ts:163-164` | The completion repair path can never report success: `completeOwner` runs, then `transition` throws "Merged is terminal" |
| A8 | medium | `skills/*/SKILL.md` + `src/routing.ts:27,31` | `herdr agent wait` is written without its required target in six places, and two-slot phases let both peers wait on each other with no timeout |
| A9 | medium | `skills/broadcast-issue/SKILL.md:23` | A section over 2000 characters aborts the broadcast, while the skill says never to shorten the truth |
| A10 | medium | `src/install.ts:16`, live `~/.codex/skills`, `~/.pi/agent/skills` | `install` never manages the codex/pi skill folders and never prunes; `plan-issue` is missing in both today |
| A11 | medium | `bunfig.toml:2`, `issues/config.yaml:9` | The declared `test` check can never run `tests/browser/*.pw.ts`, and inside a leaf worktree the changed-tests check can report "0 files affected" |
| A12 | low | `src/shell.ts:18`, `src/next.ts:310` | A missing directory or a missing `flock` surfaces as a raw Bun ENOENT stack trace, not the structured error the rest of the tool emits |
| A13 | low | `src/install.ts:39` | `install` calls `herdr integration install <harness key>`, whose accepted values are a shorter list than `herdr agent start --kind` |
| A14 | low | `README.md:31-41`, `docs/create.html:66`, `docs/parts.html:59` | `park`/`unpark` are documented nowhere at all, and the docs' hand-written example uses the layout that deadlocks (A1) |
| A15 | low | `skills/broadcast-issue/SKILL.md:43` | "one delivery attempt and one immediate retry" per target is actually per post; partial delivery is possible |
| A16 | low | `skills/merge-issue/SKILL.md:43` | Justifies broadcast ownership with a tab-close behaviour that does not exist in `src/` |
| A17 | low | `~/.config/herdr/plugins.json` vs `plugin/herdr-plugin.toml:7-11` | Registered plugin has one startup command, the manifest declares two; the seed mirror is stale (10 open GitHub issues unmirrored) |
| A18 | low | `src/next.ts:310-312` | A failed leaf fires a desktop notification on every sweep, forever |

Already open as GitHub issues (found by another pass at 12:26 today, not yet mirrored locally): A1 → #14 ("deep tree locking"), A2 → #9, A3/A5 → #6, A4 → #5, A10/A14 → #10, A18 → #11. A8's cross-wait → #12, A15 → #13.

---

## 2. Repo state during the audit

The checkout is live. While this audit ran, another lifecycle run was editing `src/status.ts` and `tests/status.test.ts` (mtimes 15:03), had moved `issues/open/docs-multipage` → `issues/closed/docs-multipage`, and had opened a leaf for `seed-filename-length` with two real panes (`w8:p86`, `w8:p87`).

Consequences for this report:
- All line numbers and behaviour below were read from `src/state.ts` (09:53), `src/next.ts` (14:41), `src/phase.ts`, `src/pull.ts`, `src/log.ts`, `src/install.ts`, `skills/` at the stated times.
- `src/status.ts` findings are excluded: the working-tree version already contains the `status-empty-open` fix in progress. Note that the in-flight version prints no header and no `no open leaves` line for a zero-leaf repo, which does not match the locked decision `issues/chart/status-empty-open/decisions/missing-open-is-zero.md` ("its name followed by an indented `no open leaves` line"). Flagging, not filing: that work is still in flight.
- The live loop also ran `next --all` during the audit: the `docs-retire-guide` worktree and branch that existed at 14:47 are gone now. That leaf's branch had an upstream (`branch.docs-retire-guide.remote=origin`), so its `git branch -d` succeeded — see A3 for why tool-created branches do not.
- No probe of mine wrote inside the repository. Two probe panes created by a delegated sub-audit in tab `w8:t48`/`w8:t49` were closed afterwards.

---

## 3. Findings

### A1 — high — a top-level leaf deadlocks the tool and wedges every repository

`src/state.ts:96-103`

```ts
export async function withLeafLocks<T>(leaf: Leaf, action: () => Promise<T>): Promise<T> {
  const issue: string = dirname(leaf.path);
  const parent: string = dirname(issue);
  const enclosing: string[] = basename(parent) === 'open' || basename(parent) === 'closed' ? [issue] : [parent, issue];
  async function acquire(paths: string[]): Promise<T> {
    return paths.length === 0 ? action() : withLock(resolve(paths[0], '.lock'), () => acquire(paths.slice(1)));
  }
  return acquire([...enclosing, leaf.path]);
}
```

For a leaf at `issues/open/<slug>` (no issue container), `issue` is `issues/open` and `parent` is `issues`, so the lock list is `[issues, issues/open, leaf]`. The first lock is `issues/.lock` — the file `withRepoLock` (`src/state.ts:92`) already holds for this process. `flock -x` on the same file from a second child blocks forever. The CLI hangs with no output and never releases the global lock it took first (`next.ts:367`, `phase.ts:159`).

Reproduction (probe `/tmp/probe/pd.sh`):

```
ls issues/open/rename-flag/state.yaml         # leaf directly under issues/open
akrogon next rename-flag                       -> hangs (timeout 1 -> 124)
akrogon next l2                                # control, nested layout
                                               -> exit 0, prompts ['plan-issue l2 slot=A ...', '... slot=B ...']
```

Process-level proof:

```
$ ps -eo pid,ppid,args | grep flock
188187  188164  flock -x /tmp/probe/pd/home/.lock ...            # held
188194  188164  flock -x /tmp/probe/pd/repo/issues/.lock ...     # held by withRepoLock
188197  188164  flock -x /tmp/probe/pd/repo/issues/.lock ...     # blocked by withLeafLocks
$ ls /tmp/probe/pd/repo/issues/open/.lock   ->  does not exist (never reached)
```

Blast radius, measured: while that process hangs, an unrelated repository on the same machine cannot dispatch either.

```
$ akrogon next l9        # different repo, same AKROGON_HOME
-> timeout after 12s (124)
$ akrogon status        # takes no lock, still works
-> exit 0
```

So one hand-written leaf in the documented shape stops the entire machine: `pull`, `next`, `park`, `phase` all block on `.lock`; only `status`/`config` answer. `next --all` is the plugin `[[startup]]` command, so the loop does not come up at all.

The shape is the documented one. `docs/create.html:63-79` ("Or just write the files") says:

```
mkdir -p issues/open/rename-flag
cat > issues/open/rename-flag/brief.md <<'EOF' ...
cat > issues/open/rename-flag/state.yaml <<'EOF'
slug: rename-flag
phase: plan.synthesis
...
akrogon sync
```

and `docs/parts.html:59` defines an Issue as "A folder under `issues/open/`". This is also what a reader does after reading "one issue = one folder" in the chart layout.

Why the tests miss it: `tests/helpers.ts:53` always creates `issues/open/<container>/<slug>` with `container = 'issue'`, so no test ever dispatches a top-level leaf.

Fix direction: derive the enclosing lock from `basename(issue)`, or drop duplicate lock paths before acquiring. A guard that refuses a `state.yaml` directly under `issues/open`/`issues/closed` would turn the hang into an error.

### A2 — high — a session-less pane stops the loop silently

`src/next.ts:230`

```ts
if (pane.agent !== null && pane.agent_session?.value === state.prompted[slot]) return;
```

When `herdr` reports an agent but no `agent_session`, the left side is `undefined`. `state.prompted[slot]` is also `undefined` after every phase move, because `commitMove` resets `prompted: {}` (`src/phase.ts:41`). `undefined === undefined` is true, so `dispatchSlot` returns before the attempts check, before the prompt, before anything observable.

Reproduction, with a control (probe `/tmp/probe/p5.sh`, same fixture, only the session field differs):

```
reportSession=true  -> [1] plan.positions: 2 prompts
                       [2] phase moves to plan.rebuttal, prompted reset to {}
                       [3] plan.rebuttal: 4 prompts total  (correct)
reportSession=false -> [1] plan.positions: 2 prompts
                       [2] phase moves to plan.rebuttal, prompted reset to {}
                       [3] plan.rebuttal: 2 prompts total  (nothing dispatched)
```

Exit code 0 in both cases, no warning, no notification, `attempts` untouched, so the `attempts >= 3 -> failed` guard never fires. The leaf waits forever.

`agent_session` is optional in the protocol and observed missing in practice on this machine: `herdr pane get w8:p83` returns `{"agent":"codex","agent_status":"done",...}` with no `agent_session`, and that pane was started by akrogon itself (agent name `akrogon-<24 hex>`, `src/next.ts:239`). `herdr api schema --json` lists `PaneInfo.required` without `agent_session`; `src/shell.ts:62` already marks it `.nullable().optional()`.

Why the tests miss it: `tests/fake-herdr.ts:94` fabricates `agent_session = { value: 'session-N' }` for every agent it starts, so `tests/next.test.ts` can only ever exercise the dedup with two real strings.

Fix direction: apply the dedup only when both sides are defined.

### A3 — high — `next --all` deletes the worktree and then dies inside cleanup

`src/next.ts:330-336` and `367-372`

```ts
async function cleanupMerged(repo: Repo, leaf: Leaf): Promise<void> {
  const members: Pane[] = (await panes()).filter((pane) => pane.tab_id === leaf.state.tab);
  if (members.length > 0) await command(['herdr', 'tab', 'close', z.string().parse(leaf.state.tab)]);
  if (leaf.state.worktree !== undefined && existsSync(leaf.state.worktree)) {
    await command(['git', 'worktree', 'remove', leaf.state.worktree], repo.root);
    await command(['git', 'branch', '-d', leaf.state.slug], repo.root);   // line 335
  }
}
```

`git worktree add -b <slug> <path> origin/main` (used by `ensureWorktree`, `src/next.ts:122-125`) does **not** set the branch upstream in git 2.55, so `git branch -d` compares against the local `main`, which merge-issue never advances (it rebases onto `origin/<branch>` and pushes). The deletion therefore fails for every leaf that carried a commit.

Reproduction (probe `/tmp/probe/p8.sh`, worktrees created by the tool itself):

```
[1] akrogon next --all          -> worktrees l1 l2, branches +l1 +l2
[2] commit in l1's worktree, origin/main := that commit, l1 phase := merged
    git config --get-regexp '^branch\.l1\.'   -> (nothing: no upstream)
[3] akrogon next --all          -> EXIT=1
    error: {"command":["git","branch","-d","l1"],"cwd":"<repo>","code":1,
            "stderr":"error: the branch 'l1' is not fully merged"}
    at async cleanupMerged (src/next.ts:335:11)
    at async nextCommand (src/next.ts:367:9)
```

Observed after that run:

```
l1 worktree: REMOVED
branch l1:   still present
l2:          never dispatched (the sweep after cleanup never ran)
issues/closed: does not exist
```

A second run exits 0 only because the worktree is already gone, so the branch is orphaned permanently (nothing ever deletes a branch once its worktree has disappeared). Every merge therefore costs one failed `next --all`, the startup sweep is skipped in that run, and a branch leaks per leaf.

Note on the live repo: the merge that landed at 12:46 (`docs-retire-guide`) cleaned up without this error because its branch carries an upstream (`branch.docs-retire-guide.remote=origin`, and `origin/main` held its head). That upstream is not what `ensureWorktree` produces — `git worktree add -b <slug> <path> origin/main` leaves `branch.<slug>.*` unset, as the probe shows — so every leaf the tool creates from now on is affected.

Fix direction: `git branch -D` after an ancestry check, and make cleanup non-fatal so one leaf cannot abort the sweep.

### A4 — high — a failed source closure is unrecoverable, and later runs hide it

`src/phase.ts:61-77` and `src/pull.ts:186-188`

```ts
// completeOwner
renameSync(owner, destination);                     // folder moves first
...
await closeSources(repo, leaf, destination);        // needs the worktree afterwards
// closeSources
if (leaf.state.worktree === undefined) throw ...;
const commit: string = await command(['git', 'rev-parse', 'HEAD'], leaf.state.worktree);
```

The worktree is `git worktree remove`d by `cleanupMerged` (A3) before `next --all` ever reaches `completeOwner`, and `cleanupMerged` never clears `state.worktree`. So the commit that the "merged `<sha>`" comment needs is gone, the `gh` call is never made, and — because `completeOwner` returns early for any leaf already under `issues/closed` (`src/phase.ts:65`) — every later run reports success.

Reproduction (probe `/tmp/probe/p9.sh`, leaf with `sources: [Tamdoma/akrogon#7]`, a fake `gh` logging its calls):

```
[3] next --all run A   -> EXIT=1  {"command":["git","branch","-d","l1"], ... "not fully merged"}
[4] next --all run B   -> EXIT=1  ENOENT: no such file or directory, posix_spawn 'git'
                                  at run (src/shell.ts:18:63)
                                  at command (src/shell.ts:33:32)
                                  at closeSources (src/pull.ts:188:32)
                                  at completeOwner (src/phase.ts:...)
[5] next --all run C   -> EXIT=0, no output at all
results: l1 worktree REMOVED; i1 moved to issues/closed; gh calls: (none)
```

Net effect: the GitHub issue referenced by the merged leaf stays open forever, no comment is posted, and after one noisy failure the tool goes quiet about it.

Fix direction: read and store the commit before the folder moves (or before cleanup), and make the closure retryable — a merged leaf under `issues/closed` with unclosed sources must remain visible to `next`.

### A5 — medium — one bad record stops dispatch everywhere

Two independent triggers, both aborting the whole run rather than the offending leaf.

**(a) Dangling `blocked-by`.** `src/next.ts:317` calls `dependenciesReady`, which maps every dependency through `findLeaf` (`src/state.ts:64-68`) and throws `Missing leaf: <slug>` on the first unresolvable one. Probe `/tmp/probe/pa.sh`:

```
leaf l2 has blocked-by: [ghost-leaf]; leaf l1 is healthy
akrogon next --all      -> EXIT=1, l1 not prompted
akrogon next l1         -> EXIT=0, l1 prompted (explicit target bypasses the sweep)
```

`next --all` is the plugin startup command, so a typo in one chart's `blocked-by` stops all dispatch of all leaves in the repository until someone edits the file by hand.

**(b) One unknown key in one `state.yaml`.** `stateSchema` is a `strictObject` (`src/state.ts:10-31`) and `activeCount` (`src/next.ts:133-143`) reads *every* registered repository before allocating any worktree. Probe `/tmp/probe/pc.sh`, two registered repositories, only `bad` carries an extra `title:` field:

```
[1] cd good && akrogon next --all   -> EXIT=1  Unrecognized key: "title"
                                       good leaf prompted? []
[2] cd good && akrogon next l1      -> EXIT=1  ZodError: unrecognized_keys ["title"]
                                       prompts now: []
```

So a hand-written leaf with one stray field in repository A blocks dispatch in repository B, including an explicit single-slug dispatch, because `activeCount` enumerates all repos. `akrogon status` handles the same file gracefully (a precise `{"unreadable": ..., "path": ..., "error": ...}` line and exit 1) — the two commands disagree on how survivable one bad file is.

Fix direction: catch per leaf (skip and report, or mark `failed`), not per run; and keep the capacity count resilient.

### A6 — medium — a diagnostics failure turns a committed move into a CLI failure

`src/phase.ts:50-57`

```ts
saveState(leaf.path, after);
console.log(`moved ${to}`);
// The transition is committed even if diagnostic collection or append fails.
try {
  if (to === 'merged') await completeOwner(repo, leaf, true);
} finally {
  await logMove(repo, before, after, slot);
}
```

The comment states an intent the code does not implement: `logMove` runs in `finally` and is not guarded, so a failing `git` call inside it replaces the successful result with a thrown error. Probe `/tmp/probe/p6.sh`, leaf whose `state.worktree` points at a removed directory:

```
akrogon phase l1 plan.rebuttal --slot B
stdout: "moved plan.rebuttal"          <- the move happened
EXIT=1
stderr: ENOENT: no such file or directory, posix_spawn 'git'   (raw Bun stack trace)
state.yaml after: phase: plan.rebuttal  <- committed
issues/log.jsonl: not written
```

The skill layer reads the exit code, so a caller cannot distinguish "moved and failed to log" from "did not move" — and a retry of the same call then fails with `Slot already recorded` or `Illegal move`. Secondary defect: `Bun.spawn` with a missing `cwd` throws ENOENT before `run()` can wrap it (`src/shell.ts:18`), so the caller gets a stack trace rather than the JSON payload every other error path produces (same shape as A4's run B).

Fix direction: compute and pass the log data before the move, or wrap the diagnostic call; and check `existsSync(cwd)` in `run()`.

### A7 — medium — the completion repair can never report success

`src/phase.ts:161-165`

```ts
const leaf: Leaf = findLeaf(repo, slug);
await withLeafLocks(leaf, async () => {
  if (leaf.state.phase === 'merged') await completeOwner(repo, leaf, false);
  await transition(repo, leaf, requested, slot, verdict);   // throws "Merged is terminal"
});
```

`recoverMerge`-style repair through `akrogon phase <slug> merged` therefore always ends in exit 1, even when the repair itself succeeded. Probe `/tmp/probe/pz.sh`:

```
first  akrogon phase l1 merged --slot A -> "moved merged" / "issue complete i1" / EXIT=0
second akrogon phase l1 merged --slot A -> exit 1, stack at src/phase.ts:164
```

`transition` refusing a repeat is correct per the repeat-safety decision, but the repair in the same invocation should report success (or be moved out of the command path). As written, the reachable recoveries are: the hook path (`src/next.ts:307-312`, `completeOwner` then `return true`) and nothing else.

### A8 — medium — `herdr agent wait` cannot run as written, and two-slot phases can wait on each other forever

**(a) Missing target.** Six places instruct a bare `herdr agent wait`:

- `skills/plan-issue/SKILL.md:27`
- `skills/implement-issue/SKILL.md:25`
- `skills/check-issue/SKILL.md:21`
- `skills/merge-issue/SKILL.md:21`
- `skills/broadcast-issue/SKILL.md:25`
- `skills/chart-issues/assets/questions.md:31`

All read "... ask once through herdr in Question/Option form ..., run `herdr agent wait` without a timeout, read the file and decide ...". The real CLI requires a target:

```
$ herdr agent wait
usage: herdr agent wait <target> [--until STATUS]... [--timeout MS]      (exit 2)
$ herdr agent wait --help
Usage: herdr agent wait <TARGET> [OPTIONS]
```

`--timeout` is genuinely optional (waits indefinitely) — the missing piece is the peer pane. No sentence names it. An agent that does not silently invent a pane id either stalls or reads `<leaf>/questions/<id>.md` before the peer wrote it, which `questions.md:31` explicitly forbids.

**(b) Mutual wait.** `src/routing.ts:27` and `:31` give `plan.positions`, `plan.rebuttal` and `check.review` two slots at once. Each skill's peer-question rule is symmetric (wait for the peer to be idle, ask, then wait without a timeout). Two slots in the same phase that both take that path wait on each other with no timeout and no arbiter; the command never intervenes, because a `blocked`/`idle` pane is only re-prompted on a phase move. Same class as the already-filed #12.

Fix direction: name the peer pane id in the wording, and either forbid the peer question in two-slot phases or make the wait bounded.

### A9 — medium — a long broadcast section aborts the send

`skills/broadcast-issue/SKILL.md:23` promises "The sender splits a long message into several Discord posts at section boundaries, so never shorten the truth to fit". `skills/broadcast-issue/scripts/discord-send.ts` never splits inside a section: `chunks()` (lines 44-56) builds exactly four parts, merges adjacent parts only while the joined text is `<= 2000`, and validates each remaining part with `chunkSchema = z.string().max(2000)` (line 33). A section over the limit fails the whole run before any request:

```
$ bun scripts/discord-send.ts --target PRIMARY < payload.json
ZodError: [ { "code": "too_big", "maximum": 2000, "message": "Too big: expected string to have <=2000 characters" } ]
$ echo $?
1
```

No request is made (by design: "validates the whole message and all targets before any delivery", `scripts/discord-send.test.ts:125-135`), and the error names no section. The skill's own scale example ("an epic gets more still ... one bullet per shipped part") is exactly the case that breaks it: with the `**Now**` heading and `- ` prefix, a bullet has about 1989 usable characters, and `before: ['a'.repeat(2000)]` is already invalid in the skill's own test (`discord-send.test.ts:130`). Either split inside a section or state the per-section budget.

### A10 — medium — `install` does not own the codex and pi skill folders, and never prunes

`src/install.ts:16` links only into `.claude/skills` and `.agents/skills`; there is no removal path at all. The locked decision `issues/chart/install-prune-dead-links/decisions/harness-folders.md` (operator answer 2026-09-11, `2-B`) requires all four folders — `~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.pi/agent/skills` — to be linked and pruned. Live state on this machine:

```
~/.claude/skills      akrogon links: 8 (all skills)
~/.agents/skills      akrogon links: 8
~/.codex/skills       akrogon links: 7   <- plan-issue absent
~/.pi/agent/skills    akrogon links: 7   <- plan-issue absent
```

`plan-issue` is the skill every planning phase runs, and `codex` is configured as slot B (`config.yaml`), which is the slot that synthesises the plan. That is the reported defect (#2/#10), still unfixed in code.

### A11 — medium — the declared checks do not cover what they claim

**(a) Browser suite unreachable.** `issues/config.yaml:9` declares `test: bun test`; `bunfig.toml:2` sets `root = "tests"`. Bun discovers `*.test.*`, `*_test.*`, `*_spec.*`, not `*.pw.ts`. Proof in a `/tmp` copy: with `tests/browser/probe.pw.ts` and `tests/probe_spec.ts` added, `bun test` ran `probe_spec.ts` and ignored `probe.pw.ts`. In the repo, `bun test` reports 44 tests in 8 files and never mentions `docs-shell/docs-concepts/docs-operate/docs-practice`. The specs do work when invoked explicitly (`playwright test --config tests/browser/playwright.config.ts`: 4 tests listed, desktop project passes), so this is a discovery/check gap: no configured command runs the docs site's only real verification.

**(b) Changed-tests can be a no-op.** `issues/config.yaml` defines `test_changed` as `bun test --changed="$AKROGON_BASE"`, and `akrogon config` computes `AKROGON_BASE` as `git merge-base HEAD <remote>/<branch>` (`src/config.ts:128`) — the empty range once the merge rebase has put the worktree's HEAD on `origin/<branch>`. Two recorded instances:

```
issues/closed/docs-multipage/docs-retire-guide/review-A.md:
  AKROGON_BASE=a2b9e07... bun test --changed="$AKROGON_BASE"  -> 0 files affected, exit 0

repo root, working tree holding only issues/ and docs/ changes:
  $ bun test --changed=$(git rev-parse HEAD)
  --changed: 43 changed files, but no test files are affected
  0 pass, 0 fail
```

So the command reports success while running zero tests in exactly the two situations a docs or config leaf produces, and the reviewers cite that as passing evidence. Whether bun's selection is right for a source leaf was checked and is fine: with `src/status.ts` modified, the same command runs `tests/status.test.ts`.

### A12 — low — raw ENOENT instead of a structured error

`src/shell.ts:18` spawns without checking the working directory, so a stale `state.worktree` (removed by `cleanupMerged`, deleted by hand, or pruned by `git worktree prune`) produces:

```
ENOENT: no such file or directory, posix_spawn 'git'
    at run (src/shell.ts:18:63)
    at command (src/shell.ts:33:32)
```

rather than the JSON payload used everywhere else. Same failure for a missing `flock` (documented dependency, no probe). The repository's own error-handling rules ask for structured fields with enough context; these two paths are the exception.

### A13 — low — `install` assumes every configured harness is an installable herdr integration

`src/install.ts:39` runs `herdr integration install <kind>` for every key of `global.harnesses`. The real accepted values are a closed list:

```
herdr integration install <TARGET>  [pi, omp, claude, codex, copilot, devin, droid, kimi, opencode,
                                     kilo, hermes, qodercli, qwen, cursor, mastracode, antigravity-cli, grok]
herdr agent start --kind <KIND>     [pi, claude, codex, gemini, cursor, devin, agy, cline, omp, mastracode,
                                     opencode, copilot, kimi, kiro, droid, amp, grok, hermes, kilo, qodercli,
                                     qwen, maki, muse]
```

The comment in `plugin/herdr-plugin.toml:4` and the config both push toward "any harness, swappable by config", but a slot using `gemini`, `cline`, `amp`, `kiro`, `agy`, `maki` or `muse` makes `akrogon install` fail at line 39, after it has already created symlinks. Not exercised live (running `install` would mutate `$HOME`); derived from the two `--help` outputs.

### A14 — low — undocumented verbs, and docs that teach the deadlocking layout

`src/akrogon.ts:71` lists `install|init|config|phase|next|pull|park|unpark|sync|status`. `README.md:31-41` and `REFERENCE.md` document seven of them; `sync` is at least on the docs cheat sheet (`docs/cheat.html`, also named in `create/files/in-practice/limits/problems`), but `park` and `unpark` appear in no skill, in no docs page, and nowhere in `README.md`/`REFERENCE.md` (grep over `skills/`, `README.md`, `REFERENCE.md`, `docs/*.html`). `park` matters operationally: `issues/parked/` currently holds three issues and `status` prints them, but nothing tells an operator how work gets there or back.

Separately, `docs/create.html:63-79` and `docs/parts.html:59` describe and demonstrate the layout that hangs the tool (A1). One of the two must change.

### A15 — low — broadcast retry is per post, not per target

`skills/broadcast-issue/SKILL.md:43`: "Each target gets one delivery attempt and one immediate retry on failure ... successful targets are not resent because another target failed". `scripts/discord-send.ts:106-116` retries inside the per-post loop, so a target can make up to `2 × posts` requests, posts already delivered are not rolled back, and `SKILL.md:45` forbids the merge slot from resending — a multi-post failure therefore leaves a permanently half-delivered message. The wording is exact only for a single-post message, which is what the test covers.

### A16 — low — merge-issue cites a tab-close behaviour that does not exist

`skills/merge-issue/SKILL.md:43` justifies "the broadcast is always sent by the merge slot" with "because the tab closes as soon as this pane goes idle after `merged`". The only `herdr tab close` in the tool is `cleanupMerged` (`src/next.ts:332`), whose only caller is the `--all` branch of `nextCommand` (`src/next.ts:368-371`); the pane-idle path (`src/next.ts:375-389`) calls `dispatchLeaf`, which for a merged leaf runs `completeOwner` and returns without touching the tab. The instruction that follows (send it in this session) is right, but line 47 is what actually closes the tab and the reason given is wrong.

### A17 — low — plugin registry drift, and a stale seed mirror

`plugin/herdr-plugin.toml:7-11` declares two startup commands (`sh pull.sh --all`, then `sh next.sh --all`). The registry herdr actually holds declares one:

```
$ python3 -c 'import json;print(json.load(open("/home/ivan/.config/herdr/plugins.json"))[0]["startup"])'
[{'command': ['sh', 'next.sh', '--all']}]
```

Whether herdr re-reads `manifest_path` at startup was not verified (that needs a herdr restart), but the observable consequence is consistent with the drift:

```
$ gh issue list -R Tamdoma/akrogon --state open
14 13 12 11 10 9 8 7 6 5 2 1        # 12 open issues
$ ls issues/seeds/
1-... 2-... 3-... 4-...              # 4 seeds; #3 and #4 are closed upstream, #5–#14 missing
```

The mirror is stale in both directions, so the GitHub intake path is not actually running on this machine.

### A18 — low — repeated notifications for a failed leaf

`src/next.ts:310-312` sends `herdr notification show "Failed leaf: ..."` every time a failed leaf is dispatched, and each `next` run dispatches it again. Probe `/tmp/probe/pz.sh`, three consecutive `akrogon next l2` on one failed leaf: `notification show calls: 3`. Same as already-filed #11; no dedup and no record exists.

---

## 4. Verified clean (probed, no defect found)

- **Real herdr protocol compatibility.** `{"result": ...}` envelopes, `id`/`type` extras, error JSON on stderr with exit 1, `tab create` → `.result.tab`/`.result.root_pane`, `pane split` → `.result.pane`, and the generated `akrogon-<24 hex>` agent name (accepted by the real `herdr agent list`). Every flag `src/` passes exists in the real `--help` output.
- **Plugin event payload.** `herdr api schema --json` matches `hookEventSchema` (`src/next.ts:47-60`) for `pane_agent_status_changed` and `pane_exited`; extra keys are stripped. 50 consecutive real plugin invocations in `herdr plugin log list` all exited 0 with empty stderr, in 30-800 ms.
- **Locking, apart from A1.** Two `phase` calls, `phase` racing `next`, and two leaves in parallel all serialise correctly, with one tab, one prompt, and no lost state write. The lock is released only in `withLock`'s `finally`, after the synchronous `writeFileSync` + `renameSync`.
- **Pane and tab recovery.** A leaf whose pane is gone but whose tab survives is re-found and re-split; a fully closed tab is recreated. Both covered by the repo suite.
- **Bounded prompt retries.** `attempts` is saved before each prompt, the third attempt goes to the peer, and the fourth fails the leaf (`src/next.ts:220-252`) — matches the repeat-safety decision.
- **Declared checks.** `bun test` 44/44, `tsc --noEmit` clean, `prettier --write` idempotent, and the broadcast script's own suite 9/9.
- **Docs site.** 17 pages, 0 broken links, 0 missing anchors, every nav target resolves (checked for both relative paths and `#fragment`).
- **`akrogon config` contract.** Prints global + effective repo config, includes `AKROGON_BASE` only inside a worktree, and `repo: none` outside a registered checkout (`src/config.ts:119-133`) — as documented.

---

## 5. Not verified (out of reach without side effects)

- Live Discord delivery (no webhook was exercised; the failure path was verified instead).
- A `herdr` restart, so the startup-hook question in A17 stays open, as does whether `herdr` re-reads `plugin/herdr-plugin.toml`.
- Real `akrogon install` (it writes to `$HOME`) — A10's code path was read, A13's list derived from `--help`, and the live symlink state inspected read-only.
- Real agent harness behaviour inside a pane (prompt delivery, skill resolution by name without a slash, compaction recovery). The audits covered the command's side of that contract only.
- `tests/browser` specs against the pages as they exist after the `guide.html` deletion: the specs run, but their byte-comparison logic was reviewed by the leaf's own reviewers, not re-derived here.
- `src/status.ts` and `tests/status.test.ts` findings: excluded, live edits (section 2).
