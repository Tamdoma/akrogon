# Seat stall detection and recovery

## Question

Q4. Which registered repo is the completion owner for Tamdoma/akrogon#16, and does that owner close on its own outcome alone or only once the other repo's outcome is accepted?

Q5. What runs the stall check while no herdr event fires?

Q6. What makes a seat a stall, and what happens when one is detected?

### Carries
- `skills/chart-issues/assets/shapes.md:159`: a GitHub report has exactly one completion owner, and its exact identity goes in every leaf beneath that owner. #16 cannot own leaves in both `akrogon` and `pi-extensions`. (B, R6)
- Cross-repo `blocked-by` is unsupported (`src/next.ts:151-154, 488-489`), so cross-repo ordering is an operator dispatch decision, not a state field. (B)
- Herdr v0.9.1 plugin manifests declare no periodic trigger; startup hooks are one-shot, not supervised daemons (herdr docs/plugins.mdx, read 2026-09-18).

## Findings
- (both) The queue fix in pi-extensions and the detector trigger in akrogon are independently checkable and need no ordering between them. Ordering is needed only if the stall trigger consumes an extension-provided signal, or if the owning report's closure claims both outcomes. (B, R6)
- (B, R5) "Notify only" and "no autonomous detection" are separate axes. A timer can run and still only notify. Q5 chooses scheduling; Q6 chooses the action.
- (B, R3) A hard 60 minute ceiling is simple and independent of pi telemetry but kills productive long work, and `busy()` includes `blocked`, which the extension emits for operator questions (`tamdoma-subagents/index.ts:108-110`). Stopping every blocked seat after an hour can terminate a legitimate operator wait.
- (B, R3) A no-progress trigger needs a signal akrogon's pane schema cannot express today (`src/shell.ts:74-81`). Its owner and contract are fog until scoped.
- (B, R6/map) Re-dispatch before confirmed retirement can produce two writers; recovery racing a phase transition can prompt obsolete work. Dispatch already re-reads phase and done state and caps attempts at three (`src/next.ts:365-384`).
- (A) `akrogon install` already links the herdr plugin (`src/install.ts:52`), so it is where a systemd user timer would be installed and removed.
- (B, R4) Any timer must run with a cwd outside a registered repo, or `next --all` sweeps only that repo (`src/next.ts:627-635`).
- (B) Proposed akrogon leaves: K1 autonomous observation during silence, K2 safe bounded stop and re-dispatch. K2 depends on K1 for an end-to-end check.

## Taken
2026-09-18, operator:

Q4 taken: `pi-extensions` is the completion owner for Tamdoma/akrogon#16.
Reason: the stranded worker is the cause; the akrogon watchdog gap is a separate bug.
Forecloses: akrogon owning #16; a manual cross-repo closure gate.

Q5 and Q6, operator direction, not yet a final selection:
Operator verbatim: "Can we do it without the watchdogs? Is it possible? You know that one of the rules is not having any hidden watchdogs anywhere... Can we come up with a more elegant solution that does not include this? This error doesn't happen very often, So let's target the core inside of the pi subagents If possible, you challenge me if needed. use herdr machinery if possible"
Operator verbatim: "6 - Again, we need a solution that doesn't include any clocks, poles or watchdogs. See if you can come up with something. Look at all the previous fixes we did we never went for watchdogs or polling. We can use Herdr's machinery if possible"
Foreclosed by this direction: the systemd user timer, a long-lived `akrogon watch`, and any elapsed-time stall trigger in akrogon.
Remaining selection is in forks/no-akrogon-detector.md.
