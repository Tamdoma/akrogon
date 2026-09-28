# Plan: operation-proof

Direct synthesis by B for `debate: no`. No positions or rebuttals were produced or needed. The brief and locked design govern scope.

## Decisions

- D1. Canonical operation-proof rule lives in `skills/chart-issues/SKILL.md` Take as one new paragraph after the current prototype sentence (SKILL.md:51). It states: every external operation a brief names (API method and path, CLI command, launch flag) gets one real call with the identity the leaf will use, recorded in the fork with command, inputs, identity reference without secret values, version, date, observed result, cleanup result and limits (what it does not prove). Writes use the smallest reversible call on a throwaway target with checked cleanup. A provider dry-run or validate call counts only for the property the provider documents it proves, run with the real identity and target. Declining a required probe holds the handoff. When no safe sufficient probe exists the handoff is held and scope is not narrowed. No waiver. Function over form: state required evidence, not a fixed template or wording.
- D2. Edit the credential timing in SKILL.md:53 only: change the final clause from "so the operator fills them before dispatch" to "before handoff so the probes can run". Keep the rest of the sentence (brief lists keys by variable name, what each is, where obtained, handoff batch names absent ones). "Credential access alone never qualifies" stays true; only timing moves.
- D3. In `skills/chart-issues/assets/shapes.md`, add two cross-reference sentences without restating rule fields. Para 166 (Preflight): refuse the handoff when a brief names an external operation with no recorded proof under the Take operation-proof rule. Para 168 (implementer audit): the audit checks that refusal. Write them as separate additive sentences that do not touch base-preflight's `akrogon preflight` sentence; the later merge rebases.
- D4. In `skills/chart-issues/assets/questions.md` Optional measurement (questions.md:52-54), scope the section to exploration only: it never replaces required operation proof, and declining a required probe holds the handoff per the Take rule. Keep existing sandbox behavior (smallest experiment, time-box, finding retained, scratch code discarded) for exploration.
- D5. One canonical definition per rule. Handoff (SKILL.md:61), the preflight sentences and Optional measurement enforce via reference ("under the Take operation-proof rule") without copying field lists. No src change, no new verb, no service-specific recipe, no change to standing-design.md.
- D6. Fuzzy terms resolve as: external operation is only what a brief names; identity is a consumer `.env` reference by name without values; sufficient means the call proves that operation works with that identity and target; throwaway means a deletable test target; checked cleanup means deletion verified and residue recorded as failed proof; limits means an explicit "does not prove" line. Scope lists, docs, introspection and operator assurance are not proof.
- D7. Verification is prose audit, not automated tests. Add no test file and do not extend `tests/docs-links.test.ts` (it scans only README and docs/guide per tests/docs-links.test.ts:75-86, so it proves nothing about skills). Done-criterion 6 is met by the three-case audit plus a direct link check, with configured `checks` as regression only. The link check distinguishes real navigational links (SKILL.md's three asset links) which must resolve from shape-template placeholders (`forks/<fork-slug>.md`, `<issue>/ISSUE.md`, `<leaf>/brief.md`) which are exempt examples listed in the report.
- D8. Sweep `docs/` and README for the changed rule per learnings/history/2026-09-11-stale-rule-in-docs.md. Expected outcome is no human-doc edit: docs/guide/chart.md:199 says only "named, not pasted" without timing and does not restate preflight or proof. Report hits; do not widen into a guide rewrite.

## Read first

Paths relative to the leaf worktree unless marked absolute.

- P1. This leaf's `brief.md` and `design.md` (absolute: `/home/ivan/Work/infra/akrogon/issues/open/execution-readiness/operation-proof/`). Design wins on conflict.
- P2. `skills/chart-issues/SKILL.md` Take (lines 45-53) and Handoff (lines 55-63).
- P3. `skills/chart-issues/assets/shapes.md` Preflight and validation (lines 164-170), `skills/chart-issues/assets/questions.md` Optional measurement (lines 52-54), `skills/chart-issues/assets/standing-design.md`.
- P4. Absolute fork source: `/home/ivan/Work/infra/akrogon/issues/chart/execution-readiness/forks/write-proof.md` (Taken 2026-09-28). Peer leaf for overlap only: `/home/ivan/Work/infra/akrogon/issues/open/execution-readiness/base-preflight/brief.md` and `design.md`.
- P5. `tests/docs-links.test.ts:75-86`, `docs/guide/chart.md` Handoff section, `docs/reference-index.md`, `skills/AREA.md`, `tests/AREA.md`, `learnings/LESSONS.md`. No lesson edit is needed.

## Interfaces and concrete scenarios

- I1. Evidence record: a fork Findings entry for operation `POST /locations/customFields` holds command, inputs, identity ref (for example `GHL_API_KEY` name only), API version, date, observed 2xx plus created field id, cleanup DELETE result, and limits (proves write scope on that location; does not prove calendar writes). Cleanup failure is failed proof with recorded residue.
- I2. Sufficient real probe: the I1 record exists for every brief-named operation, credentials were present in the consumer `.env` before handoff, handoff proceeds.
- I3. Limited dry-run: a provider `validate` endpoint documents auth-only proof. Run with the real identity it proves auth only; the write scope still needs its own I1 record. A sufficient no-write check is preferred when one exists.
- I4. Hold: brief names `POST /locations/customFields` with only GET evidence, or the operator declines the probe. Handoff is held, scope is not narrowed, no waiver is recorded. This is the Tamdoma/akrogon#20 case (GET-only probing plus unverified "I added the permission" let a missing `locations/customFields.write` scope reach implement).

## Acceptance criteria before implementation

- C1. Brief 1 and 5: Take holds the single canonical rule with all D1 elements; Handoff and both assets reference it without restating it.
- C2. Brief 2: the credential sentence requires needed keys in the consumer gitignored `.env` before handoff so probes can run.
- C3. Brief 3: shapes.md Preflight refuses a brief-named operation with no recorded proof, and the implementer audit checks it.
- C4. Brief 4: Optional measurement covers exploration only, never replaces required proof, and declining a required probe holds the handoff.
- C5. Brief 6 audit: the implementation report walks I2, I3 and I4 against the edited prose and each reaches the required outcome (proceed, partial credit plus further evidence, hold). Every real link in the three edited skill files resolves; placeholders are listed as exempt.
- C6. Configured checks pass as regression: `bun run format`, `bun run typecheck`, `bun test`. No new test file, no src diff, no human-doc edit unless the D8 sweep finds a real contradiction.

No credential variable is named by this design (brief Credentials: None), so no `bun --env-file=.env` presence check is required.

## Ordered file and criterion checklist

Agent docs affected, one line each:
- `skills/chart-issues/SKILL.md`: canonical Take rule plus credential-timing edit plus Handoff cross-ref.
- `skills/chart-issues/assets/shapes.md`: Preflight refusal plus implementer-audit cross-refs.
- `skills/chart-issues/assets/questions.md`: Optional measurement scoping cross-ref.

No human doc is affected; `docs/guide/chart.md` and `README.md` are swept with no edit expected.

- [ ] A1. Edit SKILL.md Take per D1 and D2, and add the Handoff cross-ref per D5. Covers C1, C2.
- [ ] A2. Edit shapes.md paras 166 and 168 per D3, additive sentences only, no touch to the base-preflight sentence. Covers C1, C3.
- [ ] A3. Edit questions.md Optional measurement per D4. Covers C1, C4.
- [ ] A4. Run the D8 sweep (`docs/`, README) and the direct link check; record hits and placeholder exemptions. Covers C5, C6.
- [ ] A5. Run concrete verification below, walk I2/I3/I4 against the edited prose, inspect the full diff for ownership and single-definition discipline, commit only the three owned files. Covers C1-C6.

No dependency on another leaf. Base-preflight edits the same shapes.md paragraph in parallel; the later merge rebases. Steps are one sequence.

## Concrete verification

Run from the leaf worktree. Planning baseline is `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`; execution uses its freshly resolved `AKROGON_BASE`.

```sh
bun run format
bun run typecheck
bun test
git --no-pager diff --check
git --no-pager diff --stat
git status --porcelain
```

One-off acceptance checks, recorded in the report without adding test files:

- V1. Link check: confirm `skills/chart-issues/SKILL.md` asset links (`assets/questions.md`, `assets/shapes.md`, `assets/standing-design.md`) resolve to existing files; list the shapes.md template placeholders as exempt examples. Record the command and result.
- V2. Three-case audit: quote the edited rule lines and walk I2 (proceed), I3 (partial credit only) and I4 (hold, no waiver) to their required outcomes.
- V3. Sweep: `grep -rn "before dispatch" skills/chart-issues/ docs/guide/ README.md` shows no remaining pre-dispatch timing for these credentials; `grep -rn "Optional measurement" skills/chart-issues/assets/questions.md` shows the scoped section. Inspect `git diff` to confirm only the three owned files changed.

## Open limitations and review notes

- R1. Parallel overlap is real: base-preflight adds its `akrogon preflight` sentence to the same shapes.md paragraph. Keep this leaf's sentences additive so the rebase is sentence-level.
- R2. The rule is enforced by the charting agent and human review, not by automation. No prose test is added per standing design (no vanity tests).
- R3. `docs/guide/chart.md:199` stays valid without edit because it does not state credential timing. If a reviewer finds a timing restatement elsewhere, that hit becomes a Fix or a reported limitation, not a silent widening.
