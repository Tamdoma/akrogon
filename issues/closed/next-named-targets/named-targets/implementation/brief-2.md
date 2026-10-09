# Brief U2: CLI boundary tests for named targets

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/named-targets-u2` (detached HEAD, commit here).
Leaf docs (read-only, absolute): `/home/ivan/Work/infra/akrogon/issues/open/next-named-targets/named-targets/`.

## 1. Goal

Add the CLI boundary tests proving brief criteria 1-6 for bare epic/issue names (plan D8, acceptance
A1-A6). Tests run `akrogon next` against isolated registered repos with the fake herdr, asserting the
dispatched leaf set, herdr calls made or not made, exit codes, and unchanged state. This worktree has
no `src` change, so new-behavior tests are expected RED here; section 8 defines the red/green contract.

## 2. Numbered acceptance criteria

Use these exact test names (A's `-t` filters match them):

1. `named target equivalence: owner name matches folder path from root, subfolder and worktree` — one repo with epic E (nested issues N1, N2, two leaves each) and top-level issue T (two leaves). For each owner in {E, N1, T} and each cwd in {repo root, a subfolder with no same-named folder, a leaf worktree}: run `next <name>` from that cwd in one fixture and `next <repo-relative folder path>` from the root in a twin fixture; both exit 0 and dispatch the same sorted leaf-slug set (read from `database(f).prompts`). For the worktree cwd, allocate it first by dispatching an unrelated leaf, then run from `readState(path).worktree`.
2. `leaf slug selection keeps open and closed behavior` — a bare leaf slug dispatches the same leaf as today for an open leaf and for a leaf moved under `issues/closed` (build with `leaf()` under open, then `renameSync` the leaf folder to the mirrored `issues/closed` path).
3. `existing folder shadows a same-named owner or leaf` — from a subfolder containing a same-named directory, `next <name>` selects by path (today's meaning): assert it dispatches the leaves under that local folder, not the same-named owner/leaf elsewhere.
4. Four refusal tests, each building its collision and asserting exit non-zero, stderr containing each match's kind word and repo-relative path, `calls(f)` empty, every `state.yaml` byte-identical to before, and no `issues/worktrees`, `.lock`, or `log.jsonl` created:
   - `ambiguous name refuses two same-name issues under different epics`
   - `ambiguous name refuses an epic and its same-name issue`
   - `ambiguous name refuses an issue and its same-name leaf` (single-leaf issue `exp/exp`: same leaves, still refuses)
   - `ambiguous name refuses an owner and an unrelated leaf`
5. `closed owner name does not block an open same-name owner` — closed owner `old` plus open owner `old` with leaves: `next old` exits 0 and dispatches only the open leaves. Same test: `next issues/closed/old` dispatches the closed leaf by path.
6. `empty folder and unknown names give the missing-leaf message` — empty `issues/open/emptybox/` and an unknown name both exit 1 with today's `Missing leaf: <name>` stderr; a parked same-name leaf adds the ` (parked)` hint (mirror the existing parked test shape).
7. `unreadable leaf under a named issue reports its read error` — issue `brok` whose only leaf has invalid `state.yaml`: `next brok` exits 1, stderr carries the read-error skip JSON with the leaf path, and stderr contains no `Missing leaf: brok`.
8. `owners resolve without ISSUE.md or EPIC.md` — an epic and issue with leaves but no index files resolve by name and dispatch; assert the index files do not exist.

Test rules for this unit: extend `tests/next.test.ts` only, no new test files. New cases need no cited source. Change or delete no existing assertion, fixture, or recorded output. Assert refusal, kind-plus-path content, dispatched sets, calls, exit codes, and side effects only; the only prose literals allowed are the pre-existing `Missing leaf:` and `No leaves match:` guards. One deliberate break per new behavior is shown by the section 8 red contract, no mutation score.

## 3. Read-first list

- `<leaf>/plan.md` D8, acceptance A1-A6, and the U2 checklist (T1-T6); `<leaf>/brief.md` criteria 1-6.
- Worktree `tests/helpers.ts` (`fixture`, `cli`, `leaf(f, slug, phase, extra, container)`, `fakeHerdr`; `container` accepts slashes for epic nesting, e.g. `leaf(f, 'l1', 'plan.synthesis', {}, 'epic-a/dup')`).
- Worktree `tests/next.test.ts:1-120` (`dispatchFixture`, `database`, `saveDatabase`, `calls`, `next(f, args, env, cwd)`).
- Worktree `tests/next.test.ts:2357-2380` (missing-leaf assertion shape, parked hint, `calls(f)` empty).
- Worktree `tests/next.test.ts:2279-2320` (no-side-effect assertion shape: state bytes, no worktrees/lock/log).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Pattern to copy: the dormant-resting test at `:2357-2380` for fixture plus stderr-plus-calls assertions.
- Open the index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns: `tests/next.test.ts` only. Lands first: none. Shared test resource: none (isolated temp repo plus fake herdr per test). Wave 1 of 1, parallel with U1 (src) and U3 (docs). Preceding worker output: none.
- Locked interface from U1 (lands separately, do not wait for it): single name candidate dispatches its leaves; ambiguous names throw an `Error` whose message contains each match's kind and repo-relative path (Bun prints it as `error: ...` on stderr with exit 1); zero candidates keep today's fall-through. Assert kinds and paths as substrings, never full prose.
- Reuse the file's existing helpers (`dispatchFixture`, `database`, `calls`, `next`, `resetPrompts` where handy). Compare dispatched sets via `database(f).prompts.map((p) => p.text)` leaf slugs (prompt text ends with `leaf=<path>`; the slug is the leaf folder basename).
- Twin fixtures for criterion 1: build the same repo twice, run one form per fixture, compare sorted slug sets.

## 5. Do-not, reasons and exceptions

1. Do not touch `src/`, `docs/`, `issues/`, `README.md`, or any test file but `tests/next.test.ts`. Reason: U1/U3 own their paths; one-file ownership keeps cherry-picks clean. Exception: none; return a mismatch instead.
2. Do not add a new test file. Reason: the plan extends the existing boundary file the sibling merge expects. Exception: none.
3. Do not change any existing test, helper, or expectation. Reason: new behavior adds cases; old expectations move only with a cited contradiction. Exception: none in this brief.
4. Do not assert full error prose. Reason: wording beyond kind and path is not contract (learnings 2026-10-01). Exception: the two pre-existing literals in criterion 6.
5. Do not weaken a red test to green it in this worktree. Reason: red-on-base is the deliberate-break proof (section 8); the `src` change lands in U1. Exception: none.
6. Return a mismatch naming the conflicting requirement, the actual helper or behavior with evidence, and the smallest brief correction instead of changing scope or inventing helpers the checkout lacks. Reason: the plan author owns scope. Exception: a revised brief from A authorizing the change.

Reasons restated: 1-2 keep waves disjoint, 3-4 hold the test contract, 5 preserves the break proof, 6 keeps scope with A; every exception is none except a revised brief from A.

## 6. Ordered steps

1. Read the section 3 files and the existing helper shapes (file `tests/next.test.ts`, all criteria).
2. Append the criterion 1-8 tests to `tests/next.test.ts` (same file, criteria 1-8). Keep each test self-cleaning with `try/finally f.clean()` like its neighbors.
3. Run `bun install` once in the worktree, then the section 7 command (it selects this file; allow minutes, fixtures are slow).
4. Verify the section 8 red/green contract: green group passes; each red test fails for its named today's-behavior (paste one stderr line per red test as evidence). Never edit `src` to green a red test.
5. Commit on the detached HEAD with message `named-targets U2: CLI boundary tests for bare owner names` plus trailer `Test-Change: tests/next.test.ts added T1-T6 named-target cases; no existing expectation changed`. Return the commit id plus the section 8 report.

Advisory size: 1 file, under 12 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/named-targets-u2 && AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc bun test --changed="$AKROGON_BASE" --timeout=30000
```

This is the only required suite command. A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when all section 2 tests exist and this contract holds in this `src`-unchanged worktree:

- GREEN (today's behavior, must pass): criterion 2, criterion 3, criterion 5 closed-by-path half, criterion 6, criterion 7 (today's fall-through already surfaces read errors; this test guards it), and every pre-existing test in the file.
- RED (new behavior, must fail for the named reason): criterion 1 (`Missing leaf` instead of dispatch), criterion 4 (dispatch-or-missing instead of kind-plus-path refusal), criterion 5 open-name half (`Missing leaf`), criterion 8 (`Missing leaf`).

The report links each criterion to its test name plus the green pass or the red stderr evidence, pastes the section 7 result, and names limitations and unverified criteria explicitly. A proves green after U1 lands; do not claim the red tests as failures of this unit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
