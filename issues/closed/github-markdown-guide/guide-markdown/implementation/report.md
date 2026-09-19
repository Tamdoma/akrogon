# Implementation report: guide-markdown

Base: b1bdde3105a673cf57f350b8e3c636ce3b9eee6b
Head: 51c8e53 guide-markdown: markdown operator guide, link test, drop HTML guide and playwright

## Changed files and reasons

- `README.md` — entrance rewrite: reader sentence under title, software-factory first sentence, operator ownership and stops-at-merge, reading-order list of all 17 pages; install prose names four skill roots; init row `--from` made optional.
- `docs/guide/{idea,parts,state,install,setup,create,chart,next,phases,files,gacp,merge,in-practice,limits,problems,learn,cheat}.md` — 17 new pages in design reading order, Previous/Next/Home footer each, `widgets`/`export-csv` running example throughout.
- `docs/guide/*.html` (17), `docs/guide/style.css` — deleted.
- `tests/browser/` (4 specs, playwright.config.ts, 3 per-spec configs) — deleted.
- `package.json`, `bun.lock` — `@playwright/test` removed via `bun install`.
- `tests/docs-links.test.ts` — new: relative-link + GitHub-anchor checker over README and guide, with dead-file and missing-anchor negative tests.
- `tests/command-reference.test.ts` — init contract `[--from <proposal.yaml>] [--toolkit <lang>=<runner>]` matching the README row.
- `tests/AREA.md` — browser lines dropped, docs-links named.
- `docs/reference-index.md` — Documentation line now "the markdown operator guide".

Worker reports: `implementation/report-1.md` (prose + contract), `report-2.md` (removals), `report-3.md` (link test + area docs).

## Commands run

- `bun test` — 273 pass, 0 fail, 13 files.
- `bun run typecheck` (`tsc --noEmit`) — clean.
- `bun run format` + `prettier --write README.md docs/guide/*.md` — all files pass `--check`.
- `bash -n` on extracted `gacp()` — OK.
- gacp functional run in `/tmp/gacp-test` (real repo + bare origin): staged `issues/open/x/brief.md`, committed `test commit`, rebased, pushed to origin; `git status` clean.
- Deliberate broken link: appended `[dead](nonexistent-page.md)` to `idea.md` → `README and guide links resolve` failed with `missing file nonexistent-page.md`; removed → 3 pass.
- `AKROGON_BASE=… bun test --changed` — green after each unit.

## Corrections vs old HTML (file:line evidence)

16 corrections in `implementation/report-1.md`, covering all 12 design findings plus: hook events and startup `pull --all`/`next --all` (plugin/herdr-plugin.toml:6-27), `priority`/`slot` ignored fields (src/state.ts:35-77), lesson pruning at chart open not on apply (skills/chart-issues/SKILL.md:27), cleanup scope and merged/failed never counting (src/next.ts:260-299,551-557,621-682).

## Walkthrough (criterion 8)

Reader path for `widgets`/`export-csv`, following only the new pages:

1. `install.md`: `bun install && bun src/akrogon.ts install` in the tool checkout → links command, skills, plugin; conflicts print removal commands.
2. `setup.md`: run init-issues in `~/Work/widgets` → writes `issues/config.yaml`, registers repo; `akrogon config` prints effective settings.
3. `create.md`: write `issues/open/export-csv/export-csv/brief.md` + `state.yaml` (depth-2 leaf), `gacp` or `akrogon sync` to commit and push.
4. `next.md`: `akrogon next export-csv` → tab opens, seats allocated, B dispatched at plan.synthesis (debate no).
5. `phases.md`/`state.md`: watch `state.yaml` phase move plan.synthesis → implement → check.review → merge; `akrogon status export-csv` shows the leaf.
6. `merge.md`: A rebases, runs checks, pushes fast-forward → phase `merged`, issue completes.
7. Failure branch (`problems.md`): `akrogon phase export-csv implement` resumes from `failed`; attempts only count failed deliveries.

## Known limitations

- The link test reimplements GitHub's slug algorithm; non-ASCII headings and duplicate-heading `-1` suffixes can drift from GitHub's real anchors (plan's open limitation).
- gacp's "checkout unchanged" is not a full rollback — the commit can exist before a failed pull; documented on the page.

## Unverified criteria

None. All 8 done-criteria verified above.

## Repair round 1 (check.fix)

Before: 51c8e53. After: eef24a0.

- F1 fixed: `next.md` no longer claims a "no seat" message; documents silent wait + `akrogon status` (src/next.ts:539-540 returns 'waiting' with no report).
- F2 fixed: `in-practice.md` now says blockers gate every dispatch including tabbed leaves (src/next.ts:534-537 runs before prompt).
- Nits fixed: idea.md "That issue", parts.md "in it is", cheat.md "I've got it".
- `bun test`: 273 pass, 0 fail. `tsc --noEmit`: clean. Prettier: clean.
