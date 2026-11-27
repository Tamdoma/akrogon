# Missed signpost angles, slot C: consultant-recipe

1. **Missing signpost — Enforcement boundary (global schema vs watch entry vs setup):**
   - S1 and S2 ask whether to fail loudly without distinguishing *which* boundary refuses a missing `slots.consultant`. That choice steers `src/config.ts` `globalSchema`, `skills/watch-issues/scripts/start.ts`, `src/init.ts`, `skills/watch-issues/SKILL.md`, and existing test fixtures:
     - (a) Every `readGlobal()` via `globalSchema` (blocks every akrogon command, including non-watch workflows, until the key exists);
     - (b) Watch startup only (`skills/watch-issues/scripts/start.ts` preflight, blocking unattended watch start while non-watch commands keep working);
     - (c) Setup/provisioning (`init`/`install`/`init-akrogon` seeds or requires the key on machine setup).

2. **Missing signpost — Existing-config / auto-deploy compatibility (and a missing option on S4):**
   - Live `~/.akrogon/config.yaml` currently lacks `slots.consultant`, and landing on `main` auto-deploys (`docs/reference/releases-and-updates.md`). The draft has no signpost on whether existing configs without `slots.consultant` must stay loadable across an unattended deploy (migration-free rollout) or may hard-fail immediately until edited.
   - S4 lacks option **(c) do not land a `globalSchema` refusal before `~/.akrogon/config.yaml` has the key (either wait for the operator edit first, or keep `globalSchema` backward-compatible and enforce at watch start)** — otherwise S4(a) plus an auto-deployed required `globalSchema` breaks every live `akrogon` command (listener, active leaves, `next`, `verify`) while the operator is away.

3. **Missing option on S2 — Explicit opt-out vs silent omission:**
   - S2 offers only "fail loudly (no fallback)" vs "built-in default recipe". It lacks **(c) explicit opt-out for notify-only watch** (e.g. requiring an explicit setting to disable consults rather than letting an omitted key silently degrade to notify-only), which changes whether `skills/watch-issues/SKILL.md` `## Consult` drops or keeps its notify-only path.

4. **Missing signpost — Proof kind and cost:**
   - Under the direct route, the draft does not ask whether free boundary tests (`bun test` on config/seat/watch-issues scripts) are sufficient (a) or a live `watch-consults` e2e run is required (b).
