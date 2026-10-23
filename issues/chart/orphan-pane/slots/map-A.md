# Map A

## Consolidation
- G1 run-check fidelity: #110 (gh keyring unreachable, cut bus), #111 (no locale), #112 (systemd-run expands `${}`). Same command, three independent mechanisms. Destination: a checked command sees its argv unchanged, a UTF-8 locale, and a documented route for gh auth.
- G2 verify config walls: #113 (no `setup` + package.json -> own-modules refusal), #114 = #115 duplicate (in-checkout `worktree_root` trips checkLocation once root gains package.json). Destination: a repo config mistake is refused at its source, naming the key to fix.
- G3 orphan pane: #116. Destination: an interrupted allocate leaves no unrecorded pane; the next `next` reuses it.

## G1 forks
- F1 #112: add `--expand-environment=no` to `runUnitArgv` (src/scope.ts:43-60). One argv entry. Proof run here: systemd 262 keeps `${base}`, `${file.key}`, `$HOME` literal with the flag, expands without. Nested runs spawn directly (run-check.ts:231) and are unaffected. Other systemd-run callers (land.ts:19, scope.ts:67 guard) pass no user argv. Pick: flag. No option deletes more.
- F2 #111: (a) fixed `env.LANG = 'C.UTF-8'` in constructedEnv; (b) copy LANG/LC_ALL/LC_CTYPE from caller; (c) docs only, consumer adds LANG to pass_env. Pick a: deterministic regardless of caller (a seat or cron without LANG gets the same result), one line, C.UTF-8 is glibc built-in (2.35+, host 2.44, `locale -a` lists C.utf8). b inherits caller variance, the thing constructedEnv exists to remove. pass_env still overrides when a repo lists LANG. Proof: `env -i sh -c 'printf Č | wc -m'` 2 vs 1 with LANG=C.UTF-8.
- F3 #110: (a) no code; docs/guide/setup.md:63 says the bus cut also hides keyring credentials, supply `GH_TOKEN` via `env` (.env) or `pass_env`; (b) stop cutting the bus (breaks seat containment, closed host-test-load design); (c) keyring proxy (new machinery). Pick a. Proof: env -i with cut bus -> gh 404 on private repo; same with GH_TOKEN -> `private`. mise shim hang: Off route, machine shim; the seat's tool limit already killed it.
- Split: one leaf with three criteria vs three leaves. Pick one leaf: three tiny edits in run-check/scope/docs, one lifecycle instead of three.

## G2 forks
- F4 #114/#115: (a) refuse a `worktree_root` that resolves inside the registered checkout at config read (readRepo), naming the key; delete init's in-checkout gitignore line (init.ts:71) and the setup.md:57 sentence; (b) delete `worktree_root` entirely (tests use it as fixture seam in ~15 places, bigger churn); (c) run checkLocation on the store in `akrogon config` only (still late for commands that skip config). Pick a: matches binding decision issues/closed/worktree-isolation/worktree-store/design.md (store outside every checkout), removes the class (in-checkout store) not the case, deletes code. Existing leaves under `issues/worktrees` are already a legacy root reconcile handles (reconcile.ts:397-399, 494-496); ensureWorktree mismatch message (next.ts:252-255) names the move. Pitfall: refusal at read blocks every command of that repo until fixed; loud and immediate is the point.
- F5 #113: (a) when `setup` is unset, the own-modules refusal names `setup` in issues/config.yaml as the fix; (b) refuse at config read when default-branch tree has a lockfile and no setup (git call on every read, cost); (c) nothing, operator config. Pick a: the guard is right, only its message misleads.
- Split: two leaves (independent files: config.ts/init.ts vs guard.ts/config.ts setupCommand).

## G3 fork
- F6 #116: on bootstrap reuse `members[1]` as B when present (next.ts:487-494), else split. Rejected: close unrecorded members (could close an operator pane); save pane before box (breaks the "boxed before recorded" invariant, next.ts:438). Pick reuse. Box() adopts a reused pane into scope, so containment holds.

## Pitfalls
- #112 flag must stay before `--`; ordering test reads runUnitArgv output.
- LANG fixed value: messages in tests may rely on English; C.UTF-8 messages are English.
- Gljive (other machine) still needs operator config edits (`setup`, drop worktree_root); akrogon delivers loud refusal, close notes say so.

## Evidence (better-than-training unless noted)
- src/run-check.ts:56-67 constructedEnv; src/scope.ts:43-60 runUnitArgv; man systemd-run (262) --expand-environment; probe 2026-10-22.
- src/config.ts:267-271 worktreeStore; src/guard.ts:5-22; src/init.ts:69-71; docs/guide/setup.md:57,63.
- src/next.ts:371-511 allocate.
