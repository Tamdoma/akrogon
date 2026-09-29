# Review A: keep-chart-in-place

Base: 53508e807128de2a77b22cf4874e266224cf4f0e
Reviewed head: 62b0b1e55a6a28dd5924d6cd303a5e4d1a46c196 (one commit)
Diff: src/phase.ts (-2), tests/phase.test.ts (+38/-5). No AREA.md files in the diff.

## Verification evidence

- C1: `completeOwner` (src/phase.ts:138-173) now ends at `renameSync(owner, destination)`; the `chart` binding and guarded chart rename are gone. `existsSync`, `basename`, `resolve` remain used at lines 144-150 and 250. No unused imports.
- C2: completion test (tests/phase.test.ts:184-185) and standalone/epic retry loop (tests/phase.test.ts:715-716) now assert `issues/chart/<owner>/CHART.md` exists and `issues/closed/<owner>/chart` does not.
- C3: regression `completion leaves a chart holding a same-slug draft in place and keeps the inventory readable` builds an epic fixture with `issues/chart/epic/slots/leaf-draft/alpha/state.yaml` byte-copied from the real alpha leaf, merges alpha and beta via real `phase <slug> merged`, asserts the recursive byte snapshot of `issues/chart/epic` is unchanged, `next --all` (under fakeHerdr env) exits 0 with neither `Invalid leaf depth` nor `Duplicate leaf slug` on stderr, and `status alpha` exits 0. Report evidences the pre-fix red (ENOENT on snapshot, chart moved away) and post-fix green; red also covered the two flipped assertion sites.
- C4: tests/state.test.ts and tests/next.test.ts untouched in the diff; both pass in the retained full suite.
- C5: retained artifacts exist and match the report: /tmp/keep-chart-in-place-phase-run.log (32 pass, 0 fail, 1 file) and /tmp/keep-chart-in-place-full-run.log (327 pass, 0 fail, 15 files). Re-ran `bun test tests/phase.test.ts` in this worktree: 32 pass, 0 fail.
- Live surface: `leavesUnder`/`allLeaves` (src/state.ts:93-107) and `discover` (src/next.ts:110) scan only `issues/open` and `issues/closed`; nothing reads `issues/chart` as leaf inventory, so keeping the chart in place leaves no scanned copy. `status` resolves the merged leaf under `issues/closed/epic/one/alpha` at valid depth.
- Docs: grep over README.md, docs/ and skills/ finds no claim that completion moves the chart into `issues/closed`; no documented behavior changed.

## Findings

None. The report's noted limitation (pre-fix red trips at the snapshot rather than the `next --all` assertions) is honest reporting, not a defect: D8 requires the test to fail on current code, which it does, at the documented mechanism. Already-archived `issues/closed/*/chart` folders are excluded by design D2.

## Verdict

ready

## Merge pass (slot A)

- Worktree clean; rebase onto `origin/main` b0b858d5f1bc3f0fc0fd250c0ff821c20e12dc65: clean, no conflicts. Prior reviewed head 62b0b1e, resolved head 838acf1.
- `AKROGON_BASE=b0b858d5f1bc3f0fc0fd250c0ff821c20e12dc65`
- `bun run format`: exit 0, no changes.
- `bun run typecheck` (`tsc --noEmit`): exit 0.
- `bun test`: 331 pass, 0 fail, 3885 expect() calls, 15 files, ~71s.
- `bun test --changed=$AKROGON_BASE`: 32 pass, 0 fail (tests/phase.test.ts).
- `git push origin HEAD:main`: fast-forward `b0b858d..838acf1`; `git merge-base --is-ancestor HEAD origin/main` confirmed landed.
- Issue briefs gathered: leaf `brief.md` + `implementation/brief-1.md`.
