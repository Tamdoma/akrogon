# Review A — merge-clean-worktree

Base `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`, reviewed head `564a125c81dde5325668f64c6419efaf62d6b7ca` (confirmed `git rev-parse HEAD` and `git status --porcelain` clean).

## Evidence

- Read plan.md, design.md, brief.md, implementation/report.md, then the full diff `1d7d536...HEAD` (5 files, 145 insertions).
- `bun test tests/batch-dispatch.test.ts --timeout=30000` → 28 pass, 0 fail, run in the lane worktree myself.
- Live probes on git 2.56 confirmed during planning: `git clean -fd` keeps a dir containing only ignored entries wholesale (`up2/ignored-sub/` kept `up2/`), removes truly-empty untracked dirs incl. inside tracked dirs, and `ls-files -o -i --exclude-standard --directory` collapses non-ignored parents — which is why the helper correctly avoids `--directory` for the ignore decision.
- `grep dispatchSlot/dispatchLeaf` in `src/next.ts`: `mergeContext` reaches `dispatchSlot` only via `dispatchMergeLeaf` (lines 994/1191/1220 → `dispatchLeaf(mergeContext)` at 1239/1244 → `dispatchSlot` at 719); the sweep path passes `undefined` (line 786), so the helper is merge-prompt-only as designed.
- `grep -n "empty untracked" skills/merge-issue/SKILL.md` → clauses on lines 41 and 51.

## Judgment

- The helper's semantics match the corrected design exactly: files = `ls-files -c -o` ∪ `ls-files -o -i`; kept = ancestors of every file + ignored dirs + their ancestors; victims = remaining walked dirs removed deepest-first non-recursively. `.git` entries (file or dir), symlinks (Dirent.isDirectory false) and gitlinks (dir name in `-c` list) keep parents and are never entered. Failure propagates to `dispatchLeaf`'s `report` → skip → exit 1 with the folder path in the message, and `run(args)` never executes (T4 proves all of it end-to-end).
- Call site is after `idle(ready)` and before the prompt `run(args)` in `dispatchSlot`, i.e. exactly "after the worktree is ensured and before each merge prompt", on the post-`allocate` state.
- Criterion 2 is proven on the live surface, not by construction: T1 plants `.temp/out`, `node_modules/pkg.js`, `up/ign.txt`, empty ignored `td/ige/`, `.env` symlink and asserts byte content and link target.
- T4's `chmodSync(lp, 0o555)` makes `git status` still read (listable) while `rmdirSync` fails EACCES — a clean isolation of the removal failure, and the child folder provably survives.
- Trailer on `d935fec` names each added case and states no existing expectation changed; source/doc commits correctly carry none.
- Doc review: the only changed behavior doc is the SKILL.md clause, which is accurate. `src/AREA.md` unchanged, its claims remain true; nothing else documents prompt-time worktree state, so no stale doc — no documented-behavior claim is now wrong.

## Findings

N1 — performance concern, deferred: the walk `readdirSync`s every directory including ignored trees (`node_modules`) and passes them all to one `check-ignore --stdin`. Correctness unaffected (those dirs are marked kept, never removed). Deferred because leaf worktrees in this system see modest trees, the run is bounded by one prompt-time pass, and the only cheaper prune (`ls-files --directory`) was proven wrong on live git. Promotes to Fix if a real holder shows measurable dispatch latency from the traversal; a chunked `check-ignore` during descent is the correct fix then.

## Verdict: nits
