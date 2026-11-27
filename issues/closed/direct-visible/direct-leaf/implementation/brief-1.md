# Brief 1 — U1: verbs and state (direct, direct-drop, state schema, stop factoring)

## 1. Goal

Implement plan decisions D1, D2, D3, D4, D5, D18 and the U1 wave line of `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` (the plan is the contract; read it first — sections Decisions D1-D5, D18, Interfaces, and Criterion 1/2/9 constructions). Outcome: `akrogon direct` and `akrogon direct-drop` exist and behave per the plan, the state schema accepts `direct`, `stopLeafWork` is factored, `stop --all` selects unfinished direct leaves, and `tests/direct-create.test.ts` + `tests/direct-drop.test.ts` pass unmodified.

## 2. Numbered acceptance criteria

1. `bun test tests/direct-create.test.ts --timeout=120000` passes all 12 tests unmodified.
2. `bun test tests/direct-drop.test.ts --timeout=120000` passes all 6 tests unmodified.
3. `bun run typecheck` exits 0.
4. `bun test tests/command-reference.test.ts tests/cli-help.test.ts --timeout=120000` passes (you must extend command-reference's `contracts` map — see step list — and commands.md rows must match the verbs exactly).
5. `bun test tests/stop-all.test.ts` if it exists, else `grep -l "stop.*--all" tests/*.test.ts` hits, pass unmodified (D18 must not regress tabbed-leaf selection).
6. No behavior change for non-direct leaves anywhere.

A worker writes and edits no test: a planned test that is wrong or red once your code is correct is a mismatch returned to A, never a test fix. The one exception: `tests/command-reference.test.ts` needs its `contracts` map extended for the two new verbs (plan D2 sanctions this, citing brief items 1/2). That edit is a test-file change and its commit carries the `Test-Change:` trailer — see section 8.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` — the contract (D1-D5, D18, Interfaces, Red evidence notes on cancel semantics and fake-systemctl).
- `src/usage.ts`, `src/akrogon.ts` — verb declaration/dispatch pattern; `verify-pass` is the hidden-verb precedent but these two verbs are public.
- `src/state.ts` — the strictObject schema; add `direct`.
- `src/next.ts` — `writeLeafEnv` (to export), `createSparseWorktree`, and `allocate` (what NOT to reuse).
- `src/stop.ts` — `stopLeaf` (lines ~64-80) to factor; the `--all` selection at ~99-104.
- `src/hc.ts` — `sessions()`, `terminal()`, `HcError`, `errorKind` (`not_found` detection).
- `src/preflight.ts` — `checkBase(repo, remoteRequired)`.
- `src/config.ts` — `ensureLeafTemp`, `worktreeStore`, `leafTemp`.
- `tests/direct-create.test.ts` and `tests/direct-drop.test.ts` — the exact assertions you must satisfy; read them fully before designing anything. They are the contract's executable form.
- `ponytail.md` in the implement-issue skill folder.

## 4. Change list and needed interfaces

Paths this unit owns: `src/state.ts`, `src/direct.ts` (new), `src/akrogon.ts`, `src/usage.ts`, `src/next.ts` (export writeLeafEnv only), `src/stop.ts`, `docs/reference/commands.md`, `tests/command-reference.test.ts` (contracts entries only), `src/AREA.md` (one line for src/direct.ts), `tests/AREA.md` (the new direct-* test file names). No other wave unit touches these except `src/next.ts`/`src/stop.ts` adjacency in wave 2/3 — keep both diffs minimal and localized.

Must land first: nothing (wave 1). Worktree creation commit: filled by A below.

Key binding facts copied from the plan:

- State: `direct: z.boolean().optional()` on the strictObject schema, written only as `direct: true`.
- `akrogon direct <slug> --reviewer <address> [--source <owner/repo#n>]...`: `--source` is the codebase's first repeatable flag — use `util.parseArgs` native `multiple: true`. Create flow (all refusals BEFORE any write): (1) require `HC_TERMINAL_ID` set and probing live across `sessions().live` — the caller's session is discovered by the same probe; (2) scan `issues/open/*/<slug>`: exactly one match with ISSUE.md+brief.md+design.md and no state.yaml, owner folder holds no other leaf with state.yaml; (3) probe reviewer across `sessions().live`, exactly one live session must resolve it (zero = refuse, more than one = refuse); (4) `checkBase(repo, true)`, `createSparseWorktree(repo, worktreePath, base, {branch: slug})`, `writeLeafEnv` exported with `live` false, `ensureLeafTemp`, `saveState` with phase implement / full-ISO created / sources in order / frozen {} / both seat refs / env_names / direct: true / NO tab. No setup run, no lock.
- Rerun semantics (scan finds state.yaml WITH direct, in open or closed): rewrite ONLY seat.A/seat.B (both re-probed live); clear `delivery_error` only for slots whose session or address changed; everything else byte-preserved including sources/prompted/created/phase; never create worktree/branch. Scan finds state.yaml WITHOUT direct → refuse `<slug> is not a direct leaf`.
- `akrogon direct-drop <slug> --chart <chart folder>`: refuses unless leaf is direct (open, any phase except merge), destination `<chart>/direct/` does not already exist, `--chart` present (usage error naming --chart). Then: `cancelLeafRuns`, leaf-slice systemctl stop, per-run scope stops — factored from `stopLeaf` into exported `stopLeafWork` in `src/stop.ts` (stopLeaf calls it too; direct-drop skips seat-ending and the stopped.yaml record); `git worktree remove --force`; `git update-ref -d refs/heads/<slug>`; `rename` owner folder `issues/open/<owner>/` → `<chart folder>/direct/`. `--chart` arrives repo-relative (`issues/chart/<name>`).
- Fake vs real systemctl: tests seed slices as loaded; do not add error-excusing logic beyond what stopLeaf already does.
- `cancelLeafRuns` semantics: live records get `cancel: true`, never `state: 'cancelled'` — tests assert exactly this.
- D18: `stop --all` selection gains `|| state.direct === true` (unfinished direct leaves). Do not change tabbed-leaf behavior.
- stdout of `direct`: prints the leaf folder path and worktree path, realpath-normalized (the tests parse them; check exact expectations in the test file).
- interfaces: `writeLeafEnv` exported from src/next.ts; `stopLeafWork` exported from src/stop.ts; `requiredSlots`/`historicalSlots` are NOT yours (wave 2).

## 5. Do-not, reasons and exceptions

- Do not edit any planned test file except the sanctioned `tests/command-reference.test.ts` contracts entries: the tests are the criterion contract; a red that persists when your code is correct means a mismatch — return it with evidence. Exception: the contracts map edit alone, cited.
- Do not write or edit tests beyond that; do not weaken assertions; do not special-case test fixtures in product code: any of these hides a real defect instead of fixing it. No exception.
- Do not refactor adjacent machinery (`allocate`, `dispatchLeaf`, reconcile): wave 2/3 units own those; overlapping edits break cherry-picks. Exception: the two-line `writeLeafEnv` export.
- Do not reuse `allocate`'s prelude: it mints tabs and probes label-seats, both forbidden for direct. The plan investigated this; reuse means a mismatch-worthy defect.
- Never run any `git stash` subcommand: every worktree shares one stash and a pop can lift a sibling worker's edit. To check behavior on the base, use a second worktree of the base instead. Replacement for setting work aside: commit as WIP and, before returning, `git reset --soft <creation commit>` and make the unit's single returned commit.
- Do not kill processes by pattern (pkill -f etc.): the pattern matches other leaves' runs. Use `akrogon stop-run <run-id>`.

## 6. Ordered steps

1. Read plan.md D1-D5/D18 and both test files fully. (Criterion: you can state every assertion group.)
2. `src/state.ts`: add the `direct` field. Run `bun test tests/direct-seats.test.ts --timeout=120000 -t 'nonexistent'` typecheck-only sanity: `bun run typecheck`.
3. `src/usage.ts` + `src/akrogon.ts`: declare both verbs (`--reviewer` string, `--source` string multiple, `--chart` string), dispatch, help rows. `docs/reference/commands.md` rows. `tests/command-reference.test.ts` contracts entries.
4. `src/stop.ts`: factor `stopLeafWork`; D18 selection. Verify `grep -l 'stop' tests/*.test.ts | xargs bun test --timeout=120000` for the stop test files passes.
5. `src/direct.ts`: probes + create + rerun + drop. Wire dispatch.
6. Run the two planned test files; iterate until green or mismatch.
7. `src/AREA.md` line, `tests/AREA.md` lines.
8. Final: `bun run typecheck`, both planned files green, command-reference/cli-help green.
9. `git reset --soft <creation commit>`; single commit `feat: akrogon direct and direct-drop verbs` (or similar) — with the `Test-Change: tests/command-reference.test.ts <citation>` trailer since you edited it.

Advisory size: about 8 files and under 60 turns.

## 7. Commands

Targeted tests (run in your worktree, cwd = worktree root):
- `bun test tests/direct-create.test.ts --timeout=120000`
- `bun test tests/direct-drop.test.ts --timeout=120000`
- `bun test tests/command-reference.test.ts tests/cli-help.test.ts --timeout=120000`
- `bun test tests/stop*.test.ts --timeout=120000` (glob-expand only what exists)
- `bun run typecheck`

Install first if node_modules is absent in your worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.

Never `akrogon verify` — that is A's. Long evidence commands through `akrogon run-check --name <label> -- <cmd>` citing the printed `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Done when all acceptance criteria pass in your worktree and the single squashed commit exists. Report the four lines below plus the commit ID. A worker commit changing `tests/command-reference.test.ts` ends with `Test-Change: tests/command-reference.test.ts brief items 1-2: new verbs direct/direct-drop require contract entries` in the final trailer block.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

Creation commit (A fills at wave start): 5c5337df — VERIFY with `git log --oneline -1` at start; if different, use what is there.
