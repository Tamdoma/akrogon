# Brief U1: name resolution in src/next.ts

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/named-targets-u1` (detached HEAD, commit here).
Leaf docs (read-only, absolute): `/home/ivan/Work/infra/akrogon/issues/open/next-named-targets/named-targets/`.

## 1. Goal

Implement bare epic/issue name resolution for `akrogon next` inside `selectLeaves` (plan D1-D7).
One candidate selects its leaves; two or more refuse with kind plus repo-relative path before any
lock, herdr call or state change; zero fall through to today's handling; path inputs keep today's
meaning. `Selection` is unchanged.

## 2. Numbered acceptance criteria

1. `next <open-epic>` selects every open leaf under `issues/open/<epic>`, including leaves of nested issues.
2. `next <top-level-issue>` and `next <nested-issue>` select every open leaf under that issue folder.
3. `next <leaf-slug>` behaves exactly as today across open and closed leaves.
4. An input that exists as a folder from cwd selects by path, even if an owner or leaf elsewhere shares the name.
5. A name with two or more candidates throws before any lock/herdr/state change; the message lists every match with kind (`epic`, `issue`, `leaf`) and repo-relative path, sorted by path. Prose beyond kind and path is not contract.
6. A closed epic/issue name never matches as an owner; a closed folder still selects by path.
7. Unknown names and empty-folder names give today's missing-leaf message including the parked hint; a name whose only leaves fail to read surfaces the read errors, never a missing message.
8. An input containing `/` or `\` that does not exist as a folder falls through to today's missing handling; it never enters name search.
9. An issue and its same-name leaf refuse even when they select the same leaves; no same-leaf-count shortcut.

This unit writes no tests (U2 owns `tests/`). If a correct change breaks an existing test, stop and
return a mismatch with evidence instead of touching any test.

## 3. Read-first list

- `<leaf>/plan.md` decisions D1-D7 and Needed interfaces; `<leaf>/brief.md`; `<leaf>/design.md` Names and Leaf architecture.
- Worktree `src/next.ts:1165-1210` (`Selection`, `selectLeaves` — the only function reshaped).
- Worktree `src/next.ts:120-175` (`discover`: open plus closed inventory, unreadable/unknown/foreign reporting).
- Worktree `src/next.ts:1231-1260` (`nextCommand`: select runs before `withLock`; empty selection skips dispatch; exit code).
- Worktree `src/state.ts:146-165` (`missingLeafMessage` with parked hint).
- Worktree `src/config.ts:157-187` (`expandPath`, `within`, `commonDirectory`).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Pattern to copy: the current slug-vs-path branch in `selectLeaves` plus `within()` for folder containment.
- Open the index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns: `src/next.ts` only. Lands first: none. Shared test resource: none. Wave 1 of 1, parallel with U2 (tests) and U3 (docs); the interface below is locked so no ordering is needed. Preceding worker output: none.
- Add one internal helper above `selectLeaves`, e.g.
  `ownerCandidates(openLeaves: Leaf[], repoRoot: string): { name: string; kind: 'epic' | 'issue'; path: string }[]`.
  For each open leaf, split `relative(resolve(repoRoot, 'issues/open'), leaf.path)`: depth 2 `[issue, leaf]`
  yields issue candidate `issues/open/<issue>`; depth 3 `[epic, issue, leaf]` yields epic candidate
  `issues/open/<epic>` and issue candidate `issues/open/<epic>/<issue>`. Dedupe by folder path. Exact
  signature is yours; `Selection` stays `{ repo, leaves }`.
- New branch in `selectLeaves` after repo and inventory resolve, only when input is defined and the
  folder does not exist: when input contains no `/` or `\`, collect owner candidates (open leaves only:
  `inventory.leaves.filter((l) => within(l.path, openRoot))`) whose folder basename equals input, plus
  leaf candidates (`inventory.leaves` open and closed whose slug equals input). One candidate selects its
  leaves (owner: open leaves with `within(leaf.path, ownerPath)`; leaf: that leaf). Two or more throw an
  `Error` whose message names the input once and lists every match as `kind` plus `relative(repo.root, path)`,
  sorted by path. Zero candidates fall through to the existing unreadable/missing lines unchanged.
- Needed imports already exist in `src/next.ts` except possibly `relative`/`resolve` from `node:path`
  (only `resolve` is imported today); add `relative` if the helper needs it.

## 5. Do-not, reasons and exceptions

1. Do not touch `tests/`, `docs/`, `issues/`, `README.md` or any other file: U2/U3 own their paths and the rest is frozen. Reason: disjoint waves and clean cherry-picks. Exception: none; return a mismatch instead.
2. Do not change dispatch, eligibility (`src/turn.ts`), wait reporting, exit codes for waits, or `park`/`unpark`. Reason: locked exclusions. Exception: none.
3. Do not change the `Invalid target` file check, the `existsSync` path-first lines, the `commonDirectory` repo block, or the unreadable/missing fall-through. Reason: today's behavior is preserved by keeping those lines in place. Exception: none.
4. Do not scan the filesystem for owners and do not read `ISSUE.md`/`EPIC.md`. Reason: D2 derives owners from discovered leaf paths only. Exception: none.
5. Do not add a same-leaf-count shortcut for issue-plus-leaf pairs. Reason: D5 always refuses. Exception: none.
6. Return a mismatch naming the conflicting requirement, the actual code or evidence, and the smallest brief correction instead of widening scope or changing the locked interface (`Selection`, kind-plus-path contract). Reason: the plan author owns scope. Exception: a revised brief from A authorizing the change.

Reasons restated: 1 keeps waves disjoint, 2-5 hold the locked design, 6 keeps scope with A; every exception is none except a revised brief from A.

## 6. Ordered steps

1. Read the section 3 files and trace `selectLeaves` end to end (file `src/next.ts`, all criteria).
2. Implement the helper and the branch (file `src/next.ts`, criteria 1-9).
3. Run `bun install` once in the worktree, then the section 7 command, then the affected-consumer regression run `bun test tests/next.test.ts --timeout=30000`: every pre-existing test must pass (no new tests exist in this worktree).
4. Red consumer with a cause in your diff: repair inside `src/next.ts` only. Red with no cause in your diff: record the output and stop; A runs the base comparison. Never repair by touching another file.
5. Commit on the detached HEAD with message `named-targets U1: resolve bare epic/issue names in selectLeaves` (no `Test-Change` trailer: no test file touched). Return the commit id plus the section 8 report.

Advisory size: 1 file, under 6 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/named-targets-u1 && AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc bun test --changed="$AKROGON_BASE" --timeout=30000
```

This is the only required suite command. Expect it to select `src/next.ts` and run 0 tests; the section 6 consumer run is this unit's regression signal. A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when criteria 1-9 hold by implementation, the consumer run in step 3 is green, and the section 7 output is recorded. The report links each criterion to its code (function and lines); the CLI tests proving them land in U2. Limitations and unverified criteria stay explicit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
