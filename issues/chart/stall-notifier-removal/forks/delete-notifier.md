# Delete the dead notifier

## Question

Q1. Is the elapsed-time stall notifier in `observeBusy` deleted?

### Carries
- Operator rule: no hidden watchdogs, clocks or polling.
- The replacement destination was ruled out at `../seat-stall-detection/CHART.md`.

## Findings
- (A) The notifier only executes inside an `akrogon next` run, which only happens on herdr startup or one of four herdr events. A pane frozen at `working` emits none of them, so the notifier cannot run during the stall it targets.
- (A) Beyond being inert, it is misleading: it framed the reported incident as a missed notification rather than a scheduler defect.
- (B) `busy_since` is not a timer and is read elsewhere; only the threshold, the notification and `busy_notified` go.

## Taken
2026-09-18, operator (`3-A` in round 2):

Q1 taken: delete `STALL_MS`, the `herdr notification show` call in `observeBusy` and the `busy_notified` state field. Keep `busy_since`.
Reason: a clock that structurally cannot fire during the silence it targets is worse than none, because it creates false confidence.
Forecloses: leaving it in place; replacing it with any other trigger.
Scope note, stated before the answer: this is scope neither #15 nor #16 reported. The operator accepted it explicitly.

## Taken (correction, 2026-09-18)
Operator: "Ok, lets keep it. If this gets fixed in pi-subagents we're good."
- Keep `observeBusy`, `STALL_MS`, `busy_since` and `busy_notified` unchanged. No leaf is emitted.
- Reason: the notifier is not dead, only conditional. A live scan of all six registered repos found one real fire, `framework/issues/closed/portal-integration-bridge/portal-activation/state.yaml` with `busy_notified.B: 2026-09-12T23:20:36.219Z`, against 261 recorded `busy_since` entries. That leaf had both seats busy, so seat A's pane events drove the `akrogon next` passes that observed seat B. Tamdoma/akrogon#16 had one silent seat and therefore no passes.
- Foreclosed: deletion (A). The earlier premise that the notifier could never fire is withdrawn as factually wrong.
- Standing: once the pi admission fault is fixed, this remains the only generic stall signal for causes other than admission, which is the reason to retain it.
