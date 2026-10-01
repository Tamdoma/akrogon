# Plan: leaf-temp-dir

Debate ran. Built from `brief.md`, `design.md`, `positions-A.md`, `positions-B.md`, `rebuttal-A.md`, `rebuttal-B.md`, and the live checkout. No brief/design conflict found. If one appears, the design wins.

Resolutions taken: seam through both `cli` and `fakeHerdr` (both rebuttals agree A's `cli`-only misses `nextAt` and the direct discovery subprocess); override name `AKROGON_LEAF_TEMP_ROOT` with nonblank-absolute parsing (B accepts the name, both require the validation); `closeMergedTab` returns had-live (both agree, one `panes()` call per leaf); criterion 2 via isolated subprocess with mocked uid (both agree); `tab_closed` deletes before `dispatchLeaf` (B's order: no re-discover, accurate report path, cleanup independent of GitHub/move errors; A's completion-first reporting concern is accepted as a rare dual-failure tradeoff with the same retry count).

## Decisions

- D1. One derived path beside the store. Add exported `leafTemp(repo: Repo, slug: string): string` in `src/config.ts` next to `worktreeStore` (`:127`). Root is `process.env.AKROGON_LEAF_TEMP_ROOT` parsed at the boundary as optional nonblank absolute: unset selects `/var/tmp/akrogon-${process.getuid()}`; set-but-blank or relative throws naming the variable. Leaf is `resolve(root, \`${slug.slice(0, 20)}-${createHash('sha256').update(repo.root + "\n" + slug).digest('hex').slice(0, 12)}\`)`. Slug schema (`src/state.ts`) already guarantees `[a-z0-9-]`, so no extra validation. No config key, flag, state field, or uid parameter.
- D2. One internal fixture seam, fully wired. Centralize `resolve(f.home, 'leaf-temp')` in `tests/helpers.ts`; `cli()` defaults the override when the caller env lacks it and `fakeHerdr().env` carries it so `f.env` inheritors (`nextAt`, direct discovery subprocess) are isolated too. Undocumented everywhere. The production-length proof clears the override only inside an isolated subprocess, mocks `getuid` to a 10-digit uid, calls the real `leafTemp`, and creates nothing.
- D3. Private scratch on every allocation. In `allocate` (`src/next.ts:298-310`), after `ensureWorktree` and before `placement`, ensure parent first then leaf: `lstatSync` rejects symlink, non-directory, and foreign-uid entries with an error naming the path; `mkdirSync(path, { mode: 0o700 })` then `chmodSync(path, 0o700)` so umask cannot weaken it and permissive owned dirs are corrected; never chmod foreign entries. Add `'--env', \`TMPDIR=${leafTemp(repo, slug)}\`` to `placement`, covering tab create (`:315`) and both splits (`:330,338`) including missing-seat recovery with no topology change. Runs even when both panes exist, recreating scratch after removal or operator expiry.
- D4. One shared removal. Add `removeLeafTemp(repo, slug)` in `src/next.ts`: `existsSync` guard first (absent costs one stat, no git call), else `rmSync(path, { recursive: true, force: true })` then `command(['git', 'worktree', 'prune'], repo.root)`. Errors throw for the caller's `report()`; the next run retries while the folder still exists.
- D5. `tab_closed` deletes the known merged owner first. In the branch (`:721`), before `dispatchLeaf`, when the pre-branch owner's phase is `merged`, run `removeLeafTemp` in `try`/`report(invocation, repo.name, leaf.path, error, slug)` matching `cleanupRepos` (`:642-650`), then leave dispatch and dependent flow intact. Non-merged owners skip. No re-discover; derived path needs no record move.
- D6. Sweep catches up only on confirmed-gone tabs. `closeMergedTab` (`:552`) returns `Promise<boolean>` had-live (`false` when tab is undefined or already gone; herdr call unchanged; `:753` caller ignores the return). `cleanupMerged` (`:559`) captures it, then before the `issues/open` early return calls `removeLeafTemp` only when `!hadLive`. Live panes at sweep start close the tab as today and keep scratch for the hook or a later sweep.
- D7. Named surfaces only. One sentence each in the three skills, one paragraph each in the three guides (see checklist). No wording assertions per standing design; criterion 7 is review-only. `src/AREA.md` names no allocate env and stays untouched.
- D8. Real-CLI evidence, extended before added. Extend the missing-seat cases (`tests/next.test.ts:1784-1814`) with TMPDIR assertions on every replacement split while keeping split-count and split-target asserts. Add focused cases per C1-C6 below plus refusal coverage: symlink or non-directory parent refuses with no tab create or split; existing owned permissive dir is chmod-corrected. Never mock the unit under test; placement proved via `.calls`, modes via `statSync`, worktree deregistration via `git worktree list --porcelain`.

Terms: root is `/var/tmp/akrogon-<uid>` (or the fixture override in tests). Leaf temp is `<root>/<20>-<12>`. Confirmed gone means a `tab_closed` event arrived or a sweep saw zero live panes for the tab before closing. Live panes are `panes()` entries with matching `tab_id`.

Credentials: none. The brief and design name no variable, so no env presence check applies.

## Read-first

- `docs/reference-index.md`
- `src/AREA.md`
- `tests/AREA.md`
- `skills/AREA.md`
- `src/config.ts`
- `src/next.ts`
- `src/state.ts`
- `src/phase.ts`
- `tests/helpers.ts`
- `tests/fake-herdr.ts`
- `tests/next.test.ts`
- `docs/guide/merge.md`
- `docs/guide/problems.md`
- `docs/guide/limits.md`
- `learnings/LESSONS.md`

## Needed interfaces

- `leafTemp(repo: Repo, slug: string): string` in `src/config.ts`, exported, absolute derived path.
- `AKROGON_LEAF_TEMP_ROOT` internal override, nonblank absolute when set, test-only, undocumented.
- `removeLeafTemp(repo: Repo, slug: string): Promise<void>` in `src/next.ts`, guarded rm plus prune.
- `closeMergedTab(leaf: Leaf): Promise<boolean>` had-live result.
- `placement` carries `--env TMPDIR=<leaf temp>` to tab create and pane splits.
- `$TMPDIR` contract in skills: temp files, logs, base copies under `$TMPDIR`, never fixed `/tmp/<name>`; durable evidence in the leaf folder.

## Acceptance criteria

- C1. Fresh allocation carries adjacent `--env TMPDIR=<leaf temp>` on tab create and the B-pane split; recovery carries it on every replacement split in the extended missing-seat scenarios with topology asserts unchanged; after dispatch the folder exists with mode 0700.
- C2. With a 200-character slug, long repo root, and 10-digit uid, the production path is at most 62 bytes, its basename starts with the slug's first 20 characters, and the same slug under two repo roots yields different paths. No filesystem write.
- C3. A `tab_closed` event for a merged leaf's tab deletes its folder and a detached worktree registered inside it no longer appears in `git worktree list`; the same event for a failed leaf keeps folder and contents.
- C4. A bare `akrogon next` sweep with no live panes deletes a merged leaf's folder including while still under `issues/open` (kept open via an unfinished hand-built epic sibling); with live panes at sweep start it closes the tab and keeps a scratch sentinel, deleted by a later hook or sweep.
- C5. Dispatch, manual scratch removal with tab and panes kept, then dispatch again leaves the same tab and seats and recreates scratch with mode 0700.
- C6. Every created TMPDIR asserted under the fixture root; helper and direct-subprocess envs audited; production path tested as a string only; no test writes the real `/var/tmp/akrogon-<uid>`.
- C7. Three skill one-liners and three guide paragraphs state the rule and the confirmed-gone deletion with no contradicting cleanup line. Review only.
- C8. `bun run format`, `bun test`, `bun run typecheck` pass.

## Checklist, in order

1. `src/config.ts` — add `leafTemp` per D1. Covers C2.
2. `src/next.ts` — creation plus placement per D3. Covers C1, C5.
3. `src/next.ts` — `removeLeafTemp`, `tab_closed` order, `closeMergedTab` return, `cleanupMerged` guard per D4-D6. Covers C3, C4.
4. `tests/helpers.ts` — centralized override in `cli` and `fakeHerdr` per D2. Covers C6.
5. `tests/next.test.ts` — extensions, new cases, refusal coverage per D8. Covers C1-C6.
6. Agent doc: `skills/implement-issue/SKILL.md` — one `$TMPDIR` sentence in Shared context per D7. Covers C7.
7. Agent doc: `skills/check-issue/SKILL.md` — one `$TMPDIR` sentence per D7. Covers C7.
8. Agent doc: `skills/merge-issue/SKILL.md` — one `$TMPDIR` sentence per D7. Covers C7.
9. Human doc: `docs/guide/merge.md` — merged-cleanup paragraph gains confirmed-gone temp deletion per D7. Covers C7.
10. Human doc: `docs/guide/problems.md` — lingering-worktree paragraph gains temp deletion per D7. Covers C7.
11. Human doc: `docs/guide/limits.md` — cleanup-boundary line gains temp deletion per D7, then sweep all guides for contradicting cleanup lines. Covers C7.
12. `src/AREA.md` — unaffected, names no allocate env; verify and leave untouched. Covers C7 scope.
13. Full `bun run format`, `bun test`, `bun run typecheck` per D8. Covers C8.

## Verification

| Criterion | Proof command | Failure it catches | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| C1 | `bun test tests/next.test.ts -t 'allocation carries TMPDIR'` (fresh plus extended missing-seat) | placement missing TMPDIR on create/split, wrong mode | seconds | `allocate`, `placement`, seam changes |
| C2 | `bun test tests/next.test.ts -t 'leaf temp path bounds'` (isolated subprocess, string-only) | >62 bytes, wrong prefix, root collision | seconds | `leafTemp` changes |
| C3 | `bun test tests/next.test.ts -t 'closed tab scratch'` (merged deletes plus porcelain, failed keeps) | merged kept, failed deleted, stale worktree entry | seconds | `tab_closed` branch, `removeLeafTemp` changes |
| C4 | `bun test tests/next.test.ts -t 'sweep scratch catch-up'` (open/closed no-panes, live-panes keep) | open skipped, live-panes data loss, no catch-up | seconds | `cleanupMerged`, `closeMergedTab` changes |
| C5 | `bun test tests/next.test.ts -t 'recreates missing scratch'` (same tab/seats, mode 0700) | scratch not recreated, seats reallocated | seconds | `allocate` creation changes |
| C6 | `bun test tests/next.test.ts -t 'fixture temp root'` plus env audit of `cli`, `fakeHerdr`, `nextAt` | real `/var/tmp` write, bypassed subprocess | seconds | seam, helper changes |
| C7 | `grep -n 'TMPDIR' skills/*/SKILL.md` and read of the three guide paragraphs plus contradiction sweep | missing rule, contradicting cleanup prose | minutes | skill/guide edits |
| C8 | `bun run format`, `bun test`, `bun run typecheck` | any regression | minutes | any code change |

Not a slow run; no restart boundaries. Refusal cases ride with C1's run: symlink/non-directory parent yields no tab create or split; permissive owned dir is corrected to 0700.

## Open limitation

If `rmSync` succeeds and `git worktree prune` fails, the absent-folder guard means later sweeps skip the prune and cannot retry it; only a later successful scratch deletion in the same repo prunes the stale entry, which is not guaranteed. Do not describe all cleanup failures as retried. No new state or unconditional sweep pruning. Panes running at rollout keep their old env until recreated; the operator's 7-day sweep may clear scratch for a paused leaf.

## Dependencies

None.
