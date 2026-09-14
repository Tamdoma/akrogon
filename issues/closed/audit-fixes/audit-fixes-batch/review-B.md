# Review B: audit-fixes-batch

Base: `20c613b599acfbfd7d19277c883cf13bd0920e46`
Reviewed head: `4c34e0768bf7b3a51c07c72345a9a0a787abe693` (`Apply audit fixes: drop leaf locks, share source pattern, sharpen errors`)
Worktree clean, head is one commit ahead of base.

## Findings

No Fix findings.

### Nits

- **N1 — `bun -e` placeholder arg.** The F9 test passes a `placeholder` positional because Bun 1.4.0 puts the first user arg at `process.argv[1]` for `-e` scripts. Works and is documented in the report; mildly fragile if Bun changes argv layout, but the test would fail loudly, not silently.
- **N2 — `commonDirectory` inside a `.git` dir.** Old code returned null via `--is-inside-work-tree`; new code resolves the common dir. No caller passes a `.git` dir; design accepted this. Recorded in plan notes.
- **N3 — `within` without `isAbsolute`.** Only differs where `relative()` returns absolute (cross-drive Windows roots). Akrogon paths share one host root; design accepted.

## Verification evidence

- Diff inspected in full against plan D1–D13 and brief sections 4–5. All source edits match the locked design verbatim: `sourcePattern` literal identical in `state.ts` and applied in `pull.ts`; `commonDirectory` single `run` with the specified null/throw/success branches; `requireClean` guard is the first line; `.min(1)` on exactly `tab`, `worktree`, `pane.{A,B}`, `prompted.{A,B}`; `prompted_at` untouched; `basename`/`dirname`/`isAbsolute`/`withLeafLocks` imports removed.
- `dispatchLeaf` unwrap keeps the `try/catch` as the `withRepoLock` return value; `phaseCommand` calls the body directly. Lock order is now global → repo only; no remaining leaf-lock acquisition anywhere (`grep` clean).
- Done-criterion 1: `grep -rn "withLeafLocks\|dependenciesReady\|isAbsolute\|is-inside-work-tree" src/` → no matches (rerun by B).
- Done-criterion 6 test count: base `20c613b` runs 221 tests; head runs 223 (−1 `'leaf'` scope, +3 new tests). Matches "drops only by the removed `'leaf'` lock-scope case" once the three mandated additions are counted.
- Full suite at head: 223 pass, 0 fail (artifact `/tmp/akrogon-audit-fixes-batch-test.log`). `bun run typecheck` and `prettier --check src tests` pass. `muse-audit.md` deleted.
- New tests exercise real behavior: F9 uses a `git` shim + real `bun -e` child (no mock of the unit under test); load-rejection and missing-worktree tests invoke the real CLI in temp repos. Assertions check exit codes, stderr field names, byte-identical state and absent log/gh calls — observable contracts, not wording.
- `closeSource` keeps `SourceError` on null match; schema now rejects bad `sources` at load, so the runtime path is unreachable for stored state but unchanged for defense.
- No `AREA.md` files in the diff; no doc/index pointers reference removed symbols (`grep` of docs/, README, AREA files clean). `auditdeepseek.md` mentions removed names but is outside leaf scope.

## Verdict

ready
