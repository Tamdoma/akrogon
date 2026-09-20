# Implementation report: seat-override

## Changed files and reasons

- `src/config.ts` — `repoSchema.slots` strict optional `{a?, b?}` of full seat triples; exported `SlotConfig`; exported `seats(global, repo)` resolver throwing `Missing harness template "<h>" for seat <s> in repo <name>`; `effectiveConfig` prints merged `slots` inside a repo, global pair outside.
- `src/next.ts` — `launch(global, repo, slot)` resolves via `seats` (template fill, quoting, first-token check unchanged); `dispatchSlot` passes `repo`; `dispatchLeaf` calls `seats(global, repo)` before `allocate` so an unknown harness exits through the existing `report()` skip path before worktree/tab/pane.
- `src/init.ts` — `seats(global, {name: repoName, root, config})` before `checkGrounding`, so a bad harness fails before any write.
- `tests/config.test.ts` — schema negatives (wrong seat key, partial triple, null seat), `slots: {}` accepted, merged-pair prints from root and linked worktree, global pair outside, two repos with different overrides.
- `tests/init.test.ts` — unknown-harness proposal refused with `expectInitUnchanged`; valid override stored and preserved on repeat init.
- `tests/next.test.ts` — both-seat override argv in `db.starts` including a spaced model as one argv element, inherited seat, unknown-harness refusal with no worktree/tab/pane.
- `skills/init-issues/SKILL.md` — `slots` optional in proposal block; preserve stored override on repeat; never copy merged effective seats into a proposal.
- `docs/guide/setup.md` — `slots` bullet in Repo config list with next-start rule.
- `docs/guide/cheat.md` — `slots` yaml example with next-start rule.
- `README.md` — machine-config paragraph notes a repo may override either seat.
- `src/AREA.md` — names the `seats` resolver.

## Commands run

- `AKROGON_BASE=329e59d951969f49008a2d7c2fab99c867d133c5 bun test --changed="$AKROGON_BASE"` — 236 pass, 0 fail, 8 files (worker).
- `bun test tests/config.test.ts tests/init.test.ts tests/next.test.ts` — 132 pass, 0 fail (worker).
- `bun test tests/docs-links.test.ts` — 3 pass, 0 fail (worker).
- `bun run format` — clean.
- `bun run typecheck` — clean.
- `bun test` — 287 pass, 0 fail, 13 files.
- `git status --porcelain issues/` — empty before commit.

## Commits

- Base: `329e59d951969f49008a2d7c2fab99c867d133c5`
- Head: `57bd933cb69d8e825bc84502dc125b1c927a330b` — `seat-override: per-repo seat overrides via slots in issues/config.yaml`

## Known limitations

- Override applies at next agent start; running seats keep their launch config (locked).
- `akrogon next` surfaces an unknown-harness override through the per-leaf `report()` skip path (exit 1, stderr JSON naming repo/seat/harness), not a startup-fatal error.

## Unverified criteria

None.
