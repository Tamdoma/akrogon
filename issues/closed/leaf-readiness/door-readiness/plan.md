# Plan: door-readiness

Synthesis direct from brief and locked design (`debate: "no"`); no positions exist.

## Read first

- `brief.md`, `design.md` in this leaf folder — the five Taken rules per binding decision are the contract for the prose.
- `src/readiness.ts` — merged schema and helpers; literal field names are binding (`grants[].fixtures[]` is nested, there is no top-level `fixtures` key).
- `tests/readiness.test.ts` — the `complete` fixture is a schema-valid example; reuse its shapes for the shapes.md example.
- `tests/helpers.ts` — `fixture()` writes `f.home/config.yaml` with `repos: {repo: f.root}`; `globalHome()` honors `AKROGON_HOME`, so `readGlobal()` can be driven in-process.
- `src/config.ts` — `globalHome`, `readGlobal`, `GlobalConfig`.
- `skills/chart-issues/SKILL.md` — Take paragraph order: round recording → operation-proof → human-prerequisite + old credential list (line ~55) → Handoff. Handoff paragraph 1 holds the review sentence.
- `skills/chart-issues/assets/shapes.md` — Handoff tree listings, `## Leaf files` blocks, `## Preflight and validation` final paragraph (write order + `akrogon status` sentence).
- `skills/chart-issues/assets/standing-design.md` — writer/checker share one rule definition; prose criteria are judged in review; one parse test.
- `docs/guide/chart.md` line ~199 — "Required credentials are named, not pasted" is the expected out-of-scope grep hit for criterion 4.
- `learnings/LESSONS.md` — 2026-10-01 (prose assertions couple tests to wording → only the YAML parse is tested), 2026-09-11 (stale rule left in docs/ → criterion 4 sweep), 2026-09-14 (`_2` digit missed by grep class → use plain listings for name sweeps).

## Decisions

- D1: One rule definition. `shapes.md` gains a `readiness.yaml` heading inside `## Leaf files` (after the design block, before the `state.yaml` block) holding a ` ```yaml ` fenced example that parses with `readinessSchema` from `src/readiness.ts`. The only new test, `tests/chart-shapes.test.ts`, proves the agreement; wording is judged in review.
- D2: The example uses placeholder names only, no values: one `inputs` entry of kind `env`, one of kind `file`, both `holder: repo` (the same placeholder convention as `repo: registered-key` in the `state.yaml` sample); one `produces` with `save.entry|revision|args|value_source`; one `grants` entry carrying one nested `fixtures` entry (with `cleanup[].step|identity` and `absence_check`); one `retained` entry; one `proofs` entry with `record` pointing at a chart fork path.
- D3: `readiness.yaml` is added to both leaf listings in the Handoff tree, and the write-order rule becomes brief.md, design.md and readiness.yaml before state.yaml. The `akrogon status` sentence in `## Preflight and validation` states it parses each leaf's `readiness.yaml` alongside states, so a contract the command cannot parse fails validation.
- D4: SKILL.md Taken rules, each stated once in occurrence order:
  1. **key-sheet** (Take, where forks-settle leads into proof calls): after forks settle and before the door's proof calls, the door shows one sheet of every need across the proposed leaves — purpose, consuming leaves, exact permissions and resources, official source with date checked, destination (keys/values to the declared holder's env, files to their paths, approvals to authorization records) and what done looks like — completed at the operator's pace; asynchronous approvals are waited on before the affected proofs; the door checks presence on each draft `readiness.yaml` with the literal `bun -e` `gaps(readGlobal(), readReadiness(<draft folder>))` call from the design (run from the akrogon root, since `akrogon status` cannot see drafts without `state.yaml`) and runs the proofs, with a failed proof yielding a specific repair step; the steps are stored in `inputs[].steps` so `akrogon status` prints still-missing needs and `akrogon next` refuses dispatch.
  2. **key-creation** (Take, same breath): the operator creates every missing outside-account key in one batch before handoff from the door's list; a leaf that creates something with its own key stores it itself, declared up front in `produces`, and dependents wait on it via `blocked-by`.
  3. **live-change-grant** (Take): each leaf's `grants` records one scoped live-change grant during charting before the first mutating proof, confirmed at handoff review — approval provenance, principal and account with credential name and holder (never the value), targets, fixture naming/marker/count, operations including transitive helpers and cleanup, explicit effects (destructive/public/billing/DNS/retention), repeat and recovery bounds, stop line and lifetime; new approval is needed for a different identity or account, a target outside the set, a new or different mutation, larger effects or expiry.
  4. **proof-fixtures** (Take, after the operation-proof paragraph): fixtures are disposable by default; the contract names the cleanup sequence (transitive resources, contents and config), the identity per step (the creator by default, another only when declared and proven before handoff) and the authenticated absence read-back with visibility shown first; the door proves a small create/use/delete cycle with those identities at charting; passes record created IDs under the grant and run cleanup on success and failure; leftovers are blockers with IDs, error, owner and next step; retention only by agreement before creation (purpose, resources, accepting owner, removal date, cost, exposure, cleanup identity and route, why the proof needs it alive), labeled apart in pass artifacts, never from a cleanup failure, never satisfying a deletion criterion.
  5. **save-route** (Take): a producer's contract names its save operation — entry point, inspected revision, non-secret arguments, key name, the holder's real file, the private value source — executed inside the producer process or a narrow private subprocess, never returned to the agent; the door proves on disposable data that only the named entry changes, other entries are preserved and nothing prints, inspects the real target's effective harness controls and records why the result transfers, and proves real revocation on a disposable provider-issued key; the operator's approval of that recorded proven operation is the permission, a denying control is reconciled at its source and re-proved, and no safe representative proof holds the handoff.
  
  The old prose credential list at SKILL.md:55 is replaced, not kept beside the new text.
- D5: Handoff gains (a) "confirming each leaf's recorded live-change grant" inside the existing review sentence, and (b) a pre-write presence check: per draft leaf folder, run the design's `bun -e` gaps call from the akrogon root resolved by `readlink -f $(command -v akrogon)`; prints names only, never values. After valid writes, `akrogon status` validates the emitted files.
- D6: The Take operation-proof paragraph keeps its text and gains only the link that its recording lands in the leaf's `proofs` (design literal: "keeps its text and gains only the link to `proofs`").
- D7: `tests/chart-shapes.test.ts` (new, `bun:test`, following `tests/readiness.test.ts` style):
  - Test 1: read `skills/chart-issues/assets/shapes.md` relative to the test file; extract the first ` ```yaml ` block following the `readiness.yaml` label; fail when the block is absent or `readinessSchema.parse(Bun.YAML.parse(block))` throws.
  - Test 2: `fixture()`; write the extracted example verbatim to `<draft>/readiness.yaml` where `<draft>` is a folder under `f.root` with no `state.yaml`; in the holder root (`f.root`, registered as `repo` by the fixture) write `.env` containing the declared env name and the declared file with content; set `process.env.AKROGON_HOME = f.home` and restore it in `finally`; `readReadiness(<draft>)` parses without `state.yaml`; `gaps(readGlobal(), readiness)` returns `[]`; remove the env name from `.env`; the result is exactly one gap whose `name` equals the removed name.
- D8: Criterion 4 is the implementation report's burden: quote each changed SKILL.md/shapes.md sentence beside the binding decision it carries (readiness-contract, key-creation, key-sheet, live-change-grant, proof-fixtures, save-route), and list every `docs/`/`skills/` hit for the old credential-list wording as changed or out of scope. Sweep terms: `credentials`, `keys, logins`, `handoff batch`, `variable name`, `every brief lists`, `credential list`. Known expected hits: `docs/guide/chart.md:199` (still true — names, not values; out of scope, reported), `docs/guide/limits.md:42` (operator duty, not the door's list; out of scope), `skills/AREA.md:24` and the `.env` presence rules in the seat skills (env-file invariant, not the door's list; out of scope), `standing-design.md` secret-in-.env rule (invariant; out of scope). Any other hit is changed or reported.

## Interfaces

Consumed, unchanged:

```ts
// src/readiness.ts (landed by readiness-contract)
export const readinessSchema: z.ZodType<Readiness>;
export function readReadiness(leafPath: string): Readiness | null;  // null only when the file is absent
export function gaps(global: GlobalConfig, readiness: Readiness): Gap[];
// Gap = { kind: 'env' | 'file'; name: string; holder: string; steps: string }
```

- `tests/helpers.ts`: `fixture()` → `{home, root, clean}` with `repos: {repo: root}` in `home/config.yaml`.
- The door's presence check, verbatim in SKILL.md (design literal):

```bash
bun -e "import {readGlobal} from './src/config.ts'; import {readReadiness, gaps} from './src/readiness.ts'; console.log(JSON.stringify(gaps(readGlobal(), readReadiness('<draft folder>')!)))"
```

## Checklist

### Wave 1

- **U1** — `skills/chart-issues/assets/shapes.md`
  - Handoff tree: add `readiness.yaml` to both leaf listings (single-issue and epic forms).
  - `## Leaf files`: `readiness.yaml` heading + ` ```yaml ` example per D2, placed before the `state.yaml` block.
  - `## Preflight and validation`: write-order and `akrogon status` sentences per D3.
- **U2** — `skills/chart-issues/SKILL.md`
  - Take: replace the credential list at line ~55 with key-sheet and key-creation rules (D4.1–D4.2); live-change-grant rule (D4.3); proof-fixtures rule appended to/after the operation-proof paragraph (D4.4); save-route rule (D4.5); `proofs` link per D6.
  - Handoff: grant confirmation and pre-write presence check per D5.
  - `docs/`/`skills/` sweep per D8, collecting hits for the report.

U1 and U2 own disjoint files and share no resource.

### Wave 2

- **U3** — `tests/chart-shapes.test.ts` — needs U1's landed example block.
  - Tests per D7, matching `tests/readiness.test.ts` style and strict typing.

No shared test resource: all fixtures are temp dirs.

## Done-criteria → proof

| # | Proof | Catches | Size | Rerun trigger |
|---|-------|---------|------|---------------|
| 1 | `bun test tests/chart-shapes.test.ts --timeout=30000` | missing/unparseable example, schema drift, holder/gap behavior | seconds | diff in `shapes.md`, `src/readiness.ts` or the test |
| 2 | Review judgment on the `shapes.md` diff (write-order + status sentences); supporting evidence `grep -n 'readiness.yaml' skills/chart-issues/assets/shapes.md` | rule omitted or contradicted | seconds | diff in `shapes.md` |
| 3 | Review judgment on the `SKILL.md` diff (five Taken rules, once each, in order; old list gone); supporting evidence `grep -n 'key sheet\|one batch\|grant\|fixture\|save' skills/chart-issues/SKILL.md` and `grep -n 'keys, logins' skills/chart-issues/SKILL.md` returning nothing | missing/duplicated rule, retained old list | seconds | diff in `SKILL.md` |
| 4 | Implementation report content — checked at check.review against the diff and the sweep list | unmapped change, unreported stale hit | n/a | report produced |
| all | `bun test --timeout=30000` (repo `checks.test`) | cross-suite regressions (docs-links, command-reference) | minutes | final gate |
| all | `bun run typecheck`, `bun run format` | type/format drift in the new test | seconds | any diff |

No `merge_checks` are configured; none are added. No live calls, no fixtures beyond temp dirs — nothing here is a slow or live run, so no restart boundaries apply.

## Doc checklist

- `skills/chart-issues/SKILL.md` and `skills/chart-issues/assets/shapes.md`: the change itself.
- `skills/chart-issues/assets/questions.md`, `standing-design.md`: unchanged (no rule moves there).
- `docs/guide/chart.md`, `docs/guide/limits.md`, `skills/AREA.md`, seat skills: expected out-of-scope hits, reported per criterion 4.
- README and other `docs/` pages: no readiness or credential-list content today; hits found by the D8 sweep are changed or reported.

## Credentials

The design names no env variable this leaf itself needs — the contract's `credential`/`holder`/`env` names are data the door writes, not leaf inputs. No `.env` presence check is required for execution.

## Limitations and exclusions (preserved)

- Criteria 2–4 are prose obligations; per standing design and LESSONS 2026-10-01 they are proven in review, not by tests. The single new test covers only the YAML agreement and draft gaps.
- Excluded by design: seat-skill changes, `src/` changes (readiness-contract owns `readiness.ts`, `status`, `next`), `questions.md`, `issues/` paths, env-link worktree mechanics, and the blocker-record settings change (operator step).
- The `bun -e` gaps call and its `readlink`-resolved root assume akrogon is installed at the layout the design recorded (`<root>/src/akrogon.ts`, 2026-10-02); SKILL.md names that assumption where the command is written.
