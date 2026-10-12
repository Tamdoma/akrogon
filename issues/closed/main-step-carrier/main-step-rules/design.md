# Design: main-step-rules

## Binding decisions, verbatim

### Check entry points (forks/check-entry-points.md)
Operator 2026-10-12, on 1a: "I don't understand this, can you explain it? Is this adding complexity? I like to keep my issues clean, and only actual issues"
Operator 2026-10-12: "1d"

Decision: check entries in config name a repo-owned entry point (a package script or a repo file run by its native tool), not an inline command, so a leaf that improves a check changes the entry point in code and it is live at merge. init-akrogon proposes entry points where one exists and otherwise keeps the existing command; existing stored entries are not migrated by this rule; the generated setup/flock/run-check wrapping stays. Reason: removes the config edit after the leaf, with no reminder, no new code and no new issue kind.
Foreclosed: 1a seed-issue reminders (fills GitHub issues with to-dos); 1b chart-only note (invisible after handoff); 1c new status field (new code and state); letting leaves edit issues/config.yaml (breaks the code-only lock).

### Waiting edit (forks/waiting-edit.md)
Operator 2026-10-12, after asking for a plainer explanation twice: "1a"

Decision: when a needed config edit can only follow a leaf's merge, the original GitHub identity is left out of that leaf's `sources`, so the leaf's completion does not close it. It stays open and mirrored by `akrogon pull`; the door later makes the edit on main, verifies it, and runs `akrogon close <id> --by "<edit and commit>"`. For an unsourced chart, the door names the edit at handoff review as an operator-owned step. Reason: only actual issues stay open, and the problem is not fixed until the edit is made. No new issue kind, no code.
Foreclosed: 1b (rely on 1d alone; framework's case can recur); seed-issue reminders (check-entry-points Taken).
Clarifications accepted with this answer (B final-shape check, slots/framework-switch-B.md Part 1): shapes.md:278-280 gets a stated exception; withhold the identity from every leaf whose completion could close it (src/phase.ts:206-224 closes the union of sources); an unsourced waiting edit is recorded in CHART.md as pending with edit, owner, prerequisite leaf and check.

### Framework switch (forks/framework-switch.md)
Operator 2026-10-12: "1a |"

Decision: the door sets framework `checks.test_changed: bun run test:changed` in the registered root's issues/config.yaml, leaving other entries and unrelated issues/ edits untouched. Done 2026-10-12: line 12 changed; `akrogon config` in framework shows the run-check/flock wrapper invoking `bun run test:changed`. The file is left for akrogon's record sync like other door writes on main. Framework #115 stays closed; #87 stays open until the akrogon change also lands.
Foreclosed: 1b leave the stub.
Exclusion: made by the door in framework's registered root on 2026-10-12 and effective there for akrogon (src/config.ts:215); not yet on framework's origin, which receives it with the operator's next `akrogon sync` in framework (src/sync.ts:135-165). This leaf does not touch framework. (A,B)
Held disagreement: B (slots/leaf-review-B.md F1) wants #87's closure held until that sync commit exists. A keeps #87 in this leaf's sources: akrogon's behavior is already switched where it reads config, the door does not run framework's sync because it would publish about 699 unrelated record files from other sessions, and the pending sync is recorded in CHART.md as an operator step.

### Init verified (forks/init-verified.md)
Operator 2026-10-12, after asking whether it costs time or adds complexity system-wide: "1a"

Decision: init-akrogon says a verified `test_changed` is a real run against a base with changes in which a changed test was actually selected and ran, or the full existing test suite ran; a clean exit alone does not count. The base may be read inside the entry-point script. Reason: it would have rejected framework's stub at setup; same single setup run (init-akrogon SKILL.md:82), one sentence, no code.
Foreclosed: 1b skip; any check of command text (form, not function).

### Off route (CHART.md)
merge_covers redesign, duplicate-check cleanup, #86 flake handling, run counts, check scheduling, seed-issue reminders.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: the change is skill and guide prose, so no test exists for it ("no vanity tests"); proof is reading the owned text against each criterion plus the repo's blocking `checks` passing. "Leaf work is agent-owned": the rules make the door, not a leaf, own edits under `issues/`; the leaf itself touches no `issues/` path. No machinery, chain, live run or secret applies.

## Leaf architecture

Owned surfaces: skills/chart-issues/SKILL.md, skills/chart-issues/assets/shapes.md, skills/init-akrogon/SKILL.md, docs/guide/chart.md, limited to the passages named in the brief and any sentence that would otherwise contradict the new rules.

Interfaces used as they are: `akrogon close <owner/repo#n> --by <text>` (SKILL.md:35), `akrogon config` effective output, leaf `sources` closing at completion (src/phase.ts:206-224, src/pull.ts:180).

Exclusions: src/, tests/, issues/, any framework file, other skills, merge/check scheduling text, seed-issue.

Placement: keep each rule in one home (shapes.md for chart record rules, SKILL.md only where its paragraph would otherwise contradict), no duplicated prose. Before finishing, grep docs/ and skills/ for "operator step on main", "Off route" and "verified `checks.test_changed`" and own or report each hit (lesson 2026-09-11 stale-rule-in-docs).
