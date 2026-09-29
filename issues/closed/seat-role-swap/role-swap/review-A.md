# Review A: role-swap

Date: 2026-09-29. Phase: initial check.review. Verdict: ready.

Base: `3704d86a92d6369be36bf600ca413be79cf81c22`.
Reviewed head: `7e3e30585d8cf8a9a135166f9340fd87de299116`.

## Findings

No Fixes or Nits. No unresolved questions. Debate artifacts are absent as expected for `debate: no`. The worktree is clean at the reviewed head.

## Verification

- C1-C4: Traced `requiredSlots` through dispatch and the shared transition guard. A owns synthesis, implementation and repair. B owns merge and repair review. Paired phases retain A+B. The close gate checks pane.B, and allocation remains A first, B split right. Ran `bun test tests/next.test.ts tests/phase.test.ts --test-name-pattern 'prompts configured A|swapped seats|tab survives|seat-B idle hook|refuses a --slot|rechecks only B'`: 15 pass, 0 fail, 99 assertions, 6.63s. These real CLI scenarios prove first-pane delivery with strong-a, swapped dispatch, all five wrong-slot refusals without state/log mutation, A idle/exit non-close, and B idle close.
- C5: Compared parsed base and head configuration with Bun and `isDeepStrictEqual`. Head equals base with only `slots.a` and `slots.b` exchanged. The apparent b-key removal/addition is diff alignment, not a key or whitespace edit.
- C6-C8: Read every owned skill and affected guide page, followed the reference index, and checked the criterion-8 sweep. All job assignments match the new routing. Remaining old-role matches are confined to the excluded chart-door paths. Listed and checked every concrete path named by changed `skills/AREA.md`. Its `scripts/observe.ts` shorthand resolves to existing `skills/watch-issues/scripts/observe.ts`. README, parts and src/AREA remain accurate. The guides document the new seat ownership. No additional documented behavior changed.
- C9-C10: Inspected the saved real-CLI scratch transcript, including repair, refused old-seat call, unchanged state and completion. The transcript has no worktree, so worktree handoff verification comes from the CLI test suite rather than that transcript. Reused unchanged-head implementation evidence for format, full tests (339 pass, 0 fail), and changed tests (226 pass, 0 fail). Independently ran `bun run typecheck`: exit 0.

Tests replace Herdr/GitHub only at external boundaries and exercise actual routing, transition and dispatch code. Added assertions check commands, seat identities and state effects. Design exclusions, pane recovery and state schema are unchanged. No conversion of in-flight leaves is expected under the locked cutover decision.

No reusable lesson identified. Requested handoff: `merge`, slot A, verdict `ready`, through the installed lifecycle command.

## Merge verification: 2026-09-29

Both initial reviews are ready. Fetched origin and rebased onto `origin/main` at `3704d86a92d6369be36bf600ca413be79cf81c22`. Rebase was already up to date, without conflicts. Prior reviewed head and tested head both remain `7e3e30585d8cf8a9a135166f9340fd87de299116`. Refreshed AKROGON_BASE from the installed command after rebase.

- E1: `bun run format`: exit 0, 0.54s. No worktree edits. Output: `merge-evidence/format.log`.
- E2: `bun run typecheck`: exit 0. Output: `merge-evidence/typecheck.log`.
- E3: `bun test`: 339 pass, 0 fail, 3926 assertions, 94.41s. Output: `merge-evidence/test.log`.
- E4: Configured `test_changed` command with `AKROGON_BASE=3704d86a92d6369be36bf600ca413be79cf81c22`: 226 pass, 0 fail, 1898 assertions, 79.67s. Output: `merge-evidence/test-changed.log`.

All configured blocking checks passed. No advisory checks configured. Worktree remains clean. Issue brief gathered before completion. Local-main activation remains the operator's post-merge, post-broadcast step under the locked design.

`git push origin HEAD:main` succeeded fast-forward: `3704d86..7e3e305 HEAD -> main`. Pushed head: `7e3e30585d8cf8a9a135166f9340fd87de299116`.
