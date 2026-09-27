# Review B: idle-tab-close

Base `17fa33ab58b727534ec542790fd6a6d11bb65de7`, reviewed head `dbd5e45f49f4c190953ee247017443e73017b6c4`. Worktree clean, head ahead of base. No peer review read (blind).

## Findings

No Fix. No Nit.

- D1/D2: `closeMergedTab` matches the plan; `cleanupMerged` closes before the guard, worktree/branch lines unchanged. C3–C5 tests pin the split.
- D3/D4: hook branch keeps dispatch order, rediscovers by slug, filters on merged + seat A + not blocked/unknown. Bare-`HERDR_PANE_ID` eligibility matches D4; closing regardless of dispatch outcome matches the locked Q1 rule (every merged leaf, wherever its folder is) and C4's failed-pass expectation.
- D5: hook close errors go to `report`, no throw past the lock. Closure errors keep the `dispatchLeaf` path; C4/C5 pin nonzero exit + `offline`.
- C1/C2/C6: new tests use real CLI + real hook env, no new mocks; negatives cover seat-A blocked/unknown, seat-B idle/exit, unmerged idle.
- C7/C8: skill self-close step removed; skill + three guides state the command rule. Grep for `tab close|closes its tab|close this tab|closes the tab|close the tab|own tab` finds only new-rule text; full `tab` sweep of `docs/guide` + README finds no contradicting unchanged page.
- Design exclusions intact: no change to `completeOwner`, `closeSources`, selection rules, or the broadcast skill. No `AREA.md` in the diff.

## Verification

- Targeted reruns on the reviewed head: `-t 'hook'` 15 pass, `-t 'startup'` 4 pass, `-t 'tab survives'` 5 pass, 0 fail.
- Relied on report evidence for the full run: `bun run format` exit 0, `bun run typecheck` clean, `bun test` 306 pass 0 fail.

## Verdict

`ready`
