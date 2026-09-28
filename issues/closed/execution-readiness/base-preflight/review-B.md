# Review B: base-preflight

Base: `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`
Reviewed head: `6d4225740b1dea4fb5853dec2b141bcb95d0af71` (worktree clean, base is ancestor)

## Scope check

13 files on the branch, all inside plan surfaces plus one AREA upkeep line. No `issues/` paths. `src/phase.ts` and `src/sync.ts` untouched; no fetch, commit, push, status, clock, or poll added. Design exclusions hold.

## Decisions vs diff

- D1-D3: `src/preflight.ts` carries the specified probes, error shape, and orchestration. Classify path rethrows the original C3 only when the remote probe passes; unexpected `rev-parse` codes surface as `CommandError`, never misclassified.
- D4: gate sits after `seats()`, before `allocate()`, with the mirrored-path comment. The throw uses the existing report funnel; no new presentation.
- D5: verb prints `<remote>/<branch> <sha>`; errors propagate uncaught like every other verb.
- D6: `trackingRef()` feeds `base()` and `worktree add`; `target()` kept elsewhere. No remaining `target(` call in `next.ts`, so the dropped import is correct.
- D7: fixture owns a real bare remote; every colliding `remote add` adapted by reading (second-remote `upstream` add kept, missing-origin case removes first).
- D8: README row and shapes.md sentence match the specified text.
- D9: `phase.ts` limitation preserved, not expanded.
- D10: no credentials named; nothing to check.

## Criteria vs tests

- C1-C4: 8 CLI tests in `tests/preflight.test.ts`, each establishing its own remote state; exit codes, case labels, remediation commands, and no-write assertions all behavioral.
- C5-C7: `refusal` helper plus 8 dispatch tests cover new leaf (C1/C2/C3), branch-without-worktree, existing worktree (C3/C2), no-query-on-valid-existing, proof-on-create, and impostor branch/tag losing to the tracking commit in both `rev-parse` and `AKROGON_BASE`.
- C8-C9: command-reference contract plus both doc edits, passing.
- C10: all three checks green on the reviewed head (below).
- No mocks of the unit under test (fakeHerdr is the sanctioned boundary); no prose tests beyond literal commands, SHAs, and fixed case labels.

## Docs and index

- `src/AREA.md`: one shell check confirmed all 8 named paths exist; file holds 32 lines with the required four sections.
- Changed-behavior doc pages (README command table, shapes.md preflight) carry the new rule with correct text.
- Own `docs/`/`skills/` grep for `origin/main`: only `gacp.md` operator prose, which describes the gacp workflow, not base resolution. No stale claim.

## Verification evidence

- `bun test` on the reviewed head: 323 pass, 0 fail, 15 files.
- `bun run typecheck`: clean. `bun run format`: 36 files unchanged, tree still clean.
- Live smoke: lane `akrogon preflight` against the real registered repo prints `origin/main 337ab26...`, exit 0.
- Report transcript path exists: `.evidence/preflight-verify.log`, 7 scenario headers, gitignored outside `issues/`.

## Findings

None. No Fix, no Nit.

## Verdict

ready
