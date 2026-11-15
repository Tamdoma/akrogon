# Design: skill-links-in-folder

## Binding decisions, verbatim

Chart `issues/chart/shared-rules`, fork `forks/shape.md`, Taken. Operator, door t126, 2026-11-11, verbatim: to question 1 "1b, then. Continue."; to questions 2 and 3 "2a | 3a |".

- Question 3: 3a. "The implementation report carries a table, old place to new place for every rule; the reviewing seat follows it along each phase's reading path; a check shows every link opens from an installed copy. No paid run." Foreclosed: 3b (one paid before-and-after seat run). This leaf owns the check; the tables belong to the two later leaves.
- Correction to question 1's reach, approved by the operator at the handoff review, 2026-11-11, verbatim "1a |  2a" (1a: "Put a small pointer file inside each step's own folder … Use this for the new shared rules file and also for the lesson file that fails today. A test then stops anyone adding an \"up one folder\" path again."). A shared file is reached through a link file inside each skill folder, as ponytail.md is, never through `../`. The existing lesson-rule links get the same mechanism. Reason: observations O1 and O2 in the fork's Findings (21 of 24 pi session files with a failed access; claude's Read tool fails; an in-folder link file opens in a shell, in claude's Read and in pi's read). Foreclosed: keeping `../lesson-rule.md`; an installer change that links root files into each agent program's skill root (more code for the same reach).
- Slot B's check, adopted (slots/shape-final-check-B.md, FC1): the two relative links inside `skills/lesson-rule.md` open from `skills/` and from none of the five link files, so they become references in words, and the link check follows each reader-facing link file by its own path, never deduplicating link files by their real path first.
- Signposts (forks/signposts.md, Taken, operator 2026-11-10 "1a | 2c | 3a | 4a | 5b | 6a | 7a |"): 3a "A win is charted only with a number from the factory's own records showing today's cost"; 6a "Changes land in akrogon only".
- A leaf branch carries code and skill text only: no path under `issues/`.

Excluded here, with owners: the shared lifecycle rules file and its four link files (`lifecycle-rules-source`); the chart door's step files and every other change to `skills/chart-issues/SKILL.md` (`door-step-files`); agy skill discovery (Off route in the chart).

Standing design, installed path `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf:

- A test exists only as the proof of a done-criterion: the widened link check is the proof of criteria 1 and 3. No other test is added.
- Cheapest sufficient test: the link check inside the existing `test` command, on the source tree. No install fixture is built, because the property "stays inside its skill folder" holds on any layout that links a skill folder whole, which is what `planSkillLinks` does; observation O2 shows the installed layout carries a link file whose target lies outside the folder.
- New behavior shows one deliberate break turning its test red: criterion 3.
- A test never keeps a hand-copied list of another file's entries: the check reads the tracked markdown files under `skills/`; it does not list the five skills or the link files.
- No machinery: the leaf extends one existing test in the repo's runner.
- No auth, no secret, no outside call, no live run, no browser flow. Agent-owned, no human-only prerequisite.

## Leaf architecture

Owned surfaces: new git links `skills/plan-issue/lesson-rule.md`, `skills/implement-issue/lesson-rule.md`, `skills/check-issue/lesson-rule.md`, `skills/learn-issues/lesson-rule.md`, `skills/chart-issues/lesson-rule.md`; the lesson-rule link in each of those five `SKILL.md` (seven link sites today, three of them in check-issue); the Seed and Home clauses of `skills/lesson-rule.md`; `tests/docs-links.test.ts`; `skills/AREA.md`.

Literal interfaces: each link file is named `lesson-rule.md`, has git mode 120000 and target `../lesson-rule.md`; a skill links it as `lesson-rule.md`. The rule the check enforces: for a markdown file at `skills/<name>/…`, every relative link resolves as path text to an existing path under `skills/<name>/`; a file directly under `skills/` that skill folders link holds no relative link.

Consumers of what changes:

- `planSkillLinks` in `src/install.ts` links each skill folder whole and is not changed; a link file inside the folder travels with it (O2).
- The test "lesson write sites link the shared lesson rule" in `tests/docs-links.test.ts` requires the text `lesson-rule.md` in four `SKILL.md`; the same-folder link keeps it true. Decision: unchanged.
- The test "README, docs and skill links resolve to files and anchors" and its helpers `brokenLinks`, `linkTargets` and `diskResolver`: this leaf widens its skill file set and adds the folder rule and the fenced-block rule. `diskResolver` falls back to the committed tree for paths a sparse leaf worktree lacks. Open for the plan: whether that fallback reads a git link's target text as the file's content for a link file, and how the check then reads the lesson rule through it.
- `docs/reference/skills.md` and `docs/use/learn-from-work.md` link `../../skills/lesson-rule.md`, which stays.
- `skills/broadcast-issue/node_modules` holds untracked markdown; the file set is the tracked files, so it is not read.
- `skills/chart-issues/assets/shapes.md` holds five link-shaped template examples inside fenced blocks (`forks/<fork-slug>.md` twice, `<issue>/ISSUE.md`, `<other-issue>/ISSUE.md`, `<leaf>/brief.md`); they must pass as examples (O3). `skills/chart-issues/assets/questions.md` links `../SKILL.md#open`, which stays inside its skill folder and must pass.

The meaning of the lesson rule's Seed and Home clauses is fixed; their wording is the leaf's.
