# Review A: seed-cause-evidence

Base: `ce4c9813982b690c78f075d1aecbb17ebcb01f9c` · Reviewed head: `3b8fdb5`

Diff inspected: `skills/seed-issue/SKILL.md` (+20/−6 then footer clause), `docs/guide/create.md` (+9/−3). Both match the plan's owned paths and the design's binding decisions; routing, compaction header, create invocation, one-report and no-blind-retry rules unchanged. Rule count 19 by the recorded meaning method verified by reading — merges (report rule; outcome+footer) keep meaning whole. Spot-checked body claims against live source: `checkManifestRule` unfinished filter at `advance-phase.ts:259` and `pruneSkillDispatches` current-phase exemption at `hook-state-tracking.ts:126+` are real.

## Verdict: fix

One Fix; everything else below records Nits or clean checks.

### Fix 1 — Named criterion clauses have no replay that would catch their failure

- Source: the motivating incident itself — Tamdoma/akrogon#56 — was a hand-filed cause statement; criterion 8 explicitly names "a cause-statement report... prints no line" and criterion 5 names "a closed precedent is linked as evidence". These are real reporter inputs in the leaf's own history, not handcrafted edge cases.
- Consequence today: if the skill text dropped "this report is not itself a cause statement" from the trigger, no replay would fail; if the related-rule implied "open reports only", the closed-precedent clause would fail silently. The post-fix footer clause "the reason names... any lookup failure" likewise has no exercised replay (s8 ran before commit `3b8fdb5`).
- Criterion/gap: brief C5 (closed precedent linked as evidence), C8 (cause-statement report prints no line), C6 (failure stated in the final outcome) — the leaf's chosen proof mechanism is scenario replay, so a named clause without a replay is a verification gap.
- Repair shape: three small replays on the lane skill — (a) file a cause-statement input (e.g. #128's statement shape) in a canned world where siblings exist, expect no root line and a suspected-marked title; (b) canned keyword result containing a relevant CLOSED report, expect it linked with a reason and NOT counted for root-line condition 2 (which requires open); (c) rerun a failed-lookup replay against `3b8fdb5`, expect "search failed" in the footer reason. Update `verification/results.md`.

## Nits

- N1. r124's author lookup bypassed the canned shim (env prefix reached only `date`) and hit live GitHub — a rig artifact; the historical world for "after #124" relied on the (correct) live-set coverage suppression rather than the canned moment. Not a skill defect.
- N2. s8's actor truncated a heredoc and ran create twice (capture shows 2); actor-side quoting artifact, body verified complete. Not a skill defect.
- N3. Rule count relies on dense merged rules (8, 15, 19); a stricter counter could land 21-22. Design's O1 bounds the method to meaning-preserving merges, which these are; the count is disclosed in the report for the operator's recount.
- N4. `skills/AREA.md` "Key files" lists several skills but not `seed-issue` — pre-existing omission pattern, not widened by this leaf.
- N5. Replays exercised pi subagents only; other harnesses unproven, named in the report as the brief's C11 clause requires.

## Checks

- `bun test --timeout=30000`: 415 pass / 0 fail; `bun run format` and `bun run typecheck` clean; `bun test --changed=$AKROGON_BASE`: no affected test files (markdown-only diff, consistent with src/test-files.ts).
- Docs: `docs/guide/create.md` section read against the live skill — claims match (six sections, one-hop reads, two gh searches, optional `/seed-issue` line, one report per run). No other docs affected.
- Shim log audit: only `gh issue list`, `gh issue view`, `gh issue create` in captures — no comments, labels or state changes (C7).
