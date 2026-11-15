# Leaf review, slot C — needs-and-test-isolation

Two real disagreements and three smaller gaps; the rest holds.

## needs-sheet-at-signpoints

1. **Criterion 2's escape hatch is worded loosely enough to lose the #540 park.** "lands ... as a sheet row ... where new operator authority is needed, or as the door's existing close step where `## Open` already authorizes the close". The fork's Taken (Q1) is sharper: "closes that need an operator decision" are rows; delivered-identity closes are not. #540 parked on an *operator yes* to `akrogon close` — "needs an operator decision", not "Open authorizes". An implementer can read the criterion's "already authorizes" as covering any close and re-exclude the reported case. Tighten the criterion to the Taken wording.
   Evidence: forks/needs-before-charting.md `## Taken` Q1 vs brief.md done-criterion 2; intake #129 reproduction item 4.

2. **`## Needs` section shape is underspecified in owned surfaces.** Taken pins it as "its own section after `## Taken`" in `forks/signposts.md` — the design's owned surfaces mention shapes.md gains "`forks/signposts.md` shape gains `## Needs`" but the brief's What never names the canonical record at all. An implementer working from the brief alone wouldn't know rows live in signposts.md with status (pending/supplied/late) and verbatim copying. The What should carry "recorded as a `## Needs` list in the session's `forks/signposts.md`, re-copied verbatim to the session's charts".
   Evidence: forks/needs-before-charting.md `## Taken` Q1 final paragraph; brief.md `## What` (no `## Needs` mention).

3. Minor: the notice proof ran against the operator's real `infra` session (`akrogon-notices` folder consumed ~4 s). That is a real call on the operator's session done at charting — allowed and recorded with limits, but the session toast did fire on the operator's bar. No disagreement with the proof's target; flagging because the proof's `limits` honestly say "not that a person saw it" — fine.

## fixture-repo-identity

4. **Supplier-side literals `readRepo('repo', ...)` and leaf-state `repo` fields are real consumers the named list misses.** The design's consumer list covers `leafSlice` call sites and name assertions, but `tests/batch.test.ts`, `tests/batch-merge.test.ts`, `tests/config.test.ts` contain `readRepo('repo', f.root)` calls and `repo: 'repo'` in leaf-state fixtures — they read the fixture's `repos` key directly, and silently keep working with a wrong name (still unshared, so safe, but the sweep must be deliberate or these files keep a stale identity). The design does carry "the plan sweeps tests/ for the literal `'repo'`" as a binding decision — good — but the owned-surfaces list names only the eight `leafSlice` files. State the sweep covers supplier-side reads, not only consumers that reach host-global state.
   Evidence: `grep -rn "'repo'" tests/batch.test.ts:14,121,156,282,334; tests/batch-merge.test.ts:29,141; tests/config.test.ts` (many `repo: 'repo'` and `readRepo('repo', ...)`).

5. Minor open-for-plan already listed: prefix schema is `^[a-z]{2}$` (src/config.ts:30) — a per-fixture two-letter prefix is derivable; fine as stated.

## Contract shape checks

- Done-criteria: no test file, assertion, count, merge_checks command or repo-health claim in either leaf. Criteria are observable results in ownership.
- `sources`: both leaves carry their single GitHub identity; EPIC is the completion owner, both child issues get their report. Matches shapes (`every leaf beneath that owner carries its exact identity in sources`).
- readiness.yaml: five sections present, `proofs` entries carry command/identity/target/version/date/result/cleanup/limits/record. The fixture leaf's proof's `limits` admit "a launch delay, not a synchronized overlap" — the criterion demands synchronized overlap, so criterion 1's red-side rests on the mechanism plus this proof; the leaf's own test supplies the synchronized red/green. Acceptable, but note the charting proof's `limits` cover only the mechanism, not the synchronized property — consistent with Take's split rule (acceptance stays the leaf's own test).
- state.yaml: fields match the shape; `phase: plan.synthesis`, `blocked-by: []`, no door-authored command fields.
- No `issues/` path is touched by either leaf (preflight rule satisfied); EPIC/ISSUE files are index-only.

## Net

Buildable after the two wording fixes. Everything else is consistent with the forks' Taken.
