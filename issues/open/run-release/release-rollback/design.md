# Design: release-rollback

## Binding decisions, verbatim

### Run location
From [run-location.md](../../../chart/run-release/forks/run-location.md). Operator 2026-10-16: "ok, then whatever you recommend, let's go", given after A recommended O1b: one immutable release folder per merged main commit behind a `current` pointer. Reason: rollback is one pointer flip.

### Release shape, Q4 (this leaf)
From [release-shape.md](../../../chart/run-release/forks/release-shape.md). Operator 2026-10-16: `1a | 2a | 3a | 4a`.
Q4: `akrogon rollback` points `current` at the previous release and holds that bad commit from redeploy until main moves past it; rollback works while the current release is broken. Foreclosed: fix forward only.
Q2 carried: current and previous are never pruned, so the rollback target exists.
Excluded here: Q1 (state-home), Q3 (release-deploy).

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: proven at the CLI boundary over a temporary HOME with two built releases from release-deploy's builder; a broken current release is a release whose entry point exits non-zero. Each criterion shows one deliberate break turning its test red. No machinery, no live calls.

## Leaf architecture

Owned surfaces: `src/akrogon.ts` (`rollback` verb and usage), the release module from release-deploy (hold writer, flip and link step reuse), `src/config.ts` (`readGlobal` error wrapping only) (C), README.md (rollback and manual steps), tests/command-reference contracts.

Rules:
- The hold record format and its reader belong to release-deploy, so the release rolled back to already honors it (B,C). This leaf writes it.
- After rollback, the release it left becomes previous for pruning purposes (Q2 counts current and previous by link, not by age).

State changed and its consumers:
- Rollback tests use a previous release built from release-deploy's code without this leaf's verb, so criterion 3's manual path is proven against the real predecessor (B,C).
- Pruning (release-deploy) must keep the release rolled away from until 24 h after rollback.
- Strict global schema (src/config.ts `readGlobal`) on an older release reading newer state: criterion 5 names file and key (C).

Exclusions: build, flip and pruning (release-deploy); state home (state-home).
