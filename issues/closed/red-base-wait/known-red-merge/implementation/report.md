# Implementation report — known-red-merge

Base: `2756bd07d31730f90ee539e1261299e2c481b66a` (AKROGON_BASE). Head: `a96c6d3` on `known-red-merge`. Mode: subagents, three units across two waves.

## Changed files and reasons

| Commit | Files | Why |
|---|---|---|
| `b303487` (U1) | `src/compare.ts`, `src/red-record.ts`, `src/state.ts` | `green` record variant (`run.complete: literal(true)`), `attempt` field, `merge` binding param on `validateComparisons` (attempt / leaf_revision-vs-top / counterpart-vs-built_on / attempt-bound base-run line / verdict refusals), `resolveGreen`, `mergeRecords`, `hasKnownRed`, `batch.comparisons`. |
| `a774ad8` (U3) | `skills/merge-issue/SKILL.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/files.md`, `docs/guide/cheat.md`, `README.md`, `src/AREA.md`, `tests/AREA.md` | Merge `--compare` contract, `compared:` print, `Repo red entry` notices, restack comparison gate, green resolve at landing; hold surface (`--red-on-base`, `--command`, `unhold`, `hold-fix`, `held.yaml`, `mergeHolder`) removed everywhere; `held` outcome marked historical. |
| `ccb6f76` (U2) | `src/phase.ts`, `src/akrogon.ts`, `src/next.ts`, `src/status.ts`, `src/hold.ts` (deleted) | `--compare` accepted on `merged --check` under the merge binding; `comparisons` persisted; red-record effects at `--check`; green resolve in `batchPush`, `finishPush`, `reconcileBatch`; restack `rerun` gate when a stamped record holds a known-red unit (unreadable record also forces rerun); `comparisons` cleared on every batch rewrite; retired verbs/flags fail naming `skills/merge-issue/SKILL.md` before leaf lookup; hold module and all held-state reads gone; `mergeQueue[0]` holder checks. |
| `7aea9b8` (A test correction) | `tests/merge-compare.test.ts` | Two fixture expectations corrected against real behavior: fixture config gained `setup: 'mkdir -p node_modules'` so real `akrogon base-run` passes `guard own-modules`; post-`merged` assertions read `issues/closed/` because the command moves the folders. |
| `a96c6d3` | `src/compare.ts`, `src/red-record.ts`, `tests/merge-compare.test.ts` | Prettier drift only. |

## Commands run

- Worker U1: `bun run typecheck` clean; changed-test pipeline `642→612 pass / 31 fail` (all planned reds). Commit `52bbb67` cherry-picked clean.
- Worker U3: doc sweeps clean; `bun test tests/hold-retired.test.ts -t sweep` 1 pass; `bun test tests/red-docs.test.ts` 4/4 pass. Commit `eb5a7a2` cherry-picked clean.
- Worker U2: `bun run typecheck` clean; changed tests `642 pass / 1 fail` (the base-run fixture issue A fixed). Commit `a1d8398` cherry-picked clean.
- Lane after all picks: `bun run typecheck` clean; `bun run format` clean (drift committed); `akrogon run-check --name test_changed -- ... bun test --changed=$AKROGON_BASE --timeout=30000` → **643 pass / 0 fail** across 24 files (~49s).
- Full suite `bun test --timeout=30000` → **798 pass / 0 fail** across 42 files (~74s). Wall time ~1.5 min.

No `merge_checks` configured. No advisory commands.

## Criterion proof map

- C1 (merge `--compare` accepted + bound): `tests/merge-compare.test.ts` 23 cases — happy paths, inconsistent stamp, solo binding, 12 refusal cases each asserting the field named in stderr and `not valid during merge` absent.
- C2 (effects at `--check`, notices, persistence): same file — `opened`/`notice`/`resolved` event assertions, `batch.comparisons` contents, `noticeCalls` count, `tested_top` stamped.
- C3 (no compare path untouched): existing `compare.test.ts` suite green unchanged.
- C4 (green resolves only at `landed === leaf_revision`): the three green-resolve cases incl. refused-push-landed and reconcile.
- C5 (restack gate): `rerun` with known-red record, `reuse` with green-only record, `comparisons` dropped both ways.
- C6/C7 (hold retired, pointer errors, inertness): `tests/hold-retired.test.ts` all pass — verb/flag pointer errors, legacy `held.yaml` inert, src/doc sweeps, `held` journal parse.
- C8 (docs contract): `tests/red-docs.test.ts` merge-skill case, `tests/command-reference.test.ts` README parity.

## Known limitations and unverified criteria

- L2 worker divergences from brief (verified against committed tests and design): `validateComparisons` signature is `(repo, leaf, state, slot, worktree, files, requested, merge?)`; `mergeHolder`/`writeHeld`/`heldSchema` lived in `src/hold.ts` not `state.ts`; no `prompted`-only `--compare` gate (`--compare` stays legal on non-merge moves).
- U2 noted `recordConfigEqual` kept in restack reuse unless comparisons are non-empty (both test expectations reachable).
- Unreadable persisted comparison forces `rerun` rather than warn+reuse (stricter than brief, consistent with design's missing-evidence-is-red rule).
- Pointer message literal duplicated in `src/akrogon.ts`/`src/phase.ts` (no shared no-deps module among owned files).
- `known-red` unit with `base` outcome `pass` is accepted at `--check` (resolves the entry under the ancestry rule) — the brief's refusal text was wrong and was dropped.
- No unverified criteria.

## Environment note

Worker worktrees under `worktree_store` were being wiped by the installed akrogon's `reconcile` sweep (orphan candidates: not a leaf slug, not `base-`/`batch-`, no live pane, clean HEAD). Worked around with `git worktree lock` on each worker worktree for the duration; a future leaf may want `-uN` names whitelisted in reconcile.

## check.fix repair (2026-10-11)

Prior head: `0d22194`. Repaired head: `f7396a4`. Base unchanged (`2756bd0`).

Handed-to-A items repaired:

- **F1 (both reviews)** — restack `reuse` gate restored to `recordConfigEqual && !comparisonsCarryRed` (`src/phase.ts`, commit `f7396a4`); planted expectations corrected (`tests/merge-compare.test.ts`, commit `5f91eaf`): both restack cases now advance the remote with `issues/notes.md` only so `rerun`/`reuse` attributes to the record content, and a new reproduction case asserts `rerun` when `issues/config.yaml` changed with a green record stamped (shown red at `5f91eaf`, green at `f7396a4`).
- **F4 (B)** — prose assertions `'rerun'`/`'repo is held'`/`'the repo is held'` removed from `tests/red-docs.test.ts` (commit `5f91eaf`); literal command and schema tokens retained.

Verification: `bun run typecheck` clean; `bun run format` clean; `akrogon run-check test_changed` → 646 pass / 0 fail (24 files); full `bun test --timeout=30000` → 801 pass / 0 fail (42 files). No `merge_checks` configured; no replay needed — this repair came from review, not a red merge ending.
