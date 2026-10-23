# Map C — seeds 110–116

## Consolidation

- **G1 argv mangling** — #112 alone. systemd-run expands `${...}` in payload args.
- **G2 check env contents** — #111 (locale dropped) + #110 (keyring unreachable, shim hang). Same mechanism, `constructedEnv`, but two different sub-decisions.
- **G3 config drift vs guards** — #113, #114, #115. #114 and #115 are duplicates (same refusal, same repo, same day). All three share one shape: a static config became incompatible with a deliberate guard and nothing flags it until a run dies.
- **G4 orphan pane** — #116 alone.

Suggested charts: C-A = G1+G2 code fix (run-check contract); C-B = G3 (init/config validation + messages); C-C = G4. G3 is one chart because both forks land in the same validation surface.

## G1 — runUnitArgv mangles argv (src/scope.ts:43-60)

- O1: add `--expand-environment=no` to `runUnitArgv`. Pick. Deletes the whole class; payload argv reaches `env` verbatim. Verified present on installed systemd 262 (man systemd-run, flag exists since ~v233; akrogon already requires CollectMode/busctl features of similar vintage). Fake seam `tests/fake-systemd-run.sh` ignores flags before `--`, no test breakage expected.
- O2: document `$${` escaping. Keeps the trap; every consumer rediscovers it. Reject.
- Break risk: none identified. Nested runs (`admission.kind === 'nested'`, src/run-check.ts) spawn argv directly and are already literal.

## G2 — constructedEnv drops caller state (src/run-check.ts:30-67)

The allowlist is deliberate (worktree-isolation design: credentials/toolchains are declared inputs). Do not widen `copied` wholesale.

- F1 locale (#111):
  - O1: pin `env.LANG='C.UTF-8'` before the env/pass_env loop (so a repo can still override via `env`/`pass_env`). Pick. One line, deterministic across callers, removes "check depends on seat locale". Caller locale leaking in would make evidence host-dependent.
  - O2: add `LANG`,`LC_*` to `copied`. Preserves caller parity (seed's stated expectation) but keeps variance and exposes the reserved-name checks to more surface. Acceptable, weaker.
  - O3: status quo + document `env LANG=...` workaround. Reject; 3/36 Gljive flows is proof the trap is live.
  - Break: a consumer needing a specific locale must now say so in config — that's the declared-inputs model working.
- F2 credentials/bus (#110):
  - O1: no code change; document that the session bus is dead inside checks, so keyring-backed tools need a declared token (`GH_TOKEN` via `env` from checkout `.env`, or `pass_env`). Setup.md pass_env bullet already says the bus is cut; add the consequence. Pick — the cut is load-bearing for Chrome handoff prevention and hermeticity.
  - O2: let the bus through for checks. Breaks the "test browsers stay in akrogon's cgroup" guarantee (setup.md) and leaks keyring/notifications. Reject.
  - O3: bound the run so a hung shim can't park a seat. Real gap (no deadline; the run guard only stops the scope after the wrapper dies, so the mise process did get reaped when the seat was killed — verified `startRunGuard` in src/scope.ts). But adding a timeout changes the check contract; the shim stall itself is a mise/host issue. Keep as open question Q4, not a fix here.
  - Unverified: whether `GH_TOKEN` via `pass_env` actually authenticates gh inside a run (seed's own gap). Cheap probe before writing docs.

## G3 — guards vs drifting config (src/guard.ts, src/config.ts, src/init.ts)

Root cause is not the guards; both are deliberate. The defect: config is written once, the tree moves under it, and `akrogon config` prints the result with no warning.

- F1 in-checkout `worktree_root` (#114/#115): Gljive's store passed until the *main checkout* moved to a tree holding `package.json`. Any validation at config-write time is insufficient — the offender appears later.
  - O1: `init` refuses `worktree_root` inside the repo root unconditionally. Pick. Every in-checkout store is one checkout-move from this failure; the design doc already says the store belongs outside every checkout (issues/closed/worktree-isolation/worktree-store/design.md). Deletes the gitignore branch at src/init.ts:69-71 along with the feature.
  - O2: keep in-checkout stores, add the remedy to `checkLocation`'s message when the offender is the repo root ("move worktree_root outside the checkout, then reconcile recorded worktrees"). Cheap, keeps the footgun.
  - O3: `akrogon config` warns when `worktreeStore` fails `checkLocation` on a probe child. Warn-only; verify still hard-fails later. Weaker.
  - Break: O1 removes a documented capability for repos that will never hold package.json (docs-only). Suggest pairing O1 with O2's message.
- F2 package repo with no `setup` (#113): default setup is `akrogon guard own-modules && sh -c true` (src/config.ts:333-337), so `package.json` present + `setup` absent = guaranteed red. The skill only proposes `setup` when HEAD lists a lockfile (SKILL.md) — a repo that gains a lockfile after init never gets re-proposed.
  - O1: `setupCommand` derives the installer from the committed lockfile when `setup` is unset (bun.lock→`bun install --frozen-lockfile`, etc., mirroring the skill table). Pick — removes the duplication "config must restate what the tree says"; `own-modules` still verifies the result.
  - O2: verify fails fast with a named remedy when the tree has package.json+lockfile and no setup. Keeps the manual requirement; adds a guard, not a removal.
  - O3: do nothing; operator adds `setup:`. Status quo.
  - Break for O1: a package.json with no lockfile still reds (correct — nothing reproducible to derive); implicit install in every printed check via `withSetup` changes command strings consumers may have copied.

## G4 — allocate leaves unrecorded pane (src/next.ts:371-511)

Confirmed from code: `saveState(tabState)` runs before `box(first)`/`box(second)`; only after both box calls does `saveState` record `pane:{A,B}` (the "boxed before save" comment documents intent). A throw in `box(second)` (5 s adoption deadline) leaves the split pane unrecorded; next run matches the tab, bootstrap splits a new B, orphan stays forever.

- O1: record `pane:{A:first}` after `first` is determined and `{A,B}` after `second` is split, before each `box`. Pick. A recorded-but-unboxed pane is self-healing — the entry sweep closes recorded panes outside their scope and splits fresh. Flips the comment's tradeoff: recorded-unboxed (recoverable) beats unrecorded-unboxed (permanent). Minimal diff, deletes the observed cause.
- O2: sweep unrecorded members of a matched tab at allocate start (adopt into a needed slot or `pane close`). Covers the narrow window where herdr's split lands but the save never runs, plus pre-existing orphans. More code for a case O1 already shrinks to ~nothing.
- O3: both. Only if slot A wants the sweep for already-orphaned panes in the wild.
- Why tab is saved before panes: the tab is the labeled, recoverable resource — matched by `state.tab` or slug+cwd; panes are only meaningful inside a known tab. Order is correct; the gap is pane saves, not tab saves.

## Practitioner questions / pitfalls

- Q1: Does `GH_TOKEN` under `pass_env`/`env` authenticate gh inside a run? Seed's unverified item; probe before docs.
- Q2: Why the bus is cut: keyring, notifications, and Chrome's session-bus handoff to the user's running browser — a checked Chrome would escape the leaf cgroup (setup.md pass_env bullet; LESSONS Chrome self-scoping line).
- Q3: constructedEnv allowlist exists so caller state can't leak into evidence; `forbidden`/`refuse()` and the repoSchema reserved set are the other half. Adding names is a design change, not a bugfix.
- Q4: run-check has no deadline by design; `startRunGuard` stops the scope when the wrapper dies, so seat-kill does reap. Whether a hung check should time out is a product call — flag for the door, don't fold into G1/G2.
- Q5: `checkLocation` is still needed — it guards dependency-lookup isolation for every worktree akrogon creates, verify included. The fix belongs around it (config surface), never inside it.
- Q6: in-checkout store was sanctioned by init (it gitignores it) and by docs — removing it is a feature deletion; O1 needs the docs/init change together.
- Q7: #114's trigger was the registered checkout's *tree* changing, not a config edit — any fix that only validates at write time misses the real recurrence.

## Evidence

- src/scope.ts:43-60 runUnitArgv (no expand flag); :63-80 startRunGuard; :34-42 sessionBusAddress pins real bus for manager calls — better-than-training, inspected.
- src/run-check.ts:25-43 copied/forbidden lists; :55-67 constructedEnv; nested vs systemd-run split — inspected.
- src/guard.ts:5-22 checkLocation; :36-40 own-modules — inspected.
- src/config.ts:267-271 worktreeStore; :333-337 setupCommand default; repoSchema reserved set — inspected.
- src/next.ts allocate (~:371-511), ensureWorktree path-mismatch (~:243-255), createSparseWorktree checkLocation (~:225) — inspected.
- src/verify.ts:296-297 checkLocation call; completed()/greenRun()/requireGreenReceipt — inspected.
- src/init.ts:69-71 gitignore branch for in-checkout store; no worktree_root validation — inspected.
- tests/fake-systemd-run.sh ignores pre-`--` flags — inspected.
- `man systemd-run` on systemd 262: `--expand-environment=BOOL`, default expands `${VAR}`; `$VAR` whole-arg expansion confirmed by seed repro — tool docs, better-than-training.
- issues/closed/worktree-isolation/worktree-store/design.md: store outside every checkout + ancestor guard rationale — inspected.
- Surprise: #113's red is structural, not incidental — no-setup + package.json can never pass by design; the only bug is silence. And G3's worst trigger was a git checkout move, not a human edit.
