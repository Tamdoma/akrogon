# Plan: skill-links-in-folder

Base a33d967b. Worktree /home/ivan/.akrogon/worktrees/akrogon/skill-links-in-folder. Leaf folder issues/open/shared-rules/skill-links-in-folder.

## Decisions

- D1: each of plan-issue, implement-issue, check-issue, learn-issues, chart-issues gets a tracked `lesson-rule.md` link file, git mode 120000 with target `../lesson-rule.md` (ponytail.md shape), and its SKILL.md links it as `lesson-rule.md`. The seven `../lesson-rule.md` link sites (three in check-issue) become same-folder.
- D2: `skills/lesson-rule.md` stays the one text (mode 100644). Its two relative links become references in words because the file is now read from five folders: Seed's `[learn-issues/SKILL.md](learn-issues/SKILL.md)` becomes "the Checkable definition in `skills/learn-issues/SKILL.md`", Home's `[seed-issue's owner rule](seed-issue/SKILL.md)` becomes "seed-issue's owner rule in `skills/seed-issue/SKILL.md`". Meaning unchanged.
- D3 (answers the design's Open): `diskResolver` dereferences a git link. On disk, `existsSync`/`readFileSync` already follow links. In the committed-tree fallback it reads the entry's mode via `git ls-tree`; mode 120000 means the `cat-file` blob is the target text, resolved relative to the link file's own directory, recursed with a `seen` set against link cycles. So a shared file is checked once per reader-facing link path, by that path — never deduplicated by real path, per the adopted B-check note.
- D4: `brokenLinks` takes an optional `bound` directory. A resolved relative link that lands outside it reports `<file>: link outside its folder <target>` before any existence check, so a `..` link to a real file still reports. Bound for `skills/<name>/**` is `skills/<name>`; for a file directly under `skills/` it is `skills/`; README/docs files pass no bound.
- D5: file set is tracked markdown under `skills/` from `git ls-files -s skills/`, read through `diskResolver` (sparse worktrees read HEAD for absent paths). `readdirSync` enumeration of skills is replaced; untracked markdown such as `skills/broadcast-issue/node_modules` content is never read.
- D6: fenced code blocks (``` or ~~~, opener char matched by closer) carry neither links nor headings: `proseOnly` strips them for `linkTargets` and `headingSlugs`. The five template links in `shapes.md` are examples.
- D7: link-site wording per skill is minimal substitution of `../lesson-rule.md` → `lesson-rule.md`.
- D8: `skills/AREA.md` states once that a file shared by several skills is reached through a link file inside each skill folder and never through `../`, extending the lesson-rule bullet. `tests/AREA.md` updates its docs-links one-liner to match the widened set. `docs/reference/skills.md` and `docs/use/learn-from-work.md` keep their `../../skills/lesson-rule.md` links unchanged (they stay valid: they are doc files, not skill files).

## Read first

- tests/docs-links.test.ts — `brokenLinks`, `linkTargets`, `headingSlugs`, `diskResolver`, the skills scan.
- skills/lesson-rule.md — Seed and Home clauses (D2).
- skills/check-issue/ponytail.md → ../implement-issue/ponytail.md — the established git-link precedent.
- src/install.ts `planSkillLinks` — folder-linked install layout (unchanged).
- skills/AREA.md; tests/AREA.md; docs/reference/skills.md:12; docs/use/learn-from-work.md:16.

## Unit 1 (serial-solo: one wave, one unit)

Owns every affected path; no parallelism possible.

- tests/docs-links.test.ts: proseOnly/bound/deref/track-set changes (done at planning, committed first).
- skills/plan-issue/lesson-rule.md, skills/implement-issue/lesson-rule.md, skills/check-issue/lesson-rule.md, skills/learn-issues/lesson-rule.md, skills/chart-issues/lesson-rule.md: new symlinks, `../lesson-rule.md`.
- skills/plan-issue/SKILL.md:39, skills/implement-issue/SKILL.md:33, skills/check-issue/SKILL.md:61,67,99, skills/learn-issues/SKILL.md:20, skills/chart-issues/SKILL.md:33: `../lesson-rule.md` → `lesson-rule.md`.
- skills/lesson-rule.md: Seed and Home link→words (D2).
- skills/AREA.md; tests/AREA.md: one-line statements (D8).

Doc checklist: skills/AREA.md (one line, shared-file link mechanism); tests/AREA.md (one line, widened skill set); docs/reference/skills.md and docs/use/learn-from-work.md unchanged — the pages still open, proven by the green check. No other agent or human doc is affected.

## Criteria and proofs

1. Five same-folder link sites; no tracked markdown under `skills/` links outside its skill folder; installed layout opens the rule text for a `..`-shortening reader.
   Proof: `bun test tests/docs-links.test.ts` inside the configured `test` check, green. The installed-layout property holds on the source tree: every relative link resolves inside `skills/<name>/`, and each link file's target `../lesson-rule.md` resolves inside the folder that carries it — `planSkillLinks` links folders whole, so the same shape holds installed. Intended red (recorded): the delivered test run on the undelivered tree reports the seven `../lesson-rule.md` escapes and nothing else — check `docs-links-final-red`: 1, `check-docs-links-final-red-1794392677686-2513153.log` (same content as the pre-commit run `docs-links-plan-red`):
   ```
   skills/chart-issues/SKILL.md: link outside its folder ../lesson-rule.md
   skills/check-issue/SKILL.md: link outside its folder ../lesson-rule.md  (x3)
   skills/implement-issue/SKILL.md: link outside its folder ../lesson-rule.md
   skills/learn-issues/SKILL.md: link outside its folder ../lesson-rule.md
   skills/plan-issue/SKILL.md: link outside its folder ../lesson-rule.md
   ```
   Size: seconds. Rerun trigger: any markdown or link-file change under `skills/`; inputs are the tracked tree itself, replayed by the same command.
   Condition checks: D4 bound — a link escaping a SKILL.md folder and a link escaping an assets/ folder each report (demo below); D5 tracking — untracked markdown is never read (demo below); D6 fences — fenced link-shaped text is not read (demo below); D3 traversal — a shared file's links are checked from the link file's folder path (demo below); sparse fallback — committed content incl. a git link is served for disk-absent paths (demo below). A count over cases where links stay inside proves nothing; each violable condition got its break.

2. `skills/lesson-rule.md` holds the one text; the five in-folder files are git links (mode 120000, target `../lesson-rule.md`), not copies; rule meaning unchanged, only Seed/Home links → words.
   Proof: `git ls-files -s skills/ | grep lesson-rule` shows five 120000 entries and one 100644; `readlink skills/<name>/lesson-rule.md` returns `../lesson-rule.md` per skill; `git diff` on lesson-rule.md shows only the two link→word rewrites. No new test: standing design permits the widened link check only; `git ls-files` output is the observation. Size: seconds. Rerun: on any diff to the link files.

3. Link check refuses a broken skill link and accepts the delivered tree, including through in-folder link files; fenced text is exempt.
   Proof command: `bun test tests/docs-links.test.ts` inside the configured `test` check — known-good green after delivery, plus the deliberate break (criterion's own demand):
   - Deliberate break, recorded (check `docs-links-traverse`: 1, `check-docs-links-traverse-1794392652442-2487369.log`). Temporary edits: `[x](../../AREA.md)` + `[y](gone.md)` + fenced `[z](../gone.md)` appended to assets/questions.md, untracked `skills/plan-issue/scratch.md` holding `[u](nope.md)`, staged symlink `skills/plan-issue/lesson-rule.md`. Reported:
     ```
     skills/chart-issues/assets/questions.md: link outside its folder ../../AREA.md
     skills/chart-issues/assets/questions.md: missing file gone.md
     skills/plan-issue/lesson-rule.md: missing file learn-issues/SKILL.md
     skills/plan-issue/lesson-rule.md: missing file seed-issue/SKILL.md
     ```
     The fenced `[z]` produced no line; `scratch.md` produced no line (untracked set); the staged link file was read by its own path and reported the shared file's links as missing under `skills/plan-issue/` — the reader-facing traversal the check exists to model. All edits reverted; `git status` clean except the test file.
   - Sparse fallback + HEAD git-link deref, recorded (check `docs-links-sparse-link`: 1, `check-docs-links-sparse-link-1794392661445-2496678.log`). `rm skills/check-issue/ponytail.md` (committed link, disk-absent) plus `[w](gone.md)` appended to implement-issue/ponytail.md: `skills/check-issue/ponytail.md: missing file gone.md` — HEAD served the link's target text, resolved and traversed by the link's own path. Reverted.
   - Unit cases in-file (green from the start, they prove helper conditions not reachable on the real tree): bound reports an existing out-of-folder file and a missing same-folder file; fenced link-shaped text is not a link.
   Size: seconds. Rerun: on any diff under `skills/` or to the test.

4. `skills/AREA.md` states the shared-file mechanism once; the two docs pages still open.
   Proof: diff line in AREA.md; the green docs-links test covers `docs/reference/skills.md` and `docs/use/learn-from-work.md` links to `../../skills/lesson-rule.md`. Size: seconds. Rerun: on doc diffs.

## Verification

`akrogon run-check --name test -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile --backend=copyfile'"'"' && akrogon guard own-modules && sh -c '"'"'bun test --timeout=30000 --parallel=4 --no-isolate'"'"''` — the configured `test` check, run whole at handoff; iteration runs `bun test tests/docs-links.test.ts` scoped.

## Open for the plan (all answered)

- diskResolver reads a git link's blob as its target path and dereferences (D3); the shared file is then read through each in-folder link by that link's own path.
