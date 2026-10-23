# Brief 3: front door, docs home, reference pages, old guide removal (unit U3)

## 1. Goal

Replace README.md with a short front door, add the docs home `docs/README.md`, point `docs/reference-index.md` at it, write `docs/reference/words.md` and `docs/reference/where-things-go.md`, then delete all 17 `docs/guide/*.md` pages once nothing references them. Plan decisions D1, D3, D8–D13.

## 2. Acceptance criteria

1. `README.md` fits on about one screen. It holds what Akrogon is (a lightweight software factory for people who already use coding agents: you chart work into written contracts, two agent seats in Herdr plan, build and review it, and the command lands it), who it is for, a "What you need" box (Linux desktop with a running systemd user manager, Bun, Git, flock, Herdr, one agent CLI such as Claude Code, Codex or pi, and an authenticated `gh` for GitHub work only), the embedded `docs/pictures/factory-overview.svg` with descriptive alt text, one "Start here" link to `docs/README.md`, and a few daily-job links into `docs/use/` (for example a-working-day, plan-work, run-work, when-work-fails). There is no command table, no install steps, no rollback section and no counts (no "ten skills" or similar). The text `akrogon log` is not needed.
2. `docs/README.md` (the docs home) lists start/ in reading order (what-it-is, why-it-works, install, set-up-a-project, one-change), then every page in use/, reference/ (including words.md and where-things-go.md) and examples/, one line each with what it is for. Read each page's first lines to describe it truly.
3. In `docs/reference-index.md`, the line `- [Documentation](guide/): the markdown operator guide.` becomes a line linking `README.md` (the human docs home), with `reference/where-things-go.md` named for where each fact lives. All other lines stay unchanged.
4. `docs/reference/words.md` is a glossary with one line per term. Each term links to the page that explains it. Take the terms from `docs/guide/parts.md` "The words" and the start pages, and check each meaning against `src/` and `skills/`. Drop terms for things that no longer exist. Include at least chart, chart door, consultant, contract, leaf, issue, epic, seat A and seat B, slot, harness, phase, worktree, worktree store, grounding, check, verify, landing, merged, failed, direct route, autopilot, park, pause, stop, seed, lesson, sync and release, where each exists today.
5. `docs/reference/where-things-go.md` (for maintainers) states each folder's purpose (`docs/start/`: read in order, `docs/use/`: one page per reader goal, `docs/reference/`: lookup, `docs/examples/`: real cases, `docs/pictures/`: SVGs with their own background card, `docs/reference-index.md`: the agents' code index). It states the one-home rule (each fact has one owning page, and others link to it), the link rule (link only real pages, pictures, skills and source files, never placeholders), and that a code change updates the page that owns the fact. Agent procedure stays in `skills/` and is linked, not copied. It does not copy any page-map table and does not mention issues/chart.
6. After 1–5, `git grep -n "docs/guide" -- . ':!issues' ':!learnings' ':!docs/guide'` prints nothing, and also check `git grep -n "guide/"` for relative links. Then `git rm -r docs/guide`. Paste the final grep output in your report.
7. Every statement matches current `src/` and `skills/`. No dates, no "was removed" notes, no retired command or setting names, plain short sentences. Copy the style from `docs/use/a-working-day.md`.

Planned proofs run by this unit (all must pass):

- `akrogon run-check --name u3-docs-links -- bun test --timeout=30000 tests/docs-links.test.ts`
- `akrogon run-check --name u3-guide-refs -- sh -c '! git grep -n "docs/guide" -- . ":!issues" ":!learnings" && test ! -e docs/guide'`
- `akrogon run-check --name u3-hold-run -- bun test --timeout=30000 tests/hold-retired.test.ts tests/run-permit.test.ts` (these scan README and docs for retired words)
- `akrogon run-check --name u3-log-reader -- bun test --timeout=30000 tests/log-reader.test.ts`

## 3. Read first

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- Current `README.md` (the source for what Akrogon is) and `docs/reference-index.md`
- `docs/start/*.md` (just landed, so match their words), `docs/use/*.md`, `docs/reference/*.md`, `docs/examples/*.md`, `docs/pictures/`
- `docs/guide/parts.md` "The words", `docs/guide/idea.md`
- `src/AREA.md`, `skills/AREA.md`, `src/config.ts`, `src/akrogon.ts`
- `tests/docs-links.test.ts`, `tests/hold-retired.test.ts`, `tests/run-permit.test.ts`

## 4. Change list

Rewrite `README.md`. Create `docs/README.md`, `docs/reference/words.md` and `docs/reference/where-things-go.md`. Edit one line in `docs/reference-index.md`. Delete `docs/guide/` (17 files). This unit owns only these paths. It needs U1 (`docs/start/`) and U2 (log-reader wording test removed), and both have landed.

## 5. Do-not, reasons and exceptions

- Do not edit `docs/start/`, `docs/use/`, other `docs/reference/` pages, `docs/examples/`, skills, src or tests. Other leaves own them. Exception: if a `docs/guide` reference sits in a file you do not own, report it as a mismatch with the path and line, and do not edit it.
- Do not write or edit tests. Tests are locked. A red planned test is a mismatch.
- Do not put any private project name, path or date in any page. The repo is public.
- Do not keep command tables, install or rollback detail in README. The design forecloses a long README.
- Do not touch anything under `issues/`.

Restated: stay in your paths because other leaves own the rest, except that an outside `docs/guide` reference is reported, not fixed. No test edits, because tests are locked. No private details or dates, because the repo is public. README stays short by design. issues/ is off-branch.

## 6. Ordered steps

1. Read section 3.
2. Write README.md (criterion 1).
3. Write docs/README.md and edit the reference-index line (2, 3).
4. Write words.md and where-things-go.md (4, 5).
5. Grep for docs/guide references, then delete docs/guide (6).
6. Run the four proof commands.
7. Commit as `docs: short front door, docs home and reference pages; remove old guide`, with no co-author line.

Advisory size: 6 files plus one deletion, under 25 turns.

## 7. Commands

- `bun install --frozen-lockfile` once in the worktree
- The four proof commands in section 2

## 8. Done-when and report

All criteria hold, all four proofs pass, and one commit exists. Return the commit id and these four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results with the check line>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
