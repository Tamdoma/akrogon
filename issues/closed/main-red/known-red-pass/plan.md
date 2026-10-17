# Plan: known-red-pass

Debate is off (`debate: "no"`); this synthesis plans directly from brief.md, design.md and the live surfaces listed below.

## Read-first

- `brief.md`, `design.md` under this leaf (locked rule and binding decision)
- `src/verify.ts` — run path, `verifyRunSchema`, `greenRun`, `requireGreenReceipt`, `verify()`
- `src/flaky.ts` — `failedTests` extraction (currently private; exports per design), `flips` consumer
- `src/run-check.ts` — `checkedRun`, `LeafTarget`, `leafTarget`, `leafFields`
- `src/config.ts` — `worktreeStore`, `base`, `setupCommand`; `src/preflight.ts` `trackingRef`
- `src/next.ts` — `createSparseWorktree`, `emitEnvFile`
- `src/akrogon.ts` — verify option map and call site
- `src/phase.ts` — `requireGreenReceipt` call sites (`check.review`, `check.repair→merge`, `merged --check`, batch push)
- `skills/chart-issues/scripts/direct-guards.ts` — receipt gate for the direct route
- `src/reconcile.ts` — verify-run use at `verify-*` keep-rule (name+`end` only)
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `greenReceipt`, `fakeAkrogon`), `tests/verify.test.ts`, `tests/receipt-gates.test.ts`, `tests/docs-links.test.ts`
- `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/chart-issues/SKILL.md` (landing step and Shared endings)
- `src/AREA.md` — verify lines to update
- `docs/reference-index.md`, `learnings/LESSONS.md` (read; no leaf-relevant open lessons)

## Decisions

- D1 — CLI shape: `akrogon verify [--sha <rev>] [--attempt <id> | --holder <path>] --known-red`. `src/akrogon.ts` gains `'known-red': { type: 'boolean' }` in the verify option map and passes `values['known-red'] === true` as a new trailing boolean parameter to `verify()`. Scope and caller resolution (`verifyCaller`, leaf/merge scope rule) are unchanged.
- D2 — Record shape: `verifyRunSchema` gains `compares: z.string().optional()`. Only base runs carry it, set to the head run id. Head runs (written by plain or `--known-red` verify) carry none.
- D3 — Run path: the existing `verify()` body (allocation, `createSparseWorktree`, `emitEnvFile`, setup, per-command `checkedRun`, record rewrite under `recordLock`, worktree removal) is extracted into one `runOnce(repo, caller, sha, tree, scope, akrogonBase, extra?)` returning the completed `VerifyRun`; `extra` seeds `compares` for the base run. Plain and known-red heads and the base run all go through it; the base half never consults `greenRun`.
- D4 — `verify --known-red` flow: the `greenRun` reuse short-circuit is unchanged (a green receipt still prints `reuse receipt` and exits 0). Otherwise the head half is the most recent completed run for the tested tree and scope with `setup === 0`, commands matching the current `verifyCommands` set by index, and at least one nonzero command — reuse across processes is allowed by the subset rule (answers the design's head-selection question). When none exists, the head runs first exactly as plain verify (through `runOnce`, printing `verify <scope> <sha>: green|red`); a green fresh head exits 0. With a red head run `H`: `baseSha = git merge-base <sha> <trackingRef(repo)>` in `repo.root`, then a fresh base run `B = runOnce(repo, caller, baseSha, treeOf(baseSha), scope, akrogonBase=baseSha, { compares: H.run })`. Result `pass` iff `B` completed, `B.setup === 0`, and for every `H.commands[i]` with `exit !== 0`: `failedTests(repo, H.commands[i].log)` is non-empty, contains no `(no test name)`/`(log gone)` placeholder, and is a subset of `failedTests(repo, B.commands[i].log)` where `B.commands[i]` is the same index (same command by construction). A `B` that failed to complete, had `setup !== 0`, or a base command that is green or yields no names fails that head command. Prints `verify known-red <sha>: pass|fail`, exits 0 only on pass. A missing `trackingRef` or `merge-base` throws (nonzero) — no pair is written.
- D5 — `requireGreenReceipt(repo, sha, scope)`: `greenRun` acceptance unchanged; else scans completed leaf/merge-scope candidate head runs for `tree === treeOf(sha)` with the exact current command set (index-matched), `setup === 0`, ≥1 nonzero command, in `end`-descending order, and accepts when some candidate has a completed `base` run with `compares === head.run`, `base.sha === git merge-base <sha> <trackingRef>`, `setup === 0`, index-matched commands, and the D4 subset rule holding per nonzero head command. The refusal error string is unchanged (`No green <scope> verify receipt …`).
- D6 — `src/flaky.ts` exports `failedTests(repo, recorded)` unchanged (placeholders `(no test name)` and `(log gone)` already represent "no names" and the subset rule treats them as failure).
- D7 — Open-for-plan `flips`: base runs stay as real observations. Their tree is the base (main-side) tree, so a red base run followed by a green main run on that tree reads as a true flip of main — no exclusion added.
- D8 — Open-for-plan `reconcile`: confirmed unaffected. `src/reconcile.ts` matches a `verify-<id>` worktree to `verifyRuns` by `run.run` and checks only `end === undefined` plus owner liveness; `leaf`/`sha` on the record play no role.
- D9 — `AKROGON_BASE` for the base run is `baseSha` itself (`git diff $AKROGON_BASE...HEAD` inside a base command then diffs nothing, and `akrogon guard own-modules` still runs through `setupCommand` as today).
- D10 — Seat skill edits replace the "every commit on the default branch passed `akrogon verify`" sentences with the known-red step per brief criterion 7: after the one retry stays red and the seat judges no cause in the diff, run `akrogon verify --known-red` (with `--attempt <id>` at merge), read the head and base logs of each red command for runner completeness and causal fit, record that judgment in `implementation/report.md` or the review beside the kept logs, and treat a known-red exit 0 as passing only when that judgment agrees; a disagreeing judgment or failing exit keeps the existing red path.
- D11 — chart-issues direct landing step 3: after a red `akrogon verify --holder <chart>/direct` on the rebased head, the door retries once on the same head, judges the diff for a cause, and on a no-cause red runs `akrogon verify --holder <chart>/direct --known-red`; only a failing known-red result counts as a blocking landing-check failure (repair bound wording updated to match).
- D12 — `src/AREA.md`: update the `verify.ts` line for `--known-red`/`compares` and the run-description line for the linked base run. `skills/plan-issue/SKILL.md` is expiring-time-rule's surface; not touched.
- D13 — No new proof machinery: proofs use `bun test` plus the existing CLI/fixture/`run-check` harness. Real `akrogon verify` runs happen in temporary fixture repos per the standing design.

## Units and waves

### U1 — command and gate (wave 1)

Owns: `src/verify.ts`, `src/flaky.ts`, `src/akrogon.ts`, `tests/verify.test.ts`, `tests/receipt-gates.test.ts`, `tests/helpers.ts` (add a `pairReceipt`-style seeder building head+base records with `compares`, nonzero exits and real logs under an owner dir).

Changes: D1–D9. `requireGreenReceipt` implementation in `src/verify.ts` widens accepted evidence; its four call sites (`src/phase.ts` ×3+1, direct-guards) and their call sites stay byte-identical — no edits needed in `src/phase.ts` or `skills/chart-issues/scripts/direct-guards.ts` (design's "only if its call changes" does not trigger). `failedTests` becomes exported; `flips`/`flakyLines` untouched.

### U2 — seat skills and docs (wave 1)

Owns: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/chart-issues/SKILL.md`, `src/AREA.md`, `tests/docs-links.test.ts`.

Changes: D10–D12. implement-issue: replace the base-defect sentence in the Shared context retry paragraph (and apply the same disposition wherever it cross-references it: implement-end retry line, check.fix). check-issue: same replacement in the check.review paragraph; the check.repair cross-reference stays a pointer to that paragraph. merge-issue: Shared endings gains the `akrogon verify --attempt <id> --known-red` step between the red rerun and the `check.fix` ending, with both-logs judgment recorded in `review-B.md`; a passed+agreed result proceeds to `merged --check`. chart-issues: landing step 3 per D11 and the repair-bound line naming "blocking landing-check failure" updated so only a failing known-red result counts.

Wave rationale: U1 and U2 own disjoint paths, share no test resource, and have no dependency — the doc-contract tests in U2 assert wording, not U1's runtime.

Serial assessment: wave 1 holds 2 units → delegated run, not serial-solo.

Docs: `src/AREA.md` verify lines (in U2). No guide (`docs/guide`) file names verify receipts or the removed sentence — confirm by grep during U2; report any hit. No agent doc other than the four SKILL.md files is affected.

## Criterion proofs

Seeded logs live under `issues/open/issue/<owner>/` in the fixture so `readLog`/`locate` resolves them; real runs write under the leaf's `implementation/` as today. `failedTests` placeholders count as no names.

1. **Qualifying leaf pair passes** — new test in `tests/verify.test.ts`: fixture repo with `checks: { t: 'echo "(fail) alpha" >&2; exit 7' }`-style script whose failing test name comes from a tracked file; `greenReceipt(f, baseSha, 'leaf')` seeded first; run `akrogon verify --known-red` in the caller worktree → exit 0, stdout ends `verify known-red <sha>: pass`; `verify-runs.jsonl` holds a fresh head run plus a base run with `compares === head.run`, `sha === merge-base head origin/main` (proves the seeded green base receipt was not reused); `akrogon phase <slug> check.review --slot A` succeeds. Command: `akrogon run-check --name plan-c1 -- bun test tests/verify.test.ts -t "<pattern>"`. Size: seconds. Rerun trigger: any change to `src/verify.ts`, `src/flaky.ts`, `src/akrogon.ts`, `tests/verify.test.ts`, `tests/helpers.ts`.
2. **Head-only failure refuses** — same test file: head's tracked failure name `beta`, base prints `alpha` → `verify --known-red` nonzero, `check.review` still refuses with `No green leaf verify receipt`. Command: same runner, `-t` for this case. Size: seconds. Rerun trigger: same as c1.
3. **Pair guards** — same test file, seeded records via the new helper, `requireGreenReceipt` asserted `rejects` for: (a) head nonzero command yielding no test names (log without `(fail)` lines → `(no test name)` placeholder), (b) head nonzero command with a missing log (`(log gone)`), (c) base run without `end`, (d) base run `setup !== 0`, (e) base run under a different command set, (f) base run green where head is red. Command: `-t` for this group. Size: seconds. Rerun trigger: same as c1.
4. **Base side always fresh** — covered inside criterion-1's test (green base receipt seeded, fresh base run recorded with `compares`). No separate test. Size: seconds. Rerun trigger: same as c1.
5. **Merge-scope pair through the gates** — new test in `tests/receipt-gates.test.ts`: seed a qualifying merge-scope pair for the merge leaf's HEAD (head red on one command with a `(fail)` name also failing on the linked base record) → `phase <slug> merged --slot B --check --attempt a1` stamps `tested_top` and `bun skills/chart-issues/scripts/direct-guards.ts <worktree> repo <chart>` exits 0 on a direct worktree with the same pair; a non-qualifying pair (head-only failure name) refuses both with `No green merge verify receipt`. Command: `akrogon run-check --name plan-c5 -- bun test tests/receipt-gates.test.ts -t "<pattern>"`. Size: seconds. Rerun trigger: `src/verify.ts`, `tests/receipt-gates.test.ts`, `tests/helpers.ts`.
6. **Plain verify unchanged** — new case in `tests/verify.test.ts`: red plain `akrogon verify` exits 1 and leaves exactly one record (no base half); green reuse and run-again coverage exist today ('a green receipt covers another commit…', '…under a different command set and verify runs again'). Command: `-t` for this case. Size: seconds. Rerun trigger: same as c1.
7. **Seat skills name the known-red step** — new doc-contract case in `tests/docs-links.test.ts`: assert `verify --known-red` (and `--attempt <id>` beside it in merge-issue) appears in `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, and that none of the three still contains `passed \`akrogon verify\`` as the base-defect justification sentence. Command: `akrogon run-check --name plan-c7 -- bun test tests/docs-links.test.ts -t "<pattern>"`. Size: seconds. Rerun trigger: any edit to the three SKILL.md files or the test.
8. **Direct landing step** — same file: `skills/chart-issues/SKILL.md` contains `verify --holder <chart>/direct --known-red` in the landing step and the repair-bound wording only counts a failing known-red result as blocking. Command: same runner, `-t` for this case. Size: seconds. Rerun trigger: `skills/chart-issues/SKILL.md` or the test.

Note: `bun test -t` is confirmed (`-t, --test-name-pattern=<val>` in `bun test --help`); if it ever fails, run the named file whole (still the existing runner, seconds).

## Planned red evidence (committed 91c3f14 before product code)

- `akrogon run-check --name plan-verify -- bun test tests/verify.test.ts -t "known-red|linked pair|red head"` → `check plan-verify: 1` (`implementation/check-plan-verify-1792228477807-1141859.log`): criteria 1 (`--known-red` exits 1, flag unknown), 2 (no `verify known-red` output) and 3 (`Unrecognized key: "compares"` from the strict schema) each fail for the missing behavior; the criterion-6 guard passes pre-change by design since it asserts only the absence of a base record under unchanged plain verify.
- `akrogon run-check --name plan-gates -- bun test tests/receipt-gates.test.ts -t "linked pair"` → `check plan-gates: 1` (`implementation/check-plan-gates-1792228485737-1142913.log`): criterion 5 fails with `Unrecognized key: "compares"` while seeding the pair.
- `akrogon run-check --name plan-skills -- bun test tests/docs-links.test.ts -t "known-red"` → `check plan-skills: 1` (`implementation/check-plan-skills-1792228480685-1142334.log`): criteria 7 and 8 fail on the absent `--known-red` text in all four skills.

## Open limitations (preserved from the design)

- No run-once detection and no assigned repair owner for a red main; the operator notice is `main-red-notice`'s scope.
- A new break inside an already-red unit can land unseen (accepted cost in the locked decision).
- `verify --known-red` runs the base fresh each call; main staying red costs one base run per affected leaf.

## Implementation notes

- 2026-10-17 check.repair: update README.md and docs/guide/{setup,phases,merge}.md for the qualifying linked-pair receipt and retry workflow, as required by the design binding decision “a red that is also red on the exact base passes the verify gates” and brief criteria 7–8; repairs review-A F1 and review-B F4.
