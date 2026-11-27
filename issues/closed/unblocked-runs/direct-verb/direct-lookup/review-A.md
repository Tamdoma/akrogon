# Review A: direct-lookup (check.review)

- Base: `15582bcdcfd1f14ab30f11fee4333a7da6a4871d`
- Reviewed head: `364d4e696223e8c7b16ae6299f6db093d32e1518`
- Commits: `b862819a` (tests), `64d2f2b1` (code), `de7194ef` (docs), `364d4e69` (AREA line cap)

## Against plan and design

- D1, D2: `src/direct.ts` `liveSeat` uses `terminalIfPresent` and requires `state === 'live'`. `terminal` and `probeTerminal` are not used, which matches the design pitfall list. A blank or unset `HC_SESSION` refuses with a message naming it. No fallback scan was added.
- D3: both seats resolve before `directLeafPath`, so the create path and the rerun path both refuse before any write.
- D4: `probeExactlyOne` is gone, and `rg probeExactlyOne` over the repo finds nothing. `sessions` and `terminal` are no longer imported in `src/direct.ts`.
- D5: `slugLeafFolders` iterates `issueFolders(repo.root, 'issues/<area>')` and keeps the open-draft and closed-with-state rule. `issueFolders` returns `[]` for a missing area, so the dropped `existsSync` guard is covered.
- Design exclusions hold: `src/hc.ts`, `tests/hc-fixture.ts`, `seat --slot`, `notice` and the CLI are unchanged. The seat-ref consumers (`src/next.ts`, `src/reconcile.ts`) read the same `{session, address}` shape.
- The two-session reviewer refusal test was deleted, as the design states, and the C1 test replaces it. The `Test-Change:` trailers on `b862819a` name both edited test files.

## Docs

- `src/AREA.md`, `docs/reference/commands.md` and `docs/reference-index.md` describe resolution in the caller's `HC_SESSION`.
- `grep "exactly one live session"` over the repo's `.md`/`.ts` finds nothing.
- The reference index names direct's seat lookup as the exception to the repo-session pin.
- AREA path listing: every `src/`, `docs/` and `tests/` path named in `src/AREA.md` exists (one-shell loop, no `MISSING` lines). The file is 40 lines with the four required sections.
- `skills/chart-issues/SKILL.md:118` ("probes the caller and reviewer live") stays true. No documented behavior beyond the three owned files changed.

## Verification

- `check c1-c2-c3: 0 .../implementation/check-c1-c2-c3-1795648452559-2538377.log` (19 pass) on `364d4e69`
- `check land: 0 .../implementation/check-land-1795648454700-2540427.log` on `364d4e69`
- `akrogon verify` on `364d4e69`: green (format, typecheck, test)
- Fail-before evidence for #162 and #163, plus the red runs for each condition (V1 base, V2 repoSpace, V3 unchecked reviewer, V6 late check), is in `plan.md`.

## Findings

None at Fix level.

## Nits

None.

Verdict: ready
