# Intake: repo-slots

## Scope
Per-repo seat override: `issues/config.yaml` may set harness, model and effort for seat A and/or B. One leaf in akrogon.

## Provenance
- Operator: 2026-09-20 chart-issues note

## Source: operator 2026-09-20
We need to make sure that the models when it comes to slot A and slot B, as well as the harness and everything else, is modifiable on a per repo basis. he current thing works really well, so it should stay as default, but there should be some kind of configuration on a per repo basis. Is this doable without complicating or changing anything major? Without increasing complexity and mental model.

## Agent findings
Seat config is read at one dispatch point, `src/next.ts:218` launch(). Repo config has no slots field (`src/config.ts:26`). `effectiveConfig` shallow-spreads repo over global (`src/config.ts:117`), which would hide a non-overridden seat. Harness templates and Herdr integration install key on global harness names (`src/install.ts:51`). Independent maps A and B and the merge are under slots/.
