# Review A: verify-pass-service

Base `c93f4223`, reviewed head `e709aac` (tree identical to `de163ee8`; amend was trailer-only). Verdict: **nits**.

## Evidence

- Full suite on head: `bun test --timeout=30000` → 1217 pass, 0 fail (171 s), including all five new real-systemd criterion tests.
- `bun run typecheck` → clean. `prettier --check` → clean via the verify format check.
- `akrogon verify` on head → green receipt `7550f03a` (the installed release runs the suite on the worktree checkout; the pass code under test is in the committed diff, proven green by the run-units tests which spawn the worktree entry directly with real systemd).
- AREA.md path check: every source file named in the edited lines exists (`src/verify-pass.ts`, `src/verify.ts`, `src/stop-run.ts`, `src/admission.ts`, `src/akrogon.ts`, `src/reconcile.ts`, `docs/reference/commands.md`).

## Judged against

All six done-criteria map to the shipped tests (see report.md): C1 survival, C2 join/new-pass, C3 exit codes, C4 `run <id>` + stop incl. `full`-wait + foreign refusal, C5 scope owner, C6 doc rows/lines read back against the code — `commands.md` verify/stop-run/verify-pass rows and AREA lines 6/19/20/21/33 match the implementation (join key fields match `samePass`, pass dir path matches `passesRoot()`).

Design decisions held: no receipt schema change, `AKROGON_RUN` untouched (separate `AKROGON_SCOPE` carrier), `nested()`/admission unchanged, reconcile `verify-*` worktree rule unchanged, `land.ts` unchanged, exclusions kept.

Join-key soundness: two callers can only share a key when `caller_scope` and resolved `caller` match, which fixes the cwd/git-dir, so `recordLock` (resolved under `repo.root`) serializes every same-key claim — no cross-lock gap. `stop-run` resolves check runs first, then live passes on `run === id && caller_scope === scope`; bare `stop-run` unchanged.

## Findings

No Fix found: every criterion has a passing proof on this head, no wrong behavior with a realistic source surfaced, docs match shipped behavior.

N1. `src/verify.ts` imports `readdirSync` unused (registry scan moved to `verify-pass.ts`). Trivial cleanup; no behavior. Promote if it masks a future unused-import pattern check.

N2. `waitPass` drains by reading whole `out`/`err` files every 200 ms poll. Pass streams are bounded by suite output (KBs–low MBs), so cost is trivial; if a pass ever produced very large output, switching to `fs.read` with offsets would matter. Concern only; no realistic source today.

N3. `passLive` treats a `pending` record as live for only 30 s. If systemd activation of `akrogon-verify-<id>` ever exceeds that (pathological manager stall), the caller exits 1 while the pass still runs to completion, and a retry starts a duplicate suite on the same tree (second pass's receipt is still truthful — consequence is wasted work, not wrong evidence). A stricter `pending` check on `systemctl is-active` would close it; deferred as a rare, low-consequence race.

N4. `stop-run <pass id>` in the narrow window between record claim and unit creation hits "unit not found" and exits non-zero without stopping the pass (the pass then runs). Reachable only in the launch window; the command's refusal semantics already exist for unknown ids. Nit.

N5. A `status` file truncated by a kill between `open` and `write` parses to `NaN`, which throws `RangeError` inside `verify` — the caller still exits non-zero (verified: `process.exitCode = NaN` exits 1 on bun and node), but as an uncaught exception rather than a clean return. Cosmetic. Nit.

N6. `waitPass` drain slices `out`/`err` on byte offsets with `toString('utf8')`; a multi-byte character straddling a poll boundary garbles in caller output (the file itself is intact). Streams are near-ASCII today. Nit.

## AREA.md live-path listing

`src/verify-pass.ts src/verify.ts src/stop-run.ts src/admission.ts src/akrogon.ts src/reconcile.ts docs/reference/commands.md` — all exist at HEAD. `<globalHome>/verify-passes/` is a runtime-created registry, not a repo path.
