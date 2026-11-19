# Review A: worker-stash-rule

Base: `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`. Reviewed head: `868cac1b071ea34adf5e5e58e89dc2f8192714a3` — one commit, two files, +4/-2.

## Criterion readings

- **C1 (template instructs never-stash):** met. Section 5 now carries, for every sub-brief, the standing exclusion never to run any `git stash` subcommand with its shared-`refs/stash` reason and the base-worktree replacement; the delegated branch adds the WIP-commit replacement ending in `git reset --soft <creation commit>` and one returned commit; "a standalone brief carries no reset step." Section 4 records the creation commit filled when A creates the worktree at its wave. Read against `learnings/history/2026-10-16-stash-shared-across-worker-worktrees.md` in the framework repo: the stated mechanism (shared stash ref, pop lifts a sibling's edit) matches the recorded case and the readiness probe. `<creation commit>` follows the template's existing bare-token convention (`<N>`/`<M>` turns, `<label>`, `<path>`), and the design's verbatim text names the same token.
- **C2 (SKILL.md never-stash at any time):** met. The refresh paragraph gains the sentence verbatim per design; `grep -n stash` over both owned files returns exactly two sentences, both prohibitions — nothing permits stashing.
- **C3 (links resolve):** met. No links were added or changed; `check link-check: 0` (12 pass) on `868cac1b`, and the `test` check passed inside `akrogon verify` on the same head.
- **C4 (prose-not-a-stop statement):** met. `implementation/report.md` states the change is prose, not a stop under today's Retire rule, so the framework lesson stays active; the diff touches only the two owned paths — no `learnings/` entry and the lesson file lives in the framework repo.

## Evidence

- `git diff 39e203a7...868cac1b` — two markdown files, both edits land the design's taken shape; excluded surfaces (`worker-protocol.md`, `src/sync.ts`, `docs/use/save-records.md`, framework files) untouched.
- Verify receipt on `868cac1b`: green (`verify test: 0`, `check-test-1794956431444-2865885.log`; format/typecheck/setup legs green).
- The earlier red `test` run (one `agy` door-reset flake) was retried once per the red-check rule: same command, same scope, exit 0 with the same test passing — recorded `inconsistent` in report.md with both logs cited. Diff holds no plausible cause (prose only); second `akrogon verify` confirms green. No known-red step needed.
- Doc-follow: no documented behavior outside the two owned files changed; `docs/reference/files.md` and `skills/AREA.md` descriptions stay accurate.
- Count audit: no covered operations this leaf (serial-solo, no launches); logs and artifacts match.

## Findings

None. No Fixes, no Nits, no operator actions.

## Verdict

`ready`
