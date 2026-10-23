# Review A: docs-examples

Phase check.review, seat A, blind.

- Base: `7fb2ad957a702b6834a2ba77e1db64e65ed3d482`
- Reviewed head: `2c073b38d13f91c975d7177547ac8061aa452f1c`

The diff adds four files under `docs/examples/` and nothing else. The worktree is clean, and the head is 4 commits ahead of the base.

## Evidence

- `akrogon verify` on the head is green: 1114 tests, typecheck and format all pass (receipt in implementation/report.md). No code changed since, so I did not rerun it.
- Generic scrub: `check examples-scrub: 0 implementation/check-examples-scrub-1792769108344-3876070.log`. Private-name scrub: `check examples-private: 0 implementation/check-examples-private-1792769108258-3876011.log`. Both ran on the head.

**Criterion 1 (each story matches its record).** I spot-checked each story against its source records.

- Quick fix (P1 direct record):
  - Reviews `review-B-1`, `review-B-2` and `review-B-3` read ready, fix, ready. The story says the same.
  - `direct/report.md` records the 55-test probe the story cites.
  - `evidence.tar.zst` exists, matching the pack step.
- Autopilot (P1 closed leaves): all three show `phase: merged`.

  | Leaf | A verdict | B verdict | fix_rounds | Story's review and repair tale |
  |---|---|---|---|---|
  | brand-raster-webp | nits | fix, then ready after repair | 0 | matches |
  | pagespeed-rank-preflight | ready | ready | 1 | matches |
  | lighthouse-floor-gate | nits | fix | 2 | matches |

- Recovery (varhop): the conflict is resolved as plan D4 says. Both records are true and the page says so. Worker U3 confirmed the archived leaf is `failed` and the successor is `merged`. `0be8ca4` is on varhop main, which I checked at synthesis.

**Criterion 2 (privacy).**
- Only varhop is named.
- P1 is described as "a web framework project" and "a project that builds client websites".
- No dates, home paths, session or tab ids, or private SHAs. The varhop SHAs are public.
- Alt text on both pictures describes the picture and holds no private data.

**Criterion 3 (today's tool, links, not instructions).** Every command named in the stories exists today:
- In `docs/reference/commands.md`: `akrogon pull`, `close <owner/repo#n> --by`, `pack`, `next [<slug>]`, `phase ... failed --slot A --reason`, recovery `phase <slug> implement` with no `--slot`, `status`, `run-check --holder`, `verify --holder`.
- Behavior checked against the skills and source:
  - Door self-handover between charts: chart-issues SKILL.md:147.
  - Failed leaves listed at open: SKILL.md:33.
  - Autopilot answers recorded as A's: SKILL.md:133.
  - Direct landing steps (close, broadcast, worktree removal, pack): SKILL.md:111-120.
  - The land run path matches `docs/use/merge-and-announce.md`.
  - `sources` close through `closeSources`: src/pull.ts:184.
- Link and anchor resolution is covered by `tests/docs-links.test.ts`, which passed in verify.
- All pages are past-tense narration that ends with a next link. None links `docs/guide/` or `docs/start/`.

No documented behavior changed, because the diff is docs only. No `AREA.md` is in the diff. No `Test-Change:` trailers, and no test files changed.

## Fixes

None.

## Nits

- **N1.** `quick-fix-story.md` has a section titled "The draft brief and design" that says no separate brief or design file was written. That is accurate to the record. But today's `implement-issue` direct form names "the chart's draft brief and design" as its task, so a reader may take the story as saying direct needs neither.
  - Why deferred: the page tells what happened, and today's chart-issues direct section has no refusal for a chart without draft files.
  - Promote to a Fix if today's direct route refuses or misbehaves without draft files.
- **N2.** `recovery-story.md` says "the door moved" the failed leaf folder into the chart archive. No `akrogon` command does that move today, so it is a manual door step.
  - Why deferred: the page does not name a command for it, and the varhop CHART.md records the door doing it.
  - Promote to a Fix if a reader-facing page elsewhere names a command for archiving a failed leaf that contradicts this.

## Verdict

`nits`
