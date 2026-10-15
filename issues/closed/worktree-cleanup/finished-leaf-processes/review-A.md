# Review A — finished-leaf-processes

- Reviewed: `main (0a80ab9)`..`32f0b13` — commits 9ad2541 (tests), be8561d (feat), a16265e + 32f0b13 (assertion fix + format).
- Evidence: `akrogon verify` green on `5aac9f1` (tree-identical to `32f0b13`; the receipt's rewrite was trailer-only): 859 tests, check-test-1792099559116, check-format-1792099429604, check-typecheck-1792099561765. All 9 criterion tests in `tests/leaf-slices.test.ts` pass against real systemd; the report's mapping to done-criteria 1–9 is accurate.
- AREA check: every backtick path named by `src/AREA.md` and `tests/AREA.md` exists except `reconcile-host.json`, which is a runtime artifact under `~/.akrogon/` (same convention as `akrogon.slice` in the same file) — not a dead pointer.
- Docs check: `docs/guide/next.md` and README describe kept (not stopped) units under `Kept by last cleanup:` — matches `status.ts`, which prints `readHostKept()` lines without an `existsSync` filter since units are not paths. No documented behavior contradicts the code.
- Debate off; no positions/rebuttal files expected or found.

## Findings

### F1 (Fix) — `reconcileHost` propagates `allLeaves` errors and kills the whole pass

`reconcileHost` (src/reconcile.ts) calls `allLeaves(repo)` for every registered repo to map slices to leaf records. `allLeaves` throws on states `discover` explicitly tolerates as a supported inventory: a foreign leaf (`RepoMismatchError`, `state.repo` differing from the registered name — reachable after a repo rename while records stay on disk), a duplicate slug (`Duplicate leaf slug`), or any misplaced `state.yaml` (`validateLeafDepth`'s `Invalid leaf depth`). `reconcileHost` is called from `reconcileRepos` *outside* the per-repo try/catch and again in the `tab_closed` path, so one bad record in any registered repo makes every `akrogon next` (and any pass running reconcile) exit non-zero and skip its merge passes until an operator edits the record — a permanent hard failure where the pass was previously merely noisy about the record.

- Realistic source: `discover` in src/next.ts treats each of these cases as an expected inventory state (`result.foreign`, `result.unreadable`, `result.unknown`) and reports instead of throwing; the akrogon repo itself produced `Invalid leaf depth` errors in this session's verify output.
- Consequence today: the entire automatic pass fails, dispatch stops for all repos; the slice-stop feature never runs.
- Gap it hits: the plan's "never let a new host sweep fail an otherwise working pass" intent; done-criteria 1/5/9 unreachable whenever a bad record exists.

Suggested repair shape (B's call): tolerate per-repo read failure in `reconcileHost` — catch `allLeaves(repo)` and fall back to no records for that repo, so its slices take the unmatched empty-cgroup path (still conservative: occupied slices are never stopped).

## Nits

(none held — doc wording around kept-vs-stopped units is correct in the shipped text.)

## Verdict

`fix` — one Fix (F1), no Nits.
