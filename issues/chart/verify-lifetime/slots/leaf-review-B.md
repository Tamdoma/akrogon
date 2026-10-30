# Slot B leaf review

## ISSUE.md

none

## verify-pass-service/brief.md

none

## verify-pass-service/design.md

**LR1. Caller-scope propagation lacks owned implementation surfaces.** Leaf architecture owns verify, stop-run and CLI wiring, but its own Changed states section requires handing the original scope to `checkedRun` and admission. `checkedRun` currently hardcodes `scope: callerScope()`; `callerScope` understands only an existing admission token or the current cgroup. A new scope argument or environment carrier therefore needs an owned consumer in `src/run-check.ts` or `src/admission.ts`. Add the necessary surfaces to ownership while preserving ordinary run-check cancellation and admission policy. Do not leave the implementer an interface change whose consumer it cannot edit.

Evidence tier: inspected source, 2026-10-27. Sources: `src/run-check.ts:checkedRun`; `src/admission.ts:callerScope`, `withAdmission`, `nested`; shapes.md, Leaf files, requires owned surfaces and the consumers of changed state. Reusing an admission token is not merely a scope carrier: `nested` also changes whether a check creates its own admission/unit.

**LR2. The land alternative contradicts the binding service decision.** Changed states leaves open whether `src/land.ts` runs the pass in place. Binding decision 1 and the fork's Taken section require every `runOnce` to have its own service in `akrogon.slice`. Today's land service is in a leaf slice. Running its pass in place violates that decision and does not provide the separate pass-service target required by whole-pass cancellation. Remove this alternative. If land integration requires edits, name those surfaces as owned rather than granting an exception to the binding lifetime.

Evidence tier: inspected source and binding decision, 2026-10-27. Sources: `src/land.ts:launchLand`, `land`; `issues/chart/verify-lifetime/forks/run-lifetime.md`, Taken; draft design, Binding decisions and Changed states.

**LR3. The specified launch environment drops existing check inputs.** The Interfaces section prescribes only the environment `launchLand` forwards plus caller scope. That does not preserve the environment consumed by checks today: `constructedEnv` reads configured `env`/`pass_env` names and selected process variables such as `XDG_CACHE_HOME`. These values do not automatically follow the caller into a user service. Require preservation of the existing check-environment inputs and name `constructedEnv` as their consumer. Scope propagation alone is insufficient. This changes transport, not the repository's environment policy.

Evidence tier: inspected source and boundary inference, 2026-10-27. Sources: `src/land.ts:launchLand` forwards PATH, HOME, DBUS_SESSION_BUS_ADDRESS and optional AKROGON_HOME; `src/run-check.ts:constructedEnv` consumes the additional inputs. `src/next.ts:emitEnvFile` writes the declared checkout file but does not replace inherited `pass_env` inputs.

**LR4. The blanket runtime-proof requirement does not fit documentation criterion 6.** Standing design says every criterion must be proven through the CLI with real systemd units. A unit invocation does not establish that the command reference and AREA descriptions are accurate. Limit that requirement to the runtime properties that need it, and use direct readback/review for criterion 6. Otherwise the contract pushes the planner toward an unrelated runtime or text-shape test.

Evidence tier: inspected contract/rule conflict, 2026-10-27. Sources: draft brief, Done-criteria 6; draft design, Standing design; installed standing-design.md, Standing design lines, requires the cheapest sufficient proof and forbids vanity tests.

## verify-pass-service/readiness.yaml

none

## verify-pass-service/state.yaml

none

Both YAML drafts parsed successfully with the current `readinessSchema` and `stateSchema`. No drafts were edited.
