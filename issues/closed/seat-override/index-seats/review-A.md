# Review A: index-seats

Base: `2645d97ed1682185eea4788844f882a541885d24` · Reviewed head: `372a06e`

## Verification evidence

- `bun test --timeout=30000`: 529 pass / 0 fail (24 files).
- `bun test --changed=2645d97… --timeout=30000`: 422 pass / 0 fail.
- `bun run typecheck` clean; `bun run format` clean.
- Live scratch probe (`tests/helpers` fixture + fake herdr, script discarded): depth-3 leaf with `EPIC.md` `slots.a` + `ISSUE.md` `slots.b` produced `herdr agent start` argv `--model epic-a --effort low` (A) and `--model iss-b --effort high` (B); `status probework` printed both sources as the respective index paths; overview NOTE showed `seats EPIC.md · seats ISSUE.md`; a quote-carrying index value gave overview `unreadable` exit 1 naming the `ISSUE.md` path and `slots.a.model` pattern reason, detail exit 1 with the `SeatIndexError` message; `slots: 5` detail exit 1 naming path+reason.
- Live repo (`bun <worktree>/src/akrogon.ts status`): all open leaves parse, no `seats` marker on front-matter-free indexes, detail block prints machine `config.yaml` sources.
- Diff read in full: `src/config.ts`, `src/next.ts`, `src/status.ts`, all three test files, both guide pages.
- `Test-Change:` trailers checked: `aa5fa6e`, `a38ba80`, `7abd4bc` (wrapped but `unfold` parses it), `4be9e4e`, `372a06e` — all correct for added-cases-only commits.

## Criterion check

1. argv proof covers epic, child-issue-beats-epic, standalone issue, repo/machine fallback. Verified live.
2. Malformed matrix (unparseable, non-`slots` key, seat `c`, missing field, blank value, decoded quote, unknown harness) fails `next` before allocation (empty tabs/panes/starts asserted), and `status`/`config` exit non-zero naming path+reason+seat. Machine/repo seats share the tightened schema. Verified live.
3. `config` leaf-worktree vs root/linked/outside covered by tests. Verified.
4. Detail seats block + `seats <basename>` marker covered by tests and live probe.
5. No-front-matter indexes untouched; live repo scan clean.
6. `cheat.md`/`files.md` show block + order, one place each; `docs-links` green.

## Findings

### Nits

- N1 — `effectiveConfig` calls `allLeaves()` on every `config` run inside the repo's git dir, so a leaf with a corrupt or repo-mismatched `state.yaml` now breaks `akrogon config` even at the registered root or an unrelated worktree; previously `config` ignored leaf state entirely. Realistic concern: operator hand-edits or a killed merge leaves bad state; consequence: `config` unusable repo-wide until repaired (though `status`/`next` already fail on the same corruption). Promotion evidence: a real workflow where `config` must run while a leaf is unreadable. Candidate one-line improvement: skip `allLeaves` when `top` equals `repo.root` and when cwd is provably not a managed worktree.
- N2 — `indexSeats` requires the first line to be exactly `---`; `--- ` (trailing space), a UTF-8 BOM, or CRLF endings make the block silently absent, so an operator's override stops applying with no error. Spec-literal behavior; promotion evidence: a real file with such a first line produced by an editor the operator uses.
- N3 — `src/AREA.md` describes `seats` as "merges per-repo seat overrides"; it now also resolves index front matter. Incomplete rather than wrong; promotion evidence: a reader actually misled about resolver scope.

No Fixes. Failed-checks: none; every `checks` command green. Doc pages opened (`cheat.md`, `files.md`, `setup.md`, `parts.md`): claims accurate; AREA.md gap recorded as N3.

## Verdict: nits
