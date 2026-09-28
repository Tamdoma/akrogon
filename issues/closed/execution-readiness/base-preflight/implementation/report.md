# Implementation report: base-preflight

## Changed files and reasons

Wave commits on lane `base-preflight` (base `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`, head `6d4225740b1dea4fb5853dec2b141bcb95d0af71`):

- `src/preflight.ts` (new, U1 `4b81295`): `trackingRef`, `PreflightError` (C1/C2/C3/unproven), `ensureRemote`, `localBase`, `remoteBase`, `checkBase`, `preflightCommand`. Owns the base rule per D1-D3.
- `src/config.ts` (U1): `base()` merge-bases against `trackingRef()`; `target()` untouched. D6.
- `src/akrogon.ts` (U1): `case 'preflight'` plus usage line. D5.
- `tests/preflight.test.ts` (new, U1): 8 CLI tests, each establishing its own remote state. C1-C4, C7-config.
- `tests/command-reference.test.ts` (U1): `preflight: ''` contract. C8.
- `README.md` (U1): command-table row. C8.
- `skills/chart-issues/assets/shapes.md` (U1): handoff preflight sentence. C9.
- `src/next.ts` (U2 `dfa5437`): dispatch gate after `seats()`, `worktree add` starts at `trackingRef()`, unused `target` import dropped. D4, D6.
- `tests/helpers.ts` (U2): fixture gains a real bare remote; fake `update-ref` deleted. D7.
- `tests/next.test.ts` (U2): redundant remote setups deleted, `refusal` helper plus 8 dispatch tests. C5-C7.
- `tests/pull.test.ts`, `tests/sync.test.ts` (U2): `remote add` adapted to `set-url`/deletion; missing-origin case removes the remote first. D7.
- `src/next.ts` comment, `src/AREA.md` key-files line, `tests/next.test.ts` trailing blank line (B polish `6d42257`): gate comment names the mirrored path; AREA lists the new module; prettier write.

## Commands run with pasted results and artifact paths

- U1 red: `bun test tests/preflight.test.ts tests/command-reference.test.ts` → 3 pass, 9 fail (verb missing; AKROGON_BASE resolved to the divergent impostor branch, confirming the D6 bug).
- U1 green: `bun test --changed="$AKROGON_BASE"` → 241 pass, 0 fail, 8 files. `bun run typecheck` clean.
- U2 red: new dispatch tests before the gate → 7 fail, 1 pass (C1/C3 refused with wrong errors after herdr calls; C2 and unreachable-create dispatched vacuously; impostor test failed in `worktree add`). The 1 pass is the unreachable-remote dispatch test, correct behavior pre-change.
- U2 green: 8 new tests pass; `bun test --changed="$AKROGON_BASE"` → 320 pass, 0 fail, 14 files. `bun run typecheck` clean.
- B lane picks: changed suite green after each cherry-pick (241 then 320).
- B full suite on near-final tree: `bun test` → 323 pass, 0 fail, 15 files (127s). `bun run typecheck` clean. `bun run format` applied (one trailing blank line).
- B committed-tree check: `bun run typecheck` clean; `bun test tests/preflight.test.ts tests/command-reference.test.ts` → 12 pass, 0 fail.
- Real-CLI verification transcript (temp repos, C1/C2/C3/pass/impostor): all six scenarios correct, retained outside tracked `issues/` at `/home/ivan/Work/infra/akrogon/issues/worktrees/base-preflight/.evidence/preflight-verify.log` (gitignored).

## Base and head

- Base: `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`
- Head: `6d4225740b1dea4fb5853dec2b141bcb95d0af71`

## Known limitations

- D9 (plan-locked): `phase.ts` diff guards keep abbreviated `target()`; a same-named local branch can skew them. Not scope.
- Bun's uncaught-error dump prints a source excerpt, so the unproven test asserts absence of the `C2:` label rather than bare `C2` (the excerpt contains the `'C2'` throw site). The C2 remediation itself is absent.
- `docs/` grep found only sync/merge/gacp prose touching base-adjacent topics; none states the ref rule, so no edits made.

## Unverified criteria

None. C1-C10 all hold with the evidence above.
