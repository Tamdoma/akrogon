# Plan: base-preflight

## Decisions

- D1: new `src/preflight.ts` owns the rule. `PreflightError extends Error` carries `code: 'C1' | 'C2' | 'C3' | 'unproven'`, git argv, cwd, exit status, and stderr; `message` is plain text naming the case plus remediation (for unproven, the failed command context instead of remediation).
- D2: probe commands and exit mapping. `ensureRemote`: `git remote get-url <remote>`, any non-zero is C1 naming the remote. `localBase`: `git rev-parse --verify --quiet <tracking>^{commit}`, 0 passes, 1 is local-missing, anything else rethrows as `CommandError`. `remoteBase`: `git ls-remote --exit-code <remote> refs/heads/<branch>`, 0 passes, 2 is C2, anything else is unproven carrying command, exit, stderr. C1 is never classified from `ls-remote` stderr: verified live that missing and unreachable remotes both exit 128 there.
- D3: one orchestrator `checkBase(repo, remoteRequired)`. Always `ensureRemote`, then local. On local failure runs the remote probe to classify: its C1/C2/unproven error wins, otherwise the C3 with `git fetch <remote> <branch>` stands. On local success runs the remote probe only when `remoteRequired`. Probes stay single-purpose and flag-free; the boolean is caller-observed creation intent, not a probe mode.
- D4: gate in `dispatchLeaf` after `seats(global, repo)`, before `allocate()`, passing `mustCreate = !existsSync(resolve(repo.root, repo.config.worktree_root, slug))`. Wins over the `ensureWorktree` placement: gating later pays `panes()`, `tabs()`, and possibly a full `activeCount` sweep on every hook event before refusing, and the design's own Q3-A rationale is hook-path latency. The throw flows into the existing catch → `report()` → `skipped` → exit-1 funnel, one JSON line per leaf, no worktree, tab, or `state.worktree` write. The `existsSync` predicate mirrors `ensureWorktree`'s path; keep it inline with a comment, matching the existing inline precedent at `src/next.ts:231` and `:293`.
- D5: `akrogon preflight` prints `<remote>/<branch> <sha>` on success so the handoff confirms what was proven. Errors propagate uncaught like every other verb; no bespoke catch. Repo style has zero catch-and-reformat sites, and criteria 1/3 need case plus remediation in stderr, which the message already carries.
- D6: `trackingRef(repo)` (`refs/remotes/<remote>/<branch>`, defined in `src/preflight.ts`) feeds `base()`'s merge-base and the `git worktree add` start revision. Verified live that abbreviated `origin/main` resolves to a divergent local branch over the tracking ref, so this is required. `target()` stays for `phase.ts` per locked scope; `src/log.ts` inherits the fix through `base()`.
- D7: `tests/helpers.ts` `fixture()` gains a real bare remote (`git init --bare remote.git` under `home`, `git remote add origin`, `git push origin HEAD:main`, drop the fake `update-ref`). Without this the gate turns every worktree-creating dispatch test C1. Thirteen `remote add` sites adapt to `set-url` or deletion; `pull.test.ts`'s missing-origin case runs `git remote remove origin` first.
- D8: docs. README command table gains `` `akrogon preflight` `` with effect `Verify the configured base remote branch and local tracking ref.` `shapes.md` `## Preflight and validation` gains one sentence: run `akrogon preflight` at the registered root before any handoff write and refuse the handoff on non-zero exit, handing the printed remediation to the operator.
- D9: known limitation, not scope. `phase.ts:259,266-267` keeps abbreviated `target()` in `git diff origin/main...HEAD`, so a same-named local branch can skew those guards. Locked by the design.
- D10: credentials. The brief and design name no variable names; runtime probes use the checkout's existing Git authentication. No env check to run.

## Read-first paths

- src/next.ts:230-260 (ensureWorktree, worktree add), :290-320 (allocate, AKROGON_BASE), dispatchLeaf catch/report funnel
- src/config.ts:119-145 (requireRepo, target, base, effectiveConfig)
- src/shell.ts (run/command/CommandError; use `run` for classified exits)
- src/akrogon.ts (verb dispatch, usage line)
- tests/helpers.ts:11-40 (fixture), tests/next.test.ts dispatch patterns, tests/command-reference.test.ts contracts
- skills/chart-issues/assets/shapes.md `## Preflight and validation`
- issues/chart/execution-readiness/forks/git-base.md Taken block

## Needed interfaces

```ts
// src/preflight.ts
trackingRef(repo: Repo): string;
class PreflightError extends Error; // D1 fields
localBase(repo: Repo): Promise<string>; // returns tracking commit SHA
remoteBase(repo: Repo): Promise<void>;
checkBase(repo: Repo, remoteRequired: boolean): Promise<string>; // returns SHA
preflightCommand(cwd: string): Promise<void>; // requireRepo + checkBase(repo, true) + print
```

## Acceptance criteria (from the brief, condensed)

- C1: `akrogon preflight` in temp repos exits non-zero with matching remediation for C1/C2/C3 and 0 when both refs resolve.
- C2: same-named local branch/tag never satisfies the check; only the tracking commit passes.
- C3: transport failure exits non-zero with git command, exit, stderr, and no C2 text.
- C4: unregistered/non-repo caller refused without writes; zero-leaf repo works; no file written.
- C5: new leaf, existing branch without worktree, and existing worktree each refuse once before any worktree creation or `state.worktree` write.
- C6: local verified every dispatch; remote proven on worktree creation (including branch reuse) and after local failure; existing worktree plus valid local makes no remote query; each path tested.
- C7: tracking base or refusal wins over same-named branch/tag in `worktree add` and `AKROGON_BASE`.
- C8: README lists the verb; command-reference passes.
- C9: shapes.md names the verb run before any handoff write.
- C10: configured checks pass.

## Ordered checklist

1. `src/preflight.ts` (new): probes, error, orchestrator, command per D1-D3. Serves C1-C4.
2. `src/config.ts`: `base()` uses `trackingRef()` per D6. Serves C7.
3. `src/next.ts`: dispatch gate per D4 and `worktree add` start revision per D6. Serves C5-C7.
4. `src/akrogon.ts`: `case 'preflight'`, usage line, per D5. Serves C4, C8.
5. `tests/helpers.ts`: real bare remote per D7, before any test runs. Unblocks all dispatch tests.
6. Adapted call sites in `tests/next.test.ts`, `tests/pull.test.ts`, `tests/sync.test.ts` per D7.
7. `tests/preflight.test.ts` (new): CLI cases C1/C2/C3/pass, same-named branch plus tag, unreachable URL, zero leaves, unregistered/non-repo cwd, no-write assertions. Serves C1-C4.
8. `tests/next.test.ts` additions: three worktree states refuse once with no `state.worktree`; unreachable URL dispatches fine with existing worktree but refuses on creation; branch/tag conflicts resolve to tracking or refuse; `AKROGON_BASE` equals the tracking commit. Serves C5-C7.
9. `tests/command-reference.test.ts`: `preflight: ''` contract. Serves C8.
10. `README.md` (human doc): command-table row per D8. Serves C8.
11. `skills/chart-issues/assets/shapes.md` (agent doc): preflight sentence per D8. Serves C9.
12. Grep `docs/` for base-related prose touching this rule; own or report hits. Guards C8-C9.
13. Run `bun run format`, `bun test`, `bun run typecheck`. Serves C10.

No leaf dependencies; `blocked-by` stays empty. The only ordering is checklist order: fixture repair (5-6) before test runs (7-8, 13).

## Verification

- `bun test tests/preflight.test.ts` and the new dispatch cases drive real `akrogon preflight` / `akrogon next` against temp git fixtures (bare remote for C2/C3, unreachable URL for transport); assert exit codes, remediation text, one skip line, and absent `state.worktree`.
- Full `bun test`, `bun run typecheck`, `bun run format` green.
- Retain one real CLI verification transcript outside tracked `issues/` paths and record its path in the implementation report.
