# Review B: seat-input-rules

Date: 2026-10-02
Phase: check.review
Base: `7c1567dbed492608e8cc104999c401b85d6db408`
Reviewed head: `5fff7dc70040e0ec2b1169ad37dce926f6739b1f`
Verdict: **ready**

## Findings

No Fixes, Nits or operator actions.

## Verification

- Criterion 1: inspected every changed paragraph. All four phase skills and `skills/AREA.md` use `akrogon status <slug>` and `Missing:` lines for presence, count absent/empty values as missing, preserve private process consumption and prohibit direct env-file tools. The old `env-file=.env -e` check has no matches. The synthesis and implementation credential instructions consume the same status output.
- Criterion 2: producer saves appear in plan/implement, grant reuse in all four skills, fixture cleanup/read-back/retention in check/merge, and blocker records beside the existing stops. Field references match `src/readiness.ts`. Producer values remain private, saves target the real holder file, and save failure revokes the new key. Grant comparisons and artifact records preserve scope. Cleanup covers success and failure and does not treat a delete reply as absence proof.
- Criterion 3: the entire diff is five Markdown files. No `check.repair` routing hunk changed. Required live runs remain handed to A. The merge `.env.example` exception is unchanged.
- Criterion 4: inspected all three saved harness transcripts. Codex and pi retain tool commands and results showing `Missing:` and `moved failed`, with both command exits 0. Claude's result transcript records both commands, their exits 0, the `Missing:` output and `moved failed`, with no permission denials. The report records versions, invocations, failure reasons, notification proof and harness exits. The scratch path `/tmp/seat-demo-r9BvTd` no longer exists. The worktree CLI entry point used in the demo contains the actual reviewed status implementation. No transcript shows direct env-file access or a secret value.
- Checks: reused the unchanged implementation report's `bun run format` (unchanged), `bun run typecheck` (exit 0), `bun test --timeout=30000` (383 pass, 0 fail, 17 files) and four changed-test runs (0 pass, 0 fail). No code changes, missing check evidence or specific check concern warrants rerunning them. Review additionally ran `git diff --check` successfully and confirmed a clean worktree.

## Documentation and live contracts

Opened the changed phase skills, `skills/AREA.md`, the reference index, `src/AREA.md`, and the operator guide's phase/limits pages. The guide's phase ownership remains accurate. Traced status output to `src/status.ts` and missing/empty behavior to `src/readiness.ts`; the new rules consume these existing contracts.

Listed all paths named in `skills/AREA.md` from the repository root. Every fully qualified pointer exists. Its contextual `scripts/observe.ts` and `scripts/log-tail.ts` names refer to the preceding watch-issues skill and both exist under `skills/watch-issues/scripts/`; root-level `scripts/` paths do not exist, but the text does not direct readers there. The file remains 31 lines. No dead-pointer consequence was found.

Verified the cited 2026-10-01 prose-testing lesson against `learnings/history/2026-10-01-failed-stop-guard-wording.md`. Its recorded passing behavior tests and wording concern support reviewing these prose changes without new literal-text tests. No new reusable lesson was found.

## Merge verification: 2026-10-02

Fetched `origin` and rebased cleanly onto `origin/main` at `ebc98c98ca4684ff4b799a62093a47267b4c0bc9`. Prior reviewed head: `5fff7dc70040e0ec2b1169ad37dce926f6739b1f`. Rebased head: `33607abdd8daea867d7723b5d3765994f50b62be`. Range-diff maps all four commits with `=` (unchanged patches), and the worktree is clean.

Refreshed `akrogon config` reports `AKROGON_BASE=ebc98c98ca4684ff4b799a62093a47267b4c0bc9`.

- `bun run format`: exit 0, all files unchanged.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 395 pass, 0 fail, 4360 assertions across 18 files, 16.73 seconds.
- Configured changed-test command with the refreshed base: exit 0, five changed Markdown files, no affected tests (0 pass, 0 fail). An initial invocation inherited the old base and also passed (387 pass, 0 fail across 15 files); the refreshed-base invocation above is the applicable proof.
- No `merge_checks` or advisory commands configured.

Read both reviews and gathered the issue's five leaf briefs before completion can move the owner folder. A's deferred AREA wording nit has no present consequence and does not warrant a code change or a new lesson.

Push confirmed: `git push origin HEAD:main` exited 0 and advanced remote main from `ebc98c9` to `33607ab` fast-forward.
