# Plan: guide-markdown

Debate off (`debate: "no"`); synthesized directly from brief.md and design.md.

## Decisions

- D1: README.md is the entrance. First sentence, verbatim: "Akrogon is a lightweight software factory that runs work you define through planning, implementation, review and merge using two configurable coding-agent seats in Herdr." Then what the operator owns and that it stops at merge. Under the title, the reader sentence, verbatim: "You already run coding agents. Akrogon is for when you want a system that runs them for you." A reading-order list links every docs/guide page in design order. The existing `## Install`, `## Initialize a repository`, `## Command` and `## Skills` sections stay below, reference tables unmoved.
- D2: Exactly 17 pages at `docs/guide/<stem>.md` in this order: idea, parts, state, install, setup, create, chart, next, phases, files, gacp, merge, in-practice, limits, problems, learn, cheat. Each ends with `Previous: [..] · Next: [..] · [Home](../../README.md)` (first page omits Previous target gracefully per design's line format — use the same line with the real neighbors; idea's Previous points to README/Home only if the format requires a target, otherwise `Next:` and `Home` only. Implementer picks one consistent shape; the link test must accept it).
- D3: Voice is binding on every page and README prose: contractions; mixed sentence lengths; tangents that show the thinking; conversational and simple; imperfect structure for texture; opinion, edge, specific examples. Never at the cost of a fact. No identical heading skeleton forced across pages; cheat stays a sheet.
- D4: Truth is `src/`, `config.yaml`, `skills/` only. Every akrogon claim is checked against them. On contradiction between them, the page documents code behavior and the report names the conflicting instruction. The twelve drift findings in design.md are the floor, not the ceiling; each gets a correction line with file:line evidence in the report.
- D5: `docs/guide/gacp.md` publishes the script as `gacp() ( ... )` (subshell body so `set -e`/`exit` never touch the interactive shell), verbatim body from design.md, beginner explanation per step, when to use it vs `akrogon sync` (sync commits only eligible issue records and refuses wrong branch/staged paths outside them, src/sync.ts:11-33), and the `.bashrc` install line.
- D6: Removal in this leaf: `docs/guide/*.html`, `docs/guide/style.css`, `tests/browser/` entirely (4 specs, playwright.config.ts, 3 per-spec configs), `@playwright/test` from package.json devDependencies, `bun install` to update bun.lock.
- D7: New `tests/docs-links.test.ts` (bun:test): collect README.md + docs/guide/*.md, parse `[..](target)`, skip http(s)/mailto, resolve relative targets against the file, require existence, and for `#anchor` require a heading whose GitHub slug (lowercase, spaces→hyphens, punctuation stripped) matches. Negative case: a fixture string with a dead link makes the checker return it.
- D8: `tests/AREA.md` drops the browser lines and names the link test. `docs/reference-index.md` line 7 links `docs/guide/` as the markdown guide.
- D9: init `--from` is optional (src/akrogon.ts:32-37, src/init.ts:13-23). README init row becomes `akrogon init [--from <proposal.yaml>] [--toolkit <lang>=<runner>]` and `tests/command-reference.test.ts:12` contract updates to `[--from <proposal.yaml>] [--toolkit <lang>=<runner>]` in the same change. The invalid-cases list still rejects `--from <proposal.yaml>` alone (missing toolkit group).
- D10: One running example issue, a small invented feature, reused from create through merged. Placeholder paths/slugs visibly placeholders and consistent across pages.
- D11: Report carries: each correction vs old HTML with file:line evidence (≥ the 12 design findings), one reader walkthrough taking the running example from create to merged using only the new pages with each command's expected output, and any src/config/skills contradictions found.

## Read-first

- `README.md` (current entrance; line ~14 two-root claim and init row to fix)
- `docs/guide/*.html` (old pages: structure, captions to keep as prose, claims to re-verify)
- `design.md` drift list → verify each at: `src/install.ts:11-21`, `src/state.ts:86-91`, `src/next.ts:218-225,350-391,408-419,512-542,674-682`, `src/sync.ts:11-33,109-114`, `src/routing.ts:35-38`, `src/phase.ts:95-112`, `src/akrogon.ts:32-37`, `src/init.ts:13-23`
- `config.yaml` (slots/harnesses as seats evidence)
- `skills/*/SKILL.md` (eight skills; chart-issues:37 small-item path, implement-issue:31-33,43 seat stops)
- `tests/command-reference.test.ts`, `tests/AREA.md`, `docs/reference-index.md`, `package.json`, `bunfig.toml` (`[test] root = "tests"` picks up the new test)

## Interfaces

None new beyond `tests/docs-links.test.ts`. Checker is a function over markdown strings + a file resolver so the negative fixture needs no temp files on disk for the dead-link case; the positive case runs against the real tree.

## Checklist (ordered; criterion = brief done-criteria)

1. Write the 17 pages + rewrite README top (D1-D5, D10). Criteria 1,2,4,5-prose.
2. Fix README init row + command-reference contract together (D9). Criterion 1.
3. Delete HTML/CSS/browser specs/configs, remove @playwright/test, `bun install` (D6). Criteria 2,6.
4. Write `tests/docs-links.test.ts` (D7). Criterion 7.
5. Update `tests/AREA.md`, `docs/reference-index.md` (D8). Criterion 6.
6. Verify: `bash -n` on extracted gacp; temp repo + bare fake origin run of gacp (commit, rebase, push); `bun test`; `bun run typecheck`; deliberate broken link fails the new test (paste evidence). Criteria 5,6,7.
7. Report: correction list with file:line, contradiction names, walkthrough (D11). Criteria 3,8.

Dependencies: step 3 before `bun test` in step 6 (lockfile churn); step 4 needs the real pages from step 1 to pass positive. Everything else is order-free.

## Verification

- `bun test` green including docs-links and corrected command-reference.
- `bun run typecheck` green.
- `bash -n` on the extracted `gacp()` function; functional run in `mktemp -d` repo with a bare origin: commit lands, rebase applies, push succeeds.
- Deliberate dead link injected into a page makes docs-links.test.ts fail; revert, passes.
- `ls docs/guide/` shows exactly 17 `.md`, zero `.html`/`.css`; `ls tests/browser` fails.
- `grep -n playwright package.json bun.lock` empty.

## Open limitation

The link test reimplements GitHub's heading-slug algorithm. Non-ASCII headings and duplicate headings (GitHub appends `-1`, `-2`) can drift from GitHub's real anchors; the test covers the ASCII case the pages actually use.
