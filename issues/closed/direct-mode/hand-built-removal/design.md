# Design: hand-built-removal

## Binding decisions, verbatim

### Hand-built removal (issues/chart/direct-mode/forks/hand-built-removal.md)
Operator 2026-10-08: "But do we even need it? Can we just delete that now that we have this proper way of doing it?" then
"I don't want to have two ways to do the same thing."
Delete `hand_built` everywhere: schema field, dispatch and merge-queue branches, tests, door and shapes mentions, guide
pages. Park is the one way to keep work away from agents.
Foreclosed: keeping hand_built; repairing it so hand-built leaves can merge.

Exclusions: container, eligibility, landing and growth bind the direct route (leaf direct-route); the `direct` setting is
leaf direct-setting.

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md: deletion work. Delete tests that assert
hand-built behavior with the reason "field removed"; keep each test that guards a real past regression by rewriting it
without the field. One CLI-boundary test proves a `hand_built` key is now rejected (criterion 1): the tests/status.test.ts
fixture at :99/:145 becomes that unreadable-leaf case. tests/next.test.ts:4088 drops its `hand_built` arm and keeps
`blocked-by`. Fixtures that used `hand_built` only to hold a leaf back use `blocked-by` on an unfinished leaf instead.
(A,C) Criterion 4 is checked read-only, without `akrogon status` or any fetch: a `grep -rl hand_built` over `state.yaml`
files in the three stores of every root listed by `akrogon config` `repos`, output recorded in the report. A hit is an
operator migration on main before landing, not a leaf write. (A,B,C)

## Leaf architecture
- Owned: src/state.ts (field at :69), src/next.ts (:611 branch), src/turn.ts (`Block` variant at :6 and branch at :9) (A,C), tests/state.test.ts,
  tests/status.test.ts, tests/batch-dispatch.test.ts, tests/next.test.ts, skills/chart-issues/SKILL.md (:59 sentence
  part), skills/chart-issues/assets/shapes.md (:167, :259 sentences), docs/guide/state.md, docs/guide/problems.md.
- Shared files: leaf direct-route also edits SKILL.md:59 and shapes.md:259 and is blocked by this leaf, so this leaf
  lands first. (A,C)
- Excluded: issues/ records (already cleaned on main); `akrogon park` behavior.
