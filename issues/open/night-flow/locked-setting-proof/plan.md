# Plan: locked-setting-proof

Direct synthesis, `debate: no`. Built from `brief.md`, `design.md` and the live checkout at `c53f619`. No positions or rebuttals exist. Brief and locked design agree, so no conflict note. Concrete case driving the rule: leaf `copyfile-install` locked a `bunfig.toml` key that bun 1.4.2 ignores silently; the charted proofs ran only the CLI flag, the leaf failed at `check.fix` and sat about 7 hours until the operator rewrote the decision by hand (Tamdoma/akrogon#81, map-merged M3/L7).

## Decisions

- D1: Edit `skills/chart-issues/SKILL.md` in place, one sentence appended to the existing Take operation-proof paragraph (`:57`), after "run with the real identity and target." and before "Declining a required probe". No new section, no new proof-record field.
- D2: The sentence carries the brief's rule verbatim in one sentence: "When a decision locks a setting of an outside tool (a config key, file setting, flag or environment variable), its proof uses that same key, location and value and observes the property the decision relies on, and a proof of a different form, such as the CLI flag for a locked config key, does not count for it." The brief writes the rule in two sentences; the design caps the addition at one, so the clauses join with "and" and no wording is dropped.
- D3: No code test asserts the sentence. The design's standing-design interpretation is explicit: one sentence of skill text, proof is the report's sweep with the edited sentence quoted, no live run and no outside call. A wording-assertion test is a vanity test (standing-design.md).
- D4: The sweep for criterion 2 is by meaning over every file under `skills/chart-issues/` (`SKILL.md`, `assets/*.md`, `scripts/*.ts`): any line that licenses proving a locked setting in a different form than locked is a defect to fix; lines that restate or reference the operation-proof rule without licensing a different form are out of scope and get listed in the report. Plan-time candidates: `shapes.md:284` (refuses a brief operation with no recorded proof), `shapes.md:286` (allowed proof forms) and `questions.md:56` ("never replaces required operation proof") — none licenses a different-form proof for a locked setting.
- D5: L7's second half ("a repeated finding questions the plan rule first") belongs to sibling leaf `plan-not-cap` and is out of scope here. That leaf touches `check-issue`/`implement-issue` skills, not this paragraph; no file overlap.
- D6: `docs/` restatement check (2026-09-11 stale-rule lesson): `docs/guide/chart.md` mentions leaf proofs only as live-run cost lines and restates no operation-proof rule form (grep-verified at plan time), so no human doc changes.

## Read-first paths

- `docs/reference-index.md`
- `skills/AREA.md`
- `learnings/LESSONS.md`
- `skills/chart-issues/SKILL.md` (`:57` owned paragraph)
- `skills/chart-issues/assets/standing-design.md` (no-code-test interpretation)
- `skills/chart-issues/assets/shapes.md` (`:284`, `:286` sweep targets)
- `skills/chart-issues/assets/questions.md` (`:56` sweep target)
- `issues/open/night-flow/locked-setting-proof/brief.md` and `design.md`
- `issues/chart/night-flow/slots/map-merged.md` (`:9` M3, `:39` L7)

## Needed interfaces

None. The design states literal interfaces: none.

## Acceptance criteria

1. `skills/chart-issues/SKILL.md` states the rule in its Take operation-proof paragraph.
2. A sweep of `skills/chart-issues/` by meaning finds no line allowing a different form to prove a locked setting; hits outside scope are listed in the report.

## Ordered checklist

### Wave 1

1. Insert the D2 sentence into the Take operation-proof paragraph at `SKILL.md:57` per D1 (criterion 1). Owns: `skills/chart-issues/SKILL.md`. Shared test resources: none. Lands first: nothing.
2. Sweep `skills/chart-issues/` by meaning for a line allowing a different form to prove a locked setting; fix in-scope hits, list out-of-scope hits in the report (criterion 2).
3. Confirm the diff touches only `skills/chart-issues/SKILL.md`.
4. Run every blocking `checks` command including the resolved changed-tests command.

## Affected docs

- Agent doc: `skills/chart-issues/SKILL.md` is the only live surface changed (one sentence in the Take paragraph).
- Human docs: none — `docs/guide/chart.md` restates no operation-proof rule (grep-verified at plan time).

## Tests written during synthesis

None. Per D3 and the locked design, no existing or new code test proves these criteria; proof is the quoted sentence, the meaning sweep and the blocking `checks`. No test commit precedes implementation.

## Verification

- Criterion 1: `sed -n '57p' skills/chart-issues/SKILL.md` plus `git --no-pager diff -- skills/chart-issues/SKILL.md`, read for all three rule elements (same key, location and value; observed property the decision relies on; a different form does not count). Catches a dropped clause or an insertion in the wrong paragraph. Size: seconds. Rerun on any `SKILL.md` edit.
- Criterion 2: `grep -rniE "prove|proof|probe|counts|call" skills/chart-issues/` read by meaning; every hit judged against "does this let a different form prove a locked setting". In-scope hits are fixed, out-of-scope hits listed in the report. Catches a contradicting line left in place. Size: seconds. Rerun on any edit under `skills/chart-issues/`.
- Diff scope: `git --no-pager diff --stat` lists only `skills/chart-issues/SKILL.md`. Catches drift outside the owned surface. Size: seconds. Rerun before each phase move.
- Blocking checks: `bun run format`, `bun test`, `bun run typecheck`, and the resolved changed-tests command below (config `checks`; `merge_checks` is empty). Catches red suite, type or format failures. Size: minutes. Rerun after any worktree change.
- Resolved changed-tests command: `AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c bun test --changed="$AKROGON_BASE"` (refresh `AKROGON_BASE` from `akrogon config` if the base moved; a doc-only diff may resolve to an empty test set).

## Dependencies, credentials, runtime

- Dependencies: none; `blocked-by` is empty and sibling `plan-not-cap` shares no file.
- Credentials: the design names no variable, so no `.env` presence check is required.
- Not a slow-run leaf: no restart boundaries.

## Open limitation

The rule is prose the door applies; no automated check rejects a charted proof run in a different form than the locked setting. A door that skips the audit can still repeat the #81 failure class.
