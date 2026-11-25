# Report: caller-display

Delegated implement, one wave of two units. Slot A, 2026-11-25.

Base: `8d0df9dd2cc0274401346de5fb89ccc48174f570` (origin/main; the refresh at pass start rebased the leaf's test commit from `99552b73` onto it in one clean pick).
Head: `5530b6c8` — verified green by `akrogon verify` after the final cherry-pick; no commit after the green verify.

Lane commits over base:

- `5f699994` test: criterion proofs red-first + isolation preload display-unset (planning-era test commit, carried the `Test-Change: tests/isolation.ts` trailer)
- `f024825c` carry the caller display variables through one exported list (U1 worker `0bd820c4`, cherry-picked clean)
- `fd950485` test: allow-list expectation gains the copied display names (A's pre-authorized D5 correction, `Test-Change: tests/run-check.test.ts` trailer)
- `5530b6c8` docs: caller-display forwarding rule and lesson retirement (U2 worker `10f96a1b`, cherry-picked clean, `Test-Change: tests/AREA.md` trailer)

## What was built

- `src/run-check.ts`: exported `displayEnv: readonly string[]` = `['DISPLAY', 'XAUTHORITY', 'WAYLAND_DISPLAY', 'XDG_RUNTIME_DIR']`, spread into `copied`. The existing `value !== undefined` copy loop carries each exactly as the caller holds it (empty copied, absent absent); the bus cut stays assigned after the loops.
- `src/verify.ts`: `passDisplay` derives the three non-runtime names from `displayEnv`; `passForwarded` spreads it (a repo listing the names in `pass_env` changes nothing — the set dedupes). `launchPass` emits `-p UnsetEnvironment=<name>` for each of the three the caller lacks, so the user manager's own `DISPLAY`/`WAYLAND_DISPLAY` never leaks into a verify pass; a held name gets exactly one `--setenv=<name>=<value>`, empty included, never both forms.
- `src/land.ts`: `launchLand` emits `--setenv=<name>=<value>` for each of the three the caller holds through the existing only-if-defined flatMap; never `UnsetEnvironment`; the one `--setenv=XDG_RUNTIME_DIR=${runtimeDir()}` stays exactly once. `XDG_RUNTIME_DIR` is operationally pinned in both services (binding decision 7) while the run-check payload copies the caller's verbatim.
- `src/config.ts` untouched: the four names stay valid in `env`/`pass_env`.
- `docs/reference/checks.md` (the check-environment paragraph) and `docs/reference/config.md` (the environment-variables paragraph) state the forwarding rule; `tests/AREA.md` records the preload's display-unset.
- Lesson retired: the `run-check drops DISPLAY` line removed from `learnings/LESSONS.md`, `Applied 2026-11-25 by src/run-check.ts displayEnv/copied: …` appended to `learnings/history/2026-11-24-run-check-drops-display.md`. Stop = removal of the cause: the copy is the only env construction for check commands, and every door (run-check direct, verify pass, land-through-verify) reaches the caller's values.

## Worker incidents (both brief errors by A, resolved in-turn)

- `tests/AREA.md` matches the `src/test-files.ts` path rule (`tests` segment) — the brief-2 parenthetical claiming otherwise was wrong; authorized the `Test-Change: tests/AREA.md` trailer.
- `tests/AREA.md` was already 45 lines at base, not 30 as the brief said; ruled the 40-line cap inapplicable (zero lines added, structure intact) rather than authorizing compression of unrelated bullets.

Worker reports: u1 at the (now removed) worktree's `worker-report.md`; content condensed in the wave returns. Both worker worktrees removed after cherry-pick. No mismatch on product code, no repair round, no provider failure.

## Commands run and results

Criterion proofs, all green on the committed head `5530b6c8` (each seconds of wall time; no paid run, `env_names: []`):

| Proof | Command | Result | Log |
|---|---|---|---|
| criterion 1: display names reach the run-check command as held (empty copied, absent absent, bus cut, session-type/socket absent) | `bun test --timeout=120000 tests/display-env.test.ts -t "run-check copies each display"` | 1 pass 0 fail | `check crit1-display: 0 implementation/check-crit1-display-1795594121717-3629270.log` |
| criterion 2: pass_env listing the names still loads and forwards identically | same file `-t "pass_env"` | 1 pass | `check crit2-passenv: 0 implementation/check-crit2-passenv-1795594121923-3629432.log` |
| criterion 3a: verify pass argv, caller holds all three (empty included, no UnsetEnvironment, one XDG_RUNTIME_DIR; twice — plain and pass_env-listed) | `-t "verify pass unit is launched with every held"` | 1 pass | `check crit3-verify-held: 0 implementation/check-crit3-verify-held-1795594122425-3629609.log` |
| criterion 3b: verify pass argv, caller lacks all three (one `-p UnsetEnvironment=` pair each, no setenv form) | `-t "lacking the display names unsets"` | 1 pass | `check crit3-verify-unset: 0 implementation/check-crit3-verify-unset-1795594122745-3630050.log` |
| criterion 3c: land argv, caller holds all three (empty included, no UnsetEnvironment, one XDG_RUNTIME_DIR) | `-t "land unit is launched with every held"` | 1 pass | `check crit3-land-held: 0 implementation/check-crit3-land-held-1795594122986-3630332.log` |
| criterion 3d: land argv, caller lacks all three (neither form, one XDG_RUNTIME_DIR) | `-t "land unit launched by a caller lacking"` | 1 pass | `check crit3-land-lacking: 0 implementation/check-crit3-land-lacking-1795594123228-3630540.log` |
| criterion 4: docs statements present + links/anchors intact | `grep -c DISPLAY docs/reference/checks.md docs/reference/config.md`; `bun test --timeout=120000 tests/docs-links.test.ts` | grep counts positive both files; 14 pass | `check crit4-docs: 0 implementation/check-crit4-docs-1795594127944-3630990.log`, `check crit4-docs-links: 0 implementation/check-crit4-docs-links-1795594128047-3631063.log` |
| criterion 5: lesson retirement in the leaf diff | `git diff 8d0df9dd...HEAD -- learnings/LESSONS.md` shows exactly the one line removed; history file shows the one Applied line added | verified | (diff output in this transcript) |
| changed-tests command (full suite + changed-file reruns ×5) | the printed `checks` `test` command | 1439 pass 0 fail; then 210 pass 0 fail rerun phase | `check pick-u1-changed` red only on the pre-correction allow-list test (`check-pick-u1-changed-1795593959846-3004133.log`); `check final-changed-tests: 0 implementation/check-final-changed-tests-1795594106796-3308392.log` green after all picks |
| D5 correction proof | `bun test --timeout=120000 tests/run-check.test.ts` | 36 pass 0 fail | `check d5-allowlist: 0 implementation/check-d5-allowlist-1795593985931-3304747.log` |

Red-first evidence was gathered at planning (before product code): `check crit-display-red2: 1 implementation/check-crit-display-red2-1795592810396-1697074.log` (four criterion tests red on base, two green regression pins), plus violation demonstrations each reverted: bus cut (`crit-viol-bus`), XDG_SESSION_TYPE (`crit-viol-sess`), WAYLAND_SOCKET (`crit-viol-wsock`), reserved-list collision (`crit-viol-reserved`), land UnsetEnvironment (`crit-viol-landunset2`), duplicate XDG_RUNTIME_DIR (`crit-viol-landxdg`), preload-unset determinism (`crit-viol-preload`).

`akrogon verify` on the committed head: **green** — `verify leaf 5530b6c86f0ec18a5c9290d1f3bc064d736a482f: green`; setup 0, format 0, typecheck 0, test 0 (~2.9 min wall) under `implementation/check-{setup,format,typecheck,test}-*3631257.log`. First attempt only: the verify was run once and passed; no repair round.

## Criteria linkage

1. Display variables reach the run-check command as the caller holds them — crit1-display; pass_env variant criterion 2 — crit2-passenv.
2. Verify pass argv shapes (both caller states, both pass_env states) — crit3-verify-held, crit3-verify-unset.
3. Land argv shapes (both caller states) — crit3-land-held, crit3-land-lacking.
4. Docs — crit4-docs + crit4-docs-links.
5. Lesson retirement — diff proof above.

## Known limitations

- The leaf proves forwarding at every door; it does not prove a headed window opens through the fixed CLI on this host (the design's standing dissent, recorded in plan.md as the real open limitation). The charting probes P0–P3 cover the host's pre-existing display mechanics.
- The verify pass's `UnsetEnvironment` only covers the three display names; other user-manager variables unrelated to the display are untouched by design.
- Unverified criteria: none.
