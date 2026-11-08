# Review A: coverage-audit

Base `1c444c6b3d4f65d82fb8162ca45b277b2a1df8d9` (`AKROGON_BASE`), reviewed head `5499e3dab209ccc6fae14c8f4568e62e5c4c15c2`, one commit. Prose-only leaf; standing design says no test pins the new prose, so review reads the written text against the done-criteria.

## Criterion-by-criterion

1. **Take teaches the general rule** — pass. "A proof counts only for the property it observed, which its `limits` records" is the general rule; both special cases fold in keeping specifics (dry-run: "the property the provider documents it proves, run with the real identity and target"; locked setting: "same key, location and value", other forms not counting). Clause rule present: key part defined as "a clause whose pass rests on something existing before the leaf builds, an outside system's acceptance, an existing checker's verdict, existing data or recordings", observed "by the smallest call that reaches it, free before paid, within the one operator-approved paid test budget". Split clause present. Every observation (free included) becomes a `proofs` entry with `limits`.
2. **Proof-before-handoff and cut rule** — pass. "Every operation and every key part kept in the contract needs its proof before handoff"; declined or impossible probe "cuts the contract to what is proven at the handoff review" naming the cut and its landing (prerequisite leaf under the missing-machinery rule, design exclusion, Off route entry); cut removes obligation and drops the operation from What; useful-outcome cut parks under the existing non-grant approval wait, never answered by A; "no waiver" stays; `grep -rn "scope is not narrowed" skills/chart-issues/` returns nothing (evidence: report `check criterion-2` log).
3. **shapes.md audit** — pass. Audit paragraph gains "the audit names the proof or charting observation that reached each pre-existing key part … refuses the handoff when one rests only on a proof's `limits` or on no proof"; the missing-proof refusal stays verbatim in the same section's preflight paragraph and the closing sentence names both refusals. Worked example confirmed: `fixture-weave-recorder`'s `proofs[0]` (limits disclaiming verify acceptance) against criterion 1's "real verify reports no finding" is refused under this text.
4. **Handoff review line + release link** — pass. Per-leaf key-part line sits beside the live-run line, "information only, not a gate", listing `proofs` entries and cuts with landings; "the change reaches doors only at the next release link" present.
5. **questions.md and plan-work.md agreement** — pass. "never replaces required operation proof" kept; declining-probe sentence replaced by the cut rule; docs page gains one sentence naming the new line; `grep` for the old sentence returns nothing.
6. **Diff scope** — pass. `git diff --name-only "$AKROGON_BASE"...HEAD` lists exactly the four named files; `src/`, `tests/`, `issues/` untouched (report `check criterion-6` log).

## Verification evidence

- `akrogon verify` on head `5499e3da`: green — format, test (1309 pass / 0 fail), typecheck; receipt in `implementation/`.
- Criterion proof logs `implementation/check-criterion-{1..6}-*.log`, all exit 0, commands matching plan.md.

## Docs check

The changed behavior is door-rule prose; the one human-docs page describing the handoff review (`docs/use/plan-work.md`) was updated in-diff and describes the new line consistently with the SKILL.md text. No other documented behavior changed; no `AREA.md` in the diff.

## Findings

**Nit N1** — terminology drift: `questions.md` now says "the Take proof rule" while `shapes.md` and `SKILL.md` "Handoff" keep the established name "the Take operation-proof rule". Reproduction: `grep -rn "proof rule" skills/chart-issues/` shows both phrasings. Deferred: both resolve to the same Take paragraph and a reader searching either phrase reaches it; no behavior fails today. Promotion evidence: a door seat misreading or failing to locate the rule in a real run would promote this to a Fix.

## Verdict

`nits` — all six done-criteria verified against the written text, checks green, no Fix found.
