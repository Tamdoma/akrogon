# Brief-1: pull --all pulls every registered repo from any directory

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/pull-all-repos-u1` (already created, detached at leaf HEAD). Run all commands from there.

## 1. Goal

Fix the cwd narrowing defect in `pullCommand`: `akrogon pull --all` must pull every registered repo no matter which directory it runs from. Plan decisions D1 (all branch skips current-repo resolution, straight to the `global.repos` loop), D2 (plain pull keeps `requireRepo` + `pullRepo`), D3 (failure boundary unchanged), D4 (real CLI on real temp repos with fake gh, no mocked resolver), D5 (README wording, contract intact).

## 2. Numbered acceptance criteria

- C1: `pull --all` run from a registered repo root pulls every registered repo: stdout prints one `<repo>: N open issues pulled` line per repo in config order, and each repo's `issues/seeds` tree updates. Verified by a new test with at least two registered repos.
- C2: Same as C1 but run from a linked worktree of a registered repo (`git worktree add`). Verified by the same test.
- C3: Same as C1 but run from an unregistered directory. Verified by the same test.
- C4: `pull --all` run from inside a registered repo, with another registered repo failing (non-GitHub origin), still pulls the healthy repos and exits non-zero with stderr naming the failed repo. Verified by a new negative test.
- C5: Plain `pull` still pulls only the current repo from its root and from a linked worktree, and still fails outside a registered repo. Verified by the existing tests, which all keep passing.
- C6: README `akrogon pull [--all]` row effect and the `:153` sentence state `--all` pulls every registered repo from any directory, unlike `next --all`, which stays current-repo inside one. The `[--all]` argument contract is unchanged. Verified by `tests/command-reference.test.ts` passing in the full suite (run by B); worker verifies the text by reading it.
- Bug fail-first: the new C1/C2 test fails on the unmodified `src/pull.ts` (in-repo `--all` pulls 1 repo instead of 2) and passes after the fix. Paste both red and green runs.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/pull-all-repos-u1/src/pull.ts` (`pullCommand`, the early return to delete)
- `/home/ivan/Work/infra/akrogon/issues/worktrees/pull-all-repos-u1/tests/pull.test.ts` (existing coverage to keep)
- `/home/ivan/Work/infra/akrogon/issues/worktrees/pull-all-repos-u1/tests/helpers.ts` (`fixture`, `cli`, `fakeGh`, `yaml`)
- `/home/ivan/Work/infra/akrogon/issues/worktrees/pull-all-repos-u1/tests/fake-gh.ts` (step shape, consumed in order)
- `/home/ivan/Work/infra/akrogon/issues/worktrees/pull-all-repos-u1/src/config.ts` (`requireRepo`, `readRepo`)
- `/home/ivan/Work/infra/akrogon/issues/worktrees/pull-all-repos-u1/README.md` (command table, `:153` sentence)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Pattern to copy: the existing test `missing and invalid origins fail visibly, and all continues after invalid registrations and origins` shows multi-repo registration via `yaml(global config)` plus `cli(f, ['pull', '--all'], cwd, gh.env)`; the test `pull resolves supported origins ...` shows a linked worktree via `git worktree add`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- `src/pull.ts` (C1-C5): replace the `all ? currentRepo : requireRepo` lookup plus `if (current !== null)` early return with `if (!all) { await pullRepo(await requireRepo(global, process.cwd())); return; }`, then the existing `Object.entries(global.repos)` loop untouched. Drop `currentRepo` from the `./config` import if unused. Do not touch `pullRepo`, failure collection, or `AggregateError`.
- `tests/pull.test.ts` (C1-C5): add the C1/C2/C3 test (two `fixture()` repos in one `config.yaml`, both origins GitHub, fake-gh scripted with one listing step per repo in config order, `args` left undefined) asserting both seed trees and one stdout line per repo from each of the three cwds; add the C4 negative test (one repo with non-GitHub origin, `--all` from inside the healthy repo). Keep every existing test.
- `README.md` (C6): update only the pull row effect and the `:153` sentence per section 2. Keep `[--all]` exactly.
- Needed signatures: `pullCommand(all: boolean): Promise<void>`, `pullRepo(repo: Repo): Promise<void>`, `readGlobal(): GlobalConfig`, `readRepo(name, path): Repo`, `requireRepo(global, cwd): Promise<Repo>`, test helpers `fixture(): Promise<Fixture>`, `cli(f, args, cwd?, env?): Promise<Result>`, `fakeGh(f): GhFixture`, `yaml(path, data)`, `GhStep { stdout, stderr?, code?, args? }`.
- Chunks that must land first: none; this is the single unit.
- Paths this unit owns: `src/pull.ts`, `tests/pull.test.ts`, `README.md`.
- Shared test resource or consumed output: none.

## 5. Do-not, reasons and exceptions

- Do not touch `plugin/`, `src/config.ts`, `src/akrogon.ts`, `pullRepo`, `closeSource`, `next --all`, `docs/guide/*`, `skills/*`, or any `AREA.md`; they are locked exclusions or out of scope. Exception: a revised brief from B authorizing the change.
- Do not mock the repo resolver or run pull logic in-process; the design requires the real CLI on real temp git repos with the fake-gh boundary. Exception: none.
- Do not contact real GitHub, real panes, install roots, or the herdr socket; workers stay isolated and the real A5 run is done by B. Exception: none.
- Do not change CLI arguments or the `[--all]` contract; `tests/command-reference.test.ts` pins it. Exception: a revised brief from B.
- Do not reformat unrelated files; `prettier --write src tests` runs later over the lane. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface. Exception: a revised brief from B authorizing that change.
- Reasons restated: locked exclusions keep the diff minimal, the real-CLI rule keeps tests honest, isolation keeps real state untouched, the contract keeps the CLI stable. Exceptions restated: only a revised brief from B authorizes a scope or interface change; isolation and honest-test rules have no exception.

## 6. Ordered steps

1. Read the section 3 files (all criteria, orientation).
2. Write the C1/C2/C3 and C4 tests in `tests/pull.test.ts` first, run the section 7 command, and paste the red output showing in-repo `--all` pulling only the current repo (fail-first evidence).
3. Fix `src/pull.ts` per section 4 (C1-C5).
4. Rerun the section 7 command until green; paste the green output.
5. Update `README.md` per section 4 (C6); reread the edited row and sentence to confirm the `[--all]` contract and the `next --all` contrast.
6. Commit only the three owned paths with message `pull-all-repos: pull every registered repo from any directory`; record the commit ID for the report.
- Advisory size: 3 files, under 12 turns (at least 4 turns per file). Work clearly beyond this returns a mismatch with evidence, not a silent overrun.

## 7. Commands

Setup once in the fresh worktree: `bun install`. Then the changed-test command only, run from the worktree:

```sh
AKROGON_BASE=a2f3e7a378d025930e12ac05ce8710f57f0752a2 bun test --changed="a2f3e7a378d025930e12ac05ce8710f57f0752a2"
```

Do not run the full suite; B runs it after landing.

## 8. Done-when, evidence and report

Done when C1-C6 hold: new tests fail before and pass after the fix, existing tests pass, README text verified by reading. Paste the red run, the green run, and the commit ID. Scenarios use temporary repositories, real files and processes, with gh replaced at the one fake boundary; no real GitHub, panes, or sockets. The A5 real run from `plugin/` is done by B after landing, so list it under unverified criteria as the explicit handoff. Keep limitations and unverified criteria explicit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
