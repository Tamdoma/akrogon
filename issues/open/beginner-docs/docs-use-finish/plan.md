# Plan: docs-use-finish

Debate: no (`state.yaml`), so this plan is built directly from `brief.md` and `design.md`. No credentials are named and `akrogon status docs-use-finish` prints no `Missing:` lines. No brief/design conflict found.

## Read first

- `docs/reference-index.md` (grounding index), `learnings/LESSONS.md` (relevant: stale-rule-in-docs 2026-09-11, ambiguous-prose-after-rename 2026-09-14, cleanup-timing-guide-claims 2026-10-11: old guide claims go stale, check every claim against code)
- `issues/chart/beginner-docs/PAGE-MAP.md` under the registered root (rows for this leaf, picture meanings lines 93-102, test owners)
- Authoring sources (never linked): `docs/guide/merge.md`, `docs/guide/problems.md`, `docs/guide/learn.md`, `docs/guide/files.md` "sync…", `docs/guide/gacp.md`, `README.md` "Rollback"
- Truth sources: `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `skills/learn-issues/SKILL.md`, `skills/lesson-rule.md`, `src/land.ts`, `src/phase.ts`, `src/rollback.ts`, `src/release.ts` (`writeDeploySuccess`), `src/sync.ts`, `src/lessons.ts`
- Landed pages to link: `docs/reference/commands.md`, `docs/reference/state-and-phases.md` (failed recovery, `failure` field), `docs/reference/releases-and-updates.md` (Rollback, releases picture), `docs/reference/files.md` (sync, records), `docs/reference/checks.md`, `docs/reference/skills.md`
- Pictures: `docs/pictures/failure-recovery.svg`, `lessons-flow.svg`, `records-vs-code.svg` (embed), `change-flow.svg` (link)

## Decisions

- D1. Five pages under `docs/use/`, one per map row. Plain how-to steps for a job the reader already wants, short sentences, no exercises. Each states what the reader sees, does and why, and links the owning skill for agent procedure.
- D2. Next-step chain (criterion 2): merge-and-announce → when-work-fails → roll-back-a-release → learn-from-work → save-records → `../reference/files.md`. Each page ends with one `Next:` line.
- D3. Pictures: when-work-fails embeds `failure-recovery.svg`, learn-from-work embeds `lessons-flow.svg`, save-records embeds `records-vs-code.svg`, each as `![<alt describing the picture's meaning>](../pictures/<name>.svg)`. merge-and-announce links `change-flow.svg` (owned by docs-pictures-concepts, already on main, named by the brief). roll-back-a-release links `../reference/releases-and-updates.md#rollback`, which shows the releases picture.
- D4. Link rule: links go only to these five pages, `docs/reference/*`, `docs/pictures/*` named in D3, `skills/*` and `src/*`. No link to `docs/guide/`, `docs/use/` pages owned by docs-use-plan, `docs/start/` or `docs/examples/`.
- D5. merge-and-announce follows `skills/merge-issue/SKILL.md` "merge", not `docs/guide/merge.md` (stale on who merges). Normal path: the command rebases, then runs `akrogon land` itself, which verifies, gates, pushes and moves the leaf to merged with no seat. Exceptions handed to B: red verify, gate refusal, push it cannot finish. A branch that cannot rebase mechanically gives B a solo turn to rebase by hand. B never pushes; the command pushes. Then the broadcast: one per `issue complete` or `epic complete` line, run by the merge slot with broadcast-issue, only with configured Discord targets.
- D6. when-work-fails: `failed` keeps plan, reviews, code and reason. Steps: read `akrogon status <slug>` and the reason, fix the cause, move back with `akrogon phase <slug> <active phase>` with no `--slot`, then `akrogon next <slug>`. Facts from `docs/reference/state-and-phases.md` and `src/phase.ts`. Covers the other `problems.md` cases only where they are a failure or refusal still true in `src/`.
- D7. roll-back-a-release: `akrogon rollback` first, then the manual procedure for a release that cannot start, copied from `README.md` "Rollback" and checked against `src/rollback.ts` and `src/release.ts`. The shell block must keep the exact lines `mv -T .next-current current`, `release-hold.yaml` and `writeDeploySuccess` that `tests/rollback.test.ts` asserts and replays. README keeps its section (docs-start removes it).
- D8. learn-from-work: lesson line in `learnings/LESSONS.md` plus `learnings/history/<date>-<slug>.md` (path pattern only, no real dates), then `/learn-issues` sorts lines into stopped, checkable, transfer, stays, operator-invoked only.
- D9. save-records: `akrogon sync` commits eligible issue records on the default branch, rebases and pushes, and refuses unrelated staged files. gacp is the reader's own Bash shortcut, not part of Akrogon: the page says what it does (stages everything under the current folder and commits the whole index, then pulls and pushes origin/main) and when it fits, and does not reprint the function. Its claims are checked against `docs/guide/gacp.md` since no `src/` or `skills/` file defines it.
- D10. No dates, no home paths beyond `~/.akrogon`, no example repo names beyond placeholders like `<slug>`, no retired commands or settings, no "was removed" notes.
- D11. No doc outside the five pages changes. Affected docs: the five new `docs/use/*.md` pages. `README.md`, `docs/reference-index.md` and `docs/guide/` are untouched (owned by docs-start).

## Units and waves

Implementation is pages only. Every unit uses `tests/docs-links.test.ts` read-only. No shared live fixture.

Wave 1
- U1 roll-back-a-release. Owns `docs/use/roll-back-a-release.md`. Depends on the committed test change (already on the branch). Shared test resource: `tests/rollback.test.ts` (only U1 runs it).
- U2 merge-and-announce. Owns `docs/use/merge-and-announce.md`.
- U3 when-work-fails. Owns `docs/use/when-work-fails.md`.

Wave 2
- U4 learn-from-work. Owns `docs/use/learn-from-work.md`.
- U5 save-records. Owns `docs/use/save-records.md`.

Wave 2 follows wave 1 only to keep each wave at 3. Next-step links to pages from the other wave resolve once both waves land. Run `tests/docs-links.test.ts` after wave 2.

## Criteria and proof

| # | Result | Boundary and before/after | Failure it catches | Command | Size | Rerun trigger |
|---|---|---|---|---|---|---|
| 1 | Each page covers its map subject; merge page has normal path, exceptions, broadcast | Page text vs `skills/merge-issue`, `skills/broadcast-issue`, `src/land.ts`, `src/phase.ts`, `src/sync.ts`, `skills/learn-issues`. Before: pages absent. After: present | A page that says a seat merges every leaf, or omits the solo rebase | B review per page against D5-D9 sources; `ls docs/use/{merge-and-announce,when-work-fails,roll-back-a-release,learn-from-work,save-records}.md` | minutes | Any page edit |
| 2 | Concept pages embed their picture with alt text, every page ends with a next-step link | Markdown links and images. Before: none. After: all resolve | Broken or missing image, dead next link | `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`, plus `tail -n 3` of each page and `grep -n '!\[' docs/use/*.md` in review | seconds | Any page or picture edit |
| 3 | Manual recovery procedure on the roll-back page agrees with the real-predecessor proof | `tests/rollback.test.ts` "the roll-back page manual steps…" reads the page, then runs the same steps against a real pre-rollback release. Before: red (page missing). After: green | Page missing the steps, or steps that no longer restore a release | `akrogon run-check --name rollback-page -- bun test --timeout=30000 tests/rollback.test.ts -t "manual steps"` | seconds | Page shell block, `src/release.ts` or `src/rollback.ts` edit |
| 4 | Pages match current `src/` and `skills/`, no retired names, no dates | Page text. Before: absent. After: clean | A stale claim carried from `docs/guide/`, a retired command or setting, a date | B review per page; `akrogon run-check --name docs-bans -- bun test tests/hold-retired.test.ts tests/run-permit.test.ts`; `grep -nE '\b20[0-9]{2}-[0-9]{2}' docs/use/{merge-and-announce,when-work-fails,roll-back-a-release,learn-from-work,save-records}.md` returns nothing | minutes | Any page edit |

The repo's `checks` (format, test, typecheck) run as usual. No `merge_checks` or whole-suite requirement is added.

### Criterion 3 test, red evidence

Change: `tests/rollback.test.ts` reads `docs/use/roll-back-a-release.md` instead of `README.md` and asserts `mv -T .next-current current`, `release-hold.yaml` and `writeDeploySuccess`. The runtime recovery sequence is unchanged.

`check rollback-page-red: 1 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-finish/implementation/check-rollback-page-red-1792767564717-1965619.log`

```text
ENOENT: no such file or directory, open '.../docs/use/roll-back-a-release.md'
(fail) the roll-back page manual steps roll a broken release back using the real previous release
```

Deliberate break for implement (design Q2): with the page written, remove `writeDeploySuccess` from its block, run the criterion 3 command, record the red line in `implementation/report.md`, restore.

Criteria 1, 2 and 4 need no new test: `tests/docs-links.test.ts`, `tests/hold-retired.test.ts` and `tests/run-permit.test.ts` already scan every `docs/**/*.md`, and the rest is B's per-page review.

## Known limits

- The rollback test checks three literal lines, not the whole shell block. The rest of the block is checked by review (design Q2).
- `gacp` has no source in this repo, so its description is checked against the old guide page only.
