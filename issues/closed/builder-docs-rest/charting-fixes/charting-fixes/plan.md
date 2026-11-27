# Plan: charting-fixes

## Read-first paths

- [brief.md](/home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/brief.md)
- [design.md](/home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/design.md)
- [readiness.yaml](/home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/readiness.yaml)
- [docs/reference-index.md](docs/reference-index.md)
- [docs/README.md](docs/README.md)
- [docs/reference/where-things-go.md](docs/reference/where-things-go.md)
- [tests/AREA.md](tests/AREA.md)
- [tests/docs-links.test.ts](tests/docs-links.test.ts)
- [tests/command-reference.test.ts](tests/command-reference.test.ts)
- [tests/watch-timer.test.ts](tests/watch-timer.test.ts)
- [tests/hold-retired.test.ts](tests/hold-retired.test.ts)
- [learnings/LESSONS.md](learnings/LESSONS.md)
- [/home/ivan/.claude/skills/chart-issues/assets/standing-design.md](/home/ivan/.claude/skills/chart-issues/assets/standing-design.md)

## Grounding and readiness check

- `akrogon config` inspected once; repo `akrogon`, `AKROGON_BASE=8025b594104c6dbc1d83dc35060c50887b8e6d06`, `grounding.index=docs/reference-index.md`, `implement=subagents`, configured `checks`: `format`, `test`, `typecheck` (`merge_checks: {}`).
- `akrogon status charting-fixes` reported zero `Missing:` lines; `readiness.yaml` has empty `inputs`, `produces`, `grants`, `retained`, `proofs`. No credentials or paid runs are needed.
- Brief and design agree on every point; `design.md` has no `Open for the plan:` questions.
- Live surface scan at `AKROGON_BASE` across all 62 files matching `README.md`, `docs/**/*.md`, and `docs/pictures/*.svg` found:
  - `107` em-dash (`—`, U+2014) occurrences across `67` lines in `20` Markdown files under `docs/`.
  - `0` em dashes in `README.md`, `docs/pictures/*.svg`, `docs/examples/*.md`, or `docs/reference-index.md` (and `0` XML/HTML `&mdash;`/`&#8212;`/`&#x2014;` entities).
  - `4` examples starting consultants across `docs/guide/04`–`08` and `docs/README.md`: `docs/guide/04-a-charting-session.md:22`, `docs/guide/06-charting-mode.md:35`, `docs/guide/06-charting-mode.md:54`, and `docs/guide/06-charting-mode.md:75` (the singular `"Use consultant B."` form).
  - `1` heading containing an em dash: `docs/guide/08-hand-off.md:47` (`## What the charting agent hands off — and what happens next`); repo grep confirmed zero anchor links to that heading anywhere in `README.md`, `docs/`, `skills/`, or `tests/`.

## Decisions

- **D1 — Disk-reading em-dash guard (`tests/docs-em-dash.test.ts`)**: Add one new Bun test file `tests/docs-em-dash.test.ts` (matching `.prettierrc` and `tsconfig.json`) with two helpers, `collectDocFiles(root)` and `findEmDashes(root)`, that discover files dynamically from disk on each invocation with no hand-copied page list:
  - `README.md` (throws if missing or not a file).
  - Every `.md` file recursively under `docs/` (`readdirSync(join(root, 'docs'), { recursive: true })` filtered by `.endsWith('.md')` and `statSync(file).isFile()`).
  - Every `.svg` file recursively under `docs/pictures/` (`readdirSync(join(root, 'docs', 'pictures'), { recursive: true })` filtered by `.endsWith('.svg')` and `statSync(file).isFile()`).
  - Each file is read as UTF-8 from disk and split on `/\r\n|[\n\r\u2028\u2029]/` (covering CRLF and lone `\r` line terminators per `learnings/LESSONS.md`). Any line matching `/\u2014|&mdash;|&#8212;|&#x2014;/i` is reported as `<relPath>:<lineNumber>: <trimmed line>`.
  - Two test cases: (1) real-repo check asserting `collectDocFiles(repoRoot)` includes `README.md`, at least one `docs/guide/*.md`, and at least one `docs/pictures/*.svg`, and `findEmDashes(repoRoot)` equals `[]`; (2) isolated temp-tree negative check (under `mkdtempSync`, cleaned in `finally`) proving clean trees pass (including `-`, `--flag`, and en dash `5–40`), while em dashes in `README.md`, nested `docs/**/*.md` (including `\r`-delimited lines), a newly added file created after an earlier scan in the same process, and `docs/pictures/*.svg` (both literal `—` and XML entities `&#8212;` / `&mdash;`) are all caught.
- **D2 — Natural sentence rewrites for Criterion 1 (no dash substitutes)**: Rewrite every line holding an em dash across all 20 affected Markdown files using periods, commas, colons, semicolons, parentheses, or restructured clauses so each sentence reads naturally. Never substitute `" - "`, `"--"`, or an en dash (`–`). Leave mathematical minus (`−`, U+2212) and multiplication (`×`, U+00D7) in `docs/reference/checks.md:85` untouched.
- **D3 — Consumer-contract preservation on edited lines**: Every edited line keeps all strings and Markdown formats asserted by existing doc-reading tests:
  - `docs/reference/checks.md`: preserve `(script)` (`tests/docs-links.test.ts`).
  - `docs/reference/files.md`: preserve `(script)` and the single-line `| \`verify-runs.jsonl\`` Markdown table row containing `` `timeouts` ``, `` `durations` ``, and `` `attempt` `` (`tests/docs-links.test.ts`).
  - `docs/reference/commands.md`: keep lines 44, 47, 54 as valid single-line table rows with untouched `Invocation` column and non-empty `Effect` column (`tests/command-reference.test.ts`).
  - `docs/use/watch-while-away.md`: keep `claude`, `codex`, `pi`, `agy` on line 7; introduce no `cron` or `expir*`; keep `akrogon status` out of `## What each check does` (`tests/watch-timer.test.ts`).
  - `docs/reference/skills.md`: introduce no `cron` or `expir*` (`tests/watch-timer.test.ts`).
  - `docs/guide/08-hand-off.md:47`: rewrite heading `## What the charting agent hands off — and what happens next` cleanly (for example `## What the charting agent hands off and what happens next`); `tests/docs-links.test.ts` confirms all anchors remain valid.
  - Preserve no retired strings banned by `tests/hold-retired.test.ts` (`hold-fix`, `unhold`, `--red-on-base`, `held.yaml`) or `tests/run-permit.test.ts` (`run permit`).
- **D4 — Full consultant examples and page 04 slots sentence (Criterion 2)**:
  - Update all 4 consultant-starting examples on `docs/guide/04`–`08` and `docs/README.md` to name each slot with harness, model, and effort, using the exact format from the brief and design:
    - `docs/guide/04-a-charting-session.md:22`: `/chart-issues Add a weekly client report export to client-portal. Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.`
    - `docs/guide/06-charting-mode.md:35`: `/chart-issues Add a weekly client report export to client-portal. Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.`
    - `docs/guide/06-charting-mode.md:54`: `/chart-issues Chart these three client-portal report issues on autopilot, I'll answer the signposts. Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.`
    - `docs/guide/06-charting-mode.md:75`: `/chart-issues Run full autopilot on these three client-portal cleanup reports, answering the signposts and all forks yourself. Consultants: slot B claude, claude-fable-5-2, high effort.`
  - Insert one sentence in `docs/guide/04-a-charting-session.md` right below the opening example block (after line 23, before line 25): `While charting, consultants sit in slots B, C, D, and a Lifecycle task later gets its own fresh slot B (the reviewer).` Keep line 35's existing bold `**slot A (the builder)**` and `**slot B (the reviewer)**` untouched.
  - `docs/guide/05-signposts.md`, `07-build-route.md`, `08-hand-off.md`, and `docs/README.md` contain zero consultant-starting examples (verified by reading all six pages in full).
- **D5 — Strict diff boundary and exclusions (Criterion 4)**:
  - Modify only the 20 Markdown files containing em dashes (which also include the two files needing Criterion 2 edits) plus `tests/docs-em-dash.test.ts` (already committed at planning).
  - Do not edit `README.md`, `docs/pictures/*.svg`, `docs/use/roll-back-a-release.md`, `docs/reference/where-things-go.md`, `tests/AREA.md`, `src/AREA.md`, `skills/AREA.md`, `docs/reference-index.md`, or any non-em-dash line of `docs/guide/04`–`08` (tab section, previous/next lines, and picture embeds belong to `guide-chapters` and `charting-pictures-more`).

## Interfaces

- `tests/docs-em-dash.test.ts` (internal test helpers, no exported runtime API):
  - `collectDocFiles(root: string): string[]` — returns sorted absolute paths for `README.md`, `docs/**/*.md`, and `docs/pictures/**/*.svg` read dynamically from `root`.
  - `findEmDashes(root: string): string[]` — returns `<relativePath>:<1-based-line>: <trimmed-line>` for every line matching `/\u2014|&mdash;|&#8212;|&#x2014;/i`.

## Waves and file/criterion checklist

`tests/docs-em-dash.test.ts` is committed on the branch during `plan.synthesis` before any product edits. All product edits partition cleanly into 3 independent units with disjoint owned paths, no shared test resources, and no inter-unit dependencies, running in a single parallel wave:

### Wave 1 (3 parallel units — disjoint paths, no shared test resources, no prerequisites)

- **Unit u1 — Charting guide and docs home** (Criteria 1, 2, 4)
  - Owned paths:
    - `docs/README.md` (lines 21, 22 — 2 em dashes)
    - `docs/guide/04-a-charting-session.md` (line 22 consultant example; add slots sentence after line 23; lines 25, 43, 44, 64, 78, 83, 88 — 9 em dashes)
    - `docs/guide/05-signposts.md` (lines 9, 17, 35, 54, 91, 107 — 7 em dashes)
    - `docs/guide/06-charting-mode.md` (lines 35, 54, 75 consultant examples; lines 7, 16, 17, 19, 28, 42, 63, 75, 82, 84, 97 — 13 em dashes)
    - `docs/guide/07-build-route.md` (lines 15, 24, 33, 49, 59, 75 — 7 em dashes)
    - `docs/guide/08-hand-off.md` (lines 10, 41, 47 — 4 em dashes; line 47 is a heading)
  - Shared test resources: none.
  - Prerequisites: none (`tests/docs-em-dash.test.ts` already committed at planning).

- **Unit u2 — Reference docs** (Criteria 1, 4)
  - Owned paths:
    - `docs/reference/checks.md` (lines 52, 63, 69, 85, 95, 147 — 11 em dashes; preserve `(script)` and math `−`/`×`)
    - `docs/reference/commands.md` (lines 44, 47, 54 — 8 em dashes; preserve single-line table rows and `Invocation` column)
    - `docs/reference/config.md` (line 68 — 2 em dashes; preserve table row)
    - `docs/reference/files.md` (lines 28, 71, 73, 95, 99 — 15 em dashes; preserve `(script)` and `verify-runs.jsonl` row with `` `timeouts` ``, `` `durations` ``, `` `attempt` ``)
    - `docs/reference/limits.md` (line 17 — 1 em dash)
    - `docs/reference/skills.md` (lines 16, 46 — 3 em dashes; no `cron`/`expir*`)
    - `docs/reference/state-and-phases.md` (lines 18, 36 — 2 em dashes; preserve table row on line 18)
    - `docs/reference/words.md` (line 29 — 2 em dashes)
  - Shared test resources: none.
  - Prerequisites: none.

- **Unit u3 — Start and use docs** (Criteria 1, 4)
  - Owned paths:
    - `docs/start/what-it-is.md` (line 12 — 2 em dashes)
    - `docs/start/why-it-works.md` (line 25 — 1 em dash)
    - `docs/use/a-working-day.md` (line 10 — 2 em dashes)
    - `docs/use/autopilot.md` (lines 21, 25 — 4 em dashes)
    - `docs/use/plan-work.md` (lines 24, 32, 34, 56 — 8 em dashes)
    - `docs/use/watch-while-away.md` (lines 7, 43 — 4 em dashes; preserve `claude`, `codex`, `pi`, `agy` on line 7; no `cron`/`expir*`/`akrogon status`)
  - Shared test resources: none.
  - Prerequisites: none.

### Affected docs checklist

Human docs (20 affected files, listed one per line):
- `docs/README.md` — remove 2 em dashes (u1).
- `docs/guide/04-a-charting-session.md` — remove 9 em dashes, expand consultant example, add slots sentence (u1).
- `docs/guide/05-signposts.md` — remove 7 em dashes (u1).
- `docs/guide/06-charting-mode.md` — remove 13 em dashes, expand 3 consultant examples including singular `Use consultant B.` (u1).
- `docs/guide/07-build-route.md` — remove 7 em dashes (u1).
- `docs/guide/08-hand-off.md` — remove 4 em dashes including heading on line 47 (u1).
- `docs/reference/checks.md` — remove 11 em dashes (u2).
- `docs/reference/commands.md` — remove 8 em dashes (u2).
- `docs/reference/config.md` — remove 2 em dashes (u2).
- `docs/reference/files.md` — remove 15 em dashes (u2).
- `docs/reference/limits.md` — remove 1 em dash (u2).
- `docs/reference/skills.md` — remove 3 em dashes (u2).
- `docs/reference/state-and-phases.md` — remove 2 em dashes (u2).
- `docs/reference/words.md` — remove 2 em dashes (u2).
- `docs/start/what-it-is.md` — remove 2 em dashes (u3).
- `docs/start/why-it-works.md` — remove 1 em dash (u3).
- `docs/use/a-working-day.md` — remove 2 em dashes (u3).
- `docs/use/autopilot.md` — remove 4 em dashes (u3).
- `docs/use/plan-work.md` — remove 8 em dashes (u3).
- `docs/use/watch-while-away.md` — remove 4 em dashes (u3).

Agent docs: no agent doc (`docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `skills/**/*.md`) is affected; editing them would exceed Design's Owned surfaces and Criterion 4.

## Verification and done-criteria mapping

### Criterion 1 — No em dash remains in `README.md`, `docs/**/*.md` or `docs/pictures/*.svg`; each changed sentence rewritten without dash substitutes

- **Mechanical part (absence of em dashes)**:
  - Boundary: live files on disk in the worktree (`README.md`, `docs/**/*.md`, `docs/pictures/*.svg`) read by `tests/docs-em-dash.test.ts`.
  - State before: `107` em dashes across `67` lines in `20` files; `tests/docs-em-dash.test.ts` fails.
  - State after: `0` em dashes across all scanned files; `tests/docs-em-dash.test.ts` exits `0`.
  - Product failure caught: any leftover U+2014 or XML/HTML-encoded em dash in `README.md`, any Markdown file under `docs/`, or any SVG under `docs/pictures/`.
  - Proof test & command: `tests/docs-em-dash.test.ts` via `akrogon run-check --name em-dash-guard -- bun test tests/docs-em-dash.test.ts`.
  - Size & rerun trigger: seconds; rerun whenever `README.md`, any file under `docs/`, or `tests/docs-em-dash.test.ts` changes.
  - **Checked conditions (D1, D2, D3)**:
    - *Condition C1-1 (`README.md` is scanned)* — D1 includes `README.md` directly in `collectDocFiles`; proven by negative case in `tests/docs-em-dash.test.ts` (`em-dash guard catches ...`). Temporary violation (dropping `readme` from `collectDocFiles`) red output: `Expected ["README.md:1: # README — dash here"], Received []` (`check plan-cond-readme: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-cond-readme-1795786347076-678879.log`).
    - *Condition C1-2a (nested `docs/**/*.md` is walked recursively)* — D1 calls `readdirSync(docsDir, { recursive: true })`; proven by nested `docs/nested/deep/page.md` case in `tests/docs-em-dash.test.ts`. Temporary violation (dropping `{ recursive: true }`) red output: `Expected ["docs/nested/deep/page.md:2: second line — dash here"], Received []` (`check plan-cond-recursive: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-cond-recursive-1795786347186-678954.log`).
    - *Condition C1-2b (fresh disk scan in the same process with no cached or hand-copied list)* — D1 walks disk on every `collectDocFiles` call; proven by adding `docs/fresh/added.md` after an earlier scan in the same test run. Temporary violation (caching `collectDocFiles` per root) red output: `Expected ["docs/fresh/added.md:1: Newly added — dash"], Received []` (`check plan-cond-freshness: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-cond-freshness-1795786347293-679029.log`).
    - *Condition C1-3 (`docs/pictures/*.svg` literal and XML entity em dashes are caught)* — D1 scans `docs/pictures/` for `.svg` against `/\u2014|&mdash;|&#8212;|&#x2014;/i`; proven by SVG literal and entity cases in `tests/docs-em-dash.test.ts`. Temporary violation (omitting `svgFiles`) red output: `Expected ["docs/pictures/diagram.svg:2: <text>Label — one</text>"], Received []` (`check plan-cond-svg: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-cond-svg-1795786347415-679101.log`).
    - *Condition C1-4 (non-LF line terminators `\r` do not hide or mis-number hits)* — D1 splits lines with `/\r\n|[\n\r\u2028\u2029]/`; proven by `\r`-delimited line case in `tests/docs-em-dash.test.ts`. Temporary violation (splitting on `/\n/` only) red output: `Expected ["docs/nested/deep/page.md:2: second line — dash here"], Received ["docs/nested/deep/page.md:1: first line\rsecond line — dash here"]` (`check plan-cond-linesplit: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-cond-linesplit-1795786347532-679173.log`).
    - *Condition C1-5 (existing consumer doc assertions stay intact)* — D3 preserves `(script)`, `verify-runs.jsonl` row fields, single-line `commands.md` rows, `claude`/`codex`/`pi`/`agy` in `watch-while-away.md`, and valid anchors; proven by existing `tests/docs-links.test.ts`, `tests/command-reference.test.ts`, `tests/watch-timer.test.ts`, `tests/rollback.test.ts`, `tests/hold-retired.test.ts`, and `tests/run-permit.test.ts` inside `checks.test` (traced reason: no new test needed because existing suite tests already assert each consumer contract).
  - Planning red run: `check plan-em-dash-red: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-em-dash-red-1795786327503-678466.log` — `(fail) README, docs markdown and docs pictures hold no em dashes` (reported 67 em-dash lines across 20 docs files on base; `1 pass, 1 fail`).
- **Model-choice part (rewrite quality / no dash substitutes)**:
  - Model-choice reading under standing-design: whether each changed sentence reads naturally and was rewritten rather than given `" - "`, `"--"`, or an en dash substitute is a wording judgment with no literal contract; no script check or regex asserts rewrite wording or bans hyphens/en dashes.
  - Reviewing seat evidence: slot B reads `git diff "$AKROGON_BASE"...HEAD` and `implementation/report.md` across all 20 edited Markdown files. What stays unproven mechanically: prose naturalness and absence of dash substitutes on rewritten lines.

### Criterion 2 — Consultant-starting examples on `docs/guide/04`–`08` and `docs/README.md` name each slot with harness, model and effort; page 04 holds the slots sentence

- **Model-choice reading under standing-design**: Human-guide example wording and the added explanatory sentence on page 04 are prose checked by slot B rather than code-parsed markers (no prose-assertion test is added, avoiding brittle wording tests per standing-design and `learnings/LESSONS.md`).
- Boundary & inspection command: `akrogon run-check --name consultant-examples-check -- rg -n 'chart-issues|consultant|slot [BCD]' docs/guide/04-a-charting-session.md docs/guide/05-signposts.md docs/guide/06-charting-mode.md docs/guide/07-build-route.md docs/guide/08-hand-off.md docs/README.md` plus `git diff "$AKROGON_BASE"...HEAD -- docs/guide/04-a-charting-session.md docs/guide/06-charting-mode.md`.
- State before: `04:22` says `Use two consultants.`; `06:35` and `06:54` say `Use consultants B and C.`; `06:75` says `Use consultant B.`; page 04 lacks the explicit `slots B, C, D` vs fresh `slot B (the reviewer)` sentence after the opening example.
- State after: all 4 examples name each slot with harness, model, and effort (`Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.` / singular `slot B` on `06:75`), and page 04 holds the slots sentence.
- Product failure caught: an example still omitting harness/model/effort (including singular forms) or missing the page-04 slot disambiguation sentence.
- Reviewing seat evidence: slot B reads `docs/guide/04-a-charting-session.md`, `docs/guide/05-signposts.md`, `docs/guide/06-charting-mode.md`, `docs/guide/07-build-route.md`, `docs/guide/08-hand-off.md`, `docs/README.md`, and `git diff "$AKROGON_BASE"...HEAD`. What stays unproven mechanically: completeness and clarity of consultant examples and the page-04 slots sentence.
- Size & rerun trigger: seconds; rerun after any edit to `docs/guide/04`–`08` or `docs/README.md`.

### Criterion 3 — Guard test fails on a file holding an em dash and passes on the delivered tree; report shows one deliberate break turning it red

- Boundary: `tests/docs-em-dash.test.ts` executed by Bun against both synthetic temp-dir fixtures on disk and the real repository worktree (plus one temporary injected em dash in a tracked file during implementation).
- State before: `tests/docs-em-dash.test.ts` fails on base (107 em dashes) and passes its negative fixture cases.
- State after: `tests/docs-em-dash.test.ts` exits `0` on the delivered tree, and `implementation/report.md` cites one kept `akrogon run-check` red log produced by temporarily injecting an em dash into a delivered file (e.g. `docs/README.md` or `docs/pictures/charting-session.svg`), running `bun test tests/docs-em-dash.test.ts` (observing non-zero exit naming that file), and reverting the break.
- Product failure caught: a vacuous or broken guard test that passes even when an em dash is present.
- Proof test & command: `tests/docs-em-dash.test.ts` via `akrogon run-check --name em-dash-guard -- bun test tests/docs-em-dash.test.ts` (green on delivered tree) and `akrogon run-check --name em-dash-deliberate-break -- bun test tests/docs-em-dash.test.ts` (red during deliberate break, reverted before final commit).
- Size & rerun trigger: seconds; rerun whenever `tests/docs-em-dash.test.ts`, `README.md`, or `docs/` changes.

### Criterion 4 — No other wording changes beyond Criteria 1 and 2; destination's `checks` pass

- **Diff scope (model-choice reading)**:
  - Inspection command: `git diff --stat "$AKROGON_BASE"...HEAD` and `git diff "$AKROGON_BASE"...HEAD`.
  - Reviewing seat evidence: slot B reads the full diff and confirms every changed hunk is strictly an em-dash line (Criterion 1), a consultant-starting example or the page-04 slots sentence (Criterion 2), or `tests/docs-em-dash.test.ts` (Criterion 3), with no excluded edits to `04`–`08` tab section, previous/next links, or picture embeds.
- **Destination's `checks` (mechanical)**:
  - Boundary: the configured repo checks (`format`, `typecheck`, `test`) and `akrogon verify` on the final commit before moving to `check.review`.
  - Commands:
    - `format`: `akrogon run-check --name 'format' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile --backend=copyfile'\'' && akrogon guard own-modules && sh -c '\''bunx prettier --check src tests skills/chart-issues/scripts'\'''`
    - `typecheck`: `akrogon run-check --name 'typecheck' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile --backend=copyfile'\'' && akrogon guard own-modules && sh -c '\''bun run typecheck'\'''`
    - `test`: `akrogon run-check --name 'test' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile --backend=copyfile'\'' && akrogon guard own-modules && sh -c '\''bun test --timeout=120000 --parallel=4 --max-concurrency=5 --no-isolate && { set -o pipefail; git diff -z --name-only --diff-filter=ACMR "${AKROGON_BASE:-origin/main}...HEAD" -- '\''\'\'''\''tests/*.test.ts'\''\'\'''\'' | sed -z '\''\'\'''\''s|^|./|'\''\'\'''\'' | xargs -0 -r bun test --timeout=120000 --parallel=4 --max-concurrency=5 --no-isolate --rerun-each=5; }'\'''`
    - Final commit receipt: `akrogon verify`
  - Product failure caught: prettier drift or TypeScript error in `tests/docs-em-dash.test.ts`, broken doc links/anchors (`tests/docs-links.test.ts`), broken `commands.md` table (`tests/command-reference.test.ts`), broken `watch-while-away.md` assertions (`tests/watch-timer.test.ts`), or flaky guard behavior across `--rerun-each=5`.
  - Size & rerun trigger: minutes (full `test` suite); rerun on final commit before `check.review`.

## Planning red-check evidence

All temporary condition-violation edits were discarded before committing `tests/docs-em-dash.test.ts` (SHA-256 verified identical before and after). Prettier (`bunx prettier --check tests/docs-em-dash.test.ts`) and TypeScript (`bun run typecheck`) both exited `0` on the committed test file.

- Planned guard test red on unmodified base (`1 pass, 1 fail`; 67 em-dash lines across 20 files in `docs/`):
  `check plan-em-dash-red: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-em-dash-red-1795786327503-678466.log`
- Condition C1-1 temporary violation (omit `README.md`):
  `check plan-cond-readme: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-cond-readme-1795786347076-678879.log`
- Condition C1-2a temporary violation (non-recursive `docs/` read):
  `check plan-cond-recursive: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-cond-recursive-1795786347186-678954.log`
- Condition C1-2b temporary violation (cached `collectDocFiles` per root):
  `check plan-cond-freshness: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-cond-freshness-1795786347293-679029.log`
- Condition C1-3 temporary violation (omit `docs/pictures/*.svg`):
  `check plan-cond-svg: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-cond-svg-1795786347415-679101.log`
- Condition C1-4 temporary violation (LF-only line split):
  `check plan-cond-linesplit: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-plan-cond-linesplit-1795786347532-679173.log`
