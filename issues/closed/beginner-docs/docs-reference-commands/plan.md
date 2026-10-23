# Plan: docs-reference-commands

Debate is off (`debate: "no"` in state.yaml), so this plan comes straight from brief.md and design.md. No brief/design conflict was found. No credentials are named and `akrogon status` shows no `Missing:` lines.

## Read first

- `docs/reference-index.md` (grounding index), `tests/AREA.md`, `src/AREA.md`, `skills/AREA.md`
- `issues/chart/beginner-docs/PAGE-MAP.md` under the registered root (rows for this leaf, Test owners, link rule). Read only, never edited.
- `README.md` "Command" and "Skills", `docs/guide/{cheat,install,setup,phases,merge,files}.md` (authoring sources only, never linked)
- `src/akrogon.ts` (dispatch), `src/config.ts` (`indexSchema`, `slotConfigSchema`, seat resolution at lines 150-185), `src/verify.ts`, `src/run-check.ts`, `src/guard.ts`, `src/test-files.ts`, `src/evidence.ts` (`readLog`), `src/log.ts`
- `skills/*/SKILL.md`, `skills/lesson-rule.md`
- `docs/pictures/config-layers.svg`, `docs/pictures/verification.svg` (delivered at `AKROGON_BASE`)
- Lessons that apply: "Explanatory prose assertions couple behavior tests to wording" (no new wording assertions), "grep `docs/` for a changed rule" (B checks each statement against source).

## Decisions

- D1. `tests/docs-links.test.ts` finds pages by walking: `README.md`, every `*.md` under `docs/` from `readdirSync(docs, { recursive: true })` (same idiom as `tests/hold-retired.test.ts`), and the existing `skills/*/SKILL.md` set. No glob library. Answers the design's first open question.
- D2. Image forms. Today no page under README, docs/ or skills/ uses any image reference (grep for `![`, `<img`, `<picture`, reference-style definitions found none). New pages use the Markdown form `![alt](../pictures/x.svg)`. The existing link regex already matches it. The check also reads `<img src="...">` so a later page using the HTML form (common for a README picture) is still checked, since this leaf is the single owner of the test file. Reference-style `[x]: path` is not used and not added. Answers the design's second open question.
- D3. `tests/command-reference.test.ts` reads `docs/reference/commands.md` instead of README, and `commandRows` reads every table row whose first cell starts with a backtick from the whole file (each such row must parse as an `akrogon` command, so commands.md has no other code-first table), so the page can group commands under several headings. The `## Command` section lookup is dropped. The argument contracts and dispatcher parsing stay as they are. README keeps its table until docs-start, unchecked.
- D4. commands.md is a rendered Markdown table (README's table is inside a `text` fence). Rows keep the parser's form `` | `akrogon <verb> <args>` | <effect> | `` with `\|` for alternatives. One row per dispatched verb, grouped under plain headings (set up, run work, inspect, checks and records). Each row's arguments match the test's contract for that verb.
- D5. `tests/run-permit.test.ts` docs list becomes `README.md`, every `docs/**/*.md` (same walk as D1) and `src/AREA.md` (unchanged AREA scan). The `src/` scan is untouched.
- D6. `tests/hold-retired.test.ts` already scans README and `docs/**/*.md` recursively. No code change. Criterion 4 for it is proven by a deliberate break only.
- D7. The two wording tests in command-reference ("the files guide describes the flow report", "the next guide describes stop and start") are deleted with their reads. Reason for the report: they check wording in docs/guide pages that docs-start deletes, and the command table check already proves every verb and argument form is documented (design fact-ownership Q2).
- D8. skills.md has one section per skill under `skills/` (ten skills plus a line on `skills/lesson-rule.md` as a shared rule, not a skill), each saying the result it gives and when to use it, linking `../../skills/<name>/SKILL.md`. It names chart consultants apart from execution seats.
- D9. config.md covers machine `config.yaml` in the akrogon home (`globalHome()` in `src/config.ts`), repo `issues/config.yaml`, and EPIC.md/ISSUE.md `slots:` front matter. Per seat: ISSUE.md, then EPIC.md, then repo, then machine, nearest wins, and a present seat is a whole harness/model/effort set. Every other repo setting comes from `issues/config.yaml` alone. Embeds `../pictures/config-layers.svg`. Placeholders only.
- D10. checks.md covers leaf `checks` versus `merge_checks`, `akrogon verify` in a fresh checkout and the receipt it writes, `--known-red` comparison against the base, test-change refusals (the `Test-Change:` trailer check that `akrogon phase ... --check` runs over files matched by `src/test-files.ts`), `akrogon guard` refusals, which log to read (`akrogon log <path>` from the `check <label>: <exit> <path>` line), and each refusal with its remedy. Agent proof rules are linked (`skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`), not copied. Embeds `../pictures/verification.svg`.
- D11. Owned pages link only to each other, `docs/pictures/*.svg`, `skills/` and `src/`. No `docs/guide` links, no links to pages of other leaves, no dates, no retired names, no "was removed" notes.
- D13. Live gap found at synthesis: widening docs-links to `docs/**/*.md` pulls in `docs/reference-index.md`, whose `[Issue records](../issues/)` link points into `issues/`, which leaf worktrees leave out (sparse pattern `!/issues/`). `diskResolver` now falls back to `git cat-file -p HEAD:<path>` when a path is missing on disk, so the link is still checked against the committed tree instead of skipped. A path missing from both still fails (shown in C3's break with `../../../issues/nope.md`).
- D12. `tests/AREA.md` line 13 is updated to say what the two retargeted tests now check (agent doc for the owned tests).

## Interfaces

- `markdownFiles` walk in tests: `readdirSync(resolve(root, 'docs'), { recursive: true }).map(String).filter(f => f.endsWith('.md'))`.
- `linkTargets(markdown)` in docs-links returns Markdown link/image targets plus `<img src>` values.
- `commandRows(markdown)` reads table rows from the whole file.

## Waves

The test changes (T1-T4 below) are committed by A at plan.synthesis before any page.

Wave 1

- U1. docs/reference/commands.md. Owns that file. Shared resource: none. Prereq: none.
- U2. docs/reference/skills.md. Owns that file. Shared resource: none. Prereq: none.
- U3. docs/reference/config.md and `tests/AREA.md` line 13 (D12). Owns those. Shared resource: none. Prereq: none.

Wave 2

- U4. docs/reference/checks.md. Owns that file. Shared resource: none. Prereq: U1 and U3 (it links commands.md rows and config.md, and docs-links fails on links to a missing page).

## Docs affected

- docs/reference/commands.md, skills.md, config.md, checks.md: new (U1-U4).
- tests/AREA.md: test descriptions for command-reference and docs-links (U3).
- README.md, docs/reference-index.md, docs/guide/*: not changed by this leaf (docs-start owns them).

## Criteria and proof

Common runner: `bun test --timeout=30000 <file>` through `akrogon run-check`, the configured `test` check's runner. All proofs take seconds. Rerun trigger for each: any change to the owned pages, the four owned test files or `src/akrogon.ts`. No model or outside stage is involved.

| # | Real boundary | Before → after | Failure it catches | Command | Test |
|---|---|---|---|---|---|
| 1 | `src/akrogon.ts` dispatch vs docs/reference/commands.md table | no page, test red → page lists every verb, green; a removed row turns it red | a command that runs but has no reference row, or wrong argument form | `akrogon run-check --name c1-commands -- bun test --timeout=30000 tests/command-reference.test.ts`; deliberate break: delete the `akrogon sync` row, rerun, red, restore | T1 |
| 2 | page text vs `skills/*/SKILL.md`, `src/config.ts`, `src/verify.ts`, `src/run-check.ts`, `src/guard.ts`, `src/evidence.ts` | pages missing → pages cover each listed subject | a skill, layer or refusal left out or described wrongly | B reads each page against its sources (check-issue). Links proven by C3's command. | review |
| 3 | every relative link and image in README, `docs/**/*.md`, `skills/*/SKILL.md` vs disk | only README and `docs/guide/*.md` checked → every nested page and both image forms checked | broken link or missing SVG in a nested page | `akrogon run-check --name c3-links -- bun test --timeout=30000 tests/docs-links.test.ts`; deliberate break: a nested page `docs/reference/x.md` with `[a](missing.md)` and `![b](../pictures/missing.svg)`, rerun, red, delete | T2 |
| 4 | retired-word bans vs README and `docs/**/*.md` | run-permit read three fixed docs → reads every docs page at any depth; hold-retired already recursive | a retired word in a nested page | `akrogon run-check --name c4-retired -- bun test --timeout=30000 tests/run-permit.test.ts tests/hold-retired.test.ts -t 'docs'`; deliberate breaks: `run permit` and `unhold` placed in a nested page, rerun, red, remove | T3 |
| 5 | command-reference test file | reads docs/guide/files.md and next.md → no read of either | a test that pins wording on a page about to be deleted | `akrogon run-check --name c5-no-guide -- sh -c '! grep -n "docs/guide" tests/command-reference.test.ts'` | T4 |
| 6 | page text vs current `src/` and `skills/` | n/a → no stale names, no dates | a retired command, setting or date on a page | B review per page; date scan `akrogon run-check --name c6-dates -- sh -c '! grep -nEi "\b(19\|20)[0-9]{2}\b\|january\|february\|march\|april\|june\|july\|august\|september\|october\|november\|december" docs/reference/commands.md docs/reference/skills.md docs/reference/config.md docs/reference/checks.md'` plus C4's command | review + C4 |

Whole-suite: only the repo's normal `checks` (format, test, typecheck) at their usual points. No `merge_checks` or extra suite is added.

## Test changes at synthesis

- T1. command-reference.test.ts: read docs/reference/commands.md (D3), test renamed to say so. Red now because the page does not exist.
- T2. docs-links.test.ts: walk README, `docs/**/*.md`, skills (D1), read `<img src>` (D2), fall back to the committed tree for sparse-excluded paths (D13), plus a unit case proving a broken Markdown image and a broken `<img src>` in a nested page are reported.
- T3. run-permit.test.ts: docs list from the walk (D5). hold-retired.test.ts unchanged (D6).
- T4. command-reference.test.ts: delete the two guide wording tests (D7).

## Red evidence (synthesis)

Log paths are under the leaf folder.

- T1 / C1: `check c1-commands-red: 1 implementation/check-c1-commands-red-1792766147310-541472.log`. ENOENT on docs/reference/commands.md, the page U1 writes. The row-removal break is shown in implementation/report.md once the page exists.
- T2 / C3: before D13 the widened test was red on reference-index.md (`check c3-links: 1 implementation/check-c3-links-1792766147403-541535.log`). After D13 green (`check c3-links: 0 implementation/check-c3-links-1792766190389-543586.log`). Deliberate break, nested page docs/reference/deep/break.md with a broken link, Markdown image, `<img src>` and `issues/` link: `check c3-break: 1 implementation/check-c3-break-1792766200443-544310.log`, all four reported. Unit case red with the `<img>` parsing removed: `check t2-img-break: 1 implementation/check-t2-img-break-1792766200772-544555.log`.
- T3 / C4: green (`check c4-retired: 0 implementation/check-c4-retired-1792766147518-541601.log`). "run permit" in the nested page: `check c4-break-run-permit: 1 implementation/check-c4-break-run-permit-1792766200558-544382.log`. "unhold" in the nested page: `check c4-break-hold: 1 implementation/check-c4-break-hold-1792766200674-544459.log`. Break page deleted after.
- T4 / C5: `check c5-no-guide: 0 implementation/check-c5-no-guide-1792766147609-541677.log`.

## Known limits

- C2 and C6 content accuracy is a reviewer judgment, not a mechanical check (design fact-ownership Q4: no new prose classifier).
- The command table check keeps its own copy of argument contracts in the test. That is the existing design of the test and it still reads the verb list from `src/akrogon.ts`.

## Implementation notes (2026-10-23)

- D12 refined: `tests/AREA.md` matches the `tests` segment in `src/test-files.ts`, so its edit needs a `Test-Change:` trailer. A makes that one-line edit itself after the waves, in its own commit with the trailer, instead of U3. U3 owns only `docs/reference/config.md`.
