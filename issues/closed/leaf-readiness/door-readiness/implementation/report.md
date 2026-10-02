# Implementation report: door-readiness

Base: `7c1567dbed492608e8cc104999c401b85d6db408` (`AKROGON_BASE`, readiness-contract merge head)
Head: `c34f0354d5203c99f2366a184c7943aabebcf925`

## Changed files and reasons

| Commit | File | Why |
|--------|------|-----|
| `578e4fb` | `skills/chart-issues/assets/shapes.md` | `readiness.yaml` in both handoff-tree leaf listings; `### readiness.yaml` + schema-valid fenced example in `## Leaf files`; preflight write-order and `akrogon status` parse sentences (criteria 1, 2). |
| `d338c7f` | `skills/chart-issues/SKILL.md` | `proofs` link on the operation-proof paragraph; credential list at old line 55 replaced by key-sheet + key-creation; new Take paragraphs for live-change-grant, proof-fixtures, save-route; Handoff review gains grant confirmation; pre-write `bun -e` gaps presence check (criterion 3). |
| `c34f035` | `tests/chart-shapes.test.ts` | New agreement test: extracts the ` ```yaml ` block under `### readiness.yaml`, parses with `readinessSchema`, and proves `gaps(readGlobal(), readReadiness(<draft>))` on a draft folder with no `state.yaml` returns `[]` then exactly the removed env name (criterion 1). |

Worker execution: wave 1 = U1 (shapes.md) + U2 (SKILL.md) in parallel detached worktrees, wave 2 = U3 (test). Each committed one chunk; A cherry-picked serially, reran `--changed` after each pick, removed all worker worktrees.

## Criterion 4: sentence → binding decision map (SKILL.md)

| New/changed sentence | Decision |
|---|---|
| "…recorded in the fork with the command, inputs, identity reference without secret values, version, date, observed result, cleanup result and limits stating what the call does not prove, **linked from the leaf's `proofs` records in `readiness.yaml`**" | readiness-contract (proof records); design: op-proof keeps text, gains only the `proofs` link |
| "…after the forks settle and before the door's proof calls, the door shows one sheet listing every need across the proposed leaves… the operator completes the sheet at their own pace, with asynchronous approvals waited for before the affected proofs; the door checks presence on each draft `readiness.yaml` and runs the proofs… `inputs[].steps`… `akrogon status`… `akrogon next` refuses dispatch" | key-sheet (1a) |
| "The operator creates every missing outside-account key in one batch before handoff… a leaf that creates something with its own key stores that key itself, declared up front in `produces`, and dependents wait on it through `blocked-by`" | key-creation (Q1 1a + Q2 2a) |
| "Each leaf's `grants` records one scoped live-change grant during charting, before the first mutating proof and confirmed at handoff review… A different identity or account, a target outside the set, a new or different mutation, larger effects or expiry needs new approval." | live-change-grant (1a) |
| Handoff review: "…each leaf's recorded live-change grant confirmed…" | live-change-grant (1a, confirmation leg) |
| "Proof fixtures are disposable by default. Before creation the contract names the cleanup sequence… authenticated absence read-back with visibility shown first… a leftover disposable resource is a blocker recorded with IDs, error, owner and next step. A fixture stays after its proof only by agreement before creation… a cleanup failure never becomes retention afterward, and retention never satisfies a deletion criterion." | proof-fixtures (Q1 1a + Q2 2a) |
| "A producer's contract names its save operation… inside the producer process or in a narrow save subprocess receiving the value privately, never returned to the agent… proves on disposable data that only the named entry changes… proves real revocation… the operator's approval of that recorded, proven operation is the explicit permission… reconciled at its source and re-proved…" | save-route (1a) |
| Handoff: verbatim `bun -e` `gaps(readGlobal(), readReadiness('<draft folder>'))` presence check; "`akrogon status` cannot see drafts without `state.yaml`" | key-sheet (1a, pre-handoff check; design Leaf architecture literal command) |

Replaced, not kept: "Credentials are not such a prerequisite… the handoff batch names the ones absent from the consumer repo's gitignored `.env`" (old line 55) — verified absent by grep.

### Criterion 4: sentence → decision map (shapes.md)

| New/changed sentence | Decision |
|---|---|
| `readiness.yaml` added to both leaf listings in `## Handoff tree` | readiness-contract (each leaf carries the contract) |
| `### readiness.yaml` section: "The door writes one `<leaf>/readiness.yaml` per leaf with all five sections…" + fenced example | readiness-contract; brief criterion 1 |
| "Write brief.md, design.md and readiness.yaml before state.yaml…" | readiness-contract; brief criterion 2 |
| "It parses states with the command's schema, parses each leaf's readiness.yaml… a readiness.yaml that does not parse fails validation." | readiness-contract (`akrogon status` validation); criterion 2 |

## Criterion 4: old credential-list wording sweep (docs/ + skills/)

| Hit | Verdict |
|---|---|
| `skills/chart-issues/SKILL.md` (old line 55) | **Changed** — replaced by the Taken rules |
| `docs/guide/chart.md:199` "Required credentials are named, not pasted into the contract." | Out of scope — still true under the contract (names, not values); not the door's list |
| `docs/guide/limits.md:42` operator provides permissions/credentials | Out of scope — operator role statement, not the door's list |
| `docs/guide/merge.md:57` webhook secret storage | Out of scope — unrelated storage rule |
| `skills/AREA.md:24` `.env` never opened/printed/written invariant | Out of scope — env-file invariant, unchanged by the contract |
| `skills/chart-issues/assets/standing-design.md` secrets live in consumer `.env` | Out of scope — standing invariant, do-not-edit for this leaf |
| `skills/init-akrogon/SKILL.md:40`, `skills/plan-issue/SKILL.md:63`, `check-issue:31`, `implement-issue:45,55`, `merge-issue:29`, `watch-issues:54` | Out of scope — seat-skill `.env` presence rules; seat skills owned by seat-input-rules |
| `skills/broadcast-issue/scripts/discord-send.test.ts:200`, `skills/watch-issues/scripts/fixtures/claude-session.jsonl:24` | Out of scope — test/fixture text, no rule wording |

Sweep terms used: `credentials`, `keys, logins`, `handoff batch`, `variable name`, `every brief lists`, `credential list`, supplementary `.env` hits. No remaining doc states the old credential list.

## Commands run

| Command | Result | Wall time |
|---|---|---|
| `bun -e` extract ` ```yaml ` block under `### readiness.yaml` + `readinessSchema.parse` (U1 probe) | `ok` | seconds |
| `bun test --changed=$AKROGON_BASE --timeout=30000` after each cherry-pick | doc diffs: 0 tests; after U3: `chart-shapes.test.ts` 2 pass | seconds |
| Negative-path probe: `readinessSchema.parse` on truncated example (`stop_line` removed / block cut at `grants:`) | `ZodError` both times — the agreement test catches a broken example | seconds |
| `bun test tests/chart-shapes.test.ts --timeout=30000` | 2 pass, 0 fail | <1s |
| `bun run typecheck` (`tsc --noEmit`) | clean | seconds |
| `bun run format` | clean, no rewrites | seconds |
| `bun test --timeout=30000` (full `checks.test`) | 385 pass, 0 fail, 18 files | 11.6s |

No `merge_checks` configured; none run. No credentials required; no `.env` touched (the test's `.env` is a temp fixture file it writes and deletes itself).

## Done-criteria → evidence

1. `shapes.md` holds the example (one entry per `inputs` env+file, `produces`, `grants` with fixture, `retained`, `proofs`); `tests/chart-shapes.test.ts` extracts and parses it, fails on missing/unparseable block, and proves the draft-folder `gaps` behavior — green above. **Met.**
2. `shapes.md` Preflight and validation: write-order and `akrogon status` parse sentences — in the diff. **Met (prose, review-judged).**
3. `SKILL.md` states the five Taken rules once each in occurrence order; old credential list replaced — in the diff, grep-verified absent. **Met (prose, review-judged).**
4. This report carries the sentence→decision map and the sweep list. **Met.**

## Known limitations

- Criteria 2–4 are prose obligations proven by the diff and this report; the only new test is the criterion-1 agreement test (per standing design and LESSONS 2026-10-01).
- The `bun -e` presence check assumes the installed akrogon layout recorded by the design (`<root>/src/akrogon.ts`); the SKILL.md text names that assumption via `readlink -f $(command -v akrogon)`.

## Unverified criteria

None.
