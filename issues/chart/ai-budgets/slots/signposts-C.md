# Signposts angles — Slot C

## Proposed signposts questions

1. **Autonomy boundary — what may AI self-budget without per-leaf operator words?**
   - **A (Rec):** Paid model/harness runs + local/throwaway-target live runs on existing credentials with proven cleanup; external irreversible, prod/public, retained, new-credential, and secret-save actions stay operator-only.
   - **B:** All runs inside a standing cap including external staging/sandbox writes with proven cleanup; only prod/public/retained/secret-save stay operator-only.
   - **C:** Paid model calls only; every live write (even local/throwaway) still requires per-leaf operator approval.

2. **Hard ceiling shape — how is "never blow the budget" enforced when AI can self-raise?**
   - **A (Rec):** One standing operator-set ceiling in `~/.akrogon/config.yaml` (optional repo override) using unit-aware caps (sessions/launches + wall time, plus optional USD) that AI starts below and may self-raise up to, stopping only at the ceiling.
   - **B:** No numeric config ceiling; rely on seat discipline plus the existing red-repro circuit-breaker.
   - **C:** Strict USD spend ledger in `akrogon run-check` that blocks any run whose dollar cost is unmeasurable or exceeds a hard dollar cap.

3. **Proof sufficiency vs. re-run strictness — when a diff touches a model-facing input or hits a budget cap, what wins?**
   - **A (Rec):** Evidence-sufficiency first: skip a fresh paid run (or accept an earlier passing run) whenever prior proof + deterministic checks already cover the changed behavior; self-raise only when live behavior is genuinely unproven; hard-stop only if unproven AND at ceiling.
   - **B:** Always re-run live on any model-facing input change up to the ceiling; allow sufficiency pass only after the ceiling is spent.
   - **C:** Never pass without a fresh run after a model-facing edit; set a generous standing ceiling instead.

4. **Authority on "enough proof" — who judges sufficiency and how is review-B bounded?**
   - **A (Rec):** Treat sufficiency as a recorded model choice (`standing-design.md` model-choice rule): the implementing/repairing seat records prior evidence and why the diff cannot break the live property; `check.review` may Fix only by naming a concrete unverified behavioral risk, never prose edits or run-count shortfalls.
   - **B:** Mechanical input taxonomy (code/schema forces re-run; prose/docs never do) with no seat judgment.
   - **C:** Implementing/repairing seats always attempt a fresh run; only `check.review` may waive it.

5. **Schema & prose refactor depth — simplify or layer on top?**
   - **A (Rec):** Simplify the model: separate immutable safety scope (targets, fixtures, cleanup, `stop_line`) from mutable AI-managed budget (initial estimate + self-raises inside ceiling), retire append-only duplicate `grants[]` copies and redundant warn-vs-stop repeat-count prose across skills.
   - **B:** Keep `readiness.ts` `grantSchema` as-is and layer `approved.by: ai` plus a config ceiling on top.
   - **C:** Remove per-leaf `grants[]` entirely and govern all runs solely from `~/.akrogon/config.yaml`.

6. **Cross-seat escalation & charting probes — which seats may set or raise budgets?**
   - **A (Rec):** Chart door sets conservative initial budgets and may run bounded charting probes under the standing ceiling; implement and `check.repair` may self-raise within the ceiling with a recorded reason (red-repro gate intact); `check.review` launches nothing and never raises `Operator actions` for counts/prose.
   - **B:** Only the chart door sets or raises budgets; lifecycle seats cannot edit `readiness.yaml`.
   - **C:** Any seat, including `check.review`, may raise budgets and run live proofs up to the ceiling.

## Angles A might miss

- **Harness auto-mode classifiers (INTAKE finding 5):** External safety classifiers refuse agent writes that fabricate operator approval. AI-set budgets must carry distinct provenance (e.g. referencing operator-signed standing config) and never write `approved.by: operator`.
- **Flat-rate / subscription harnesses have no USD readout:** `watch-consults` ran on logged-in subscriptions (claude, codex, pi, Google AI Ultra). A USD-only cap either fails closed on `unknown` cost or does nothing; session/launch counts + duration must be first-class ceiling units.
- **Self-raising can defeat runaway protection without the red-repro gate:** Keep `lifecycle-rules.md` (`## Grant reuse and count lines`) red-repro rule (one paid launch first; after red, no rerun without a passing free repro or named diagnostic) so self-raises cannot burn the ceiling on a broken loop.
- **Host side effects bundled inside "paid runs":** `watch-consults` paid runs also mutated `$HOME` (trust entries, session logs, `hc` state). Standing autonomy must still require declared disposable fixtures and verified `absence_check`, or it silently weakens host-cleanup safety.
- **Rubber-stamp risk on "just make it pass":** Without requiring a named evidence trail (specific prior run + why the post-run diff cannot invalidate it), seats under budget pressure may waive genuine live regressions; anchoring to `standing-design.md`'s recorded model-choice rule keeps review-B able to catch real contradictions.
- **Six-surface rule drift:** Grant/fresh-run/operator-blocker rules live in `src/readiness.ts`, `standing-design.md`, `autopilot.md`, `chart-issues/SKILL.md` (`## Open`, `## Take`), `check-issue/SKILL.md` (`## Shared context`, `## check.review`, `## check.repair`), and 4 identical `skills/*/lifecycle-rules.md` copies. Missing any one recreates merge stops.
- **`z.strictObject` breakage on existing open leaves:** `src/readiness.ts` uses `strictObject` on `grantSchema` and `readinessSchema`; changing fields without accepting legacy entries will break `readReadiness()` on already-open leaves in consumer repos.
- **Aggregate burn under full autopilot / watcher:** Per-leaf ceilings multiply across concurrent leaves; decide early whether a session/day cap or per-leaf ceiling + red-repro gate suffices.
- **`autopilot.md` self-limit guard:** `autopilot.md` forbids the door from raising an existing bound or changing autopilot's own limits without operator approval; verify the operator's intake words cover charting this while keeping final activation operator-confirmed.

## Foreseen operator-only needs

- **Keys, external accounts, paid test budget for this chart:** None — `ai-budgets` can be proven deterministically with local unit/CLI and skill-agreement checks, no live paid runs needed.
- **One-time machine config (`~/.akrogon/config.yaml`):** Operator approval/values for the standing budget ceiling (and any standing local host-cleanup scope) so standing authority has genuine operator provenance for both akrogon and harness classifiers.
- **Autopilot limit change sign-off:** Explicit operator confirmation if activating relaxed `autopilot.md` grant/probe limits on main is treated as changing autopilot's own bounds (intake authorizes charting it; confirm whether merge/activation needs no extra stop).
