# Review-A: guarded-peer-wait

- Base: `f71f559982c3d3159510f8bbd5a98d1aab391b94`
- Reviewed head: `d57a64e6e97a4536836b48224fac730370c2e9bb` (one commit ahead of base, `git status --porcelain` empty)
- Diff: `skills/chart-issues/assets/questions.md`, 1 line changed, no other file on the branch.

## Verification evidence (run by this seat on the lane)

- New sentence is byte-identical to the design taken wording: extracted `For each named peer, wait until ... peer failure.` from line 44 and diffed against the `design.md` blockquote — no diff. All 11 required fragments present (idle wait, guarded prompt, three prompt codes, never re-prompt, bounded repeated wait, below-harness timeout, `blocked` to operator, return-file read, missing-file failure).
- Rest of line 44 untouched: prefix before the sentence and the readiness sentence both diff-clean against base (plan D2).
- C3: `grep -rn "without a timeout" skills docs README.md` prints nothing, exit 1. Hygiene sweep for `supported herdr interface` also empty.
- Design exclusions untouched: no change to herdr, `src/next.ts`, `skills/watch-issues/SKILL.md`, or anything under `issues/`.
- No `AREA.md` in the diff, so no path-listing check applies. No doc outside the target file describes the peer-wait rule (docs sweep clean), so no documented behavior changed elsewhere.
- Report check: base, head, changed file, command results, and the open limitation (unobserved operator-routed branches) all match what this seat observed; no material report gap.
- Checks: report records `bun test` 339 pass 0 fail, `bun run format` exit 0, `bun run typecheck` exit 0 at the reviewed head. No code changed since, so no rerun per the rerun rule; this seat's fresh grep/sed/diff evidence above covers the prose criteria.

## Findings

No Fixes. No Nits. The diff is the smallest possible change satisfying C1-C3, matches the locked wording verbatim, and adds no test file per the standing no-vanity-tests rule (wording-asserting tests are also rejected review-side).

## Verdict

ready
