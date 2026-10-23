# Plan: check-env-fidelity

Debate off (`debate: "no"`); synthesized directly from brief.md and design.md. Design's one open question resolved below (D3).

## Decisions

- **D1** (locked 1a): `runUnitArgv` in `src/scope.ts` adds the literal `'--expand-environment=no'` before the `--` separator, so the checked command's argv reaches it byte for byte. The flag exists since systemd 254; `docs/guide/install.md` states that floor.
- **D2** (locked 2a): `constructedEnv` in `src/run-check.ts` sets `env.LANG = 'C.UTF-8'` after the `copied` loop and before the `env`/`pass_env` copy loop, so a repo declaring `LANG` keeps its own value. `LANG`/`LC_ALL` are never added to the reserved names in `src/config.ts`.
- **D3** (resolves design's open question): criterion 1 gets a new `test.serial` in `tests/run-units.test.ts`, not an extension of the existing 'nested run-check' test. The existing test proves cgroup equality and record counting; folding argv fidelity in would attribute a red run to either defect. The new test reuses `realFixture()` and its shared `akrogon-test-*` slice, so the real systemd-run boundary is already proven machinery — no new runner.
- **D4** (locked 3a): docs only for the gh credential note. `docs/guide/setup.md`'s `pass_env` bullet gains the sentence that the bus cut hides keyring-stored credentials, so gh needs a token in its own file (`gh auth login --insecure-storage`) or the repo declares `GH_TOKEN` in `env` or `pass_env`.
- **D5**: three units in one wave. Paths are disjoint, no shared test resource beyond per-test temp homes, no prerequisites between units.
- **D6**: the planned test commit also updates the env allowlist in `tests/run-check.test.ts` (`allowed` gains `'LANG'`). Brief criterion 2 changes the constructed environment the test asserts; the update is green before and after the product edit, so it stays red-free at planning. The commit carries a `Test-Change:` trailer citing brief criterion 2.

## Read-first

- `src/scope.ts` — `runUnitArgv` (line ~43), `startRunGuard` (other systemd-run caller, out of scope).
- `src/run-check.ts` — `constructedEnv` (line ~56), `forbidden`/`copied` lists, `checkedRun` scope-vs-nested branch (line ~229).
- `src/config.ts` — reserved env names in `superRefine` (line ~63); LANG/LC_ALL stay out.
- `tests/run-units.test.ts` — `spawnReal`, `realFixture`, `testSlice`, `leafWorktree`, the 'nested run-check' test as the template.
- `tests/run-check.test.ts` — `cli`, `fixture`, `leafWorktree`, `baseEnv`, the env allowlist test.
- `tests/helpers.ts` — `cli`, `fixture`, `fakeAkrogon` (puts the entry on PATH for nested calls).
- `tests/fake-systemd-run.sh` — skips all flags before `--`; the new flag needs no fake change.
- `src/AREA.md` — run-check commands and the Test-Change trailer rule (Non-obvious patterns).
- `docs/guide/install.md` — prerequisites list; `docs/guide/setup.md` — `pass_env` bullet (line ~63).
- `issues/chart/run-check-fidelity/forks/check-contract.md` — proofs P1–P3 and the 2026-10-13 gh lock.

## Interfaces

None new. `runUnitArgv`'s signature is unchanged; consumers (`src/run-check.ts` scope path) pass argv through unchanged. `constructedEnv` gains one key in its returned record.

## Wave 1 — all three units, any order

- **U1 argv fidelity**: `src/scope.ts` (`runUnitArgv` body only). Shared test resource: the host's systemd user manager via the shared `akrogon-test-*` slice (read-only use; the test file owns it through `createdSlices` cleanup). Proof: criterion 1 test green.
- **U2 LANG**: `src/run-check.ts` (`constructedEnv` only). Proof: criterion 2 tests green; env allowlist test still green.
- **U3 docs**: `docs/guide/install.md` prerequisites line; `docs/guide/setup.md` `pass_env` bullet. Proof: criterion 3 greps green and `tests/docs-links.test.ts` green.

Docs: `docs/guide/install.md` and `docs/guide/setup.md` are the affected human docs (edited in U3). No agent-facing doc is affected: `src/AREA.md`'s run-check description still holds, skills name no argv or locale contract.

## Acceptance evidence

| Criterion | Boundary | Before → after | Product failure it catches | Command (via `akrogon run-check`) | Size / rerun |
|---|---|---|---|---|---|
| 1 argv byte-for-byte, scope and nested | real `systemd-run --scope` unit and a nested `run-check` inside it | `a  b`, ``, `/home/ivan`, `${x}` → literal `a ${base} b`, `${file.key}`, `$HOME`, `$${x}` | systemd-run env expansion swallowing `$`-arguments of checked commands (#112) | `akrogon run-check --name argv-literal -- bun test --timeout=45000 tests/run-units.test.ts -t 'byte for byte'` | minutes / rerun when `runUnitArgv`, admission nesting or the test file change |
| 2 LANG=C.UTF-8 default, caller LANG under pass_env | checked command's env via run-check fixture | `LANG` unset, `wc -m`=2 → `LANG=C.UTF-8`, `wc -m`=1; `pass_env: [LANG]` → caller value | no locale in checked commands; JVM path-encoding break (#111); a declared LANG silently dropped | `akrogon run-check --name lang-default -- bun test --timeout=30000 tests/run-check.test.ts -t 'LANG'` | seconds / rerun when `constructedEnv` or reserved names change |
| 3 docs name systemd 254 and gh file storage | the rendered guide text itself | absent → `install.md` names systemd 254+; `setup.md` `pass_env` bullet names keyring hiding, `--insecure-storage` or declared `GH_TOKEN` | install on systemd <254 breaking `runUnitArgv` silently; operators debugging gh 404s with no hint (#110 credential part) | `akrogon run-check --name guide-env -- sh -c "grep -n '254' docs/guide/install.md && grep -n 'insecure-storage\|GH_TOKEN' docs/guide/setup.md"`, plus existing `bun test tests/docs-links.test.ts` inside the `test` check | seconds / rerun when the two guide files change |

No new proof machinery: both test commands use `bun test`, the fake seam stays as-is, the real-unit path already exists in `tests/run-units.test.ts`. No model or outside stage; no credentials needed (`Missing:` check: none named by the design). Not a slow run; no restart boundaries needed.

## Planned tests (this pass, red-first)

1. `tests/run-units.test.ts`, new `test.serial` `a run-check passes $-arguments byte for byte through the real run unit and a nested run-check`: outer `spawnReal` `run-check -- sh -c <recorder> sh 'a ${base} b' '${file.key}' '$HOME' '$${x}'` writes each argv line plus `/proc/self/cgroup`; inside the same script a nested `akrogon run-check --name inner -- sh -c <recorder> sh <same four>` writes the inner set; assert both files equal `args.join('\n')` and the cgroup names an `akrogon-run-*.scope` under the test slice. Red observed 2026-10-22 (`check argv-literal: 1 implementation/check-argv-literal-1792695291269-1831453.log`): `outer` held `a  b`, ``, `$HOME`, `${x}` — `${base}`/`${file.key}` expanded to empty and `$${x}` collapsed to `${x}` inside the systemd-run'd script argument; `$HOME` survived only because whole-word `$NAME` expansion does not reach inside a larger argument.
2. `tests/run-check.test.ts`, new test `run-check gives the command LANG=C.UTF-8 unless the repo declares LANG in env or pass_env`: `run-check -- sh -c 'printf "lang=%s\\n" "$LANG"; printf "Č" | wc -m'` → `lang=C.UTF-8` and `1`; then with `pass_env: ['LANG']` a caller `LANG=akrogon-test-lang` reaches the command. Red observed 2026-10-22 (`check lang-default: 1 implementation/check-lang-default-1792695289446-1831199.log`): `lang=` empty and `wc -m` printed `2` — no locale set, so `Č` counts as two bytes.
3. Same planned commit: `allowed` set in the existing env test gains `'LANG'` (D6).

Commit 1 (planning, before product code): the two new tests plus the allowlist line, `Test-Change:` trailer citing brief criterion 2 for `tests/run-check.test.ts` (expectation change plus added case) and naming the added case for `tests/run-units.test.ts`.

## Limitations

- The flag is proven on systemd 262 (chart P1); systemd 254–261 are covered by the documented floor, not re-proven here.
- The JVM path-encoding effect of #111 is intake evidence; no JDK on this host (chart P2 limits).
- gh file-token storage rests on the 2026-10-13 T1 proof; this host's gh uses the keyring (chart P3 limits).
- #110's mise shim hang stays open and out of scope per the design's "Off route".
